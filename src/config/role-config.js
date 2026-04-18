const roleConfig = {
  lawyer: {
    title: "Lawyer",
    description: "Draft legal documents, contracts, and case summaries with AI precision.",
    gradient: "from-amber-500 to-orange-500",
    glow: "rgba(245,158,11,0.3)",
    bgAccent: "bg-amber-500/10",
    borderAccent: "border-amber-500/30",
    textAccent: "text-amber-400",
    placeholder: "Draft a contract clause or legal brief...",
    greeting: "Ready to assist with your legal documents. What would you like to draft today?",
    avatarPath:
      "M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z",
    mockResponses: [
      "I've drafted a preliminary clause based on standard legal conventions. Would you like me to refine the language or add specific conditions?",
      "Here's a summary of the key legal points. Shall I expand on any particular section?",
      "The contract language has been structured to protect both parties. Let me know if you'd like to adjust the liability terms.",
    ],
  },
  doctor: {
    title: "Doctor",
    description: "Generate medical reports, patient notes, and clinical documentation effortlessly.",
    gradient: "from-emerald-500 to-teal-500",
    glow: "rgba(16,185,129,0.3)",
    bgAccent: "bg-emerald-500/10",
    borderAccent: "border-emerald-500/30",
    textAccent: "text-emerald-400",
    placeholder: "Write a patient note or clinical report...",
    greeting: "Ready to help with your clinical documentation. What do you need to write?",
    avatarPath:
      "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z",
    mockResponses: [
      "I've formatted the clinical notes following standard SOAP format. Would you like me to adjust the assessment section?",
      "The patient summary has been structured clearly. Shall I add differential diagnoses or treatment recommendations?",
      "Documentation is ready. Let me know if you need to include lab results or imaging findings.",
    ],
  },
  engineer: {
    title: "Engineer",
    description: "Write technical specs, code documentation, and project proposals with ease.",
    gradient: "from-sky-500 to-blue-500",
    glow: "rgba(14,165,233,0.3)",
    bgAccent: "bg-sky-500/10",
    borderAccent: "border-sky-500/30",
    textAccent: "text-sky-400",
    placeholder: "Write a technical spec or documentation...",
    greeting: "Let's build something great. What technical document do you need help with?",
    avatarPath:
      "M11.42 15.17l-5.96-5.96a2.12 2.12 0 010-3L9.93 1.74a2.12 2.12 0 013 0l5.96 5.96a2.12 2.12 0 010 3l-4.47 4.47a2.12 2.12 0 01-3 0z M20.71 7.04a.996.996 0 000-1.41l-2.34-2.34a.996.996 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z",
    mockResponses: [
      "I've outlined the technical architecture. Want me to add sequence diagrams or API endpoint details?",
      "The spec is structured with clear requirements and acceptance criteria. Shall I elaborate on edge cases?",
      "Documentation is ready for review. Let me know if you'd like to add code examples or performance benchmarks.",
    ],
  },
  faculty: {
    title: "Faculty",
    description: "Create lesson plans, research papers, and academic content seamlessly.",
    gradient: "from-violet-500 to-purple-500",
    glow: "rgba(139,92,246,0.3)",
    bgAccent: "bg-violet-500/10",
    borderAccent: "border-violet-500/30",
    textAccent: "text-violet-400",
    placeholder: "Create a lesson plan or research outline...",
    greeting: "Let's create excellent academic content. What would you like to work on?",
    avatarPath:
      "M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5",
    mockResponses: [
      "I've structured the lesson plan with clear learning objectives. Would you like me to add assessment rubrics?",
      "The research outline follows standard academic conventions. Shall I expand the literature review section?",
      "Content is organized by topic progression. Let me know if you want to add discussion questions or activities.",
    ],
  },
  writer: {
    title: "Writer",
    description: "Craft compelling stories, articles, and creative content with AI assistance.",
    gradient: "from-rose-500 to-pink-500",
    glow: "rgba(244,63,94,0.3)",
    bgAccent: "bg-rose-500/10",
    borderAccent: "border-rose-500/30",
    textAccent: "text-rose-400",
    placeholder: "Start writing your story or article...",
    greeting: "Your creative workspace is ready. What story shall we tell today?",
    avatarPath:
      "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125",
    mockResponses: [
      "That's a compelling opening! I can help develop the narrative arc. Want me to suggest a plot progression?",
      "Great creative direction. Shall I help flesh out the character development or dialogue?",
      "The tone is well-established. Let me know if you'd like me to draft the next paragraph or suggest alternatives.",
    ],
  },
  student: {
    title: "Student",
    description: "Summarize notes, generate essays, and prepare study materials in seconds.",
    gradient: "from-cyan-500 to-sky-500",
    glow: "rgba(6,182,212,0.3)",
    bgAccent: "bg-cyan-500/10",
    borderAccent: "border-cyan-500/30",
    textAccent: "text-cyan-400",
    placeholder: "Ask a question or start writing your essay...",
    greeting: "Let's ace your assignments! What are you working on?",
    avatarPath:
      "M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25",
    mockResponses: [
      "Here's a clear summary of the key concepts. Would you like me to create flashcards or practice questions?",
      "I've outlined the essay structure with a thesis and supporting arguments. Want me to expand any section?",
      "The study guide covers all major topics. Let me know if you need more detail on specific areas.",
    ],
  },
};

export default roleConfig;
