import { useState, useRef, useEffect, useCallback } from "react";
import { nlpService } from "../../api/nlp-service";
import { SpellCheckOverlay } from "./SpellCheckOverlay";

/**
 * Reusable textarea with an integrated overlay for real-time spellchecking.
 */
export function SpellCheckedTextarea({ value, onChange, placeholder, rows = 1, onKeyDown }) {
  const [correctionsMap, setCorrectionsMap] = useState({});
  const textareaRef = useRef(null);
  const overlayRef = useRef(null);
  const skipNextSpellcheck = useRef(false);

  useEffect(() => {
    if (!value.trim()) {
      // Avoid synchronous setState in effect body to prevent cascading render warnings
      const timer = setTimeout(() => setCorrectionsMap({}), 0);
      return () => clearTimeout(timer);
    }
    if (skipNextSpellcheck.current) {
      skipNextSpellcheck.current = false;
      return;
    }

    const controller = new AbortController();
    let autoFixTimer = null;

    const timer = setTimeout(async () => {
      try {
        const data = await nlpService.spellcheck(value, controller.signal);
        const { corrections, auto_corrected_text } = data;
        
        const map = {};
        for (const c of corrections) {
          map[c.word.toLowerCase()] = {
            correction: c.correction,
            offset: c.offset,
            length: c.length
          };
        }
        setCorrectionsMap(map);

        /* Automatically correct high confidence errors after one second of inactivity. */
        if (corrections.length > 0 && auto_corrected_text) {
          autoFixTimer = setTimeout(() => {
            skipNextSpellcheck.current = true;
            onChange(auto_corrected_text);
            setCorrectionsMap({});
          }, 1000);
        }
      } catch (e) {
        if (e.name !== "AbortError") {
          console.error("Spellcheck error:", e);
        }
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      clearTimeout(autoFixTimer);
      controller.abort();
    };
  }, [value, onChange]);

  /* Handle auto-expanding height logic. */
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const newHeight = Math.min(textareaRef.current.scrollHeight, 200);
      textareaRef.current.style.height = `${newHeight}px`;
      if (overlayRef.current) {
        overlayRef.current.style.height = `${newHeight}px`;
      }
    }
  }, [value]);

  function handleReplace(offset, length, correction) {
    skipNextSpellcheck.current = true;
    const newValue = value.slice(0, offset) + correction + value.slice(offset + length);
    onChange(newValue);
    setCorrectionsMap({});
  }

  const syncScroll = useCallback(() => {
    if (overlayRef.current && textareaRef.current) {
      overlayRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, []);

  return (
    <div className="relative rounded-xl border border-white/10 bg-bg-card transition-colors focus-within:border-white/20 overflow-hidden">
      <div
        ref={overlayRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-y-auto whitespace-pre-wrap break-words px-4 py-3 text-sm leading-relaxed scrollbar-hide"
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        <SpellCheckOverlay
          text={value}
          correctionsMap={correctionsMap}
          onReplace={handleReplace}
        />
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={syncScroll}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        rows={rows}
        className="relative z-10 w-full resize-none bg-transparent px-4 py-3 text-sm leading-relaxed text-transparent caret-white outline-none placeholder:text-slate-600 overflow-y-auto custom-scrollbar"
        style={{ fontFamily: "Poppins, sans-serif" }}
      />
    </div>
  );
}
