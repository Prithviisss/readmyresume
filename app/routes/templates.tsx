import { Link } from "react-router";
import Navbar from "~/components/Navbar";

export default function Templates() {
    const templates = [
        {
            id: 1,
            name: "Modern Minimal",
            description: "Clean, contemporary design with excellent ATS compatibility",
            filename: "modern-minimal.pdf",
            icon: "✨"
        },
        {
            id: 2,
            name: "Professional Classic",
            description: "Traditional and formal layout, perfect for corporate roles",
            filename: "professional-classic.pdf",
            icon: "💼"
        },
        {
            id: 3,
            name: "Creative Bold",
            description: "Eye-catching design for creative and design-focused roles",
            filename: "creative-bold.pdf",
            icon: "🎨"
        },
        {
            id: 4,
            name: "Tech Focus",
            description: "Optimized for tech professionals with skills showcase",
            filename: "tech-focus.pdf",
            icon: "💻"
        },
        {
            id: 5,
            name: "Executive Premium",
            description: "High-end design for senior and executive positions",
            filename: "executive-premium.pdf",
            icon: "👔"
        }
    ];

    const handleDownload = (filename: string) => {
        const link = document.createElement("a");
        link.href = `/templates/${filename}`;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen">
            <Navbar />

            <section className="main-section">
                <div className="page-heading py-16">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <h1 className="hero-title text-gradient-strong">Resume Templates</h1>
                        <p className="hero-subtitle text-gradient-subtle mt-4">
                            Download professionally designed templates optimized for ATS systems
                        </p>
                    </div>

                    {/* Templates Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                        {templates.map((template) => (
                            <div
                                key={template.id}
                                className="bg-white/10 backdrop-blur rounded-lg border border-white/20 hover:border-white/40 transition-all overflow-hidden hover:shadow-lg"
                            >
                                {/* Icon */}
                                <div className="h-20 flex items-center justify-center text-4xl bg-gradient-to-r from-blue-500/20 to-purple-500/20">
                                    {template.icon}
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    <h2 className="text-xl font-bold mb-2">{template.name}</h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{template.description}</p>

                                    <button
                                        onClick={() => handleDownload(template.filename)}
                                        className="primary-button w-full py-2 rounded-md transition-all hover:scale-105 text-sm"
                                    >
                                        ⬇️ Download PDF
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* CTA Section */}
                    <div className="bg-white/10 backdrop-blur rounded-lg border border-white/20 p-8 md:p-12 text-center max-w-2xl mx-auto">
                        <h2 className="text-2xl font-bold text-white mb-4">Ready to Analyze Your Resume?</h2>
                        <p className="text-gray-300 mb-6">
                            Download a template, fill it out, and use our AI analyzer to get instant feedback.
                        </p>
                        <Link to="/upload" className="primary-button inline-block py-3 px-8 rounded-md">
                            Analyze Your Resume →
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
