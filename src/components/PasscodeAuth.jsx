import { useState } from "react";
import { Lock, AlertCircle } from "lucide-react";

const PASSCODE = "6565";

export default function PasscodeAuth({ onAuthenticated }) {
    const [code, setCode] = useState("");
    const [error, setError] = useState(false);
    const [shake, setShake] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (code === PASSCODE) {
            // Store auth in session
            sessionStorage.setItem("ats_authenticated", "true");
            onAuthenticated();
        } else {
            setError(true);
            setShake(true);
            setTimeout(() => setShake(false), 500);
            setCode("");
        }
    };

    const handleChange = (e) => {
        const value = e.target.value.replace(/\D/g, "").slice(0, 4);
        setCode(value);
        setError(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="w-full max-w-sm">
                {/* Card */}
                <div className="bg-white rounded-2xl border border-slate-200 p-8 card-shadow-lg">
                    {/* Icon */}
                    <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-emerald-100 flex items-center justify-center">
                        <Lock className="w-8 h-8 text-emerald-600" />
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl font-bold text-slate-800 text-center mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-slate-500 text-center mb-8">
                        Enter your passcode to continue
                    </p>

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        <div className={`mb-6 ${shake ? "animate-shake" : ""}`}>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={code}
                                onChange={handleChange}
                                placeholder="••••"
                                className={`w-full h-14 text-center text-2xl font-bold tracking-[0.5em] rounded-xl border-2 transition-colors ${error
                                        ? "border-red-300 bg-red-50 text-red-600"
                                        : "border-slate-200 bg-slate-50 text-slate-800 focus:border-emerald-500 focus:bg-white"
                                    } focus:outline-none`}
                                autoFocus
                            />
                        </div>

                        {error && (
                            <div className="flex items-center justify-center gap-2 mb-4 text-red-500 text-sm">
                                <AlertCircle className="w-4 h-4" />
                                <span>Incorrect passcode</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={code.length !== 4}
                            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold transition-colors"
                        >
                            Unlock
                        </button>
                    </form>
                </div>

                {/* Branding */}
                <p className="text-center text-slate-400 text-sm mt-6">
                    ATS Resume Optimizer
                </p>
            </div>

            {/* Shake animation */}
            <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
        </div>
    );
}
