import { motion as Motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function ChatBubble({ message, config }) {
  const isUser = message.sender === "user";

  // Don't render empty placeholder before any streaming content arrives
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
          <>
            {message.description && <p>{message.description}</p>}
            {message.points && message.points.length > 0 && (
              <ol className="mt-2 list-decimal space-y-1 pl-4">
                {message.points.map((p) => (
                  <li key={p.index}>{p.text}</li>
                ))}
              </ol>
            )}
            {/* Fallback for non-streamed replies */}
            {!message.description && !message.points?.length && message.text}
          </>
        )}
      </div>
    </Motion.div>
  );
}
