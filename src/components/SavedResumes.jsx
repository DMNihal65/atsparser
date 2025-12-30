import { useState } from "react";
import {
    Clock,
    FileText,
    Trash2,
    Download,
    ChevronRight,
    FolderOpen,
    Target,
} from "lucide-react";
import { getResumes, deleteResume } from "../services/storage";

export default function SavedResumes({ onLoad, onClose }) {
    const [resumes, setResumes] = useState(getResumes());
    const [confirmDelete, setConfirmDelete] = useState(null);

    const handleDelete = (id) => {
        if (confirmDelete === id) {
            deleteResume(id);
            setResumes(getResumes());
            setConfirmDelete(null);
        } else {
            setConfirmDelete(id);
            // Auto-reset after 3 seconds
            setTimeout(() => setConfirmDelete(null), 3000);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (resumes.length === 0) {
        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-slate-900 rounded-2xl border border-slate-700/50 w-full max-w-2xl shadow-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
                        <div className="flex items-center gap-2">
                            <FolderOpen className="w-5 h-5 text-purple-400" />
                            <span className="font-semibold text-white">Saved Resumes</span>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                        >
                            ×
                        </button>
                    </div>
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-800 flex items-center justify-center">
                            <FileText className="w-8 h-8 text-slate-600" />
                        </div>
                        <h3 className="text-slate-400 font-medium mb-2">No Saved Resumes</h3>
                        <p className="text-slate-500 text-sm max-w-md mx-auto">
                            After analyzing and optimizing a resume, click "Save Resume" to store it for future reference.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 rounded-2xl border border-slate-700/50 w-full max-w-3xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
                    <div className="flex items-center gap-2">
                        <FolderOpen className="w-5 h-5 text-purple-400" />
                        <span className="font-semibold text-white">Saved Resumes</span>
                        <span className="px-2 py-0.5 text-xs rounded-full bg-slate-700 text-slate-400">
                            {resumes.length}
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors text-2xl"
                    >
                        ×
                    </button>
                </div>

                {/* Resume List */}
                <div className="flex-1 overflow-auto p-4 space-y-3">
                    {resumes.map((resume) => (
                        <div
                            key={resume.id}
                            className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-purple-500/30 transition-all group"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-medium text-white truncate">
                                            {resume.name}
                                        </h3>
                                        {resume.analysis?.score && (
                                            <span
                                                className={`px-2 py-0.5 text-xs rounded-full border ${resume.analysis.score >= 80
                                                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                                                        : resume.analysis.score >= 60
                                                            ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                                                            : "bg-red-500/20 text-red-400 border-red-500/30"
                                                    }`}
                                            >
                                                <Target className="w-3 h-3 inline mr-1" />
                                                {resume.analysis.score}%
                                            </span>
                                        )}
                                        {resume.optimizedLatex && (
                                            <span className="px-2 py-0.5 text-xs rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                                Optimized
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {formatDate(resume.createdAt)}
                                        </span>
                                        {resume.jobDescription && (
                                            <span className="truncate max-w-xs">
                                                JD: {resume.jobDescription.substring(0, 50)}...
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleDelete(resume.id)}
                                        className={`p-2 rounded-lg transition-colors ${confirmDelete === resume.id
                                                ? "bg-red-500/20 text-red-400"
                                                : "hover:bg-slate-700 text-slate-400 hover:text-red-400"
                                            }`}
                                        title={confirmDelete === resume.id ? "Click again to confirm" : "Delete"}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            onLoad(resume);
                                            onClose();
                                        }}
                                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 transition-colors text-sm"
                                    >
                                        Load
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
