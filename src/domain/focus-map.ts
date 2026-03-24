import type { FunnelType } from "./contracts";

export type FocusArea = {
  label: string;
  stepIds: string[];
  keywords: string[];
};

export const focusCatalog: Record<FunnelType, FocusArea[]> = {
  checkout: [
    { label: "payment reliability", stepIds: ["checkout-payment"], keywords: ["payment", "pay", "billing", "card"] },
    { label: "validation clarity", stepIds: ["checkout-validation"], keywords: ["validation", "address", "zip", "error"] },
    { label: "policy and legal links", stepIds: ["checkout-policy"], keywords: ["policy", "legal", "terms", "link"] },
  ],
  login: [
    { label: "session creation", stepIds: ["login-submit"], keywords: ["login", "session", "auth", "signin"] },
    { label: "password recovery", stepIds: ["login-reset"], keywords: ["reset", "recovery", "forgot", "password"] },
  ],
  form: [
    { label: "submission success feedback", stepIds: ["form-submit"], keywords: ["toast", "success", "feedback", "submit"] },
    { label: "form validation", stepIds: ["form-entry", "form-submit"], keywords: ["validation", "required", "error", "field"] },
  ],
};

export function normalizePriorityNote(value: string): string {
  return value.trim().toLowerCase();
}

export function collectFocusAreas(funnel: FunnelType, priorityNote: string): FocusArea[] {
  const normalized = normalizePriorityNote(priorityNote);
  if (!normalized) {
    return [];
  }

  return focusCatalog[funnel].filter((focus) => focus.keywords.some((keyword) => normalized.includes(keyword)));
}
