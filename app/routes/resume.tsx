import {Link, useNavigate, useParams} from "react-router";
import {useEffect, useState} from "react";
import Summary from "~/components/Summary";
import ATS from "~/components/ATS";
import Details from "~/components/Details";
import FitScore from "~/components/FitScore";

export const meta = () => ([
    { title: 'Resumind | Review ' },
    { name: 'description', content: 'Detailed overview of your resume' },
])

const Resume = () => {
    const { id } = useParams();
    const [imageUrl, setImageUrl] = useState('');
    const [resumeUrl, setResumeUrl] = useState('');
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [jobTitle, setJobTitle] = useState<string | undefined>();
    const [companyName, setCompanyName] = useState<string | undefined>();
    const navigate = useNavigate();

    useEffect(() => {
        const loadResume = async () => {
            if (!id) return;

            try {
                // Load from localStorage
                const resumeData = localStorage.getItem(`resume:${id}`);
                if (!resumeData) {
                    console.error('Resume not found');
                    return;
                }

                const data = JSON.parse(resumeData);

                // Set image URL
                if (data.imagePath) {
                    if (data.imagePath.startsWith('blob:')) {
                        setImageUrl(data.imagePath);
                    } else {
                        // Try to get from localStorage if it's a stored image
                        const storedImageUrl = localStorage.getItem(`resume:${id}:image`);
                        if (storedImageUrl) {
                            setImageUrl(storedImageUrl);
                        } else {
                            setImageUrl(data.imagePath);
                        }
                    }
                }

                setFeedback(data.feedback);
                setJobTitle(data.jobTitle);
                setCompanyName(data.companyName);
                
                console.log('Resume loaded:', { id, feedback: data.feedback, jobTitle: data.jobTitle, companyName: data.companyName });
            } catch (err) {
                console.error('Error loading resume:', err);
            }
        }

        loadResume();
    }, [id]);

    return (
        <main className="!pt-0">
            <nav className="resume-nav">
                <Link to="/" className="back-button">
                    <img src="/icons/back.svg" alt="logo" className="w-2.5 h-2.5" />
                    <span className="text-gray-800 text-sm font-semibold">Back to Homepage</span>
                </Link>
            </nav>
            <div className="flex flex-row w-full max-lg:flex-col-reverse">
                <section className="feedback-section bg-[url('/images/bg-small.svg') bg-cover h-[100vh] sticky top-0 items-center justify-center">
                    {imageUrl && resumeUrl && (
                        <div className="animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] max-wxl:h-fit w-fit">
                            <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                                <img
                                    src={imageUrl}
                                    className="w-full h-full object-contain rounded-2xl"
                                    title="resume"
                                />
                            </a>
                        </div>
                    )}
                </section>
                <section className="feedback-section">
                    <h2 className="text-4xl !text-black font-bold">Resume Review</h2>
                    {feedback ? (
                        <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
                            <FitScore 
                                feedback={feedback} 
                                jobTitle={jobTitle}
                                companyName={companyName}
                            />
                            <Summary feedback={feedback} />
                            <ATS score={feedback.ATS.score || 0} suggestions={feedback.ATS.tips || []} />
                            <Details feedback={feedback} />
                        </div>
                    ) : (
                        <img src="/images/resume-scan-2.gif" className="w-full" />
                    )}
                </section>
            </div>
        </main>
    )
}
export default Resume
