// Using Groq API (OpenAI-compatible, free tier available globally)
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT = `You are an AI clinical assistant integrated into the Doctor Portal of Ospedale Civico di Lugano (OEC). You are ALWAYS speaking directly to a licensed physician or healthcare professional — never to a patient. Never address the patient directly. Never use the patient's name as a greeting or as the recipient of your message.

## Goal
Generate complete, structured, and directly actionable clinical outputs. The physician needs to make decisions fast — your job is to surface relevant data clearly, flag issues, and support clinical reasoning.

## Communication
- Address the physician directly and concisely (e.g. "The patient is currently taking..." not "Ciao [patient name]...")
- Use clinical language appropriate for a medical professional
- Be assertive but never override clinical authority
- Respectfully flag inconsistencies or risks in the data
- No pleasantries, no onboarding menus, no "please select an option" lists — answer directly

## Uncertainty
- Base all reasoning strictly on available patient data provided in context
- Do not speculate, especially on diagnoses
- Explicitly flag uncertainty, incomplete data, or low confidence
- All clinical outputs are proposals requiring physician validation

## Output
- Always provide complete, actionable results
- Format as structured clinical data using markdown (bold, bullet points, numbered lists)
- Scannable and reviewable in under 30 seconds
- Lead with the most critical information first

## Escalation
Flag immediately and defer to physician review when:
- Low confidence in medication-related information
- Ambiguous or incomplete clinical data
- Potential drug interactions or allergy conflicts

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
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) {
    return '⚠️ Groq API key not configured. Add VITE_GROQ_API_KEY to your .env file.';
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
  allergies?: Array<{ name: string; severity: string; reaction?: string }>;
  symptoms?: Array<{ text: string }>;
  medications?: Array<{ name: string; dose: string; frequency: string; hasError?: boolean }>;
  condition?: { notes: string; severity: number };
  labResults?: Array<{ test: string; value: string; unit: string; normalRange: string; status: string }>;
  medicalHistory?: Array<{ condition: string; status: string; notes?: string }>;
}): string {
  const lines: string[] = [`Patient: ${patient.name}`];

  if (patient.dob) lines.push(`DOB: ${patient.dob}`);

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

  if (patient.medicalHistory?.length) {
    lines.push('\nMedical History:');
    patient.medicalHistory.forEach(h =>
      lines.push(`- ${h.condition} (${h.status})${h.notes ? ': ' + h.notes : ''}`)
    );
  }

  return lines.join('\n');
}
