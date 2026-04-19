import { motion as Motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function ChatBubble({ message, config }) {
  const isUser = message.sender === "user";

  const hasContent =
    message.text ||
    message.description ||
    (message.points && message.points.length > 0);
  if (!hasContent) return null;

  return (
    <Motion.div
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
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed sm:max-w-[70%] ${
          isUser
            ? `bg-gradient-to-r ${config.gradient} text-white rounded-br-sm`
            : "bg-bg-card text-slate-200 border border-white/5 rounded-bl-sm"
        }`}
      >
        {isUser ? (
          message.text
        ) : (
          <div className="markdown-container prose prose-invert prose-sm max-w-none">
            {message.description && <p className="mb-2 font-medium text-white">{message.description}</p>}
            {message.points && message.points.length > 0 && (
              <ol className="mb-3 list-decimal space-y-1 pl-4">
                {message.points.map((p, idx) => (
                  <li key={idx}>{p.text}</li>
                ))}
              </ol>
            )}
            {message.text && (
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                  ul: ({ children }) => <ul className="mb-2 list-disc pl-4 space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="mb-2 list-decimal pl-4 space-y-1">{children}</ol>,
                  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                  strong: ({ children }) => <strong className="font-bold text-white tracking-tight">{children}</strong>,
                  code: ({ children }) => <code className="rounded bg-white/10 px-1 py-0.5 text-xs font-mono">{children}</code>
                }}
              >
                {message.text}
              </ReactMarkdown>
            )}
          </div>
        )}
      </div>
    </Motion.div>
  );
}
