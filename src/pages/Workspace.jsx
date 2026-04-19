import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { AnimatePresence, motion as Motion } from "framer-motion";

import roleConfig from "../config/role-config";
import { nlpService } from "../api/nlp-service";

import { WorkspaceHeader } from "../components/workspace/WorkspaceHeader";
import { TabBar } from "../components/workspace/TabBar";
import { ChatBubble } from "../components/workspace/ChatBubble";
import { TypingIndicator } from "../components/workspace/TypingIndicator";
import { PredictionList } from "../components/workspace/PredictionList";
import { DocumentAnalyzerTab } from "../components/workspace/DocumentAnalyzerTab";
import { CoherenceDetectorTab } from "../components/workspace/CoherenceDetectorTab";
import { SpellCheckedTextarea } from "../components/workspace/SpellCheckedTextarea";
import { CorrectionPopover } from "../components/workspace/CorrectionPopover";
import { API_BASE } from "../api/api-client";

// fadeUp and other animation constants...

export default function Workspace() {
  const { role } = useParams();
  const navigate = useNavigate();
  const config = roleConfig[role];

  // State
  const [activeTab, setActiveTab] = useState("chat");
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [predictions, setPredictions] = useState([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [isTipsOpen, setIsTipsOpen] = useState(false);

  // Refs for auto-fix/popover (legacy but still needed for some orchestration)
  const chatEndRef = useRef(null);

  // Handling predictions logic
  useEffect(() => {
    if (!config || activeTab !== "chat") return;
    const lastWord = inputText.split(" ").pop();
    if (lastWord.length < 3) {
      setPredictions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const results = await nlpService.predict(inputText, role);
        setPredictions(results);
        setShowPredictions(true);
      } catch (e) {
        console.error("Prediction error:", e);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [inputText, role, activeTab, config]);

  useEffect(() => {
    if (!config) return;
    // Initial greeting
    if (messages.length === 0) {
      setMessages([{ sender: "assistant", text: config.greeting }]);
    }
  }, [config, messages.length]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Redirect if role is invalid (Move to AFTER hooks)
  if (!config) return <Navigate to="/roles" replace />;

  const handleSendMessage = async (textOverride) => {
    const text = textOverride || inputText;
    if (!text.trim()) return;

    const userMsg = { sender: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setPredictions([]);
    setShowPredictions(false);
    setIsTyping(true);

    try {
      // Create a temporary placeholder for streaming content
      setMessages((prev) => [...prev, { sender: "assistant", text: "", description: "", points: [] }]);
      
      const response = await fetch(`${API_BASE}/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, messages: [...messages, userMsg] }),
      });

      if (!response.ok) {
        if (response.status === 429) throw new Error("You're sending messages too quickly. Please wait a moment.");
        if (response.status >= 500) throw new Error("Our AI service is experiencing difficulties. Please try again later.");
        throw new Error("I couldn't connect to the chat service.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let displayedText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        
        // Keep the last (potentially partial) line in the buffer
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine || !trimmedLine.startsWith("data: ")) continue;
          
          const data = trimmedLine.slice(6);
          if (data === "[DONE]") {
            setIsTyping(false);
            return;
          }
          
          try {
            const parsed = JSON.parse(data);
            if (parsed.text) {
              displayedText += parsed.text;
              
              setMessages((prev) => {
                const newMessages = [...prev];
                const lastIndex = newMessages.length - 1;
                // Update the placeholder message with accumulated text
                newMessages[lastIndex] = { 
                  ...newMessages[lastIndex], 
                  text: displayedText,
                  sender: "assistant"
                };
                return newMessages;
              });
            }
          } catch (e) {
            console.error("Error parsing stream line:", e, "Line:", trimmedLine);
          }
        }
      }
    } catch (error) {
       console.error("Chat error:", error);
       const friendlyMessage = error.message.includes("Failed to fetch") 
         ? "The server is currently unavailable. Please check your connection."
         : error.message || "I'm sorry, I encountered an error. Please try again.";
       
       setMessages(prev => {
         const newMessages = [...prev];
         const lastIndex = newMessages.length - 1;
         // If we had a placeholder assistant message, replace its text
         if (newMessages[lastIndex]?.sender === "assistant" && !newMessages[lastIndex].text) {
           newMessages[lastIndex] = { ...newMessages[lastIndex], text: friendlyMessage };
           return newMessages;
         }
         return [...prev, { sender: "assistant", text: friendlyMessage }];
       });
    } finally {
      setIsTyping(false);
    }
  };

  const applyPrediction = (p) => {
    const words = inputText.trim().split(" ");
    words.pop(); // Remove the partial word
    const newValue = words.join(" ") + (words.length > 0 ? " " : "") + p + " ";
    setInputText(newValue);
    setPredictions([]);
    setShowPredictions(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-[100dvh] flex-col bg-bg-deep font-poppins overflow-hidden">
      <WorkspaceHeader
        config={config}
        onBack={() => navigate("/roles")}
        onShowTips={() => setIsTipsOpen(true)}
      />
      
      <main className="flex flex-1 flex-col overflow-hidden sm:flex-row">
        {/* Left/Main Column: Chat & Tabs */}
        <div className="flex flex-1 flex-col border-r border-white/5 bg-white/[0.01]">
          <TabBar activeTab={activeTab} onChange={setActiveTab} config={config} />

          <div className="relative flex flex-1 flex flex-col overflow-hidden">
            {activeTab === "chat" && (
              <div className="flex h-full flex-col overflow-hidden">
                {/* Scrollable Message Area */}
                <div className="custom-scrollbar flex-1 overflow-y-auto pt-4">
                  <AnimatePresence initial={false}>
                    {messages.map((m, i) => (
                      <ChatBubble key={i} message={m} config={config} />
                    ))}
                    {isTyping && <TypingIndicator config={config} />}
                  </AnimatePresence>
                  <div ref={chatEndRef} />
                </div>
 
                {/* Inline Input Area (Native Flexbox sibling) */}
                <div className="bg-bg-deep/80 px-3 pb-4 pt-4 backdrop-blur-md sm:px-4 sm:pb-6 sm:pt-6">
                  <div className="mx-auto max-w-2xl">
                    <AnimatePresence>
                      {showPredictions && predictions.length > 0 && (
                        <PredictionList
                          predictions={predictions}
                          config={config}
                          onSelect={applyPrediction}
                        />
                      )}
                    </AnimatePresence>
 
                    <div className="flex items-end gap-2 rounded-2xl bg-bg-card p-2 shadow-xl border border-white/10 ring-1 ring-white/5">
                      <div className="flex-1">
                        <SpellCheckedTextarea
                          value={inputText}
                          onChange={setInputText}
                          onKeyDown={handleKeyDown}
                          placeholder={config.placeholder}
                          rows={1}
                        />
                      </div>
                      <button
                        onClick={() => handleSendMessage()}
                        disabled={!inputText.trim() || isTyping}
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r ${config.gradient} text-white shadow-lg transition-all hover:brightness-110 disabled:opacity-30 disabled:grayscale`}
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "document" && <DocumentAnalyzerTab config={config} />}
            {activeTab === "coherence" && <CoherenceDetectorTab config={config} role={role} />}
          </div>
        </div>



        {/* Quick Tips Modal */}
        <AnimatePresence>
          {isTipsOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <Motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsTipsOpen(false)}
                className="absolute inset-0 bg-bg-deep/80 backdrop-blur-sm"
              />
              <Motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-bg-card shadow-2xl"
              >
                <div className={`p-6 bg-gradient-to-br ${config.gradient} text-white`}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">Quick Tips</h3>
                    <button onClick={() => setIsTipsOpen(false)} className="rounded-lg p-1 hover:bg-white/10">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <p className="mt-1 text-xs opacity-80">Boost your productivity with TextifyAI</p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5">
                      <i className="fas fa-file-alt text-xs text-sky-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Document Analyzer</h4>
                      <p className="mt-1 text-xs text-slate-500">Upload .txt files to fix spelling and grammar across large texts instantly.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5">
                      <i className="fas fa-sync text-xs text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Coherence Detector</h4>
                      <p className="mt-1 text-xs text-slate-500">Ensure your logic flows correctly between sentences or paragraphs.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5">
                      <i className="fas fa-keyboard text-xs text-violet-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Shortcuts</h4>
                      <p className="mt-1 text-xs text-slate-500">Press <b>Enter</b> to send, <b>Shift+Enter</b> for newline.</p>
                    </div>
                  </div>
                </div>
                <div className="border-t border-white/5 p-4 bg-white/[0.02]">
                  <button
                    onClick={() => setIsTipsOpen(false)}
                    className="w-full rounded-xl bg-white/5 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
                  >
                    Got it, thanks!
                  </button>
                </div>
              </Motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
