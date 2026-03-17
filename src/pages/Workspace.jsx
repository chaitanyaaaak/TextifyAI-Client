import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import roleConfig from "../data/roleConfig";
import { api, API_BASE } from "../api/client";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

/* ------------------------------------------------------------------ */
/*  WorkspaceHeader                                                    */
/* ------------------------------------------------------------------ */
function WorkspaceHeader({ config, onBack }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-30 flex items-center gap-4 border-b border-white/10 bg-bg-deep/70 px-4 py-3 backdrop-blur-xl sm:px-6"
    >
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-slate-400 transition-colors hover:text-white"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        <span className="hidden sm:inline text-sm">Back</span>
      </button>

      <div className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${config.gradient} text-white shadow-lg`}>
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d={config.avatarPath} />
        </svg>
      </div>

      <div>
        <h1 className="text-sm font-bold text-white leading-tight">{config.title} Workspace</h1>
        <p className="text-xs text-slate-500">TextifyAI</p>
      </div>
    </motion.header>
  );
}

/* ------------------------------------------------------------------ */
/*  TypingIndicator                                                    */
/* ------------------------------------------------------------------ */
function TypingIndicator({ config }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex items-end gap-2 px-4 py-2"
    >
      <div className={`flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br ${config.gradient} text-white shrink-0`}>
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d={config.avatarPath} />
        </svg>
      </div>
      <div className="rounded-2xl rounded-bl-sm bg-bg-card px-4 py-3 border border-white/5">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className={`block h-2 w-2 rounded-full bg-gradient-to-r ${config.gradient}`}
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  ChatBubble                                                         */
/* ------------------------------------------------------------------ */
function ChatBubble({ message, config }) {
  const isUser = message.sender === "user";

  // Don't render empty placeholder before any streaming content arrives
  const hasContent =
    message.text ||
    message.description ||
    (message.points && message.points.length > 0);
  if (!hasContent) return null;

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className={`flex ${isUser ? "justify-end" : "items-end gap-2"} px-4 py-1`}
    >
      {!isUser && (
        <div className={`flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br ${config.gradient} text-white shrink-0`}>
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d={config.avatarPath} />
          </svg>
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed sm:max-w-[70%] ${
          isUser
            ? `bg-gradient-to-r ${config.gradient} text-white rounded-br-sm`
            : "bg-bg-card text-slate-200 border border-white/5 rounded-bl-sm"
        }`}
      >
        {isUser ? (
          message.text
        ) : (
          <>
            {message.description && <p>{message.description}</p>}
            {message.points && message.points.length > 0 && (
              <ol className="mt-2 list-decimal space-y-1 pl-4">
                {message.points.map((p) => (
                  <li key={p.index}>{p.text}</li>
                ))}
              </ol>
            )}
            {/* Fallback for non-streamed replies (e.g. /chat endpoint) */}
            {!message.description && !message.points?.length && message.text}
          </>
        )}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  CorrectionPopover                                                  */
/* ------------------------------------------------------------------ */
function CorrectionPopover({ word, corrections, position, onSelect, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 6, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="absolute z-50 flex flex-col gap-1 rounded-xl border border-white/10 bg-bg-card p-2 shadow-2xl"
      style={{ bottom: "100%", left: position, marginBottom: 8, minWidth: 120 }}
    >
      <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        Suggestions
      </span>
      {corrections.map((c) => (
        <button
          key={c}
          onClick={() => onSelect(c)}
          className="rounded-lg px-3 py-1.5 text-left text-sm text-emerald-400 transition-colors hover:bg-white/5"
        >
          {c}
        </button>
      ))}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  PredictionList                                                     */
/* ------------------------------------------------------------------ */
function PredictionList({ predictions, config, onSelect }) {
  if (!predictions.length) return null;

  return (
    <motion.ul
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.2 }}
      className="mx-3 mb-2 overflow-hidden rounded-xl border border-white/10 bg-bg-card"
    >
      {predictions.map((p, i) => (
        <motion.li
          key={i}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.04 }}
          onClick={() => onSelect(p)}
          className={`cursor-pointer border-b border-white/5 px-4 py-2.5 text-sm ${config.textAccent} transition-colors last:border-b-0 hover:bg-white/5`}
        >
          {p}
        </motion.li>
      ))}
    </motion.ul>
  );
}

/* ------------------------------------------------------------------ */
/*  SpellCheckOverlay — renders text with red wavy underlines          */
/*  Uses correctionsMap from API instead of local dictionary           */
/* ------------------------------------------------------------------ */
function SpellCheckOverlay({ text, correctionsMap, onReplace }) {
  if (!text) return <span className="text-slate-500 pointer-events-none select-none">&nbsp;</span>;

  const tokens = text.split(/(\s+)/);
  let charOffset = 0;

  return tokens.map((token, i) => {
    const tokenStart = charOffset;
    charOffset += token.length;

    if (/^\s+$/.test(token)) {
      return <span key={i}>{token}</span>;
    }

    const stripped = token.replace(/[^a-zA-Z'-]/g, "");
    const entry = stripped ? correctionsMap[stripped.toLowerCase()] || null : null;

    if (entry) {
      return (
        <span
          key={i}
          onClick={(e) => {
            e.stopPropagation();
            onReplace(tokenStart, token.length, entry.correction);
          }}
          className="cursor-pointer text-red-400 underline decoration-wavy decoration-red-500 underline-offset-4"
          title={`Tap to fix: ${entry.correction}`}
          style={{ pointerEvents: "auto" }}
        >
          {token}
        </span>
      );
    }

    return (
      <span key={i} className="text-slate-200">
        {token}
      </span>
    );
  });
}

/* ------------------------------------------------------------------ */
/*  FileAnalysisModal — uses backend upload / poll / report / download */
/* ------------------------------------------------------------------ */
const analysisSteps = [
  { label: "Uploading file", icon: "fa-file-upload" },
  { label: "Analyzing text for errors", icon: "fa-search" },
  { label: "Correcting misspelled words", icon: "fa-spell-check" },
  { label: "Generating corrected file", icon: "fa-file-download" },
];

/* ------------------------------------------------------------------ */
/*  TabBar                                                             */
/* ------------------------------------------------------------------ */
const TABS = [
  {
    id: "chat",
    label: "Chat & Generator",
    iconPath: "M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z",
  },
  {
    id: "document",
    label: "Document Analyzer",
    iconPath: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
  },
  {
    id: "coherence",
    label: "Coherence Detector",
    iconPath: "M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5",
  },
];

function TabBar({ activeTab, onChange, config }) {
  return (
    <div className="flex shrink-0 border-b border-white/10 bg-bg-deep/30 px-2">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === tab.id
              ? `border-current ${config.textAccent}`
              : "border-transparent text-slate-500 hover:text-slate-300"
          }`}
        >
          <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d={tab.iconPath} />
          </svg>
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  DocumentAnalyzerTab                                                */
/* ------------------------------------------------------------------ */
function DocumentAnalyzerTab({ config }) {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef(null);

  function selectFile(f) {
    if (!f || f.type !== "text/plain") return;
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
        const formData = new FormData();
        formData.append("file", file);
        const uploadRes = await fetch(`${API_BASE}/files/upload`, { method: "POST", body: formData });
        if (!uploadRes.ok) {
          let msg = "Upload failed";
          try { const e = await uploadRes.json(); msg = e.detail || e.message || msg; } catch {}
          throw new Error(msg);
        }
        const uploadData = await uploadRes.json();
        const jobId = uploadData.jobId ?? uploadData.job_id;
        if (!jobId) throw new Error("Server did not return a job ID");
        if (cancelled) return;
        setCurrentStep(1);

        let completed = false;
        while (!completed && !cancelled) {
          await new Promise((r) => setTimeout(r, 1500));
          const statusRes = await fetch(`${API_BASE}/files/status/${jobId}`);
          if (!statusRes.ok) {
            let msg = "Status check failed";
            try { const e = await statusRes.json(); msg = e.detail || e.message || msg; } catch {}
            throw new Error(msg);
          }
          const statusData = await statusRes.json();
          if (statusData.step != null) {
            setCurrentStep(Math.min(statusData.step - 1, analysisSteps.length - 1));
          } else {
            const statusMap = { queued: 0, analyzing: 1, correcting: 2, completed: 3 };
            if (statusMap[statusData.status] != null) setCurrentStep(statusMap[statusData.status]);
          }
          if (statusData.status === "completed") {
            completed = true;
          } else if (statusData.status === "failed") {
            console.error("Backend failed status payload:", JSON.stringify(statusData, null, 2));
            const reason = statusData.error || statusData.message || statusData.detail || "unknown reason";
            throw new Error(`File processing failed: ${reason}`);
          }
        }
        if (cancelled) return;

        const reportRes = await fetch(`${API_BASE}/files/report/${jobId}`);
        if (!reportRes.ok) {
          let msg = "Failed to fetch report";
          try { const e = await reportRes.json(); msg = e.detail || e.message || msg; } catch {}
          throw new Error(msg);
        }
        const report = await reportRes.json();
        if (cancelled) return;
        setResult({ jobId, totalWords: report.totalWords || 0, totalErrors: report.totalErrors || 0, corrections: report.corrections || [] });
        setProcessing(false);
      } catch (err) {
        if (!cancelled) { console.error("File processing error:", err); setError(err.message); setProcessing(false); }
      }
    }
    processFile();
    return () => { cancelled = true; };
  }, [file, processing]);

  async function handleDownload() {
    if (!result?.jobId) return;
    try {
      const res = await fetch(`${API_BASE}/files/download/${result.jobId}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${file.name.replace(/\.[^.]+$/, "")}_corrected.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) { console.error("Download error:", err); }
  }

  // Drop zone — no file selected yet
  if (!file) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
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
        </motion.div>
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
                <motion.div
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
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Results */}
        <AnimatePresence>
          {done && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="mb-4 grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-white/5 p-3 text-center">
                  <p className="text-lg font-bold text-white">{result.totalWords}</p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">Words</p>
                </div>
                <div className="rounded-xl bg-red-500/10 p-3 text-center">
                  <p className="text-lg font-bold text-red-400">{result.totalErrors || result.corrections.length}</p>
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
                      <span className="text-red-400 line-through">{c.original || c.word}</span>
                      <i className="fas fa-arrow-right text-[8px] text-slate-600" />
                      <span className="font-medium text-emerald-400">{c.corrected || (c.suggestions && c.suggestions[0]) || "—"}</span>
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
                  <i className="fas fa-download" /> Download Corrected File
                </button>
                <button onClick={reset} className="rounded-xl border border-white/10 px-4 py-3 text-sm text-slate-400 transition-colors hover:border-white/20 hover:text-white">
                  New File
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SpellCheckedTextarea — reusable overlay textarea with spellcheck  */
/* ------------------------------------------------------------------ */
function SpellCheckedTextarea({ value, onChange, placeholder, rows = 3 }) {
  const [correctionsMap, setCorrectionsMap] = useState({});
  const textareaRef = useRef(null);
  const overlayRef = useRef(null);
  const skipNextSpellcheck = useRef(false);

  useEffect(() => {
    if (!value.trim()) { setCorrectionsMap({}); return; }
    if (skipNextSpellcheck.current) { skipNextSpellcheck.current = false; return; }
    const controller = new AbortController();
    let autoFixTimer = null;
    const timer = setTimeout(async () => {
      try {
        const data = await api("/spellcheck", { text: value }, { signal: controller.signal });
        const { corrections, auto_corrected_text } = data;
        const map = {};
        for (const c of corrections) {
          map[c.word.toLowerCase()] = { correction: c.correction, offset: c.offset, length: c.length };
        }
        setCorrectionsMap(map);
        if (corrections.length > 0 && auto_corrected_text) {
          autoFixTimer = setTimeout(() => {
            skipNextSpellcheck.current = true;
            onChange(auto_corrected_text);
            setCorrectionsMap({});
          }, 1000);
        }
      } catch (e) {
        if (e.name !== "AbortError") console.error("Spellcheck error:", e);
      }
    }, 300);
    return () => { clearTimeout(timer); clearTimeout(autoFixTimer); controller.abort(); };
  }, [value]);

  function handleReplace(offset, length, correction) {
    skipNextSpellcheck.current = true;
    onChange(value.slice(0, offset) + correction + value.slice(offset + length));
    setCorrectionsMap({});
  }

  const syncScroll = useCallback(() => {
    if (overlayRef.current && textareaRef.current) {
      overlayRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, []);

  return (
    <div className="relative rounded-xl border border-white/10 bg-bg-card transition-colors focus-within:border-white/20">
      <div
        ref={overlayRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden whitespace-pre-wrap break-words px-4 py-3 text-sm leading-relaxed"
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        <SpellCheckOverlay text={value} correctionsMap={correctionsMap} onReplace={handleReplace} />
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={syncScroll}
        placeholder={placeholder}
        rows={rows}
        className="relative z-10 w-full resize-none bg-transparent px-4 py-3 text-sm leading-relaxed text-transparent caret-white outline-none placeholder:text-slate-600"
        style={{ fontFamily: "Poppins, sans-serif" }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CoherenceDetectorTab                                               */
/* ------------------------------------------------------------------ */
function CoherenceDetectorTab({ config, role }) {
  const [sentenceA, setSentenceA] = useState("");
  const [sentenceB, setSentenceB] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function checkCoherence() {
    if (!sentenceA.trim() || !sentenceB.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await api("/coherence", { sentence_a: sentenceA.trim(), sentence_b: sentenceB.trim(), role });
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setSentenceA(""); setSentenceB(""); setResult(null); setError(null);
  }

  const canCheck = sentenceA.trim().length > 0 && sentenceB.trim().length > 0;

  return (
    <div className="flex flex-1 flex-col overflow-y-auto p-6">
      <div className="mx-auto w-full max-w-lg space-y-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-6 text-center">
            <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${config.gradient} text-white shadow-lg`}>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
              </svg>
            </div>
            <h2 className="text-base font-bold text-white">Coherence Detector</h2>
            <p className="mt-1 text-xs text-slate-500">Test if two sentences are logically coherent with each other</p>
          </div>

          {/* Sentence A */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Sentence A</label>
            <SpellCheckedTextarea
              value={sentenceA}
              onChange={setSentenceA}
              placeholder="Enter the first sentence..."
              rows={3}
            />
          </div>

          {/* VS divider */}
          <div className="flex items-center gap-3 py-1">
            <div className="h-px flex-1 bg-white/10" />
            <span className={`text-xs font-bold ${config.textAccent}`}>VS</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          {/* Sentence B */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Sentence B</label>
            <SpellCheckedTextarea
              value={sentenceB}
              onChange={setSentenceB}
              placeholder="Enter the second sentence..."
              rows={3}
            />
          </div>

          {/* Check button */}
          <button
            onClick={checkCoherence}
            disabled={!canCheck || loading}
            className={`flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${config.gradient} px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-30`}
          >
            {loading ? <><i className="fas fa-circle-notch fa-spin" /> Checking...</> : <><i className="fas fa-check-double" /> Check Coherence</>}
          </button>

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-center">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Result */}
          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-xl border border-white/10 bg-bg-card p-5 space-y-4">
                {/* Score + badge */}
                <div className="flex items-center justify-between">
                  <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                    result.coherence === "high"
                      ? "bg-emerald-500/15 text-emerald-400"
                      : result.coherence === "medium"
                        ? "bg-yellow-500/15 text-yellow-400"
                        : "bg-red-500/15 text-red-400"
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${result.coherence === "high" ? "bg-emerald-400" : result.coherence === "medium" ? "bg-yellow-400" : "bg-red-400"}`} />
                    {result.coherence?.toUpperCase()} COHERENCE
                  </div>
                  {result.score != null && (
                    <span className={`text-2xl font-bold tabular-nums ${
                      result.score >= 70 ? "text-emerald-400" : result.score >= 40 ? "text-yellow-400" : "text-red-400"
                    }`}>
                      {result.score}<span className="text-sm font-normal text-slate-500">/100</span>
                    </span>
                  )}
                </div>

                {/* Score bar */}
                {result.score != null && (
                  <div className="h-1.5 w-full rounded-full bg-white/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${result.score}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className={`h-full rounded-full ${result.score >= 70 ? "bg-emerald-400" : result.score >= 40 ? "bg-yellow-400" : "bg-red-400"}`}
                    />
                  </div>
                )}

                {/* Reason */}
                {result.reason && (
                  <div>
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Reason</p>
                    <p className="text-sm leading-relaxed text-slate-300">{result.reason}</p>
                  </div>
                )}

                {/* Suggestion (only shown for low/medium) */}
                {result.suggestion && (
                  <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 px-4 py-3">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-yellow-500">Suggestion</p>
                    <p className="text-sm leading-relaxed text-slate-300">{result.suggestion}</p>
                  </div>
                )}

                <button onClick={reset} className="text-xs text-slate-500 underline transition-colors hover:text-white">Clear & try again</button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

/* LEGACY — kept for reference, logic moved to DocumentAnalyzerTab */
function FileAnalysisModal({ file, config, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!file) return;
    let cancelled = false;

    async function processFile() {
      try {
        // Step 1: Upload file
        const formData = new FormData();
        formData.append("file", file);
        const uploadRes = await fetch(`${API_BASE}/files/upload`, {
          method: "POST",
          body: formData,
        });
        if (!uploadRes.ok) {
          let msg = "Upload failed";
          try { const e = await uploadRes.json(); msg = e.detail || e.message || msg; } catch {}
          throw new Error(msg);
        }
        const uploadData = await uploadRes.json();
        // Handle both camelCase (jobId) and snake_case (job_id) from backend
        const jobId = uploadData.jobId ?? uploadData.job_id;
        if (!jobId) throw new Error("Server did not return a job ID");
        if (cancelled) return;
        setCurrentStep(1);

        // Step 2-3: Poll status until completed
        let completed = false;
        while (!completed && !cancelled) {
          await new Promise((r) => setTimeout(r, 1500));
          const statusRes = await fetch(`${API_BASE}/files/status/${jobId}`);
          if (!statusRes.ok) {
            let msg = "Status check failed";
            try { const e = await statusRes.json(); msg = e.detail || e.message || msg; } catch {}
            throw new Error(msg);
          }
          const statusData = await statusRes.json();

          // Map API step (1-indexed) to our array (0-indexed)
          if (statusData.step != null) {
            setCurrentStep(Math.min(statusData.step - 1, analysisSteps.length - 1));
          } else {
            // Map status string to step
            const statusMap = { queued: 0, analyzing: 1, correcting: 2, completed: 3 };
            if (statusMap[statusData.status] != null) {
              setCurrentStep(statusMap[statusData.status]);
            }
          }

          if (statusData.status === "completed") {
            completed = true;
          } else if (statusData.status === "failed") {
            // Log full response to help diagnose
            console.error("Backend failed status payload:", JSON.stringify(statusData, null, 2));
            const reason = statusData.error || statusData.message || statusData.detail || "unknown reason";
            throw new Error(`File processing failed: ${reason}`);
          }
        }
        if (cancelled) return;

        // Step 4: Get report
        const reportRes = await fetch(`${API_BASE}/files/report/${jobId}`);
        if (!reportRes.ok) {
          let msg = "Failed to fetch report";
          try { const e = await reportRes.json(); msg = e.detail || e.message || msg; } catch {}
          throw new Error(msg);
        }
        const report = await reportRes.json();
        if (cancelled) return;

        setResult({
          jobId,
          totalWords: report.totalWords || 0,
          totalErrors: report.totalErrors || 0,
          corrections: report.corrections || [],
        });
      } catch (err) {
        if (!cancelled) {
          console.error("File processing error:", err);
          setError(err.message);
        }
      }
    }

    processFile();
    return () => {
      cancelled = true;
    };
  }, [file]);

  async function handleDownload() {
    if (!result?.jobId) return;
    try {
      const res = await fetch(`${API_BASE}/files/download/${result.jobId}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const baseName = file.name.replace(/\.[^.]+$/, "");
      a.download = `${baseName}_corrected.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
    }
  }

  const done = !!result;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl border border-white/10 bg-bg-card p-6 shadow-2xl"
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${config.gradient} text-white`}>
              <i className="fas fa-file-upload text-sm" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">File Analysis</h3>
              <p className="text-xs text-slate-500 truncate max-w-[200px]">{file.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 transition-colors hover:text-white">
            <i className="fas fa-times" />
          </button>
        </div>

        {/* Error state */}
        {error && (
          <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-center">
            <i className="fas fa-exclamation-circle text-red-400 text-xl mb-2" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Steps */}
        <div className="mb-6 space-y-3">
          {analysisSteps.map((step, i) => {
            const isActive = !done && !error && currentStep === i;
            const isComplete = done || currentStep > i;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                  isActive
                    ? `${config.bgAccent} border ${config.borderAccent}`
                    : isComplete
                      ? "bg-emerald-500/5 border border-emerald-500/20"
                      : "bg-white/[0.02] border border-white/5"
                }`}
              >
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                  isActive
                    ? `bg-gradient-to-br ${config.gradient} text-white`
                    : isComplete
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-white/5 text-slate-600"
                }`}>
                  {isComplete ? (
                    <i className="fas fa-check text-[10px]" />
                  ) : isActive ? (
                    <i className="fas fa-circle-notch fa-spin text-[10px]" />
                  ) : (
                    <span>{i + 1}</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <i className={`fas ${step.icon} text-xs ${
                    isActive ? config.textAccent : isComplete ? "text-emerald-400" : "text-slate-600"
                  }`} />
                  <span className={`text-sm ${
                    isActive ? "text-white font-medium" : isComplete ? "text-emerald-300" : "text-slate-500"
                  }`}>
                    {step.label}
                    {isActive && <span className="ml-1 animate-pulse">...</span>}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Results */}
        <AnimatePresence>
          {done && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Stats */}
              <div className="mb-4 grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-white/5 p-3 text-center">
                  <p className="text-lg font-bold text-white">{result.totalWords}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Words</p>
                </div>
                <div className="rounded-xl bg-red-500/10 p-3 text-center">
                  <p className="text-lg font-bold text-red-400">{result.totalErrors || result.corrections.length}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Errors</p>
                </div>
                <div className="rounded-xl bg-emerald-500/10 p-3 text-center">
                  <p className="text-lg font-bold text-emerald-400">{result.corrections.length}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Fixed</p>
                </div>
              </div>

              {/* Corrections list */}
              {result.corrections.length > 0 && (
                <div className="mb-4 max-h-32 overflow-y-auto rounded-xl bg-white/[0.02] border border-white/5 p-3 space-y-1.5">
                  {result.corrections.map((c, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="text-red-400 line-through">{c.original || c.word}</span>
                      <i className="fas fa-arrow-right text-[8px] text-slate-600" />
                      <span className="text-emerald-400 font-medium">{c.corrected || (c.suggestions && c.suggestions[0]) || "—"}</span>
                    </div>
                  ))}
                </div>
              )}

              {result.corrections.length === 0 && (
                <div className="mb-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-4 text-center">
                  <i className="fas fa-check-circle text-emerald-400 text-xl mb-2" />
                  <p className="text-sm text-emerald-300">No spelling errors found!</p>
                </div>
              )}

              {/* Download button */}
              <button
                onClick={handleDownload}
                className={`flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${config.gradient} px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:brightness-110`}
              >
                <i className="fas fa-download" />
                Download Corrected File
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>,
    document.body
  );
}

/* ------------------------------------------------------------------ */
/*  ChatInput — debounced spellcheck + predictions via API             */
/* ------------------------------------------------------------------ */
function ChatInput({ config, onSend, role }) {
  const [text, setText] = useState("");
  const [correctionsMap, setCorrectionsMap] = useState({});
  const [predictions, setPredictions] = useState([]);
  const textareaRef = useRef(null);
  const overlayRef = useRef(null);
  const containerRef = useRef(null);
  const skipNextSpellcheck = useRef(false);

  // Debounced spell check via API
  useEffect(() => {
    if (!text.trim()) {
      setCorrectionsMap({});
      return;
    }
    // Skip one cycle after auto-correction so corrected text doesn't re-trigger underlines
    if (skipNextSpellcheck.current) {
      skipNextSpellcheck.current = false;
      return;
    }
    const controller = new AbortController();
    let autoFixTimer = null;
    const timer = setTimeout(async () => {
      try {
        const data = await api("/spellcheck", { text }, { signal: controller.signal });
        const { corrections, auto_corrected_text } = data;
        const map = {};
        for (const c of corrections) {
          map[c.word.toLowerCase()] = { correction: c.correction, offset: c.offset, length: c.length };
        }
        setCorrectionsMap(map);
        if (corrections.length > 0 && auto_corrected_text) {
          autoFixTimer = setTimeout(() => {
            skipNextSpellcheck.current = true;
            setText(auto_corrected_text);
            setCorrectionsMap({});
          }, 1000);
        }
      } catch (e) {
        if (e.name !== "AbortError") console.error("Spellcheck error:", e);
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      clearTimeout(autoFixTimer);
      controller.abort();
    };
  }, [text]);

  // Debounced predictions via API
  useEffect(() => {
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount < 4) {
      setPredictions([]);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const data = await api("/predict", { text, role, count: 5 }, { signal: controller.signal });
        setPredictions(data.predictions || []);
      } catch (e) {
        if (e.name !== "AbortError") console.error("Predict error:", e);
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [text, role]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = ta.scrollHeight + "px";
    }
  }, [text]);

  // Sync scroll between textarea and overlay
  const syncScroll = useCallback(() => {
    if (overlayRef.current && textareaRef.current) {
      overlayRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, []);

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
    setCorrectionsMap({});
    setPredictions([]);
  }

  // On tap: replace misspelled word at [offset:offset+length] with correction
  function handleReplace(offset, length, correction) {
    skipNextSpellcheck.current = true;
    setText((prev) => prev.slice(0, offset) + correction + prev.slice(offset + length));
    setCorrectionsMap({});
    textareaRef.current?.focus();
  }

  function handlePrediction(prediction) {
    setText(prediction);
    setPopover(null);
    textareaRef.current?.focus();
  }

  return (
    <div className="border-t border-white/10 bg-bg-deep/80 backdrop-blur-xl">
      <div className="flex items-end gap-2 px-3 py-3 sm:px-4">

        <div ref={containerRef} className="relative min-h-[44px] flex-1 rounded-xl border border-white/10 bg-bg-card transition-colors focus-within:border-white/20">
          {/* Styled overlay (visible text with spell highlights — tap to auto-fix) */}
          <div
            ref={overlayRef}
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden whitespace-pre-wrap break-words px-4 py-3 text-sm leading-relaxed"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            <SpellCheckOverlay text={text} correctionsMap={correctionsMap} onReplace={handleReplace} />
          </div>

          {/* Actual textarea (transparent bg so overlay shows through) */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onScroll={syncScroll}
            placeholder={config.placeholder}
            rows={1}
            className="relative z-10 w-full resize-none bg-transparent px-4 py-3 text-sm leading-relaxed text-transparent caret-white outline-none placeholder:text-slate-600"
            style={{ fontFamily: "Poppins, sans-serif", maxHeight: 160 }}
          />
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r ${config.gradient} text-white shadow-lg transition-all hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed`}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </div>

      {/* Prediction chips below the input */}
      <AnimatePresence>
        {predictions.length > 0 && (
          <PredictionList
            predictions={predictions}
            config={config}
            onSelect={handlePrediction}
          />
        )}
      </AnimatePresence>

    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ChatArea                                                           */
/* ------------------------------------------------------------------ */
function ChatArea({ messages, config, isAiTyping }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAiTyping]);

  return (
    <div className="flex-1 overflow-y-auto py-4">
      {messages.length === 0 && !isAiTyping && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center"
        >
          <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${config.gradient} text-white shadow-xl`}>
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d={config.avatarPath} />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white">{config.title} Workspace</h2>
          <p className="max-w-sm text-sm text-slate-400">{config.greeting}</p>
          <p className="text-xs text-slate-600">
            Start typing to see real-time spell checking and AI-powered predictions
          </p>
        </motion.div>
      )}

      {messages.map((msg) => (
        <ChatBubble key={msg.id} message={msg} config={config} />
      ))}

      <AnimatePresence>
        {isAiTyping && <TypingIndicator config={config} />}
      </AnimatePresence>

      <div ref={bottomRef} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Workspace (main export) — streaming chat via SSE                   */
/* ------------------------------------------------------------------ */
export default function Workspace() {
  const { role } = useParams();
  const navigate = useNavigate();
  const config = roleConfig[role];

  const [messages, setMessages] = useState([]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const nextId = useRef(1);

  // Guard: invalid role → redirect
  if (!config) return <Navigate to="/roles" replace />;

  async function handleSend(text) {
    const userMsg = { id: nextId.current++, sender: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setIsAiTyping(true);

    // Build conversation history for the chat API
    const chatMessages = [...messages, userMsg].map((m) => ({
      sender: m.sender === "ai" ? "assistant" : m.sender,
      text: m.text,
    }));

    const aiMsgId = nextId.current++;
    // Add an empty AI message placeholder (ChatBubble hides it until content arrives)
    setMessages((prev) => [...prev, { id: aiMsgId, sender: "ai", text: "", description: "", points: [] }]);

    try {
      // Try streaming endpoint first
      const res = await fetch(`${API_BASE}/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, messages: chatMessages }),
      });

      if (!res.ok) throw new Error("Stream request failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let currentEvent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop(); // keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith("event: ")) {
            currentEvent = line.slice(7).trim();
          } else if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (currentEvent === "message") {
                setIsAiTyping(false);
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === aiMsgId ? { ...m, text: data.text } : m
                  )
                );
              } else if (currentEvent === "description") {
                setIsAiTyping(false);
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === aiMsgId ? { ...m, description: data.text } : m
                  )
                );
              } else if (currentEvent === "point") {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === aiMsgId
                      ? { ...m, points: [...m.points, { index: data.index, text: data.text }] }
                      : m
                  )
                );
              } else if (currentEvent === "done") {
                setIsAiTyping(false);
              }
            } catch {
              // Skip malformed SSE lines
            }
          }
        }
      }
      setIsAiTyping(false);
    } catch {
      // Fallback: try non-streaming chat endpoint
      try {
        const data = await api("/chat", { role, messages: chatMessages });
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsgId ? { ...m, text: data.reply } : m
          )
        );
      } catch {
        // Both endpoints failed — show error message
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsgId
              ? { ...m, text: "Sorry, I couldn't process your request. Please check that the backend server is running at http://localhost:8000." }
              : m
          )
        );
      }
      setIsAiTyping(false);
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-bg-deep p-4">
      {/* Background orbs */}
      <div
        className={`pointer-events-none fixed -top-32 -left-32 h-[400px] w-[400px] rounded-full bg-gradient-to-br ${config.gradient} opacity-10 blur-[120px]`}
        style={{ animation: "float 8s ease-in-out infinite" }}
      />
      <div
        className={`pointer-events-none fixed -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-gradient-to-br ${config.gradient} opacity-10 blur-[120px]`}
        style={{ animation: "float 10s ease-in-out infinite reverse" }}
      />

      {/* Contained workspace window */}
      <div className="relative z-10 flex h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-bg-deep/90 shadow-2xl backdrop-blur-sm">
        <WorkspaceHeader config={config} onBack={() => navigate("/roles")} />
        <TabBar activeTab={activeTab} onChange={setActiveTab} config={config} />

        {activeTab === "chat" && (
          <>
            <ChatArea messages={messages} config={config} isAiTyping={isAiTyping} />
            <ChatInput config={config} onSend={handleSend} role={role} />
          </>
        )}
        {activeTab === "document" && <DocumentAnalyzerTab config={config} />}
        {activeTab === "coherence" && <CoherenceDetectorTab config={config} role={role} />}
      </div>
    </div>
  );
}
