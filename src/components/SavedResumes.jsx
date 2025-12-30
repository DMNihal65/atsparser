import { X, Clock, Trash2, FileText, CheckCircle } from "lucide-react";

export default function SavedResumes({ isOpen, onClose, resumes, onLoad, onDelete }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-800">Saved Resumes</h2>
                            <p className="text-sm text-slate-500">{resumes.length} saved</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {resumes.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
                                <FileText className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-slate-600 font-medium mb-1">No Saved Resumes</h3>
                            <p className="text-slate-400 text-sm">
                                Analyzed resumes will appear here
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {resumes.map((resume) => (
                                <div
                                    key={resume.id}
                                    className="p-4 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all cursor-pointer group"
                                    onClick={() => onLoad(resume)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-medium text-slate-800 truncate">
                                                    {resume.name}
                                                </h3>
                                                {resume.optimizedLatex && (
                                                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-medium border border-emerald-200">
                                                        <CheckCircle className="w-3 h-3" />
                                                        Optimized
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {new Date(resume.createdAt).toLocaleDateString()}
                                                </span>
                                                {resume.analysis?.score && (
                                                    <span className={`font-medium ${resume.analysis.score >= 80 ? "text-emerald-600" :
                                                            resume.analysis.score >= 60 ? "text-amber-500" : "text-red-500"
                                                        }`}>
                                                        Score: {resume.analysis.score}%
                                                    </span>
                                                )}
                                            </div>
                                            {resume.jobDescription && (
                                                <p className="text-xs text-slate-400 mt-2 truncate">
                                                    {resume.jobDescription.substring(0, 80)}...
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete(resume.id);
                                            }}
                                            className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
                    <p className="text-xs text-slate-500 text-center">
                        Click on a resume to load it • Data stored locally in your browser
                    </p>
                </div>
            </div>
        </div>
    );
}
