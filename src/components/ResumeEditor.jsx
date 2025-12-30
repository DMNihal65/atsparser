import CodeMirror from "@uiw/react-codemirror";
import { StreamLanguage } from "@codemirror/language";
import { stex } from "@codemirror/legacy-modes/mode/stex";
import { Upload, RotateCcw, FileCode } from "lucide-react";

export default function ResumeEditor({ value, onChange, onReset }) {
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                onChange(event.target.result);
            };
            reader.readAsText(file);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 overflow-hidden card-shadow">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
                <div className="flex items-center gap-2">
                    <FileCode className="w-5 h-5 text-emerald-600" />
                    <span className="font-semibold text-slate-700">LaTeX Resume</span>
                </div>
                <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors text-sm text-slate-600">
                        <Upload className="w-4 h-4" />
                        Upload
                        <input
                            type="file"
                            accept=".tex,.txt"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                    </label>
                    <button
                        onClick={onReset}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 transition-colors text-sm text-slate-600"
                        title="Reset to default"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Reset
                    </button>
                </div>
            </div>

            {/* Editor */}
            <div className="flex-1 overflow-hidden">
                <CodeMirror
                    value={value}
                    height="100%"
                    extensions={[StreamLanguage.define(stex)]}
                    onChange={(val) => onChange(val)}
                    theme="light"
                    basicSetup={{
                        lineNumbers: true,
                        highlightActiveLineGutter: true,
                        highlightActiveLine: true,
                        foldGutter: true,
                    }}
                />
            </div>
        </div>
    );
}
