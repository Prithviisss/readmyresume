import { Link } from "react-router";
import Navbar from "~/components/Navbar";
import { useState } from "react";

interface TemplateOptionModalProps {
    template: TemplateType;
    isOpen: boolean;
    onClose: () => void;
    onDownload: (filename: string) => void;
}

interface TemplateType {
    id: number;
    name: string;
    description: string;
    filename: string;
    icon: string;
}

const TemplateOptionModal = ({ template, isOpen, onClose, onDownload }: TemplateOptionModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl p-8 max-w-sm w-full mx-4 border border-gray-200 dark:border-gray-700">
                <div className="text-center mb-6">
                    <div className="text-5xl mb-4">{template.icon}</div>
                    <h2 className="text-2xl font-bold mb-2">{template.name}</h2>
                    <p className="text-gray-600 dark:text-gray-400">{template.description}</p>
                </div>

                <div className="space-y-3 mb-6">
                    <button
                        onClick={() => {
                            window.open(`/templates/${template.filename}`, '_blank');
                            onClose();
                        }}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
                    >
                        👁️ View Preview
                    </button>
                    <button
                        onClick={() => {
                            onDownload(template.filename);
                            onClose();
                        }}
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
                    >
                        ⬇️ Download PDF
                    </button>
                    <button
                        onClick={() => {
                            const text = `Check out this resume template: ${template.name}`;
                            navigator.clipboard.writeText(text);
                            alert('Template info copied to clipboard!');
                        }}
                        className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
                    >
                        📋 Copy Info
                    </button>
                </div>

                <button
                    onClick={onClose}
                    className="w-full bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-2 px-4 rounded-md transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default function Templates() {
    const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const templates: TemplateType[] = [
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

    const openModal = (template: TemplateType) => {
        setSelectedTemplate(template);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedTemplate(null);
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
                                        onClick={() => openModal(template)}
                                        className="primary-button w-full py-2 rounded-md transition-all hover:scale-105 text-sm"
                                    >
                                        View Options
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

            {/* Modal */}
            {selectedTemplate && (
                <TemplateOptionModal
                    template={selectedTemplate}
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    onDownload={handleDownload}
                />
            )}
        </main>
    );
}
