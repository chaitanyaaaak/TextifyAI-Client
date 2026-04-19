# TextifyAI - Intelligent Writing Assistant

TextifyAI is a premium, AI-powered writing assistant designed to elevate your content across various professional domains. Whether you're a lawyer, doctor, engineer, or creative writer, TextifyAI provides real-time spellchecking, logical coherence analysis, and sentence predictions tailored to your specific field.

---

## 🚀 Live Deployment
Experience TextifyAI live at: **[https://textify-ai-seven.vercel.app/](https://textify-ai-seven.vercel.app/)**

---

## 🛠️ Tech Stack
- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 7](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Rendering**: [React Markdown](https://github.com/remarkjs/react-markdown) for structured AI responses.

---

## 🏗️ Folder Overview

A well-structured overview of the project's architecture:

```text
src/
├── api/             # Backend communication layer (NLP, Files, Chat)
├── assets/          # Brand assets, logos, and UI images
├── components/      # Reusable UI components
│   └── workspace/   # Specialized workspace tabs and tools (Chat, Spellcheck, etc.)
├── config/          # Application-level configurations (Role definitions)
├── pages/           # Main application view components (Landing, Roles, Workspace)
├── App.jsx          # Main application router and state entry
├── index.css        # Global styles and Tailwind directives
└── main.jsx         # Application mounting point
```

---

## ⚡ Quick Start

Get the project running locally in under a minute:

### 1. Clone the repository
```bash
git clone https://github.com/chaitanyaaaak/TextifyAI-Client.git
cd TextifyAI-Client
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment
Create a `.env` file in the root directory and set your backend API URL:
```env
VITE_API_URL=https://textifyai-api.onrender.com
```

### 4. Launch Development Server
```bash
npm run dev
```
The application will be available at `http://localhost:5173`.

---

## 📝 Key Features
- **Role-Based Intelligence**: Tailored AI assistance for various professional fields.
- **Advanced Coherence Checker**: Verify the logical flow between your thoughts.
- **Document Analyzer**: Bulk spellchecking and grammar correction for uploaded files.
- **Real-time Prediction**: Deep-learning based sentence completions as you type.
- **Premium UI/UX**: Dark-mode primary interface with glassmorphism and smooth animations.

---

## ✅ Deployment
The client is optimized for deployment on platforms like **Vercel** or **Netlify**. Ensure that the `VITE_API_URL` environment variable is correctly configured in your deployment settings to point to the active backend service.
