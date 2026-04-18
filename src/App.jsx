import { motion as Motion, useInView, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import logo from "./assets/textify-logo.png";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

/* Section wrapper with scroll-triggered animation. */
function Section({ children, className = "", delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <Motion.section
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </Motion.section>
  );
}

/* Live Demo Card with animated correction showcase. */

const demoLines = [
  {
    wrong: "heyy are you travaellluing today",
    fixed: "hey are you travelling today",
    corrections: [
      { wrong: "heyy", fixed: "hey" },
      { wrong: "travaellluing", fixed: "travelling" },
    ],
  },
  {
    wrong: "i recieved the documnet yestarday",
    fixed: "I received the document yesterday",
    corrections: [
      { wrong: "i", fixed: "I" },
      { wrong: "recieved", fixed: "received" },
      { wrong: "documnet", fixed: "document" },
      { wrong: "yestarday", fixed: "yesterday" },
    ],
  },
  {
    wrong: "the meetting is sceduled for wenesday",
    fixed: "the meeting is scheduled for Wednesday",
    corrections: [
      { wrong: "meetting", fixed: "meeting" },
      { wrong: "sceduled", fixed: "scheduled" },
      { wrong: "wenesday", fixed: "Wednesday" },
    ],
  },
];

function DemoCard() {
  const [lineIndex, setLineIndex] = useState(0);
  const [phase, setPhase] = useState("typing"); // typing, wrong, correcting, or done
  const [typedChars, setTypedChars] = useState(0);
  const current = demoLines[lineIndex];

  useEffect(() => {
    if (phase !== "typing") return;
    if (typedChars >= current.wrong.length) {
      const t = setTimeout(() => setPhase("wrong"), 400);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setTypedChars((c) => c + 1), 35);
    return () => clearTimeout(t);
  }, [phase, typedChars, current.wrong.length]);

  useEffect(() => {
    if (phase !== "wrong") return;
    const t = setTimeout(() => setPhase("correcting"), 800);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "correcting") return;
    const t = setTimeout(() => setPhase("done"), 1200);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "done") return;
    const t = setTimeout(() => {
      setLineIndex((i) => (i + 1) % demoLines.length);
      setPhase("typing");
      setTypedChars(0);
    }, 2000);
    return () => clearTimeout(t);
  }, [phase]);

  /* Build the displayed wrong text with highlighted errors. */
  function renderWrongText() {
    const text = current.wrong.slice(0, typedChars);
    if (phase === "typing") {
      return (
        <span className="text-slate-300">
          {text}
          <span className="inline-block w-0.5 h-4 bg-sky-400 ml-0.5 align-middle animate-pulse" />
        </span>
      );
    }
    let result = current.wrong;
    const parts = [];
    let lastIdx = 0;
    for (const c of current.corrections) {
      const idx = result.indexOf(c.wrong, lastIdx);
      if (idx === -1) continue;
      if (idx > lastIdx) parts.push({ text: result.slice(lastIdx, idx), err: false });
      parts.push({ text: c.wrong, err: true });
      lastIdx = idx + c.wrong.length;
    }
    if (lastIdx < result.length) parts.push({ text: result.slice(lastIdx), err: false });
    return parts.map((p, i) =>
      p.err ? (
        <span key={i} className="relative text-red-400 line-through decoration-red-500/60">{p.text}</span>
      ) : (
        <span key={i} className="text-slate-300">{p.text}</span>
      )
    );
  }

  return (
    <Motion.div
      className="w-full max-w-md rounded-2xl border border-slate-800/80 bg-bg-card overflow-hidden shadow-[0_0_60px_rgba(56,189,248,0.08)]"
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.3 }}
    >
      <div className="flex items-center gap-2 border-b border-slate-800/60 px-5 py-3">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
        </div>
        <span className="ml-2 text-xs text-slate-500 font-medium">TextifyAI Live Demo</span>
      </div>

      <div className="px-5 py-6 min-h-[200px] flex flex-col gap-5">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <svg className="h-3.5 w-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" />
            </svg>
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-600">You typed</span>
          </div>
          <div className="rounded-xl border border-slate-800/60 bg-bg-deep px-4 py-3 text-sm font-mono leading-relaxed min-h-[44px]">
            {renderWrongText()}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {(phase === "correcting" || phase === "done") && (
            <Motion.div
              key={lineIndex + "-corrected"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              <div className="mb-2 flex items-center gap-2">
                <svg className="h-3.5 w-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-[11px] font-medium uppercase tracking-wider text-emerald-500/80">Corrected</span>
              </div>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm font-mono leading-relaxed text-emerald-300">
                {current.fixed}
              </div>
            </Motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {phase === "done" && (
            <Motion.div
              className="flex flex-wrap gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {current.corrections.map((c, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-800/60 bg-bg-deep px-3 py-1 text-[11px]"
                >
                  <span className="text-red-400 line-through">{c.wrong}</span>
                  <svg className="h-3 w-3 text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                  <span className="text-emerald-400">{c.fixed}</span>
                </span>
              ))}
            </Motion.div>
          )}
        </AnimatePresence>
      </div>
    </Motion.div>
  );
}

/* Feature and process definitions. */

const features = [
  {
    title: "Next-Word Prediction",
    desc: "Get intelligent suggestions as you type. TextifyAI anticipates your next words based on context, saving time and keeping your flow uninterrupted.",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    gradient: "from-sky-500 to-cyan-400",
  },
  {
    title: "Grammar & Style Fixes",
    desc: "Instantly catch grammatical errors, awkward phrasing, and inconsistencies. Write with confidence knowing every sentence is polished.",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    gradient: "from-violet-500 to-purple-400",
  },
  {
    title: "AI Conversations",
    desc: "Ask questions, brainstorm ideas, or get explanations. Have a natural dialogue with AI that understands your domain and context.",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
    gradient: "from-pink-500 to-rose-400",
  },
];

const steps = [
  { num: "01", title: "Choose Your Role", desc: "Pick a professional persona like lawyer, doctor, or engineer." },
  { num: "02", title: "Start Writing", desc: "Type naturally while AI predicts, corrects, and enhances in real time." },
  { num: "03", title: "Review & Export", desc: "Get polished output ready to share, publish, or submit anywhere." },
];

/* Application entry component. */

function App() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-bg-deep text-white">
      {/* Floating background gradient orbs. */}
      <div
        className="pointer-events-none fixed -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-sky-500/20 blur-[120px]"
        style={{ animation: "float 8s ease-in-out infinite" }}
      />
      <div
        className="pointer-events-none fixed -bottom-32 -right-32 h-[500px] w-[500px] rounded-full bg-violet-500/20 blur-[120px]"
        style={{ animation: "float 10s ease-in-out infinite reverse" }}
      />

      {/* Main navigation header. */}
      <Motion.nav
        className="sticky top-0 z-50 border-b border-white/[0.06] bg-bg-deep/70 backdrop-blur-xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-12">
          {/* Brand identity. */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              src={logo}
              alt="TextifyAI"
              className="h-9 w-9 rounded-xl ring-1 ring-white/10 transition-shadow group-hover:shadow-[0_0_16px_rgba(56,189,248,0.25)]"
            />
            <span className="text-lg font-semibold tracking-tight">
              Textify<span className="bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent">AI</span>
            </span>
          </Link>

          {/* Supplemental navigation links. */}
          <div className="hidden items-center gap-1 rounded-full border border-white/[0.06] bg-white/[0.03] px-1.5 py-1 sm:flex">
            {[
              { label: "Features", href: "#features" },
              { label: "How It Works", href: "#how-it-works" },
              { label: "Contact", href: "#contact" },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="rounded-full px-4 py-1.5 text-[13px] font-medium text-slate-400 transition-all hover:bg-white/[0.06] hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Primary call to action. */}
          <Link
            to="/roles"
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-violet-500 px-5 py-2 text-sm font-semibold text-white shadow-[0_0_16px_rgba(56,189,248,0.25)] transition-all hover:scale-105 hover:shadow-[0_0_24px_rgba(139,92,246,0.35)] cursor-pointer"
          >
            Get Started
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </Motion.nav>


      {/* Main hero section with split layout. */}
      <header className="relative z-10 px-6 pt-16 pb-24 sm:px-12 sm:pt-20 sm:pb-32">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-16">
          <Motion.div
            className="flex flex-1 flex-col items-center text-center lg:items-start lg:text-left"
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            <Motion.span
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-700/60 bg-bg-card px-4 py-1.5 text-xs tracking-wide text-slate-400"
              variants={fadeUp}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Powered by BERT and Transformer Models
            </Motion.span>

            <Motion.h1
              className="max-w-xl text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl"
              variants={fadeUp}
            >
              Write Smarter with{" "}
              <span className="bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent">
                AI-Powered
              </span>{" "}
              Intelligence
            </Motion.h1>

            <Motion.p
              className="mt-6 max-w-lg text-lg leading-relaxed text-slate-400"
              variants={fadeUp}
            >
              Your intelligent writing companion that predicts, corrects, and
              converses tailored for lawyers, doctors, engineers, and
              anyone who writes.
            </Motion.p>

            <Motion.div className="mt-8 flex flex-wrap items-center gap-4" variants={fadeUp}>
              <Link
                to="/roles"
                className="rounded-full bg-gradient-to-r from-sky-500 to-violet-500 px-8 py-3.5 font-semibold text-white shadow-[0_0_24px_rgba(56,189,248,0.4)] transition-all hover:scale-105 hover:shadow-[0_0_32px_rgba(139,92,246,0.5)] cursor-pointer"
              >
                Get Started for Free
              </Link>
              <a
                href="#features"
                className="flex items-center gap-2 rounded-full border border-slate-700/60 px-6 py-3.5 text-sm font-medium text-slate-300 transition-all hover:border-slate-600 hover:text-white"
              >
                Learn More
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                </svg>
              </a>
            </Motion.div>
          </Motion.div>

          <div className="flex flex-1 items-center justify-center lg:justify-end">
            <DemoCard />
          </div>
        </div>
      </header>

      {/* Decorative divider line. */}
      <div className="mx-auto h-px w-2/3 bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />

      {/* Key features overview. */}
      <div id="features" className="relative z-10 px-6 py-24 sm:px-12 sm:py-32">
        <Section className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Everything You Need to{" "}
              <span className="bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent">
                Write Better
              </span>
            </h2>
            <p className="mt-4 mx-auto max-w-2xl text-slate-400">
              Three powerful AI capabilities working together to supercharge your writing workflow.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <Section key={f.title} delay={i * 0.1}>
                <div className="group relative flex h-full flex-col rounded-2xl border border-slate-800/80 bg-bg-card p-8 transition-all duration-300 hover:border-slate-700/80 hover:bg-bg-card/80">
                  <div
                    className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${f.gradient} text-white shadow-lg`}
                  >
                    {f.icon}
                  </div>
                  <h3 className="mb-3 text-lg font-bold text-white">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-400">{f.desc}</p>
                  <div className={`pointer-events-none absolute -top-px -right-px h-24 w-24 rounded-tr-2xl bg-gradient-to-bl ${f.gradient} opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-20`} />
                </div>
              </Section>
            ))}
          </div>
        </Section>
      </div>

      {/* Section divider. */}
      <div className="mx-auto h-px w-2/3 bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />

      {/* Step by step process description. */}
      <div id="how-it-works" className="relative z-10 px-6 py-24 sm:px-12 sm:py-32">
        <Section className="mx-auto max-w-4xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Get Up and Running in{" "}
              <span className="bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent">
                3 Simple Steps
              </span>
            </h2>
            <p className="mt-4 mx-auto max-w-2xl text-slate-400">
              No complex setup. Pick a role, start writing, and let AI handle the rest.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {steps.map((s, i) => (
              <Section key={s.num} delay={i * 0.12}>
                <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
                  <span className="mb-4 text-4xl font-extrabold bg-gradient-to-b from-slate-600 to-slate-800 bg-clip-text text-transparent">
                    {s.num}
                  </span>
                  <h3 className="mb-2 text-lg font-bold text-white">{s.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-400">{s.desc}</p>
                </div>
              </Section>
            ))}
          </div>
        </Section>
      </div>

      {/* Section divider. */}
      <div className="mx-auto h-px w-2/3 bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />

      {/* Final call to action section. */}
      <Section className="relative z-10 px-6 py-24 sm:px-12 sm:py-32">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-800/80 bg-bg-card p-12 text-center sm:p-16">
          <div className="pointer-events-none absolute inset-0 mx-auto h-64 w-64 rounded-full bg-violet-500/10 blur-[100px]" />
          <h2 className="relative text-3xl font-extrabold tracking-tight sm:text-4xl">
            Ready to Transform Your Writing?
          </h2>
          <p className="relative mt-4 mx-auto max-w-lg text-slate-400">
            Join professionals who write faster, cleaner, and smarter with
            TextifyAI. Pick your role and start in seconds.
          </p>
          <Link
            to="/roles"
            className="relative mt-8 inline-block rounded-full bg-gradient-to-r from-sky-500 to-violet-500 px-10 py-4 font-semibold text-white shadow-[0_0_24px_rgba(56,189,248,0.4)] transition-all hover:scale-105 hover:shadow-[0_0_32px_rgba(139,92,246,0.5)] cursor-pointer"
          >
            Get Started for Free
          </Link>
        </div>
      </Section>

      {/* Site footer component. */}
      <footer id="contact" className="relative z-10 border-t border-slate-800/60 px-6 py-10 sm:px-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <img src={logo} alt="TextifyAI" className="h-7 w-7 rounded-md" />
            <span className="text-sm font-semibold text-slate-300">TextifyAI</span>
          </div>
          <p className="text-xs text-slate-600">
            &copy; {new Date().getFullYear()} TextifyAI. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-slate-500">
            <a href="#" className="transition-colors hover:text-slate-300">Privacy</a>
            <a href="#" className="transition-colors hover:text-slate-300">Terms</a>
            <a href="#" className="transition-colors hover:text-slate-300">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
