# CLAUDE.md — healthcare-group-5

## Project
Swiss Health Portal — university group project (Group 5).
Doctor portal for Ospedale Civico di Lugano (OEC).
React + TypeScript + Vite frontend. No backend.

## Repo
- Local folder: `/Users/giorgio/Desktop/REPOS/healthcare-group-5` ← always work from here
- GitHub: `https://github.com/g10rg10/healthcare-agent-ai` (rename pending to `healthcare-group-5`)
- Branch: `main`
- Push directly from this folder — it IS the git repo (no separate clone needed)

## Stack
- React + TypeScript + Vite
- Tailwind CSS
- lucide-react icons
- Groq API (OpenAI-compatible) — model: `llama-3.3-70b-versatile`
- API key in `.env` as `VITE_GROQ_API_KEY` (gitignored) + localStorage fallback

## Key files
- `src/app/components/DoctorDashboard.tsx` — main doctor portal UI (large file ~3000+ lines)
- `src/app/components/PatientDashboard.tsx` — patient portal UI
- `src/app/components/UseCaseSelector.tsx` — home screen / role selector
- `src/app/components/ApiKeySettings.tsx` — gear icon modal for API key
- `src/services/gemini.ts` — Groq API client + system prompt + `buildPatientContext()`
- `.env` — contains real Groq API key (never commit)

## Language
**All UI text must be in English.** No Italian strings in components or services.

## Conventions
- No comments unless strictly necessary
- No new files unless required
- Prefer editing existing files
- Push after every session: `git add <files> && git commit -m "..." && git push origin main`
- Commit messages: conventional commits style (`feat:`, `fix:`, `chore:`, `refactor:`)

## AI / Groq
- System prompt is in `src/services/gemini.ts` — always addresses a licensed physician, never the patient
- AI is **read-only** except for appointment scheduling via `APPT:{...}` tag
- When AI responds with `APPT:{"date":"...","time":"...","notes":"..."}`, the frontend parses it, strips it from the displayed message, and shows an inline confirmation card in the chat
- Appointment notes must always be in English, professional clinical descriptions

## Dev server
- `npm run dev` — starts on `http://localhost:5173` (falls back to 5174, 5175... if port in use)
- HMR active — hard reload (`window.location.reload()`) needed for env var changes

## Landing page
- `src/app/components/StoryPage.tsx` — scrollytelling landing (shown first on `/`)
- Content from "REFINED Presentation 2.pdf" — Group 5 real data
- Colors: indigo `#3D35E8`, cyan `#3ECFCF`, deep `#12107A`
- "Try the live demo" / "Open the portal" → calls `onEnterApp()` → shows `UseCaseSelector`
