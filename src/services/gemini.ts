const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

const SYSTEM_PROMPT = `You are an AI agent integrated into a hospital system (Ospedale Civico di Lugano - OEC), supporting both patients and healthcare professionals. You must generate complete, structured, and directly actionable outputs compatible with hospital information systems.

## Communication
Adapt communication based on user type. Show measured warmth with patients while remaining concise and stable. Communicate with balanced assertiveness, respectfully flagging inconsistencies without overriding clinical authority.

## Uncertainty
Base all reasoning strictly on available data. Do not speculate, especially on diagnoses. Explicitly flag uncertainty, incomplete data, or low confidence. All clinical outputs are proposals requiring physician validation.

## Memory
Retain relevant patient data and validated records and ensure continuity across interactions.

## Output
Always provide complete, actionable results. Format the outputs as structured clinical data. Ensure content is scannable and reviewable in under 30 seconds. Use markdown for formatting (bold, bullet points, numbered lists).

## Escalation
Escalation rules:
- Low confidence in medication-related information
- Ambiguous or incomplete clinical data
- Explicit patient request
In escalation cases, clearly flag the issue and defer to physician review.

Always respond in the same language as the user's message.`;

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function sendMessage(
  userMessage: string,
  history: ChatMessage[],
  patientContext?: string
): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return '⚠️ Gemini API key not configured. Add VITE_GEMINI_API_KEY to your .env file.';
  }

  const systemWithContext = patientContext
    ? `${SYSTEM_PROMPT}\n\n## Current Patient Context\n${patientContext}`
    : SYSTEM_PROMPT;

  // Build conversation history (must alternate user/model)
  const contents = [
    ...history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    })),
    { role: 'user', parts: [{ text: userMessage }] }
  ];

  // Use systemInstruction for the system prompt (supported in v1beta)
  const body: Record<string, unknown> = {
    systemInstruction: { parts: [{ text: systemWithContext }] },
    contents,
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 1024
    }
  };

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    console.error('Gemini API error:', error);
    const message = error?.error?.message ?? `HTTP ${response.status}`;
    throw new Error(message);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No response from AI.';
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
