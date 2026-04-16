export function logError(message: string, error?: unknown): void {
  if (error !== undefined) {
    console.error("[Phaseboard]", message, error);
  } else {
    console.error("[Phaseboard]", message);
  }
}
