import { motion as Motion } from "framer-motion";

export function PredictionList({ predictions, config, onSelect }) {
  if (!predictions.length) return null;

  return (
    <Motion.ul
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.2 }}
      className="mx-3 mb-2 overflow-hidden rounded-xl border border-white/10 bg-bg-card"
    >
      {predictions.map((p, i) => (
        <Motion.li
          key={i}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.04 }}
          onClick={() => onSelect(p)}
          className={`cursor-pointer border-b border-white/5 px-4 py-2.5 text-sm ${config.textAccent} transition-colors last:border-b-0 hover:bg-white/5`}
        >
          {p}
        </Motion.li>
      ))}
    </Motion.ul>
  );
}
