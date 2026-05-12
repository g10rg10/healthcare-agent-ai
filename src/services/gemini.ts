// Using Groq API (OpenAI-compatible, free tier available globally)
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT = `You are an AI clinical assistant integrated into the Doctor Portal of Ospedale Civico di Lugano (OEC). You are ALWAYS speaking directly to a licensed physician — never to a patient.

## Critical rules
- Answer ONLY what was asked. If the physician asks one specific question, give one specific answer — do not dump a full patient summary.
- Address the physician directly: "The patient's DOB is..." and never address the patient by name.
- Use clinical language. Be concise and assertive.
- If the physician sends a greeting (e.g. "ciao", "hello"), respond briefly and offer to help — do not lecture them about it.
- No menus, no unsolicited summaries.

## When to include extra context
Only add unrequested information if it is immediately clinically relevant to the question (e.g. a drug interaction directly related to a medication question). Otherwise: answer only what was asked.

## Uncertainty
- Base reasoning strictly on patient data in context.
- Flag missing data only if it directly affects the answer.
- All outputs are proposals requiring physician validation.

## Format
- Short questions → short direct answers (1-3 lines max).
- Complex requests → use **bold** for section labels, bullet points (- item) for lists, numbered lists for sequences.
- Never use # or ## or ### headers — use **Bold label:** instead.
- Lead with the most critical information.

## Escalation
Flag immediately when:
- Potential drug interactions or allergy conflicts
- Ambiguous or incomplete data that could affect a clinical decision

## Scheduling appointments
When the physician asks to add, schedule, or book an appointment, you MUST:
1. Briefly confirm what you're scheduling (1 sentence).
2. Append at the very end of your response, on its own line, a machine-readable tag in this exact format (no spaces inside the braces):
APPT:{"date":"YYYY-MM-DD","time":"HH:MM","notes":"Professional clinical description of the visit purpose"}
Use ISO date format (YYYY-MM-DD). Infer date from context (e.g. "tomorrow" → next day, "Tuesday" → next Tuesday). Default duration is 30 minutes. Room default: "Room 108, OEC Lugano".
For the "notes" field: always write a professional clinical description IN ENGLISH (e.g. "Cardiology follow-up visit", "Blood test control — HbA1c and lipid panel", "Routine check-up and medication review") — never use raw keywords like "esami" or single words, and never write in Italian.

## What you CANNOT do
You cannot modify medication lists, lab results, diagnoses, or any patient clinical data. Only appointment scheduling is supported via the APPT tag.

Always respond in the same language as the physician's message.`;

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function sendMessage(
  userMessage: string,
  history: ChatMessage[],
  patientContext?: string
): Promise<string> {
  const rawKey = import.meta.env.VITE_GROQ_API_KEY || localStorage.getItem('groq_api_key') || '';
  const apiKey = rawKey.startsWith('gsk_') ? rawKey : '';
  if (!apiKey) {
    return '⚠️ Groq API key non configurata. Clicca l\'ingranaggio ⚙️ nella home per inserire la chiave API.';
  }

  const systemContent = patientContext
    ? `${SYSTEM_PROMPT}\n\n## Current Patient Context\n${patientContext}`
    : SYSTEM_PROMPT;

  const messages = [
    { role: 'system', content: systemContent },
    ...history.map(msg => ({ role: msg.role, content: msg.content })),
    { role: 'user', content: userMessage }
  ];

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      temperature: 0.3,
      max_tokens: 1024
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    console.error('Groq API error:', error);
    const message = error?.error?.message ?? `HTTP ${response.status}`;
    throw new Error(message);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? 'No response from AI.';
}

export function buildPatientContext(patient: {
  name: string;
  dob?: string;
  sex?: string;
  avs?: string;
  nationality?: string;
  phone?: string;
  email?: string;
  address?: string;
  emergencyContact?: string;
  insurance?: string;
  allergies?: Array<{ name: string; severity: string; reaction?: string }>;
  symptoms?: Array<{ text: string }>;
  medications?: Array<{ name: string; dose: string; frequency: string; hasError?: boolean }>;
  condition?: { notes: string; severity: number };
  labResults?: Array<{ test: string; value: string; unit: string; normalRange: string; status: string }>;
  medicalHistory?: Array<{ condition: string; status: string; notes?: string }>;
  timeline?: Array<{ date: string; type: string; title: string; description: string; provider?: string }>;
  careTeam?: Array<{ name: string; role: string; phone?: string }>;
}): string {
  const lines: string[] = [`Patient: ${patient.name}`];

  if (patient.dob) lines.push(`DOB: ${patient.dob}`);
  if (patient.sex) lines.push(`Sex: ${patient.sex}`);
  if (patient.avs) lines.push(`AVS Number: ${patient.avs}`);
  if (patient.nationality) lines.push(`Nationality: ${patient.nationality}`);
  if (patient.phone) lines.push(`Phone: ${patient.phone}`);
  if (patient.email) lines.push(`Email: ${patient.email}`);
  if (patient.address) lines.push(`Address: ${patient.address}`);
  if (patient.emergencyContact) lines.push(`Emergency Contact: ${patient.emergencyContact}`);
  if (patient.insurance) lines.push(`Insurance: ${patient.insurance}`);

  if (patient.allergies?.length) {
    lines.push('\nAllergies:');
    patient.allergies.forEach(a =>
      lines.push(`- ${a.name} (${a.severity})${a.reaction ? ': ' + a.reaction : ''}`)
    );
  }

  if (patient.medications?.length) {
    lines.push('\nCurrent Medications:');
    patient.medications.forEach(m =>
      lines.push(`- ${m.name} ${m.dose} ${m.frequency}${m.hasError ? ' [⚠️ NEEDS VERIFICATION]' : ''}`)
    );
  }

  if (patient.symptoms?.length) {
    lines.push('\nSymptoms:');
    patient.symptoms.forEach(s => lines.push(`- ${s.text}`));
  }

  if (patient.condition?.notes) {
    lines.push(`\nClinical Notes: ${patient.condition.notes}`);
    lines.push(`Severity: ${patient.condition.severity}/10`);
  }

  if (patient.labResults?.length) {
    lines.push('\nLab Results:');
    patient.labResults.forEach(l =>
      lines.push(`- ${l.test}: ${l.value} ${l.unit} (normal: ${l.normalRange}) [${l.status.toUpperCase()}]`)
    );
  }

  if (patient.timeline?.length) {
    lines.push('\nClinical Timeline:');
    patient.timeline.forEach(t =>
      lines.push(`- ${t.date} [${t.type}] ${t.title}: ${t.description}${t.provider ? ' (' + t.provider + ')' : ''}`)
    );
  }

  if (patient.careTeam?.length) {
    lines.push('\nCare Team:');
    patient.careTeam.forEach(c =>
      lines.push(`- ${c.name} (${c.role})${c.phone ? ' — ' + c.phone : ''}`)
    );
  }

  if (patient.medicalHistory?.length) {
    lines.push('\nMedical History:');
    patient.medicalHistory.forEach(h =>
      lines.push(`- ${h.condition} (${h.status})${h.notes ? ': ' + h.notes : ''}`)
    );
  }

  return lines.join('\n');
}
