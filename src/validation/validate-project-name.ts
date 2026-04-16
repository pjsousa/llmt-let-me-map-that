import { ValidationResult } from "./types";

export function validateProjectName(name: string): ValidationResult {
  const trimmed = name.trim();

  if (trimmed.length === 0) {
    return {
      valid: false,
      errors: [{ field: "name", message: "Project name is required." }],
    };
  }

  return { valid: true, errors: [] };
}