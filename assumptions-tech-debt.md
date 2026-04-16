# Assumptions & Tech Debt

## 2026-04-16 — Introspection: E1-S1 plan review

- **Project name mismatch in dev-status.yaml:** Line 1 reads `project: YouTube Caption Search` but all documentation (PRD, brief, architecture, epics) describes **Phaseboard**. The project name field appears stale from an earlier project. This does not block any story but should be corrected. Assumption: proceed with Phaseboard as the actual project name.

## 2026-04-16 — Introspection: E2-S2 plan review

- **React dependency gap in original plan:** The original E2-S2 plan proposed creating `use-feedback.ts` (using `useReducer`), `feedback-context.ts` (using React context APIs), and `ToastContainer.ts` (a React component placeholder), but React is not installed yet — it will be added in E3-S1. These files could not type-check or run without React. Refinement: extract pure logic (types, reducer, tests) into React-free modules deliverable now; defer all React-dependent code (hook, context, component) to E3-S1.
- **Inline validation error display scope:** The epic E2-S2 description mentions "Support inline validation error display (field-level messages)" and architecture §7.7 lists "Show inline validation errors on fields" under FeedbackService. However, this is a UI-rendering concern best handled directly by page components consuming `ValidationResult` from E2-S1, not by the toast system. Assumption: inline validation errors are out of scope for the FeedbackService toast module; they will be rendered in page components during E3–E5.
