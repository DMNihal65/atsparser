import { FileCheck, Sparkles } from "lucide-react";

export default function Header() {
    return (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo & Title */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                            <FileCheck className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800">
                                ATS Resume Optimizer
                            </h1>
                            <p className="text-xs text-slate-500">
                                AI-powered resume analysis
                            </p>
                        </div>
                    </div>

                    {/* Badge */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-medium text-emerald-700">
                            Powered by Gemini
                        </span>
                    </div>
                </div>
            </div>
        </header>
    );
}
