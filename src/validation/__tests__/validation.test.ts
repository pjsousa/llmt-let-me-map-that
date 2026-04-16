import { describe, it, expect } from "vitest";
import {
  validateProjectName,
  validateUrl,
  validatePromptText,
} from "../index";

describe("validateProjectName", () => {
  it("rejects empty string", () => {
    const result = validateProjectName("");
    expect(result.valid).toBe(false);
    expect(result.errors).toEqual([
      { field: "name", message: "Project name is required." },
    ]);
  });

  it("rejects whitespace-only string", () => {
    const result = validateProjectName("   ");
    expect(result.valid).toBe(false);
    expect(result.errors[0].message).toBe("Project name is required.");
  });

  it("accepts a valid project name", () => {
    const result = validateProjectName("My Project");
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("accepts a single character name", () => {
    const result = validateProjectName("A");
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("accepts a name with leading/trailing whitespace after trim", () => {
    const result = validateProjectName("  Valid Name  ");
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });
});

describe("validateUrl", () => {
  it("accepts empty string as valid (optional field)", () => {
    const result = validateUrl("");
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("accepts whitespace-only string as valid (optional field)", () => {
    const result = validateUrl("   ");
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("accepts a valid https URL", () => {
    const result = validateUrl("https://example.com");
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("accepts a valid http URL", () => {
    const result = validateUrl("http://example.com/path?q=1");
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("rejects a malformed URL", () => {
    const result = validateUrl("not-a-url");
    expect(result.valid).toBe(false);
    expect(result.errors).toEqual([
      { field: "url", message: "Please enter a valid URL." },
    ]);
  });

  it("rejects a URL missing protocol", () => {
    const result = validateUrl("example.com");
    expect(result.valid).toBe(false);
    expect(result.errors[0].message).toBe("Please enter a valid URL.");
  });

  it("accepts a valid URL with whitespace around it after trim", () => {
    const result = validateUrl("  https://example.com  ");
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("rejects just a protocol with no host", () => {
    const result = validateUrl("https://");
    expect(result.valid).toBe(false);
  });
});

describe("validatePromptText", () => {
  it("rejects empty string", () => {
    const result = validatePromptText("");
    expect(result.valid).toBe(false);
    expect(result.errors).toEqual([
      { field: "promptText", message: "Prompt text is required." },
    ]);
  });

  it("rejects whitespace-only string", () => {
    const result = validatePromptText("   ");
    expect(result.valid).toBe(false);
    expect(result.errors[0].message).toBe("Prompt text is required.");
  });

  it("accepts a valid prompt text", () => {
    const result = validatePromptText("What is the best approach?");
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("accepts a single character", () => {
    const result = validatePromptText("A");
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("accepts text with leading/trailing whitespace after trim", () => {
    const result = validatePromptText("  Valid prompt  ");
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });
});