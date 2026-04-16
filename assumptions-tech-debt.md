# Assumptions & Tech Debt

## 2026-04-16 — Introspection: E1-S1 plan review

- **Project name mismatch in dev-status.yaml:** Line 1 reads `project: YouTube Caption Search` but all documentation (PRD, brief, architecture, epics) describes **Phaseboard**. The project name field appears stale from an earlier project. This does not block any story but should be corrected. Assumption: proceed with Phaseboard as the actual project name.

## 2026-04-16 — Introspection: E2-S2 plan review

- **React dependency gap in original plan:** The original E2-S2 plan proposed creating `use-feedback.ts` (using `useReducer`), `feedback-context.ts` (using React context APIs), and `ToastContainer.ts` (a React component placeholder), but React is not installed yet — it will be added in E3-S1. These files could not type-check or run without React. Refinement: extract pure logic (types, reducer, tests) into React-free modules deliverable now; defer all React-dependent code (hook, context, component) to E3-S1.
- **Inline validation error display scope:** The epic E2-S2 description mentions "Support inline validation error display (field-level messages)" and architecture §7.7 lists "Show inline validation errors on fields" under FeedbackService. However, this is a UI-rendering concern best handled directly by page components consuming `ValidationResult` from E2-S1, not by the toast system. Assumption: inline validation errors are out of scope for the FeedbackService toast module; they will be rendered in page components during E3–E5.

## 2026-04-16 — E3-S2 plan

- **BrowserRouter vs HashRouter:** E3-S2 uses BrowserRouter for clean URL paths (/project/:id). This works natively on Vercel and Netlify with SPA fallback. If the app is deployed to GitHub Pages, a _redirects or custom 404.html fallback will be needed to serve index.html for all routes. This is acceptable tech debt for MVP; if GitHub Pages becomes the deployment target, the router can be switched to HashRouter or a fallback page can be added.

## 2026-04-16 — Introspection: E4-S1 plan refinement

- **Contradictory error handling in original plan:** The original plan had three conflicting steps: (3) set `notFound` state on missing/invalid ID and on getProject failure, (6) render a not-found state page with a "Back to projects" link, and (11) redirect to `/` with an error toast. The acceptance criteria requires "Invalid project ID redirects to list with error message," which is best satisfied by redirecting, not showing a not-found page. Refinement: removed `notFound` state variable, removed not-found UI step, and consolidated error handling into the useEffect with `navigate('/', { replace: true })` for both missing ID and getProject failure. Using `replace: true` prevents the back button from returning to an invalid URL.
- **RESEARCH_SPACE_URL placement:** The original plan was ambiguous about placing the constant at "module top or in a shared constants file." Refinement: specified `src/constants.ts` as the location for maintainability and reusability across future stories that may reference the research Space URL.

## 2026-04-16 — Introspection: E6-S1 plan review

- **Optional fields validated as required on edit:** Both `originalPrompt` and `phase2Prompt` are marked "Optional" in the data model (architecture §8), but their inline-edit flows use `validatePromptText` which rejects empty/whitespace-only input. This means the user can leave these fields empty in their initial state (the empty-state message is shown) but cannot clear them once they've been set — the user can only replace the text, not remove it. This is consistent across E4-S3 (original prompt) and E6-S1 (Phase 2 prompt). If the ability to clear optional prompt fields is desired in the future, a `validateOptionalPromptText` function (passing empty strings as valid) or a conditional check before validation would be needed. Recording as tech debt; current behavior is a reasonable design choice for MVP.

## 2026-04-16 — Introspection: E7-S1 plan

- **Missing Phase 2 section JSX (resolved):** The E7-S1 plan originally listed adding the missing Phase 2 section JSX as a prerequisite. Upon introspection, this JSX is already present in project-detail-page.tsx (lines 818-870), fully implemented with display/edit/empty-state modes. Removed the stale prerequisite from the E7-S1 plan.
- **Progressive disclosure 'Expand' vs 'Edit' semantics (refined during introspection):** For collapsed filled sections, an "Expand" button expands the section to show full content without entering edit mode — the user can review their saved data before deciding to edit. The expanded view includes the existing "Edit" button for entering edit mode. For collapsed unfilled sections, an "Edit" (or "Add") button both expands the section and enters edit/add mode, since there is no content to view. Exception: the name section uses an "Edit" button that expands AND enters edit mode even when filled, since the name is short and always visible in the collapsed heading. The Phase 1 empty state uses an "Add" button that expands AND calls handleStartAddPrompt, since the action is to add a new prompt block rather than view existing ones.
- **Research Space section excluded from progressive disclosure:** The Research Space section (read-only, always-filled constant) is intentionally excluded from collapse/expand logic and remains always visible, since it has no edit affordance and its content is a single link.
- **Default expanded section when all sections are filled:** When every section has data, the plan defaults to expanding 'phase2' as the last section, giving the user a complete view of the bottom of the page. This is a reasonable fallback since 'phase2' is the final section in the top-to-bottom order.

## 2026-04-16 — Introspection: E7-S3 plan review

- **Missing React testing infrastructure for ErrorBoundary tests:** The original plan called for unit-testing the ErrorBoundary React component in `src/error/__tests__/error-boundary.test.tsx`, but the project has no DOM-based testing infrastructure — all prior tests (data layer, validation, reducer) are pure-function tests running in Node.js without a DOM. Testing a React class component that uses `componentDidCatch` and `render()` requires `@testing-library/react` (for `render` and `screen`), `jsdom` (for a DOM environment in Vitest), and `@testing-library/jest-dom` (for DOM assertions like `toBeInTheDocument()`). Refinement: added a step to install these dev dependencies and a step to configure the jsdom environment via `// @vitest-environment jsdom` docblock pragma in the test file, so existing Node.js tests remain unaffected.
- **Plan step ordering for logError creation vs. usage:** The original plan listed "Add console.error logging to all repository error paths" before "Create src/error/error-logger.ts", which would be impossible since the logError function wouldn't exist yet. Refinement: reordered so that error-logger.ts creation comes before repository logging integration.

## 2026-04-16 — Introspection: E7-S4 plan refinement

- **Stale steps 1 and 2 (already implemented):** The original E7-S4 plan included two steps for App.tsx (add overflow-x-hidden, responsive padding) and toast-container.tsx (add left-4 sm:left-auto, max-w constraint). Both files already have these responsive styles — App.tsx has `overflow-x-hidden`, `px-4 sm:px-6` on header and main, and toast-container.tsx has `left-4 sm:left-auto` and `max-w-[calc(100vw-2rem)]`. These were likely added during E3-S1 scaffolding or E7-S1 progressive disclosure. Refinement: removed the two stale steps and replaced with a note that those files already have the needed responsive styles.
- **Phase 1 collapsed view itemsError edge case (pre-existing, out of scope):** In the collapsed Phase 1 section of project-detail-page.tsx, when `itemsLoading` is false, `itemsError` is true, and `items.length === 0`, the code shows "No prompt blocks yet." with an "Add" button instead of an error indicator. This is a minor UX issue from E7-S1 but not a mobile responsiveness concern — recording here as future tech debt rather than fixing in E7-S4.

## 2026-04-16 — E7-S5 Final QA Results

### Automated Checks — PASS
- `npm run typecheck`: PASS (no type errors)
- `npm test`: PASS (41/41 tests passing)
- `npm run build`: PASS (production build succeeds)

### Sequence Integrity — PASS (verified via unit tests)
- Empty project: first item gets sequenceNumber 1 ✓
- Consecutive adds: sequence numbers 1, 2, 3 ✓
- Delete gap: deleted sequence number is never reused ✓
- Delete middle add: new items get correct numbers, deleted item retains original number ✓
- All deleted then add: sequence continues from max deleted number + 1 ✓
- Cross-project isolation: sequence numbers independent per project ✓
- getPhase1Items excludes soft-deleted and sorts ascending ✓
- Reload/reopen: items and sequence numbers persist after database close and reopen ✓
- Update immutability: sequenceNumber and projectId cannot be changed via update ✓

### Code Review Findings — PASS
- Project creation flow: validates empty names, creates project in IndexedDB, fires success toast, navigates to detail page. No blocking issues.
- Save operations: all paths validate input, call repository, show success/error toasts, update local state. No blocking issues.
- Progressive disclosure: effectiveExpandedSection correctly prioritizes editing states > manual expansion > first unfilled section. No blocking issues.
- Error handling: all repository methods catch errors and return typed Result errors. Invalid project ID redirects to list. Error boundary catches uncaught exceptions. No blocking issues.
- Mobile responsiveness: responsive classes applied (w-full, flex-wrap, break-all, overflow-x-hidden, etc.). No blocking issues.
- Form validation: validateProjectName rejects empty/whitespace; validateUrl rejects malformed URLs and allows empty; validatePromptText rejects empty/whitespace. No blocking issues.
- Toast system: addSuccess/addError/dismiss all work correctly. Auto-dismiss at 3 seconds. Minor note: toast timers reset for existing toasts when a new toast is added (cosmetic, not blocking).

### Known Non-Blocking Issues (previously documented)
- Optional prompt fields (originalPrompt, phase2Prompt) cannot be cleared once set — by design for MVP, documented in E6-S1 assumptions.
- Collapsed Phase 1 with itemsError and empty items shows "No prompt blocks yet" instead of error message — minor UX, documented in E7-S4 assumptions.
- Toast auto-dismiss timers reset for existing toasts when new toasts are added — cosmetic, each toast eventually dismisses.

### Manual Browser Verification Needed (cannot be automated)
The following success metric scenarios require manual browser testing:
- Project creation success rate ≥95% (visual confirmation of UI flow)
- Resume speed <10 seconds (timing measurement)
- Capture speed <20 seconds (timing measurement)
- Progressive disclosure visual behavior (visual confirmation)
- Mobile responsiveness at 375px viewport (visual confirmation)
- Core workflow completion without confusion (subjective UX assessment)

### Conclusion
All automated checks pass. Code review finds no blocking defects. Sequence integrity is verified at unit-test level with 100% coverage of the specified scenarios. The remaining verification steps are manual browser tests that require human interaction and visual confirmation.
