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

  // Don't render empty messages (e.g. streaming placeholder before first token)
  if (!message.text) return null;

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
        {message.text}
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
/*  PredictionChips                                                    */
/* ------------------------------------------------------------------ */
function PredictionChips({ predictions, config, onSelect }) {
  if (!predictions.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.2 }}
      className="scrollbar-hide flex gap-2 overflow-x-auto px-4 pb-2"
    >
      {predictions.map((p, i) => (
        <motion.button
          key={p}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.04 }}
          onClick={() => onSelect(p)}
          className={`shrink-0 rounded-full border ${config.borderAccent} ${config.bgAccent} px-3 py-1.5 text-xs font-medium ${config.textAccent} transition-all hover:brightness-125 whitespace-nowrap`}
        >
          {p}
        </motion.button>
      ))}
    </motion.div>
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
        if (!uploadRes.ok) throw new Error("Upload failed");
        const uploadData = await uploadRes.json();
        const jobId = uploadData.jobId;
        if (cancelled) return;
        setCurrentStep(1);

        // Step 2-3: Poll status until completed
        let completed = false;
        while (!completed && !cancelled) {
          await new Promise((r) => setTimeout(r, 1500));
          const statusRes = await fetch(`${API_BASE}/files/status/${jobId}`);
          if (!statusRes.ok) throw new Error("Status check failed");
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
            throw new Error("File processing failed on server");
          }
        }
        if (cancelled) return;

        // Step 4: Get report
        const reportRes = await fetch(`${API_BASE}/files/report/${jobId}`);
        if (!reportRes.ok) throw new Error("Failed to fetch report");
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
  const [uploadedFile, setUploadedFile] = useState(null);
  const [correctionsMap, setCorrectionsMap] = useState({});
  const [predictions, setPredictions] = useState([]);
  const textareaRef = useRef(null);
  const overlayRef = useRef(null);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Debounced spell check via API
  useEffect(() => {
    if (!text.trim()) {
      setCorrectionsMap({});
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const data = await api("/spellcheck", { text }, { signal: controller.signal });
        const map = {};
        for (const c of data.corrections) {
          map[c.word.toLowerCase()] = { correction: c.correction, offset: c.offset, length: c.length };
        }
        setCorrectionsMap(map);
      } catch (e) {
        if (e.name !== "AbortError") console.error("Spellcheck error:", e);
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [text]);

  // Debounced predictions via API
  useEffect(() => {
    if (text.trim().length < 3) {
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
    setText((prev) => prev.slice(0, offset) + correction + prev.slice(offset + length));
    textareaRef.current?.focus();
  }

  function handlePrediction(prediction) {
    setText(prediction);
    setPopover(null);
    textareaRef.current?.focus();
  }

  function handleFileChange(e) {
    const f = e.target.files?.[0];
    if (f && f.type === "text/plain") setUploadedFile(f);
    e.target.value = "";
  }

  return (
    <div className="border-t border-white/10 bg-bg-deep/80 backdrop-blur-xl">
      <div className="flex items-end gap-2 px-3 py-3 sm:px-4">
        {/* File upload button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-bg-card text-slate-400 transition-all hover:border-white/20 hover:text-white"
          title="Upload text file"
        >
          <i className="fas fa-file-upload text-sm" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,text/plain"
          onChange={handleFileChange}
          className="hidden"
        />

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
          <PredictionChips
            predictions={predictions}
            config={config}
            onSelect={handlePrediction}
          />
        )}
      </AnimatePresence>

      {/* File analysis modal */}
      <AnimatePresence>
        {uploadedFile && (
          <FileAnalysisModal
            file={uploadedFile}
            config={config}
            onClose={() => setUploadedFile(null)}
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
    // Add an empty AI message placeholder (ChatBubble hides it until text arrives)
    setMessages((prev) => [...prev, { id: aiMsgId, sender: "ai", text: "" }]);

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
      let receivedFirst = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop(); // keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.done) {
                setIsAiTyping(false);
              } else if (data.token) {
                if (!receivedFirst) {
                  setIsAiTyping(false);
                  receivedFirst = true;
                }
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === aiMsgId ? { ...m, text: m.text + data.token } : m
                  )
                );
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
              ? { ...m, text: "Sorry, I couldn't process your request. Please check that the backend server is running at http://localhost:8001." }
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

      {/* Contained chat window */}
      <div className="relative z-10 flex h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-bg-deep/90 shadow-2xl backdrop-blur-sm">
        <WorkspaceHeader config={config} onBack={() => navigate("/roles")} />
        <ChatArea messages={messages} config={config} isAiTyping={isAiTyping} />
        <ChatInput config={config} onSend={handleSend} role={role} />
      </div>
    </div>
  );
}
