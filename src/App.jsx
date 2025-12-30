import { useState, useEffect } from "react";
import Header from "./components/Header";
import ResumeEditor from "./components/ResumeEditor";
import JobDescriptionInput from "./components/JobDescriptionInput";
import AnalysisResults from "./components/AnalysisResults";
import PdfPreview from "./components/PdfPreview";
import SavedResumes from "./components/SavedResumes";
import PasscodeAuth from "./components/PasscodeAuth";
import { analyzeResume, optimizeResume } from "./services/gemini";
import { getResumes, saveResume, deleteResume, getDefaultResume } from "./services/storage";
import { Search, Wand2, Save, FolderOpen, Eye, EyeOff, X, CheckCircle, AlertCircle } from "lucide-react";
import "./App.css";

export default function App() {
  // Authentication
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem("ats_authenticated") === "true";
  });

  // Core state
  const [latex, setLatex] = useState(getDefaultResume());
  const [optimizedLatex, setOptimizedLatex] = useState(null);
  const [showOptimized, setShowOptimized] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState(null);

  // UI state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showSavedResumes, setShowSavedResumes] = useState(false);
  const [savedResumes, setSavedResumes] = useState([]);
  const [notification, setNotification] = useState(null);

  // Load saved resumes on mount
  useEffect(() => {
    setSavedResumes(getResumes());
  }, []);

  // Show notification
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Handle analyze
  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      showNotification("Please enter a job description", "error");
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzeResume(latex, jobDescription);
      setAnalysis(result);
      showNotification(`Analysis complete! Score: ${result.score}%`);
    } catch (error) {
      console.error("Analysis error:", error);
      showNotification("Failed to analyze resume", "error");
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
      const optimized = await optimizeResume(latex, analysis, jobDescription);
      setOptimizedLatex(optimized);
      setShowOptimized(true);
      showNotification("Resume optimized successfully!");
    } catch (error) {
      console.error("Optimization error:", error);
      showNotification("Failed to optimize resume", "error");
    } finally {
      setIsOptimizing(false);
    }
  };

  // Handle save
  const handleSave = () => {
    const name = prompt("Enter a name for this resume:");
    if (name) {
      saveResume(name, latex, jobDescription, analysis, optimizedLatex);
      setSavedResumes(getResumes());
      showNotification("Resume saved successfully!");
    }
  };

  // Handle load
  const handleLoad = (resume) => {
    setLatex(resume.latex);
    setJobDescription(resume.jobDescription || "");
    setAnalysis(resume.analysis);
    setOptimizedLatex(resume.optimizedLatex);
    setShowOptimized(false);
    setShowSavedResumes(false);
    showNotification(`Loaded: ${resume.name}`);
  };

  // Handle delete
  const handleDelete = (id) => {
    if (confirm("Delete this resume?")) {
      deleteResume(id);
      setSavedResumes(getResumes());
      showNotification("Resume deleted");
    }
  };

  // Reset to default
  const handleReset = () => {
    if (confirm("Reset to default resume?")) {
      setLatex(getDefaultResume());
      setOptimizedLatex(null);
      setShowOptimized(false);
      setAnalysis(null);
    }
  };

  // If not authenticated, show passcode screen
  if (!isAuthenticated) {
    return <PasscodeAuth onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  const currentLatex = showOptimized && optimizedLatex ? optimizedLatex : latex;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Action Bar */}
        <div className="flex items-center justify-between mb-6 bg-white rounded-xl border border-slate-200 p-4 card-shadow">
          <div className="flex items-center gap-3">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !jobDescription.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-medium transition-colors"
            >
              <Search className={`w-4 h-4 ${isAnalyzing ? "animate-pulse" : ""}`} />
              {isAnalyzing ? "Analyzing..." : "Analyze Resume"}
            </button>

            <button
              onClick={handleOptimize}
              disabled={isOptimizing || !analysis}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 disabled:text-slate-300 text-slate-700 font-medium transition-colors border border-slate-200"
            >
              <Wand2 className={`w-4 h-4 ${isOptimizing ? "animate-spin" : ""}`} />
              {isOptimizing ? "Optimizing..." : "Optimize with AI"}
            </button>

            {optimizedLatex && (
              <button
                onClick={() => setShowOptimized(!showOptimized)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors border ${showOptimized
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
              >
                {showOptimized ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                {showOptimized ? "Viewing Optimized" : "View Original"}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSavedResumes(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white hover:bg-slate-50 text-slate-600 font-medium transition-colors border border-slate-200"
            >
              <FolderOpen className="w-4 h-4" />
              History
              {savedResumes.length > 0 && (
                <span className="px-1.5 py-0.5 text-xs rounded-full bg-emerald-100 text-emerald-700">
                  {savedResumes.length}
                </span>
              )}
            </button>

            <button
              onClick={handleSave}
              disabled={!analysis}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 disabled:bg-slate-50 disabled:text-slate-300 text-emerald-700 font-medium transition-colors border border-emerald-200 disabled:border-slate-200"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - Inputs */}
          <div className="col-span-5 space-y-6">
            <div className="h-[400px]">
              <ResumeEditor
                value={currentLatex}
                onChange={(val) => {
                  if (showOptimized) {
                    setOptimizedLatex(val);
                  } else {
                    setLatex(val);
                  }
                }}
                onReset={handleReset}
              />
            </div>
            <div className="h-[300px]">
              <JobDescriptionInput
                value={jobDescription}
                onChange={setJobDescription}
              />
            </div>
          </div>

          {/* Right Column - Results & Preview */}
          <div className="col-span-7 space-y-6">
            <div className="h-[400px]">
              <PdfPreview latex={currentLatex} isOptimized={showOptimized} />
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              <AnalysisResults analysis={analysis} isLoading={isAnalyzing} />
            </div>
          </div>
        </div>
      </main>

      {/* Saved Resumes Modal */}
      <SavedResumes
        isOpen={showSavedResumes}
        onClose={() => setShowSavedResumes(false)}
        resumes={savedResumes}
        onLoad={handleLoad}
        onDelete={handleDelete}
      />

      {/* Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-in">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border ${notification.type === "error"
                ? "bg-red-50 border-red-200 text-red-700"
                : "bg-emerald-50 border-emerald-200 text-emerald-700"
              }`}
          >
            {notification.type === "error" ? (
              <AlertCircle className="w-5 h-5" />
            ) : (
              <CheckCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="p-1 hover:bg-white/50 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
