import { useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { nlpService } from "../../api/nlp-service";
import { SpellCheckedTextarea } from "./SpellCheckedTextarea";

export function CoherenceDetectorTab({ config, role }) {
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
      const data = await nlpService.checkCoherence(sentenceA.trim(), sentenceB.trim(), role);
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setSentenceA("");
    setSentenceB("");
    setResult(null);
    setError(null);
  }

  const canCheck = sentenceA.trim().length > 0 && sentenceB.trim().length > 0;

  return (
    <div className="flex h-full flex-1 flex-col min-h-0 overflow-y-auto p-6">
      <div className="mx-auto w-full max-w-lg space-y-4">
        <Motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
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
            className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${config.gradient} px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-30`}
          >
            {loading ? (
              <><i className="fas fa-circle-notch fa-spin" /> Checking...</>
            ) : (
              <><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Check Coherence</>
            )}
          </button>

          {/* Error */}
          {error && (
            <Motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group relative overflow-hidden rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-center"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-50" />
              <div className="relative flex flex-col items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10 text-red-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-red-200">{error}</p>
                <p className="text-[10px] text-red-400/60 uppercase tracking-widest font-bold">Action Required</p>
              </div>
            </Motion.div>
          )}

          {/* Result */}
          <AnimatePresence>
            {result && (
              <Motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-xl border border-white/10 bg-bg-card p-5 space-y-4">
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

                {result.score != null && (
                  <div className="h-1.5 w-full rounded-full bg-white/10">
                    <Motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${result.score}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className={`h-full rounded-full ${result.score >= 70 ? "bg-emerald-400" : result.score >= 40 ? "bg-yellow-400" : "bg-red-400"}`}
                    />
                  </div>
                )}

                {result.reason && (
                  <div>
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Reason</p>
                    <p className="text-sm leading-relaxed text-slate-300">{result.reason}</p>
                  </div>
                )}

                {result.suggestion && (
                  <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 px-4 py-3">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-yellow-500">Suggestion</p>
                    <p className="text-sm leading-relaxed text-slate-300">{result.suggestion}</p>
                  </div>
                )}

                <button onClick={reset} className="text-xs text-slate-500 underline transition-colors hover:text-white">Clear & try again</button>
              </Motion.div>
            )}
          </AnimatePresence>
        </Motion.div>
      </div>
    </div>
  );
}
