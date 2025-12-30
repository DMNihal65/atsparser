import { useState, useEffect } from "react";
import {
  Zap,
  Sparkles,
  Save,
  FolderOpen,
  ArrowLeftRight,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

import Header from "./components/Header";
import ResumeEditor from "./components/ResumeEditor";
import JobDescriptionInput from "./components/JobDescriptionInput";
import AnalysisResults from "./components/AnalysisResults";
import PdfPreview from "./components/PdfPreview";
import SavedResumes from "./components/SavedResumes";

import { analyzeResume, optimizeResume } from "./services/gemini";
import { getDefaultResume, saveResume } from "./services/storage";

import "./App.css";

export default function App() {
  // State
  const [latex, setLatex] = useState("");
  const [optimizedLatex, setOptimizedLatex] = useState(null);
  const [showOptimized, setShowOptimized] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showSavedResumes, setShowSavedResumes] = useState(false);
  const [notification, setNotification] = useState(null);

  // Load default resume on mount
  useEffect(() => {
    setLatex(getDefaultResume());
  }, []);

  // Show notification
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Handle analyze
  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      showNotification("Please enter a job description first", "error");
      return;
    }

    setIsAnalyzing(true);
    setAnalysis(null);
    setOptimizedLatex(null);
    setShowOptimized(false);

    try {
      const result = await analyzeResume(latex, jobDescription);
      setAnalysis(result);
      showNotification(
        `Analysis complete! ATS Score: ${result.score}%`,
        result.score >= 70 ? "success" : "warning"
      );
    } catch (error) {
      console.error("Analysis error:", error);
      showNotification("Failed to analyze resume. Please try again.", "error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle optimize
  const handleOptimize = async () => {
    if (!analysis) {
      showNotification("Please analyze the resume first", "error");
      return;
    }

    setIsOptimizing(true);

    try {
      const result = await optimizeResume(latex, analysis, jobDescription);
      setOptimizedLatex(result);
      setShowOptimized(true);
      showNotification("Resume optimized successfully! Review the changes.", "success");
    } catch (error) {
      console.error("Optimization error:", error);
      showNotification("Failed to optimize resume. Please try again.", "error");
    } finally {
      setIsOptimizing(false);
    }
  };

  // Handle save
  const handleSave = () => {
    const name = prompt("Enter a name for this resume:", `Resume - ${new Date().toLocaleDateString()}`);
    if (!name) return;

    try {
      saveResume(name, latex, jobDescription, analysis, optimizedLatex);
      showNotification("Resume saved successfully!", "success");
    } catch (error) {
      console.error("Save error:", error);
      showNotification("Failed to save resume", "error");
    }
  };

  // Handle load saved resume
  const handleLoadResume = (resume) => {
    setLatex(resume.latex);
    setJobDescription(resume.jobDescription || "");
    setAnalysis(resume.analysis || null);
    setOptimizedLatex(resume.optimizedLatex || null);
    setShowOptimized(false);
    showNotification(`Loaded: ${resume.name}`, "success");
  };

  // Toggle between original and optimized
  const toggleOptimized = () => {
    if (optimizedLatex) {
      setShowOptimized(!showOptimized);
    }
  };

  // Get current latex to display
  const currentLatex = showOptimized && optimizedLatex ? optimizedLatex : latex;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Header />

      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-slide-in ${notification.type === "success"
              ? "bg-green-500/20 border border-green-500/30 text-green-400"
              : notification.type === "warning"
                ? "bg-yellow-500/20 border border-yellow-500/30 text-yellow-400"
                : "bg-red-500/20 border border-red-500/30 text-red-400"
            }`}
        >
          {notification.type === "success" ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      {/* Action Bar */}
      <div className="bg-slate-900/80 backdrop-blur-lg border-b border-slate-700/50 sticky top-0 z-40">
        <div className="max-w-[1800px] mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !jobDescription.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium shadow-lg shadow-blue-500/25 transition-all"
              >
                {isAnalyzing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Zap className="w-5 h-5" />
                )}
                {isAnalyzing ? "Analyzing..." : "Analyze Resume"}
              </button>

              <button
                onClick={handleOptimize}
                disabled={isOptimizing || !analysis}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium shadow-lg shadow-purple-500/25 transition-all"
              >
                {isOptimizing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Sparkles className="w-5 h-5" />
                )}
                {isOptimizing ? "Optimizing..." : "Optimize with AI"}
              </button>

              {optimizedLatex && (
                <button
                  onClick={toggleOptimized}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${showOptimized
                      ? "bg-green-500/20 border-green-500/30 text-green-400"
                      : "bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-white"
                    }`}
                >
                  <ArrowLeftRight className="w-4 h-4" />
                  {showOptimized ? "Viewing Optimized" : "View Original"}
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSavedResumes(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 text-slate-400 hover:text-white transition-all"
              >
                <FolderOpen className="w-4 h-4" />
                Saved Resumes
              </button>

              <button
                onClick={handleSave}
                disabled={!latex}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Save className="w-4 h-4" />
                Save Resume
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-[1800px] mx-auto w-full px-6 py-6">
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-180px)]">
          {/* Left Column - Editor & Job Description */}
          <div className="col-span-4 flex flex-col gap-6">
            <div className="flex-1 min-h-0">
              <ResumeEditor
                value={currentLatex}
                onChange={(val) => {
                  if (showOptimized) {
                    setOptimizedLatex(val);
                  } else {
                    setLatex(val);
                  }
                }}
              />
            </div>
            <div className="h-[300px]">
              <JobDescriptionInput
                value={jobDescription}
                onChange={setJobDescription}
              />
            </div>
          </div>

          {/* Middle Column - Analysis */}
          <div className="col-span-4 min-h-0">
            <AnalysisResults analysis={analysis} isLoading={isAnalyzing} />
          </div>

          {/* Right Column - PDF Preview */}
          <div className="col-span-4 min-h-0">
            <PdfPreview latex={currentLatex} isOptimized={showOptimized} />
          </div>
        </div>
      </main>

      {/* Saved Resumes Modal */}
      {showSavedResumes && (
        <SavedResumes
          onLoad={handleLoadResume}
          onClose={() => setShowSavedResumes(false)}
        />
      )}
    </div>
  );
}
