import {type FormEvent, useState} from 'react'
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import {useNavigate} from "react-router";
import {convertPdfToImage} from "~/lib/pdf2img";
import {generateUUID} from "~/lib/utils";
import {prepareInstructions} from "../../constants";
import {logDebug, generateTestFeedback} from "~/lib/debug";
import {analyzeResumeWithGemini, validateGeminiSetup} from "~/lib/gemini";

const Upload = () => {
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState('');
    const [canRetry, setCanRetry] = useState(false);
    const [analysisTimeout, setAnalysisTimeout] = useState(false);

    const handleFileSelect = (file: File | null) => {
        setFile(file)
    }

    /**
     * Extract text from PDF file
     */
    const extractTextFromPDF = async (pdfFile: File): Promise<string> => {
        try {
            const arrayBuffer = await pdfFile.arrayBuffer();
            const pdfjsLib = (window as any).pdfjsLib;
            
            if (!pdfjsLib) {
                throw new Error('PDF.js library not loaded');
            }

            // Set worker if not already set
            if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
                pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
            }

            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
            
            let text = '';
            for (let pageNum = 1; pageNum <= Math.min(pdf.numPages, 10); pageNum++) {
                const page = await pdf.getPage(pageNum);
                const textContent = await page.getTextContent();
                text += textContent.items.map((item: any) => item.str).join(' ') + '\n';
            }
            return text;
        } catch (err) {
            console.error('Error extracting PDF text:', err);
            throw new Error('Failed to extract text from PDF. Ensure the PDF is readable and contains text.');
        }
    };

    const handleAnalyze = async ({ companyName, jobTitle, jobDescription, file, skipAnalysis = false }: { companyName: string, jobTitle: string, jobDescription: string, file: File, skipAnalysis?: boolean  }) => {
        try {
            logDebug('Analysis started', { companyName, jobTitle, useGemini: true });
            setIsProcessing(true);
            setError('');
            setCanRetry(false);
            setAnalysisTimeout(false);

            // Validate Gemini is configured
            if (!validateGeminiSetup()) {
                throw new Error('Google Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your .env file');
            }

            setStatusText('Converting PDF to image...');
            const imageFile = await convertPdfToImage(file);
            if(!imageFile.file) throw new Error('Failed to convert PDF to image');
            logDebug('PDF converted to image', { fileName: imageFile.file.name });

            setStatusText('Extracting resume text...');
            const resumeText = await extractTextFromPDF(file);
            if (!resumeText || resumeText.length < 50) {
                throw new Error('Could not extract meaningful text from PDF. Ensure it\'s a valid, text-based resume.');
            }
            logDebug('PDF text extracted', { length: resumeText.length });

            // Generate unique ID and image URL
            const uuid = generateUUID();
            const imageBlob = imageFile.file;
            const imageUrl = URL.createObjectURL(imageBlob);

            setStatusText('Preparing data...');
            const data: any = {
                id: uuid,
                imagePath: imageUrl,
                companyName, 
                jobTitle, 
                jobDescription,
                feedback: null,
            }
            
            // Store in localStorage
            const storageData = {
                ...data,
            };
            localStorage.setItem(`resume:${uuid}`, JSON.stringify(storageData));
            // Also store the image blob for later retrieval
            localStorage.setItem(`resume:${uuid}:image`, imageUrl);
            logDebug('Resume data saved to localStorage', { uuid });

            // Allow skipping analysis
            if (skipAnalysis) {
                setStatusText('Skipping analysis, redirecting...');
                logDebug('Analysis skipped');
                setTimeout(() => {
                    navigate(`/resume/${uuid}`);
                }, 1000);
                return;
            }

            setStatusText('Analyzing resume with Google Gemini (30-60 seconds)...');
            logDebug('Starting Gemini analysis');

            // Add timeout protection (60 seconds)
            const timeoutPromise = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('TIMEOUT')), 60000)
            );

            let analysisText: string;
            try {
                logDebug('Sending to Gemini API', { textLength: resumeText.length });
                
                analysisText = await Promise.race([
                    analyzeResumeWithGemini(
                        resumeText,
                        prepareInstructions({ jobTitle, jobDescription })
                    ),
                    timeoutPromise
                ]) as string;
                
                logDebug('Gemini analysis received', { length: analysisText?.length });
            } catch (err: any) {
                logDebug('Gemini error', { error: err.message });
                if (err.message === 'TIMEOUT') {
                    setAnalysisTimeout(true);
                    throw new Error('Analysis took too long. Try a shorter resume or skip analysis.');
                }
                const errorMsg = err?.message || 'Unknown error';
                throw new Error(`Analysis failed: ${errorMsg}`);
            }

            if (!analysisText) throw new Error('No response from analysis service');

            logDebug('Parsing analysis response', { preview: analysisText.substring(0, 100) });

            try {
                // Remove markdown code blocks if present
                let cleanText = analysisText
                    .replace(/```json\n?/g, '')
                    .replace(/```\n?/g, '')
                    .trim();

                data.feedback = JSON.parse(cleanText);
                logDebug('Parsed feedback successfully', { score: data.feedback?.overallScore });
            } catch (parseErr: any) {
                logDebug('JSON parse failed', { text: analysisText.substring(0, 300) });
                throw new Error(`Failed to parse analysis response: ${analysisText.substring(0, 150)}...`);
            }

            // Store final result
            localStorage.setItem(`resume:${uuid}`, JSON.stringify({
                ...data,
            }));
            
            setStatusText('Analysis complete, redirecting...');
            logDebug('Analysis complete and stored', { uuid });
            setTimeout(() => {
                navigate(`/resume/${uuid}`);
            }, 500);
        } catch (err: any) {
            const errorMsg = err?.message || 'Unknown error occurred';
            logDebug('Analysis error', { errorMsg });
            setError(errorMsg);
            setStatusText('Error');
            setCanRetry(true);
            setIsProcessing(false);
            console.error('Analysis error:', err);
        }
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget.closest('form');
        if(!form) return;
        const formData = new FormData(form);

        const companyName = formData.get('company-name') as string;
        const jobTitle = formData.get('job-title') as string;
        const jobDescription = formData.get('job-description') as string;

        if(!file) {
            setError('Please select a resume file');
            return;
        }

        handleAnalyze({ companyName, jobTitle, jobDescription, file });
    }

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
            <Navbar />

            <section className="main-section">
                <div className="page-heading py-16">
                    <h1 className="hero-title text-gradient-strong">Smart feedback for your dream job</h1>
                    {isProcessing ? (
                        <>
                            <h2 className="hero-subtitle text-gradient-subtle">{statusText}</h2>
                            {error ? (
                                <div className="mt-6 p-4 bg-red-50 border border-red-300 rounded-lg">
                                    <p className="text-red-700 font-semibold mb-3">⚠️ {error}</p>
                                    <div className="flex gap-3 flex-wrap">
                                        {canRetry && (
                                            <button
                                                onClick={() => {
                                                    if(file) {
                                                        const form = document.getElementById('upload-form') as HTMLFormElement;
                                                        if(form) {
                                                            const formData = new FormData(form);
                                                            const cName = formData.get('company-name') as string;
                                                            const jTitle = formData.get('job-title') as string;
                                                            const jDesc = formData.get('job-description') as string;
                                                            handleAnalyze({ companyName: cName, jobTitle: jTitle, jobDescription: jDesc, file });
                                                        }
                                                    }
                                                }}
                                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                                            >
                                                🔄 Retry
                                            </button>
                                        )}
                                        {analysisTimeout && (
                                            <button
                                                onClick={() => {
                                                    if(file) {
                                                        const form = document.getElementById('upload-form') as HTMLFormElement;
                                                        if(form) {
                                                            const formData = new FormData(form);
                                                            const cName = formData.get('company-name') as string;
                                                            const jTitle = formData.get('job-title') as string;
                                                            const jDesc = formData.get('job-description') as string;
                                                            handleAnalyze({ companyName: cName, jobTitle: jTitle, jobDescription: jDesc, file, skipAnalysis: true });
                                                        }
                                                    }
                                                }}
                                                className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 text-sm"
                                            >
                                                ⏭️ Skip & Proceed
                                            </button>
                                        )}
                                        <button
                                            onClick={() => {
                                                setIsProcessing(false);
                                                setError('');
                                                setCanRetry(false);
                                                setAnalysisTimeout(false);
                                            }}
                                            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                                        >
                                            ✕ Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <img src="/images/resume-scan.gif" className="w-full" />
                            )}
                        </>
                    ) : (
                        <h2 className="hero-subtitle text-gradient-subtle">Drop your resume for an ATS score and improvement tips</h2>
                    )} 
                    {!isProcessing && (
                        <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
                            <div className="form-div">
                                <label htmlFor="company-name">Company Name</label>
                                <input type="text" name="company-name" placeholder="Company Name" id="company-name" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-title">Job Title</label>
                                <input type="text" name="job-title" placeholder="Job Title" id="job-title" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-description">Job Description</label>
                                <textarea rows={5} name="job-description" placeholder="Job Description" id="job-description" />
                            </div>

                            <div className="form-div">
                                <label htmlFor="uploader">Upload Resume</label>
                                <FileUploader onFileSelect={handleFileSelect} />
                            </div>

                            <button className="primary-button" type="submit">
                                Analyze Resume
                            </button>

                            {/* Setup Instructions */}
                            <details className="mt-4 p-3 bg-blue-50 rounded text-sm border border-blue-300">
                                <summary className="cursor-pointer font-semibold text-blue-900">
                                    ℹ️ Google Gemini API Setup
                                </summary>
                                <div className="mt-3 text-blue-800 space-y-2">
                                    <p><strong>Step 1:</strong> Get API Key</p>
                                    <ul className="list-disc list-inside ml-2 spacing-y-1">
                                        <li>Go to <a href="https://aistudio.google.com/app/apikey" target="_blank" className="underline">Google AI Studio</a></li>
                                        <li>Click "Create API Key"</li>
                                        <li>Copy the generated API key</li>
                                    </ul>
                                    
                                    <p className="mt-2"><strong>Step 2:</strong> Configure Project</p>
                                    <ul className="list-disc list-inside ml-2">
                                        <li>Create <code className="bg-white px-1">.env</code> file in project root</li>
                                        <li>Add: <code className="bg-white px-1">VITE_GEMINI_API_KEY=your-api-key-here</code></li>
                                        <li>Restart dev server</li>
                                    </ul>

                                    <p className="mt-2"><strong>Status: </strong>
                                        {validateGeminiSetup() ? (
                                            <span className="text-green-600 font-bold">✅ API Key Configured</span>
                                        ) : (
                                            <span className="text-red-600 font-bold">❌ API Key Missing</span>
                                        )}
                                    </p>

                                    {!validateGeminiSetup() && (
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                logDebug('Using test data', {});
                                                const uuid = generateUUID();
                                                const testData = {
                                                    id: uuid,
                                                    companyName: 'Test Company',
                                                    jobTitle: 'Test Position',
                                                    jobDescription: 'Test job description',
                                                    imagePath: '/images/resume_01.png',
                                                    feedback: generateTestFeedback(),
                                                };
                                                localStorage.setItem(`resume:${uuid}`, JSON.stringify(testData));
                                                navigate(`/resume/${uuid}`);
                                            }}
                                            className="mt-3 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                                        >
                                            📊 Try with Sample Data
                                        </button>
                                    )}
                                </div>
                            </details>
                        </form>
                    )}
                </div>
            </section>
        </main>
    )
}
export default Upload
