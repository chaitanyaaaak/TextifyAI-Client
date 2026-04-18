import { useState, useRef, useEffect } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { fileService } from "../../api/file-service";

const analysisSteps = [
  { label: "Uploading file", icon: "fa-file-upload" },
  { label: "Analyzing text for errors", icon: "fa-search" },
  { label: "Correcting misspelled words", icon: "fa-spell-check" },
  { label: "Generating corrected file", icon: "fa-file-download" },
];

export function DocumentAnalyzerTab({ config }) {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef(null);

  function selectFile(f) {
    if (!f || f.type !== "text/plain") {
      setError("Please select a plain text (.txt) file.");
      return;
    }
    setFile(f);
    setResult(null);
    setError(null);
    setCurrentStep(0);
    setProcessing(true);
  }

  function reset() {
    setFile(null);
    setResult(null);
    setError(null);
    setProcessing(false);
    setCurrentStep(0);
  }

  useEffect(() => {
    if (!file || !processing) return;
    let cancelled = false;

    async function processFile() {
      try {
        const uploadData = await fileService.uploadFile(file);
        const jobId = uploadData.jobId || uploadData.job_id;
        
        if (!jobId) throw new Error("Server did not return a job ID");
        if (cancelled) return;
        setCurrentStep(1);

        let completed = false;
        while (!completed && !cancelled) {
          await new Promise((r) => setTimeout(r, 1500));
          const statusData = await fileService.getStatus(jobId);
          
          if (statusData.step != null) {
            setCurrentStep(Math.min(statusData.step - 1, analysisSteps.length - 1));
          } else {
            const statusMap = { queued: 0, analyzing: 1, correcting: 2, completed: 3 };
            if (statusMap[statusData.status] != null) setCurrentStep(statusMap[statusData.status]);
          }

          if (statusData.status === "completed") {
            completed = true;
          } else if (statusData.status === "failed") {
            const reason = statusData.error || statusData.message || statusData.detail || "unknown reason";
            throw new Error(`File processing failed: ${reason}`);
          }
        }

        if (cancelled) return;

        const report = await fileService.getReport(jobId);
        if (cancelled) return;

        setResult({
          jobId,
          totalWords: report.totalWords || 0,
          totalErrors: report.totalErrors || 0,
          corrections: report.corrections || []
        });
        setProcessing(false);
      } catch (err) {
        if (!cancelled) {
          console.error("File processing error:", err);
          setError(err.message);
          setProcessing(false);
        }
      }
    }

    processFile();
    return () => { cancelled = true; };
  }, [file, processing]);

  async function handleDownload() {
    if (!result?.jobId) return;
    try {
      const url = fileService.getDownloadUrl(result.jobId);
      const res = await fetch(url);
      const blob = await res.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `${file.name.replace(/\.[^.]+$/, "")}_corrected.txt`;
      a.click();
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error("Download error:", err);
    }
  }

  if (!file) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <Motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); selectFile(e.dataTransfer.files[0]); }}
            onClick={() => fileInputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center gap-5 rounded-2xl border-2 border-dashed p-14 text-center transition-all ${
              isDragging ? `border-current ${config.bgAccent}` : "border-white/10 bg-white/[0.02] hover:border-white/20"
            }`}
          >
            <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${config.gradient} text-white shadow-lg`}>
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <div>
              <p className="text-base font-semibold text-white">Drop your file here</p>
              <p className="mt-1 text-sm text-slate-500">or click to browse · .txt files only</p>
            </div>
          </div>
          <input ref={fileInputRef} type="file" accept=".txt,text/plain" onChange={(e) => selectFile(e.target.files?.[0])} className="hidden" />
          {error && <p className="mt-4 text-center text-sm text-red-400">{error}</p>}
        </Motion.div>
      </div>
    );
  }

  const done = !!result;

  return (
    <div className="flex flex-1 flex-col overflow-y-auto p-6">
      <div className="mx-auto w-full max-w-lg">
        {/* File header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${config.gradient} text-white`}>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-white">Analyzing File</p>
              <p className="max-w-[220px] truncate text-xs text-slate-500">{file.name}</p>
            </div>
          </div>
          <button onClick={reset} className="text-xs text-slate-500 transition-colors hover:text-white">Change file</button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-center">
            <p className="text-sm text-red-300">{error}</p>
            <button onClick={reset} className="mt-3 text-xs text-slate-400 underline hover:text-white">Try another file</button>
          </div>
        )}

        {/* Steps */}
        {!error && (
          <div className="mb-6 space-y-3">
            {analysisSteps.map((step, i) => {
              const isActive = !done && currentStep === i;
              const isComplete = done || currentStep > i;
              return (
                <Motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-all ${
                    isActive ? `${config.bgAccent} ${config.borderAccent}` : isComplete ? "border-emerald-500/20 bg-emerald-500/5" : "border-white/5 bg-white/[0.02]"
                  }`}
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                    isActive ? `bg-gradient-to-br ${config.gradient} text-white` : isComplete ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-slate-600"
                  }`}>
                    {isComplete ? <i className="fas fa-check text-[10px]" /> : isActive ? <i className="fas fa-circle-notch fa-spin text-[10px]" /> : <span>{i + 1}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <i className={`fas ${step.icon} text-xs ${isActive ? config.textAccent : isComplete ? "text-emerald-400" : "text-slate-600"}`} />
                    <span className={`text-sm ${isActive ? "font-medium text-white" : isComplete ? "text-emerald-300" : "text-slate-500"}`}>
                      {step.label}{isActive && <span className="ml-1 animate-pulse">...</span>}
                    </span>
                  </div>
                </Motion.div>
              );
            })}
          </div>
        )}

        {/* Results */}
        <AnimatePresence>
          {done && (
            <Motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="mb-4 grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-white/5 p-3 text-center">
                  <p className="text-lg font-bold text-white">{result.totalWords}</p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">Words</p>
                </div>
                <div className="rounded-xl bg-red-500/10 p-3 text-center">
                  <p className="text-lg font-bold text-red-400">{result.totalErrors}</p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">Errors</p>
                </div>
                <div className="rounded-xl bg-emerald-500/10 p-3 text-center">
                  <p className="text-lg font-bold text-emerald-400">{result.corrections.length}</p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">Fixed</p>
                </div>
              </div>
              {result.corrections.length > 0 ? (
                <div className="mb-4 max-h-48 space-y-1.5 overflow-y-auto rounded-xl border border-white/5 bg-white/[0.02] p-3">
                  {result.corrections.map((c, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="text-red-400 line-through">{c.original}</span>
                      <svg className="h-2.5 w-2.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                      <span className="font-medium text-emerald-400">{c.corrected}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
                  <p className="text-sm text-emerald-300">No spelling errors found!</p>
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={handleDownload}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${config.gradient} px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:brightness-110`}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 12l4.5 4.5m0 0l4.5-4.5M12 3v13.5" />
                  </svg>
                  Download Corrected File
                </button>
                <button onClick={reset} className="rounded-xl border border-white/10 px-4 py-3 text-sm text-slate-400 transition-colors hover:border-white/20 hover:text-white">
                  New File
                </button>
              </div>
            </Motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
