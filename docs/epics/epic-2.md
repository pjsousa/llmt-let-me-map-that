### Epic E2: Validation & Feedback Services

- **Objective:** Provide reusable validation and user feedback utilities consumed by all UI modules.
- **Included scope:** ValidationService pure functions (project name, URL fields, prompt text), structured validation result type, FeedbackService (success toast, error toast, inline validation errors, auto-dismiss).
- **Excluded scope:** Wiring into specific pages (done in later epics).
- **Dependencies:** None â€” can be built in parallel with E1.
- **Main risks:** Low. Pure functions and simple UI component.
- **Done definition:** Validation functions unit-tested for valid/invalid cases. Toast component renders and auto-dismisses.

#### Story E2-S1: Implement ValidationService

- **Goal:** Provide reusable input validation for all UI modules.
- **Description:** Implement pure validation functions: `validateProjectName(name)` â€” non-empty after trim; `validateUrl(url)` â€” uses URL constructor, returns specific error for malformed URLs, allows empty (optional fields); `validatePromptText(text)` â€” non-empty for required fields. All return `{ valid: boolean, errors: { field: string, message: string }[] }`.
- **Relevant architecture area:** ValidationService (Â§7.6).
- **Dependencies:** None.
- **Acceptance criteria:**
  - `validateProjectName("")` returns invalid with â€œProject name is required.â€
  - `validateProjectName("  ")` returns invalid (whitespace-only).
  - `validateUrl("not-a-url")` returns invalid with specific message.
  - `validateUrl("https://example.com")` returns valid.
  - `validateUrl("")` returns valid (optional field).
  - `validatePromptText("")` returns invalid.
  - Unit tests cover all edge cases.

#### Story E2-S2: Implement FeedbackService (Toast System)

- **Goal:** Provide consistent save feedback across all UI interactions.
- **Description:** Build a toast/notification component and service. Support success toasts (auto-dismiss ~3 s) and error toasts (persist until dismissed). Support inline validation error display (field-level messages). Expose a simple API: `showSuccess(message)`, `showError(message)`. Manage a toast queue so multiple notifications stack.
- **Relevant architecture area:** FeedbackService (Â§7.7).
- **Dependencies:** None.
- **Acceptance criteria:**
  - Success toast appears, displays message, auto-dismisses after ~3 seconds.
  - Error toast appears, displays message, persists until user dismisses.
  - Multiple toasts stack without overlapping.
  - Toast component is reusable from any page/module.


