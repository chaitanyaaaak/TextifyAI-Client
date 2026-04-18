import { motion as Motion } from "framer-motion";
import { Link } from "react-router-dom";
import roleConfig from "../config/role-config";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

/* Convert config object to array for easier mapping. */
const roles = Object.entries(roleConfig).map(([id, config]) => ({
  id,
  ...config,
}));

export default function RoleSelection() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-bg-deep">
      {/* Floating background gradient orbs. */}
      <div
        className="pointer-events-none absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-sky-500/20 blur-[120px]"
        style={{ animation: "float 8s ease-in-out infinite" }}
      />
      <div
        className="pointer-events-none absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full bg-violet-500/20 blur-[120px]"
        style={{ animation: "float 10s ease-in-out infinite reverse" }}
      />

      <div className="relative z-10 flex flex-col items-center px-6 py-16">
        {/* Back navigation link. */}
        <Motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 self-start ml-4 sm:ml-12"
        >
          <Link
            to="/"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back
          </Link>
        </Motion.div>

        {/* Page title and description. */}
        <Motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent">
            Choose Your Role
          </h1>
          <p className="mt-4 max-w-lg mx-auto text-lg text-slate-400">
            Select a tailored professional persona to optimize your TextifyAI workflow.
          </p>
        </Motion.div>

        {/* Interactive role selection grid. */}
        <Motion.div
          className="grid w-full max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {roles.map((role) => (
            <Link
              key={role.id}
              to={`/workspace/${role.id}`}
            >
              <Motion.div
                variants={fadeUp}
                className={`group relative flex flex-col items-center gap-4 rounded-2xl border ${role.borderAccent} ${role.bgAccent} bg-bg-card p-8 text-center transition-all duration-300 hover:scale-[1.03] hover:border-opacity-60 cursor-pointer h-full`}
                style={{
                  boxShadow: `0 0 0px ${role.glow}`,
                }}
                whileHover={{
                  boxShadow: `0 0 30px ${role.glow}`,
                }}
              >
                {/* Visual role avatar representation. */}
                <div
                  className={`flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${role.gradient} text-white shadow-lg`}
                >
                  <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d={role.avatarPath} />
                  </svg>
                </div>

                <h2 className="text-xl font-bold text-white">
                  Work as {role.title}
                </h2>

                <p className="text-sm text-slate-400 leading-relaxed">
                  {role.description}
                </p>

                {/* Animated call to action prompt. */}
                <div
                  className={`mt-auto pt-4 flex items-center gap-1 text-sm font-semibold bg-gradient-to-r ${role.gradient} bg-clip-text text-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                >
                  Get Started
                  <svg className="h-4 w-4 stroke-current" style={{ color: "inherit" }} fill="none" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              </Motion.div>
            </Link>
          ))}
        </Motion.div>
      </div>
    </div>
  );
}
