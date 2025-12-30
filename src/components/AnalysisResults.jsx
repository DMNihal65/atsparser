import { useState } from "react";
import { BarChart3, CheckCircle2, XCircle, Lightbulb, ChevronDown, ChevronUp, Sparkles } from "lucide-react";

export default function AnalysisResults({ analysis, isLoading }) {
    const [expandedSections, setExpandedSections] = useState({});

    const toggleSection = (section) => {
        setExpandedSections((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 p-8 card-shadow">
                <div className="flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-full border-3 border-emerald-500 border-t-transparent animate-spin mb-4"></div>
                    <p className="text-slate-600 font-medium">Analyzing your resume...</p>
                    <p className="text-slate-400 text-sm mt-1">This may take a few seconds</p>
                </div>
            </div>
        );
    }

    if (!analysis) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 p-8 card-shadow">
                <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                        <BarChart3 className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-slate-700 font-semibold mb-2">No Analysis Yet</h3>
                    <p className="text-slate-500 text-sm max-w-xs">
                        Enter a job description and click "Analyze" to get ATS optimization recommendations
                    </p>
                </div>
            </div>
        );
    }

    const getScoreColor = (score) => {
        if (score >= 80) return "text-emerald-600";
        if (score >= 60) return "text-amber-500";
        return "text-red-500";
    };

    const getScoreRingColor = (score) => {
        if (score >= 80) return "#10b981";
        if (score >= 60) return "#f59e0b";
        return "#ef4444";
    };

    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case "high":
                return "bg-red-50 text-red-600 border-red-200";
            case "medium":
                return "bg-amber-50 text-amber-600 border-amber-200";
            case "low":
                return "bg-emerald-50 text-emerald-600 border-emerald-200";
            default:
                return "bg-slate-50 text-slate-600 border-slate-200";
        }
    };

    // Group suggestions by section
    const groupedSuggestions = analysis.suggestions?.reduce((acc, suggestion) => {
        const section = suggestion.section || "General";
        if (!acc[section]) acc[section] = [];
        acc[section].push(suggestion);
        return acc;
    }, {});

    const circumference = 2 * Math.PI * 40;
    const progress = (analysis.score / 100) * circumference;

    return (
        <div className="space-y-4">
            {/* Score Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 card-shadow">
                <div className="flex items-center gap-6">
                    {/* Circular Progress */}
                    <div className="relative w-24 h-24 flex-shrink-0">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="48"
                                cy="48"
                                r="40"
                                stroke="#e2e8f0"
                                strokeWidth="8"
                                fill="none"
                            />
                            <circle
                                cx="48"
                                cy="48"
                                r="40"
                                stroke={getScoreRingColor(analysis.score)}
                                strokeWidth="8"
                                fill="none"
                                strokeLinecap="round"
                                strokeDasharray={`${progress} ${circumference}`}
                                className="score-circle"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className={`text-2xl font-bold ${getScoreColor(analysis.score)}`}>
                                {analysis.score}%
                            </span>
                        </div>
                    </div>

                    {/* Score Details */}
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-800 mb-1">ATS Score</h3>
                        <p className="text-sm text-slate-500 mb-3">
                            {analysis.score >= 80
                                ? "Excellent! Your resume is well-optimized."
                                : analysis.score >= 60
                                    ? "Good, but there's room for improvement."
                                    : "Needs improvement for better ATS compatibility."}
                        </p>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                <span className="text-sm text-slate-600">
                                    {analysis.presentKeywords?.length || 0} found
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <XCircle className="w-4 h-4 text-red-400" />
                                <span className="text-sm text-slate-600">
                                    {analysis.missingKeywords?.length || 0} missing
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Keywords */}
            <div className="grid grid-cols-2 gap-4">
                {/* Found Keywords */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 card-shadow">
                    <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        Keywords Found
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                        {analysis.presentKeywords?.slice(0, 12).map((keyword, i) => (
                            <span
                                key={i}
                                className="px-2 py-1 text-xs rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200"
                            >
                                {keyword}
                            </span>
                        ))}
                        {analysis.presentKeywords?.length > 12 && (
                            <span className="px-2 py-1 text-xs rounded-md bg-slate-100 text-slate-500">
                                +{analysis.presentKeywords.length - 12} more
                            </span>
                        )}
                    </div>
                </div>

                {/* Missing Keywords */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 card-shadow">
                    <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-400" />
                        Missing Keywords
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                        {analysis.missingKeywords?.slice(0, 12).map((keyword, i) => (
                            <span
                                key={i}
                                className="px-2 py-1 text-xs rounded-md bg-red-50 text-red-600 border border-red-200"
                            >
                                {keyword}
                            </span>
                        ))}
                        {analysis.missingKeywords?.length > 12 && (
                            <span className="px-2 py-1 text-xs rounded-md bg-slate-100 text-slate-500">
                                +{analysis.missingKeywords.length - 12} more
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* AI Summary */}
            {analysis.summary && (
                <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4">
                    <div className="flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-semibold text-emerald-800 mb-1">AI Summary</h4>
                            <p className="text-sm text-emerald-700 leading-relaxed">{analysis.summary}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Suggestions */}
            {groupedSuggestions && Object.keys(groupedSuggestions).length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden card-shadow">
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                        <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-amber-500" />
                            Optimization Suggestions
                        </h4>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {Object.entries(groupedSuggestions).map(([section, suggestions]) => (
                            <div key={section}>
                                <button
                                    onClick={() => toggleSection(section)}
                                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
                                >
                                    <span className="text-sm font-medium text-slate-700">{section}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-400">
                                            {suggestions.length} suggestion{suggestions.length > 1 ? "s" : ""}
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
                                        {suggestions.map((suggestion, i) => (
                                            <div
                                                key={i}
                                                className="p-3 rounded-lg bg-slate-50 border border-slate-100"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <span
                                                        className={`px-2 py-0.5 text-xs rounded font-medium border ${getPriorityColor(
                                                            suggestion.priority
                                                        )}`}
                                                    >
                                                        {suggestion.priority || "Medium"}
                                                    </span>
                                                    <p className="text-sm text-slate-600 flex-1">
                                                        {suggestion.suggestion}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
