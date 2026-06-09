const INJECTION_KEYWORDS = [
  "ignore previous instructions",
  "system prompt",
  "reveal your instructions",
  "you are now a chat bot named",
  "dan mode",
  "output raw markdown",
];

const FINANCIAL_ADVICE_FLAGS = [
  "should i buy tsla",
  "give me financial advice",
  "predict bitcoin price",
  "is palantir a buy",
];

export const GUARDRAIL_ERROR =
  "[NEXUS_SYSTEM_NOTICE]: Input out of bounds. The Nexus Context Engine only processes queries relative to James Wei's portfolio architecture, enterprise automation pipelines, or professional background.";

export function applyNexusGuardrails(userInput: string): boolean {
  const normalized = userInput.toLowerCase();
  if (INJECTION_KEYWORDS.some((k) => normalized.includes(k))) return false;
  if (FINANCIAL_ADVICE_FLAGS.some((f) => normalized.includes(f))) return false;
  return true;
}

export const suggestedPrompts = [
  "What does James do at Tesla?",
  "Walk me through his AI projects",
  "How do I reach James for a role?",
] as const;
