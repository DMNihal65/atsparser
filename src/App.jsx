import { useState, useEffect } from "react";
import Header from "./components/Header";
import ResumeEditor from "./components/ResumeEditor";
import JobDescriptionInput from "./components/JobDescriptionInput";
import AnalysisResults from "./components/AnalysisResults";
import PdfPreview from "./components/PdfPreview";
import SaveApplicationModal from "./components/SaveApplicationModal";
import ApplicationTracker from "./components/ApplicationTracker";
import GoalTracker from "./components/GoalTracker";
import PasscodeAuth from "./components/PasscodeAuth";
import { analyzeResume, optimizeResume } from "./services/gemini";
import { getDefaultResume } from "./services/storage";
import { createApplication, getTodayGoal } from "./services/api";
import { Search, Wand2, Save, FileText, Target, BarChart3, Eye, EyeOff, X, CheckCircle, AlertCircle } from "lucide-react";
import "./App.css";

export default function App() {
  // Authentication
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem("ats_authenticated") === "true";
  });

  // Navigation
  const [activeTab, setActiveTab] = useState("optimizer");

  // Core state
  const [latex, setLatex] = useState(getDefaultResume());
  const [optimizedLatex, setOptimizedLatex] = useState(null);
  const [showOptimized, setShowOptimized] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState(null);

  // UI state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [todayProgress, setTodayProgress] = useState({ achieved: 0, target: 10 });

  // Fetch today's progress
  useEffect(() => {
    if (isAuthenticated) {
      getTodayGoal()
        .then(setTodayProgress)
        .catch(console.error);
    }
  }, [isAuthenticated]);

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

  // Handle save to database
  const handleSaveApplication = async (applicationData) => {
    setIsSaving(true);
    try {
      await createApplication(applicationData);
      setShowSaveModal(false);
      showNotification("Application saved successfully!");

      // Update today's progress
      const updated = await getTodayGoal();
      setTodayProgress(updated);
    } catch (error) {
      console.error("Save error:", error);
      showNotification("Failed to save application", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle load application from tracker
  const handleLoadApplication = (app) => {
    setLatex(app.resume_latex || getDefaultResume());
    setOptimizedLatex(app.optimized_latex);
    setJobDescription(app.job_description || "");
    setAnalysis(app.analysis);
    setShowOptimized(false);
    setActiveTab("optimizer");
    showNotification(`Loaded: ${app.company_name}`);
  };

  // Reset to default
  const handleReset = () => {
    if (confirm("Reset to default resume?")) {
      setLatex(getDefaultResume());
      setOptimizedLatex(null);
      setShowOptimized(false);
      setAnalysis(null);
      setJobDescription("");
    }
  };

  // If not authenticated, show passcode screen
  if (!isAuthenticated) {
    return <PasscodeAuth onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  const currentLatex = showOptimized && optimizedLatex ? optimizedLatex : latex;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header with Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">ATS Resume Optimizer</h1>
                <p className="text-xs text-slate-500">Track & Optimize Your Applications</p>
              </div>
            </div>

            {/* Today's Progress Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
              <Target className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700">
                Today: {todayProgress.achieved}/{todayProgress.target}
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex gap-1">
            <button
              onClick={() => setActiveTab("optimizer")}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "optimizer"
                  ? "border-emerald-500 text-emerald-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Resume Optimizer
              </div>
            </button>
            <button
              onClick={() => setActiveTab("applications")}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "applications"
                  ? "border-emerald-500 text-emerald-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Applications
              </div>
            </button>
            <button
              onClick={() => setActiveTab("goals")}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "goals"
                  ? "border-emerald-500 text-emerald-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
            >
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Daily Goals
              </div>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Optimizer Tab */}
        {activeTab === "optimizer" && (
          <>
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

              <button
                onClick={() => setShowSaveModal(true)}
                disabled={!analysis}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 disabled:bg-slate-50 disabled:text-slate-300 text-emerald-700 font-medium transition-colors border border-emerald-200 disabled:border-slate-200"
              >
                <Save className="w-4 h-4" />
                Save Application
              </button>
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
          </>
        )}

        {/* Applications Tab */}
        {activeTab === "applications" && (
          <ApplicationTracker onLoadApplication={handleLoadApplication} />
        )}

        {/* Goals Tab */}
        {activeTab === "goals" && (
          <GoalTracker />
        )}
      </main>

      {/* Save Application Modal */}
      <SaveApplicationModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveApplication}
        analysis={analysis}
        latex={latex}
        optimizedLatex={optimizedLatex}
        jobDescription={jobDescription}
        isLoading={isSaving}
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
