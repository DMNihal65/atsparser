import { FileText, X, Briefcase } from "lucide-react";

export default function JobDescriptionInput({ value, onChange }) {
    const sampleJobDescription = `Senior Software Engineer - Full Stack

We are looking for a passionate Senior Software Engineer to join our team. 

Requirements:
• 5+ years of experience with Python, JavaScript, and SQL
• Strong experience with React, Node.js, and RESTful APIs
• Experience with cloud platforms (AWS, GCP, or Azure)
• Familiarity with containerization (Docker, Kubernetes)
• Experience with CI/CD pipelines and DevOps practices
• Strong problem-solving skills and attention to detail
• Experience with Agile/Scrum methodologies

Nice to have:
• Experience with machine learning or data engineering
• Knowledge of TypeScript and GraphQL
• Experience with microservices architecture
• Contributions to open-source projects

Responsibilities:
• Design, develop, and maintain scalable web applications
• Collaborate with cross-functional teams
• Mentor junior developers
• Participate in code reviews and technical discussions`;

    const loadSample = () => {
        onChange(sampleJobDescription);
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 overflow-hidden card-shadow">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
                <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-emerald-600" />
                    <span className="font-semibold text-slate-700">Job Description</span>
                </div>
                <div className="flex items-center gap-2">
                    {value && (
                        <button
                            onClick={() => onChange("")}
                            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400"
                            title="Clear"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                    <span className="text-xs text-slate-400">
                        {value.length.toLocaleString()} chars
                    </span>
                </div>
            </div>

            {/* Textarea */}
            <div className="flex-1 relative">
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Paste the job description here...

Include details like:
• Required skills and technologies
• Years of experience needed
• Responsibilities
• Nice-to-have qualifications"
                    className="w-full h-full p-4 resize-none bg-white text-slate-700 placeholder:text-slate-400 focus:outline-none text-sm leading-relaxed"
                />
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-200">
                <button
                    onClick={loadSample}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm font-medium transition-colors border border-emerald-200"
                >
                    <FileText className="w-4 h-4" />
                    Load Sample Job Description
                </button>
            </div>
        </div>
    );
}
