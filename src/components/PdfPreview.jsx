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
            // Submit the form to the iframe
            if (formRef.current) {
                formRef.current.submit();
                setLastCompiled(new Date().toLocaleTimeString());

                // Set hasPreview after a delay to show the iframe
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

    // Handle iframe load event
    const handleIframeLoad = () => {
        setIsLoading(false);
        setHasPreview(true);
    };

    // Auto-generate on mount and when latex changes (debounced)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (latex && latex.trim().length > 100) {
                generatePdf();
            }
        }, 2500);

        return () => clearTimeout(timer);
    }, [latex, generatePdf]);

    // Download PDF in new tab
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

    // Copy LaTeX
    const copyLatex = async () => {
        try {
            await navigator.clipboard.writeText(latex);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    // Open in Overleaf
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
        <div className="flex flex-col h-full bg-slate-900 rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl">
            {/* Hidden form for PDF generation - targets the iframe */}
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
            <div className="flex items-center justify-between px-4 py-3 bg-slate-800/50 border-b border-slate-700/50">
                <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-cyan-400" />
                    <span className="font-semibold text-white">PDF Preview</span>
                    {isOptimized && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                            Optimized
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {lastCompiled && (
                        <span className="text-xs text-slate-500">{lastCompiled}</span>
                    )}
                    <button
                        onClick={generatePdf}
                        disabled={isLoading}
                        className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 disabled:opacity-50 transition-colors text-slate-300"
                        title="Refresh Preview"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                    </button>
                    <button
                        onClick={copyLatex}
                        className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors text-slate-300"
                        title="Copy LaTeX"
                    >
                        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all text-sm text-white font-medium shadow-lg shadow-purple-500/25"
                        title="Open PDF in new tab"
                    >
                        <Download className="w-4 h-4" />
                        Download
                    </button>
                </div>
            </div>

            {/* Preview Area */}
            <div className="flex-1 relative bg-white">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/95 z-10">
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-purple-500 border-t-transparent animate-spin"></div>
                            <p className="text-slate-300 font-medium">Compiling LaTeX...</p>
                            <p className="text-slate-500 text-sm mt-1">This may take 5-10 seconds</p>
                        </div>
                    </div>
                )}

                {error && !isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-10">
                        <div className="text-center p-6 max-w-md">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/10 flex items-center justify-center">
                                <AlertTriangle className="w-8 h-8 text-red-400" />
                            </div>
                            <h3 className="text-red-400 font-medium mb-2">Preview Error</h3>
                            <p className="text-slate-500 text-sm mb-4">{error}</p>
                            <div className="flex gap-2 justify-center">
                                <button
                                    onClick={generatePdf}
                                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm transition-colors"
                                >
                                    Try Again
                                </button>
                                <button
                                    onClick={handleDownload}
                                    className="px-4 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 text-sm transition-colors"
                                >
                                    Open in New Tab
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {!hasPreview && !isLoading && !error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                        <div className="text-center p-6">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-800 flex items-center justify-center">
                                <FileText className="w-8 h-8 text-slate-600" />
                            </div>
                            <h3 className="text-slate-400 font-medium mb-2">Generating Preview...</h3>
                            <p className="text-slate-500 text-sm mb-4">
                                Preview will load automatically
                            </p>
                            <button
                                onClick={generatePdf}
                                className="px-4 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 text-sm transition-colors"
                            >
                                Generate Now
                            </button>
                        </div>
                    </div>
                )}

                {/* PDF iframe - always rendered, form submits to it */}
                <iframe
                    ref={iframeRef}
                    name="pdfPreviewIframe"
                    className="w-full h-full"
                    title="Resume PDF Preview"
                    onLoad={handleIframeLoad}
                />
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 bg-slate-800/50 border-t border-slate-700/30">
                <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500">
                        Preview via TeXLive.net • Click refresh to recompile
                    </p>
                    <button
                        onClick={openInOverleaf}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 text-xs transition-colors border border-green-500/20"
                    >
                        <ExternalLink className="w-3 h-3" />
                        Overleaf
                    </button>
                </div>
            </div>
        </div>
    );
}
