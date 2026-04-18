import { motion as Motion } from "framer-motion";

export function WorkspaceHeader({ config, onBack, onShowTips }) {
  return (
    <Motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/10 bg-bg-deep/70 px-4 py-3 backdrop-blur-xl sm:px-6 sm:gap-4"
    >
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-slate-400 transition-colors hover:text-white"
        aria-label="Go back to role selection"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        <span className="hidden sm:inline text-sm">Back</span>
      </button>

      <div className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-gradient-to-br ${config.gradient} text-white shadow-lg`}>
        <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d={config.avatarPath} />
        </svg>
      </div>

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-[13px] sm:text-sm font-bold text-white leading-tight">
          {config.title} Workspace
        </h1>
        <p className="text-[10px] sm:text-xs text-slate-500">TextifyAI</p>
      </div>

      <button
        onClick={onShowTips}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition-all hover:border-white/20 hover:text-white"
        aria-label="Show quick tips"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
        </svg>
      </button>
    </Motion.header>
  );
}
