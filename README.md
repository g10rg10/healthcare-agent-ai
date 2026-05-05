# Healthcare Agent AI — Swiss Health Portal

AI-powered medical document platform for patients and healthcare professionals at **Ospedale Civico di Lugano (OEC)**.

## Features

- **Patient Portal** — Upload medical documents (drag & drop / camera), AI-assisted file renaming, appointment view
- **Doctor Portal** — Patient records, medication management, AI chat assistant powered by Gemini

## Tech Stack

React 18 · TypeScript · Vite · Tailwind CSS v4 · shadcn/ui · Google Gemini 2.0 Flash

## Getting Started

### 1. Install dependencies

```bash
npm install
# or
pnpm install
```

### 2. Set up API key

Get a **free** Gemini API key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey) (no credit card, no credit card needed).

```bash
cp .env.example .env
# edit .env and paste your key
```

### 3. Run

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Project Structure

```
src/
├── app/
│   └── components/
│       ├── UseCaseSelector.tsx   ← Landing page (Patient / Doctor choice)
│       ├── PatientDashboard.tsx  ← Patient portal
│       └── DoctorDashboard.tsx   ← Doctor portal with AI chat
├── services/
│   └── gemini.ts                 ← Google Gemini API + system prompt
└── styles/
```

## AI System Prompt

The AI agent is configured to:
- Adapt communication per user type (warmth for patients, clinical precision for doctors)
- Never speculate on diagnoses — flag uncertainty explicitly
- Require physician validation for all clinical outputs
- Escalate when confidence is low or data is ambiguous

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_GEMINI_API_KEY` | Free at [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |

## Original Figma design

[https://www.figma.com/design/X7hcjWY5Fc0XCzmOrXQNdk/Group-5](https://www.figma.com/design/X7hcjWY5Fc0XCzmOrXQNdk/Group-5)
