### Epic E7: Progressive Disclosure, Polish & Error Handling

- **Objective:** Make the detail page feel polished â€” guide the user to the next action, handle errors gracefully, ensure mobile usability.
- **Included scope:** Progressive disclosure logic (first unfilled section expanded, filled sections collapsed with edit button), empty states for all sections, React error boundary at root, ErrorLogger (console.error for all error paths, optional IndexedDB error store), mobile responsive layout pass, manual QA against success metrics.
- **Excluded scope:** Data export, markdown rendering, analytics, templates.
- **Dependencies:** E3â€“E6 (all UI must exist before polish pass).
- **Main risks:** Over-engineering progressive disclosure. Keep to the simple rule: first empty section = expanded; everything else = collapsed or showing saved data.
- **Done definition:** Detail page guides user to next action. Errors are caught and logged. Layout works on mobile for quick reference. Manual QA passes success metric targets.


#### Story E7-S1: Implement Progressive Disclosure on Detail Page

- **Goal:** Guide the user to the next action without presenting a giant form.
- **Description:** Implement the disclosure rule: scan sections top-to-bottom (name â†’ original prompt â†’ kickoff URL â†’ Phase 1 â†’ Phase 2). The first section with no saved data is expanded/highlighted as the suggested next action. All filled sections are collapsed, showing their saved content with an edit button. All unfilled sections below the active one are collapsed with minimal empty-state text.
- **Relevant architecture area:** ProjectDetailPage (Â§7.2), Â§9.6 progressive disclosure, Risk: Progressive disclosure complexity (Â§14).
- **Dependencies:** E4 (header fields), E5 (Phase 1), E6 (Phase 2) â€” all sections must exist.
- **Acceptance criteria:**
  - On a new project, the original prompt section is expanded (name is already filled from creation).
  - After filling the prompt, kickoff URL section becomes the expanded one.
  - Filled sections show saved data in collapsed/read mode with edit affordance.
  - User can manually expand any section to edit, regardless of progressive disclosure state.

#### Story E7-S2: Add Empty States for All Sections

- **Goal:** Every unfilled field/section clearly communicates what to do.
- **Description:** Review all sections and ensure empty states are clear and actionable: project name (always filled), original prompt (â€œAdd your deep-research promptâ€), kickoff URL (â€œPaste your kickoff thread URLâ€), Phase 1 (â€œNo prompt blocks yet. Add your first one.â€), Phase 2 (â€œAdd your Phase 2 prompt.â€). Ensure empty states include the relevant action button/link.
- **Relevant architecture area:** All page modules.
- **Dependencies:** E4, E5, E6.
- **Acceptance criteria:**
  - Every section with no data shows a descriptive, actionable empty state.
  - Empty state text matches the architectureâ€™s specified messages where defined.

#### Story E7-S3: Add React Error Boundary and ErrorLogger

- **Goal:** Prevent crashes from breaking the app and ensure errors are logged for troubleshooting.
- **Description:** Add a React error boundary at the root level that catches unhandled exceptions and shows a recovery message (â€œSomething went wrong. Try refreshing the page.â€). Implement ErrorLogger: wrap all `ProjectRepository` error paths with `console.error`. Optionally, write errors to an IndexedDB `errors` table for post-session review.
- **Relevant architecture area:** ErrorLogger (Â§7.8), Error handling (Â§12).
- **Dependencies:** E1-S1 (IndexedDB â€” if persisting errors).
- **Acceptance criteria:**
  - An unhandled exception in any component shows the error boundary message instead of a blank screen.
  - All repository error results trigger `console.error` with descriptive messages.
  - App remains usable after a caught error (user can navigate away).

#### Story E7-S4: Mobile Responsive Layout Pass

- **Goal:** Ensure the app is usable on mobile for quick reference.
- **Description:** Review all pages on mobile viewport sizes (375px, 414px). Ensure text is readable, inputs are tappable, links are clickable, and Phase 1 list is scrollable. Fix layout issues. Desktop remains the primary target â€” mobile is for quick reference only.
- **Relevant architecture area:** Non-functional requirements (PRD), desktop primary / mobile usable.
- **Dependencies:** E3â€“E6.
- **Acceptance criteria:**
  - Project list page is usable on mobile.
  - Project detail page scrolls and all sections are accessible on mobile.
  - Input fields and buttons are tappable at mobile sizes.
  - No horizontal overflow on mobile viewports.

#### Story E7-S5: Final QA Against Success Metrics

- **Goal:** Verify the MVP meets its stated success criteria before considering it done.
- **Description:** Manually test against each success metric: project creation success rate (target 95%), resume speed (target <10 s), capture speed for Phase 1 (target <20 s), order integrity (target 100%), core workflow completion (target 90%). Document any failures and fix blocking issues.
- **Relevant architecture area:** PRD Success Metrics, Risk: Capture friction.
- **Dependencies:** All prior stories.
- **Acceptance criteria:**
  - Project creation succeeds on â‰¥95% of attempts.
  - Reopening a project and clicking the right link takes <10 s.
  - Adding and saving a Phase 1 block takes <20 s.
  - Phase 1 numbering is 100% correct across all test scenarios.
  - A user can complete the full workflow (create â†’ Phase 1 â†’ Phase 2) without assistance.

