import {
    Target,
    TrendingUp,
    TrendingDown,
    AlertCircle,
    CheckCircle2,
    XCircle,
    ChevronDown,
    ChevronUp,
    Sparkles,
} from "lucide-react";
import { useState } from "react";

export default function AnalysisResults({ analysis, isLoading }) {
    const [expandedSections, setExpandedSections] = useState({});

    if (isLoading) {
        return (
            <div className="flex flex-col h-full bg-slate-900 rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl">
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/50 border-b border-slate-700/50">
                    <Target className="w-5 h-5 text-green-400" />
                    <span className="font-semibold text-white">ATS Analysis</span>
                </div>
                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="text-center">
                        <div className="relative w-20 h-20 mx-auto mb-4">
                            <div className="absolute inset-0 rounded-full border-4 border-purple-500/20"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-purple-500 border-t-transparent animate-spin"></div>
                            <div className="absolute inset-2 rounded-full bg-slate-800 flex items-center justify-center">
                                <Sparkles className="w-8 h-8 text-purple-400 animate-pulse" />
                            </div>
                        </div>
                        <p className="text-slate-400 font-medium">Analyzing your resume...</p>
                        <p className="text-slate-500 text-sm mt-1">This may take a few seconds</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!analysis) {
        return (
            <div className="flex flex-col h-full bg-slate-900 rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl">
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/50 border-b border-slate-700/50">
                    <Target className="w-5 h-5 text-green-400" />
                    <span className="font-semibold text-white">ATS Analysis</span>
                </div>
                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="text-center max-w-md">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-800 flex items-center justify-center">
                            <Target className="w-8 h-8 text-slate-600" />
                        </div>
                        <h3 className="text-slate-400 font-medium mb-2">No Analysis Yet</h3>
                        <p className="text-slate-500 text-sm">
                            Enter a job description and click "Analyze Resume" to get your ATS score and optimization suggestions.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const getScoreColor = (score) => {
        if (score >= 80) return "text-green-400";
        if (score >= 60) return "text-yellow-400";
        if (score >= 40) return "text-orange-400";
        return "text-red-400";
    };

    const getScoreGradient = (score) => {
        if (score >= 80) return "from-green-500 to-emerald-500";
        if (score >= 60) return "from-yellow-500 to-amber-500";
        if (score >= 40) return "from-orange-500 to-amber-500";
        return "from-red-500 to-rose-500";
    };

    const getScoreBg = (score) => {
        if (score >= 80) return "bg-green-500/10 border-green-500/30";
        if (score >= 60) return "bg-yellow-500/10 border-yellow-500/30";
        if (score >= 40) return "bg-orange-500/10 border-orange-500/30";
        return "bg-red-500/10 border-red-500/30";
    };

    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case "high":
                return "bg-red-500/20 text-red-400 border-red-500/30";
            case "medium":
                return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
            case "low":
                return "bg-green-500/20 text-green-400 border-green-500/30";
            default:
                return "bg-slate-500/20 text-slate-400 border-slate-500/30";
        }
    };

    const toggleSection = (section) => {
        setExpandedSections((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    // Group suggestions by section
    const groupedSuggestions = analysis.suggestions?.reduce((acc, suggestion) => {
        const section = suggestion.section || "General";
        if (!acc[section]) acc[section] = [];
        acc[section].push(suggestion);
        return acc;
    }, {}) || {};

    return (
        <div className="flex flex-col h-full bg-slate-900 rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl">
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/50 border-b border-slate-700/50">
                <Target className="w-5 h-5 text-green-400" />
                <span className="font-semibold text-white">ATS Analysis Results</span>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4 space-y-4">
                {/* Score Card */}
                <div className={`p-6 rounded-xl border ${getScoreBg(analysis.score)}`}>
                    <div className="flex items-center gap-6">
                        {/* Circular Score */}
                        <div className="relative">
                            <svg className="w-24 h-24 transform -rotate-90">
                                <circle
                                    cx="48"
                                    cy="48"
                                    r="40"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="none"
                                    className="text-slate-700"
                                />
                                <circle
                                    cx="48"
                                    cy="48"
                                    r="40"
                                    stroke="url(#scoreGradient)"
                                    strokeWidth="8"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeDasharray={`${(analysis.score / 100) * 251.2} 251.2`}
                                    className="transition-all duration-1000 ease-out"
                                />
                                <defs>
                                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" className={`${getScoreColor(analysis.score).replace('text-', 'stop-color-')}`} stopColor={analysis.score >= 80 ? '#22c55e' : analysis.score >= 60 ? '#eab308' : analysis.score >= 40 ? '#f97316' : '#ef4444'} />
                                        <stop offset="100%" className={`${getScoreColor(analysis.score).replace('text-', 'stop-color-')}`} stopColor={analysis.score >= 80 ? '#10b981' : analysis.score >= 60 ? '#f59e0b' : analysis.score >= 40 ? '#f59e0b' : '#f43f5e'} />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className={`text-2xl font-bold ${getScoreColor(analysis.score)}`}>
                                    {analysis.score}%
                                </span>
                            </div>
                        </div>

                        {/* Score Details */}
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white mb-1">ATS Compatibility Score</h3>
                            <p className="text-sm text-slate-400 mb-3">
                                {analysis.score >= 80
                                    ? "Excellent! Your resume is highly ATS-compatible."
                                    : analysis.score >= 60
                                        ? "Good, but there's room for improvement."
                                        : analysis.score >= 40
                                            ? "Needs work. Follow the suggestions below."
                                            : "Poor match. Significant optimization needed."}
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5 text-sm">
                                    {analysis.score >= 60 ? (
                                        <TrendingUp className="w-4 h-4 text-green-400" />
                                    ) : (
                                        <TrendingDown className="w-4 h-4 text-red-400" />
                                    )}
                                    <span className="text-slate-400">
                                        Target: <span className="text-white font-medium">90%+</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Keywords Section */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Present Keywords */}
                    <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                        <div className="flex items-center gap-2 mb-3">
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                            <span className="text-sm font-medium text-green-400">
                                Keywords Found ({analysis.presentKeywords?.length || 0})
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {analysis.presentKeywords?.slice(0, 15).map((keyword, index) => (
                                <span
                                    key={index}
                                    className="px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-300 border border-green-500/30"
                                >
                                    {keyword}
                                </span>
                            ))}
                            {analysis.presentKeywords?.length > 15 && (
                                <span className="px-2 py-0.5 text-xs rounded-full bg-slate-700 text-slate-400">
                                    +{analysis.presentKeywords.length - 15} more
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Missing Keywords */}
                    <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                        <div className="flex items-center gap-2 mb-3">
                            <XCircle className="w-4 h-4 text-red-400" />
                            <span className="text-sm font-medium text-red-400">
                                Missing Keywords ({analysis.missingKeywords?.length || 0})
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {analysis.missingKeywords?.slice(0, 15).map((keyword, index) => (
                                <span
                                    key={index}
                                    className="px-2 py-0.5 text-xs rounded-full bg-red-500/20 text-red-300 border border-red-500/30"
                                >
                                    {keyword}
                                </span>
                            ))}
                            {analysis.missingKeywords?.length > 15 && (
                                <span className="px-2 py-0.5 text-xs rounded-full bg-slate-700 text-slate-400">
                                    +{analysis.missingKeywords.length - 15} more
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Summary */}
                {analysis.summary && (
                    <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-4 h-4 text-purple-400" />
                            <span className="text-sm font-medium text-purple-400">AI Summary</span>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed">{analysis.summary}</p>
                    </div>
                )}

                {/* Suggestions by Section */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm font-medium text-yellow-400">
                            Optimization Suggestions ({analysis.suggestions?.length || 0})
                        </span>
                    </div>

                    {Object.entries(groupedSuggestions).map(([section, suggestions]) => (
                        <div
                            key={section}
                            className="rounded-xl bg-slate-800/50 border border-slate-700/50 overflow-hidden"
                        >
                            <button
                                onClick={() => toggleSection(section)}
                                className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-800 transition-colors"
                            >
                                <span className="font-medium text-white">{section}</span>
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 text-xs rounded-full bg-slate-700 text-slate-400">
                                        {suggestions.length}
                                    </span>
                                    {expandedSections[section] ? (
                                        <ChevronUp className="w-4 h-4 text-slate-400" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4 text-slate-400" />
                                    )}
                                </div>
                            </button>

                            {expandedSections[section] && (
                                <div className="px-4 pb-3 space-y-2">
                                    {suggestions.map((suggestion, index) => (
                                        <div
                                            key={index}
                                            className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/50 border border-slate-700/30"
                                        >
                                            <span
                                                className={`px-2 py-0.5 text-xs rounded-full border whitespace-nowrap ${getPriorityColor(
                                                    suggestion.priority
                                                )}`}
                                            >
                                                {suggestion.priority}
                                            </span>
                                            <p className="text-sm text-slate-300 flex-1">
                                                {suggestion.suggestion}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
