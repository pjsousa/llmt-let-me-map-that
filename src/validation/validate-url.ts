import { ValidationResult } from "./types";

export function validateUrl(url: string): ValidationResult {
  const trimmed = url.trim();

  if (trimmed.length === 0) {
    return { valid: true, errors: [] };
  }

  try {
    new URL(trimmed);
  } catch {
    return {
      valid: false,
      errors: [{ field: "url", message: "Please enter a valid URL." }],
    };
  }

  return { valid: true, errors: [] };
}