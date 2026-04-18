import { motion as Motion } from "framer-motion";

export function TypingIndicator({ config }) {
  return (
    <Motion.div
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
            <Motion.span
              key={i}
              className={`block h-2 w-2 rounded-full bg-gradient-to-r ${config.gradient}`}
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </div>
    </Motion.div>
  );
}
