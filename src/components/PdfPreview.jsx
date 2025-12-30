import { useState, useEffect, useCallback, useRef } from "react";
import { Eye, Download, RefreshCw, AlertTriangle, FileText, ExternalLink, Copy, Check } from "lucide-react";

export default function PdfPreview({ latex, isOptimized }) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastCompiled, setLastCompiled] = useState(null);
    const [copied, setCopied] = useState(false);
    const [hasPreview, setHasPreview] = useState(false);
    const formRef = useRef(null);
    const iframeRef = useRef(null);

    // Generate PDF by submitting form to iframe
    const generatePdf = useCallback(() => {
        if (!latex || latex.trim().length < 100) {
            setError("LaTeX content is too short or empty");
            return;
        }

        setIsLoading(true);
        setError(null);
        setHasPreview(false);

        try {
            if (formRef.current) {
                formRef.current.submit();
                setLastCompiled(new Date().toLocaleTimeString());

                setTimeout(() => {
                    setHasPreview(true);
                    setIsLoading(false);
                }, 5000);
            }
        } catch (err) {
            console.error("PDF generation error:", err);
            setError(err.message || "Failed to generate PDF preview");
            setIsLoading(false);
        }
    }, [latex]);

    const handleIframeLoad = () => {
        setIsLoading(false);
        setHasPreview(true);
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (latex && latex.trim().length > 100) {
                generatePdf();
            }
        }, 2500);

        return () => clearTimeout(timer);
    }, [latex, generatePdf]);

    const handleDownload = () => {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = 'https://texlive.net/cgi-bin/latexcgi';
        form.target = '_blank';
        form.enctype = 'multipart/form-data';

        const fileInput = document.createElement('input');
        fileInput.type = 'hidden';
        fileInput.name = 'filecontents[]';
        fileInput.value = latex;
        form.appendChild(fileInput);

        const filenameInput = document.createElement('input');
        filenameInput.type = 'hidden';
        filenameInput.name = 'filename[]';
        filenameInput.value = 'document.tex';
        form.appendChild(filenameInput);

        const returnInput = document.createElement('input');
        returnInput.type = 'hidden';
        returnInput.name = 'return';
        returnInput.value = 'pdf';
        form.appendChild(returnInput);

        const engineInput = document.createElement('input');
        engineInput.type = 'hidden';
        engineInput.name = 'engine';
        engineInput.value = 'pdflatex';
        form.appendChild(engineInput);

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
    };

    const copyLatex = async () => {
        try {
            await navigator.clipboard.writeText(latex);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const openInOverleaf = () => {
        try {
            const encoded = btoa(unescape(encodeURIComponent(latex)));
            const url = `https://www.overleaf.com/docs?snip_uri=data:application/x-tex;base64,${encoded}`;
            window.open(url, '_blank');
        } catch (err) {
            console.error('Failed to open in Overleaf:', err);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 overflow-hidden card-shadow">
            {/* Hidden form for PDF generation */}
            <form
                ref={formRef}
                method="POST"
                action="https://texlive.net/cgi-bin/latexcgi"
                target="pdfPreviewIframe"
                encType="multipart/form-data"
                style={{ display: 'none' }}
            >
                <input type="hidden" name="filecontents[]" value={latex} />
                <input type="hidden" name="filename[]" value="document.tex" />
                <input type="hidden" name="return" value="pdf" />
                <input type="hidden" name="engine" value="pdflatex" />
            </form>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
                <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-emerald-600" />
                    <span className="font-semibold text-slate-700">PDF Preview</span>
                    {isOptimized && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 font-medium">
                            Optimized
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {lastCompiled && (
                        <span className="text-xs text-slate-400">{lastCompiled}</span>
                    )}
                    <button
                        onClick={generatePdf}
                        disabled={isLoading}
                        className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 transition-colors text-slate-600"
                        title="Refresh Preview"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                    </button>
                    <button
                        onClick={copyLatex}
                        className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 transition-colors text-slate-600"
                        title="Copy LaTeX"
                    >
                        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 transition-colors text-sm text-white font-medium"
                        title="Download PDF"
                    >
                        <Download className="w-4 h-4" />
                        Download
                    </button>
                </div>
            </div>

            {/* Preview Area */}
            <div className="flex-1 relative bg-slate-100">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/90 z-10">
                        <div className="text-center">
                            <div className="w-12 h-12 mx-auto mb-4 rounded-full border-3 border-emerald-500 border-t-transparent animate-spin"></div>
                            <p className="text-slate-700 font-medium">Compiling LaTeX...</p>
                            <p className="text-slate-500 text-sm mt-1">This may take 5-10 seconds</p>
                        </div>
                    </div>
                )}

                {error && !isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                        <div className="text-center p-6 max-w-md">
                            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-red-50 flex items-center justify-center">
                                <AlertTriangle className="w-7 h-7 text-red-500" />
                            </div>
                            <h3 className="text-red-600 font-medium mb-2">Preview Error</h3>
                            <p className="text-slate-500 text-sm mb-4">{error}</p>
                            <div className="flex gap-2 justify-center">
                                <button
                                    onClick={generatePdf}
                                    className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm transition-colors"
                                >
                                    Try Again
                                </button>
                                <button
                                    onClick={handleDownload}
                                    className="px-4 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm transition-colors"
                                >
                                    Open in New Tab
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {!hasPreview && !isLoading && !error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white">
                        <div className="text-center p-6">
                            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
                                <FileText className="w-7 h-7 text-slate-400" />
                            </div>
                            <h3 className="text-slate-600 font-medium mb-2">Generating Preview...</h3>
                            <p className="text-slate-400 text-sm mb-4">
                                Preview will load automatically
                            </p>
                            <button
                                onClick={generatePdf}
                                className="px-4 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm font-medium transition-colors border border-emerald-200"
                            >
                                Generate Now
                            </button>
                        </div>
                    </div>
                )}

                <iframe
                    ref={iframeRef}
                    name="pdfPreviewIframe"
                    className="w-full h-full"
                    title="Resume PDF Preview"
                    onLoad={handleIframeLoad}
                />
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200">
                <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500">
                        Preview via TeXLive.net
                    </p>
                    <button
                        onClick={openInOverleaf}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs transition-colors border border-emerald-200 font-medium"
                    >
                        <ExternalLink className="w-3 h-3" />
                        Overleaf
                    </button>
                </div>
            </div>
        </div>
    );
}
