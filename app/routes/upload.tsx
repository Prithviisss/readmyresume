import {type FormEvent, useState} from 'react'
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import {usePuterStore} from "~/lib/puter";
import {useNavigate} from "react-router";
import {convertPdfToImage} from "~/lib/pdf2img";
import {generateUUID} from "~/lib/utils";
import {prepareInstructions} from "../../constants";
import {logDebug, generateTestFeedback} from "~/lib/debug";

const Upload = () => {
    const { auth, isLoading, fs, ai, kv } = usePuterStore();
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

    const handleAnalyze = async ({ companyName, jobTitle, jobDescription, file, skipAnalysis = false }: { companyName: string, jobTitle: string, jobDescription: string, file: File, skipAnalysis?: boolean  }) => {
        try {
            logDebug('Analysis started', { companyName, jobTitle, fileName: file.name });
            setIsProcessing(true);
            setError('');
            setCanRetry(false);
            setAnalysisTimeout(false);

            setStatusText('Uploading the file...');
            const uploadedFile = await fs.upload([file]);
            if(!uploadedFile) throw new Error('Failed to upload resume file');
            logDebug('File uploaded', { path: uploadedFile.path });

            setStatusText('Converting to image...');
            const imageFile = await convertPdfToImage(file);
            if(!imageFile.file) throw new Error('Failed to convert PDF to image');
            logDebug('PDF converted to image', { fileName: imageFile.file.name });

            setStatusText('Uploading the image...');
            const uploadedImage = await fs.upload([imageFile.file]);
            if(!uploadedImage) throw new Error('Failed to upload resume preview image');
            logDebug('Image uploaded', { path: uploadedImage.path });

            setStatusText('Preparing data...');
            const uuid = generateUUID();
            const data: any = {
                id: uuid,
                resumePath: uploadedFile.path,
                imagePath: uploadedImage.path,
                companyName, 
                jobTitle, 
                jobDescription,
                feedback: null,
            }
            await kv.set(`resume:${uuid}`, JSON.stringify(data));
            logDebug('Resume data saved', { uuid });

            // Allow skipping analysis (useful if AI is slow/timing out)
            if (skipAnalysis) {
                setStatusText('Skipping analysis, redirecting...');
                logDebug('Analysis skipped');
                setTimeout(() => {
                    navigate(`/resume/${uuid}`);
                }, 1000);
                return;
            }

            setStatusText('Analyzing resume with AI (this may take 30-60 seconds)...');
            logDebug('Starting AI analysis', { uploadedFilePath: uploadedFile.path });

            // Add timeout protection (60 seconds)
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('TIMEOUT')), 60000)
            );

            let feedback;
            try {
                logDebug('Sending to AI', { model: 'claude-3-7-sonnet' });
                feedback = await Promise.race([
                    ai.feedback(
                        uploadedFile.path,
                        prepareInstructions({ jobTitle, jobDescription })
                    ),
                    timeoutPromise
                ]);
                logDebug('AI feedback received', { type: typeof feedback });
            } catch (err: any) {
                logDebug('AI feedback error', { error: err.message, type: err.name });
                if (err.message === 'TIMEOUT') {
                    setAnalysisTimeout(true);
                    throw new Error('Analysis took too long (60+ seconds). This usually means the AI service is busy. You can proceed without detailed analysis or try again.');
                }
                const errorMsg = err?.message || err?.response?.message || err?.toString() || 'Unknown AI service error';
                throw new Error(`AI Analysis failed: ${errorMsg}. This could be due to: 1) AI service being slow/unavailable, 2) Invalid API key/quota, 3) Resume file format issue. Try again or skip analysis.`);
            }

            if (!feedback) throw new Error('No response from AI analysis - please try again');

            let feedbackText = '';
            const feedbackObj = feedback as any;
            
            logDebug('Processing feedback structure', { keys: Object.keys(feedbackObj || {}) });
            
            if (typeof feedbackObj?.message?.content === 'string') {
                feedbackText = feedbackObj.message.content;
            } else if (Array.isArray(feedbackObj?.message?.content)) {
                feedbackText = feedbackObj.message.content[0]?.text || '';
            } else if (typeof feedbackObj?.content === 'string') {
                feedbackText = feedbackObj.content;
            } else if (Array.isArray(feedbackObj?.content)) {
                feedbackText = feedbackObj.content[0]?.text || feedbackObj.content[0] || '';
            }

            logDebug('Extracted feedback text length', { length: feedbackText.length, preview: feedbackText.substring(0, 100) });

            if (!feedbackText) {
                logDebug('Feedback extraction failed', { fullResponse: JSON.stringify(feedbackObj).substring(0, 500) });
                throw new Error('Failed to extract analysis response. Response format was unexpected.');
            }

            try {
                data.feedback = JSON.parse(feedbackText);
                logDebug('Parsed feedback successfully', { score: data.feedback?.overallScore });
            } catch (parseErr: any) {
                logDebug('JSON parse error', { text: feedbackText.substring(0, 300), error: parseErr.message });
                throw new Error(`Failed to parse AI response. Response was: "${feedbackText.substring(0, 300)}..."`);
            }

            await kv.set(`resume:${uuid}`, JSON.stringify(data));
            setStatusText('Analysis complete, redirecting...');
            logDebug('Analysis complete', { uuid });
            setTimeout(() => {
                navigate(`/resume/${uuid}`);
            }, 500);
        } catch (err: any) {
            const errorMsg = err?.message || 'Unknown error occurred';
            logDebug('Analysis error', { errorMsg });
            setError(errorMsg);
            setStatusText('Error during analysis');
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
                                    <div className="flex gap-3">
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
                                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                            >
                                                🔄 Retry Analysis
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
                                                className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
                                            >
                                                ⏭️ Skip Analysis & Proceed
                                            </button>
                                        )}
                                        <button
                                            onClick={() => {
                                                setIsProcessing(false);
                                                setError('');
                                                setCanRetry(false);
                                                setAnalysisTimeout(false);
                                            }}
                                            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
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

                            {/* Debug section - Remove in production */}
                            <details className="mt-4 p-3 bg-gray-100 rounded text-sm">
                                <summary className="cursor-pointer font-semibold text-gray-700">
                                    🔧 Troubleshooting
                                </summary>
                                <div className="mt-3 text-gray-600 space-y-2">
                                    <p>If analysis is failing:</p>
                                    <ol className="list-decimal list-inside space-y-1 ml-2">
                                        <li>Check browser console (F12) for error messages</li>
                                        <li>Ensure Puter.js is loaded (check window.puter in console)</li>
                                        <li>Try using test data to verify the app works</li>
                                        <li>Check your Puter account has AI credits/quota</li>
                                    </ol>
                                    {!isProcessing && (
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                logDebug('Using test data', {});
                                                const uuid = generateUUID();
                                                const testData = {
                                                    id: uuid,
                                                    resumePath: '/test/resume.pdf',
                                                    imagePath: '/test/resume.png',
                                                    companyName: 'Test Company',
                                                    jobTitle: 'Test Position',
                                                    jobDescription: 'Test job description',
                                                    feedback: generateTestFeedback(),
                                                };
                                                await kv.set(`resume:${uuid}`, JSON.stringify(testData));
                                                navigate(`/resume/${uuid}`);
                                            }}
                                            className="mt-3 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                                        >
                                            Test with Sample Data
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
