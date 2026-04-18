/**
 * Renders text with visual indicators for identified spelling errors.
 */
export function SpellCheckOverlay({ text, correctionsMap, onReplace }) {
  if (!text) return <span className="text-slate-500 pointer-events-none select-none">&nbsp;</span>;

  const tokens = text.split(/(\s+)/);
  let charOffset = 0;
  const renderedTokens = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const tokenStart = charOffset;
    charOffset += token.length;

    if (/^\s+$/.test(token)) {
      renderedTokens.push(<span key={i}>{token}</span>);
      continue;
    }

    const stripped = token.replace(/[^a-zA-Z'-]/g, "");
    const entry = stripped ? correctionsMap[stripped.toLowerCase()] || null : null;

    if (entry) {
      renderedTokens.push(
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
    } else {
      renderedTokens.push(
        <span key={i} className="text-slate-200">
          {token}
        </span>
      );
    }
  }

  return <>{renderedTokens}</>;
}
