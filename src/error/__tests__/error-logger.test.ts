import { describe, it, expect, vi, beforeEach } from "vitest";
import { logError } from "../error-logger";

describe("logError", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("logs message with error object", () => {
    const error = new Error("test error");
    logError("Something failed", error);
    expect(console.error).toHaveBeenCalledWith(
      "[Phaseboard]",
      "Something failed",
      error,
    );
  });

  it("logs message without error", () => {
    logError("Something failed");
    expect(console.error).toHaveBeenCalledWith(
      "[Phaseboard]",
      "Something failed",
    );
  });

  it("logs message with string error", () => {
    logError("Something failed", "string error");
    expect(console.error).toHaveBeenCalledWith(
      "[Phaseboard]",
      "Something failed",
      "string error",
    );
  });
});
