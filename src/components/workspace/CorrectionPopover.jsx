import { useRef, useEffect } from "react";
import { motion as Motion } from "framer-motion";

export function CorrectionPopover({ corrections, position, onSelect, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <Motion.div
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
    </Motion.div>
  );
}
