import { ValidationResult } from "./types";

export function validatePromptText(text: string): ValidationResult {
  const trimmed = text.trim();

  if (trimmed.length === 0) {
    return {
      valid: false,
      errors: [{ field: "promptText", message: "Prompt text is required." }],
    };
  }

  return { valid: true, errors: [] };
}