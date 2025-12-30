import { useState } from "react";
import { X, Building2, Briefcase, Link, Save } from "lucide-react";

export default function SaveApplicationModal({
    isOpen,
    onClose,
    onSave,
    analysis,
    latex,
    optimizedLatex,
    jobDescription,
    isLoading
}) {
    const [companyName, setCompanyName] = useState("");
    const [jobTitle, setJobTitle] = useState("");
    const [applicationLink, setApplicationLink] = useState("");

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!companyName.trim()) return;

        onSave({
            company_name: companyName.trim(),
            job_title: jobTitle.trim(),
            application_link: applicationLink.trim(),
            status: 'applied',
            resume_latex: latex,
            optimized_latex: optimizedLatex,
            job_description: jobDescription,
            analysis: analysis,
            ats_score: analysis?.score || null
        });
    };

    const handleClose = () => {
        setCompanyName("");
        setJobTitle("");
        setApplicationLink("");
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                            <Save className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-800">Save Application</h2>
                            <p className="text-sm text-slate-500">Track this job application</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Company Name */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                            <Building2 className="w-4 h-4" />
                            Company Name *
                        </label>
                        <input
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="e.g., Google, Amazon"
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-700 placeholder:text-slate-400"
                            required
                            autoFocus
                        />
                    </div>

                    {/* Job Title */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                            <Briefcase className="w-4 h-4" />
                            Job Title
                        </label>
                        <input
                            type="text"
                            value={jobTitle}
                            onChange={(e) => setJobTitle(e.target.value)}
                            placeholder="e.g., Senior Software Engineer"
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-700 placeholder:text-slate-400"
                        />
                    </div>

                    {/* Application Link */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                            <Link className="w-4 h-4" />
                            Application Link
                        </label>
                        <input
                            type="url"
                            value={applicationLink}
                            onChange={(e) => setApplicationLink(e.target.value)}
                            placeholder="https://careers.company.com/job-id"
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-700 placeholder:text-slate-400"
                        />
                    </div>

                    {/* ATS Score Preview */}
                    {analysis?.score && (
                        <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                            <span className="text-sm text-emerald-700">ATS Score</span>
                            <span className="text-lg font-bold text-emerald-600">{analysis.score}%</span>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!companyName.trim() || isLoading}
                            className="flex-1 px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-medium transition-colors"
                        >
                            {isLoading ? "Saving..." : "Save Application"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
