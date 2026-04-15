# Stories

## 1. Story Planning Notes

- Stories are grouped by epic and ordered for implementation within each epic.
- Cross-epic dependencies are noted on individual stories. No story should be started until its dependencies are met.
- The architectureâ€™s recommended implementation sequence (Â§15) is the primary ordering guide.
- Each story maps to a specific architecture module or area. Stories are sized to be implementable in roughly half a day to one day by a solo developer.
- Spikes are used only where ambiguity materially blocks build quality.

-----

## 2. Confirmed Facts from Source Materials

- Client-side SPA: React + Vite + Tailwind CSS + `idb` for IndexedDB.
- Two IndexedDB object stores: `projects` (keyPath: `id`) and `phase1Items` (keyPath: `id`, index on `projectId`).
- Project entity: id (UUID), name, originalPrompt, kickoffThreadUrl, phase2Prompt, createdAt, updatedAt.
- Phase1Item entity: id (UUID), projectId, sequenceNumber (immutable), promptText, conversationUrl, artifactUrl, deleted (boolean), createdAt, updatedAt.
- Sequence number rule: `max(all items in project including deleted) + 1`, or `1` if none exist.
- Soft-delete: `deleted = true`, item hidden from UI, number permanently retired.
- ProjectRepository is the sole data access layer â€” no module touches IndexedDB directly.
- All repository methods return `Result<T>` type: `{ success: true, data } | { success: false, error }`.
- ValidationService is pure functions returning `{ valid, errors[] }`.
- FeedbackService: success toast (auto-dismiss ~3 s), error toast, inline validation errors.
- Fixed research Space link: global constant, not user-entered.
- Progressive disclosure: first unfilled section expanded; filled sections collapsed with edit.
- External links: `target="_blank" rel="noopener noreferrer"`.

-----

## 3. Assumptions

- Soft-delete is the deletion policy (architecture assumption, not yet confirmed by stakeholder).
- Research Space link is a single global URL constant.
- No markdown rendering â€” raw text display is sufficient.
- No data export for MVP.
- Toast auto-dismiss duration: ~3 seconds for success, manual dismiss for errors.
- Project creation requires only a name; all other fields are optional and added on the detail page.
- Phase 1 â€œAdd Prompt Blockâ€ requires only prompt text; conversation URL and artifact URL are added via subsequent edit.

-----

## 4. Open Questions / Clarifications Needed

|#|Question                                                                                        |Recommendation                                                                               |
|-|------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------|
|1|Soft-delete vs. hard-delete for Phase 1 items?                                                  |Proceed with soft-delete per architecture. Confirm with stakeholder before E5 implementation.|
|2|Global vs. per-project research Space link?                                                     |Proceed with global constant. If changed, add one story to E4 for an editable field.         |
|3|Should deleted items show a â€œ(deleted)â€ placeholder in the list, or just show gaps in numbering?|Backlog item. Plan assumes gaps shown naturally with no placeholder.                         |
|4|Exact research Space URL value?                                                                 |Need from stakeholder before E4 implementation. Non-blocking â€” use placeholder in dev.       |

-----

## 5. Stories by Epic

### Epic E1: Data Model & Repository

#### Story E1-S1: Initialize IndexedDB Schema

- **Goal:** Establish the persistent storage foundation.
- **Description:** Create the IndexedDB database `phaseboard` using the `idb` library. Define two object stores: `projects` (keyPath: `id`) and `phase1Items` (keyPath: `id`, with index on `projectId`). Implement database versioning for the initial schema (version 1). Handle database open errors gracefully and return error results.
- **Relevant architecture area:** Data Model (Â§8), ProjectRepository (Â§7.5).
- **Dependencies:** None.
- **Acceptance criteria:**
  - Database `phaseboard` opens successfully with version 1.
  - `projects` store exists with keyPath `id`.
  - `phase1Items` store exists with keyPath `id` and an index on `projectId`.
  - Database open errors are caught and surfaced as typed error results.

#### Story E1-S2: Implement Project CRUD in ProjectRepository

- **Goal:** Enable create, read, update, and list operations for projects.
- **Description:** Implement `createProject(name)`, `getProject(id)`, `getAllProjects()`, and `updateProject(id, fields)` in ProjectRepository. `createProject` generates a UUID, sets `createdAt`/`updatedAt`, and initializes optional fields as empty strings. `getAllProjects` returns projects sorted by `updatedAt` descending. `updateProject` sets `updatedAt` on every write. All methods return `Result<T>`.
- **Relevant architecture area:** ProjectRepository (Â§7.5), Data Model â€” Project entity (Â§8).
- **Dependencies:** E1-S1.
- **Acceptance criteria:**
  - `createProject("Test")` returns `{ success: true, data: Project }` with UUID, name, timestamps, and empty optional fields.
  - `getProject(id)` retrieves the correct project or returns an error result for missing IDs.
  - `getAllProjects()` returns projects sorted by `updatedAt` descending.
  - `updateProject(id, { originalPrompt: "text" })` updates the field and sets new `updatedAt`.
  - All methods return `Result<T>` â€” no thrown exceptions.

#### Story E1-S3: Implement Phase 1 Item CRUD with Sequence Logic

- **Goal:** Deliver the critical sequence-integrity data operations.
- **Description:** Implement `createPhase1Item(projectId, promptText)`, `getPhase1Items(projectId)`, `updatePhase1Item(id, fields)`, and `deletePhase1Item(id)` in ProjectRepository. `createPhase1Item` computes `sequenceNumber = max(all items in project including deleted) + 1` (or `1` if none). `sequenceNumber` is immutable after creation. `deletePhase1Item` sets `deleted = true`. `getPhase1Items` returns only non-deleted items sorted by `sequenceNumber` ascending. `updatePhase1Item` must not allow changes to `sequenceNumber` or `projectId`.
- **Relevant architecture area:** ProjectRepository (Â§7.5), Data Model â€” Phase1Item entity and sequence integrity rules (Â§8).
- **Dependencies:** E1-S1.
- **Acceptance criteria:**
  - First item in an empty project gets `sequenceNumber = 1`.
  - Second item gets `sequenceNumber = 2`.
  - After deleting item 2 and adding a new item, new item gets `sequenceNumber = 3` (not 2).
  - `getPhase1Items` excludes deleted items and returns sorted by `sequenceNumber` ascending.
  - `updatePhase1Item` rejects attempts to modify `sequenceNumber`.
  - All methods return `Result<T>`.

#### Story E1-S4: Unit Test Sequence Integrity Scenarios

- **Goal:** Prove the core invariant before any UI depends on it.
- **Description:** Write focused tests for sequence number assignment covering: empty project â†’ first add; consecutive adds; add â†’ delete â†’ add (verifying gap); add multiple â†’ delete middle â†’ add (verifying max-based assignment); reload and verify order; bulk deletion scenarios. Use an in-memory IndexedDB mock or `fake-indexeddb` for test isolation.
- **Relevant architecture area:** Data Model â€” Sequence integrity rules (Â§8), Risk: Sequence corruption (Â§14).
- **Dependencies:** E1-S3.
- **Acceptance criteria:**
  - All scenarios pass: empty-add, consecutive-add, delete-gap, delete-middle-add, reload-order.
  - Sequence numbers are never reused across any scenario.
  - Deleted items are excluded from display queries but included in max-sequence computation.

-----

### Epic E2: Validation & Feedback Services

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

-----

### Epic E3: App Shell & Project List

#### Story E3-S1: Scaffold Vite + React + Tailwind Project

- **Goal:** Get the app buildable and runnable.
- **Description:** Initialize a Vite project with React and TypeScript. Install and configure Tailwind CSS. Install `idb` library. Set up the project structure with folders for pages, modules, services, and types. Verify `npm run dev` serves the app.
- **Relevant architecture area:** Architectural Approach (Â§5), stack decisions.
- **Dependencies:** None.
- **Acceptance criteria:**
  - `npm run dev` starts the app and renders a placeholder page.
  - Tailwind utility classes work in components.
  - `idb` is installed and importable.
  - TypeScript compiles without errors.

#### Story E3-S2: Set Up React Router with Page Shells

- **Goal:** Establish navigation between list and detail pages.
- **Description:** Install React Router. Create two routes: `/` â†’ ProjectListPage, `/project/:id` â†’ ProjectDetailPage. Both pages render shell components with placeholder content. Add a back-navigation link from detail to list.
- **Relevant architecture area:** Router + page shells (Â§15, order 3).
- **Dependencies:** E3-S1.
- **Acceptance criteria:**
  - Navigating to `/` renders ProjectListPage shell.
  - Navigating to `/project/some-id` renders ProjectDetailPage shell with the ID accessible from params.
  - Link from detail page navigates back to list.

#### Story E3-S3: Build ProjectListPage

- **Goal:** Let the user see all projects and create new ones.
- **Description:** Implement ProjectListPage: on mount, fetch all projects via `ProjectRepository.getAllProjects()` and display as a list (name + creation date), sorted by most recently updated. Provide a â€œNew Projectâ€ action: inline name input, validation via ValidationService, create via ProjectRepository, navigate to detail page on success. Show empty state when no projects exist (â€œNo projects yet. Create your first one.â€). Show feedback toasts for create success/failure.
- **Relevant architecture area:** ProjectListPage (Â§7.1), Interaction flow Â§9.1.
- **Dependencies:** E1-S2 (Project CRUD), E2-S1 (validation), E2-S2 (feedback).
- **Acceptance criteria:**
  - Empty state displays when no projects exist.
  - User can enter a name and create a project; validation rejects empty names.
  - After creation, app navigates to the new projectâ€™s detail page.
  - Project list shows existing projects sorted by `updatedAt` descending.
  - Success toast shown on project creation.
  - Error toast shown if creation fails.

-----

### Epic E4: Project Detail â€” Header Fields

#### Story E4-S1: Load and Display Project on Detail Page

- **Goal:** Make the detail page show real project data.
- **Description:** On mount, read project ID from route params and fetch via `ProjectRepository.getProject(id)`. Display project name, original prompt (or empty state), research Space link (hardcoded constant, clickable, opens in new tab), and kickoff thread URL (or empty state). Handle not-found case (invalid ID â†’ navigate back to list with error).
- **Relevant architecture area:** ProjectDetailPage (Â§7.2), Interaction flow Â§9.6.
- **Dependencies:** E3-S2 (routing), E1-S2 (Project CRUD).
- **Acceptance criteria:**
  - Detail page loads and displays correct project name.
  - Research Space link renders as clickable link opening in new tab.
  - Empty states shown for unfilled fields.
  - Invalid project ID redirects to list with error message.

#### Story E4-S2: Inline Edit for Project Name

- **Goal:** Let the user rename a project from the detail page.
- **Description:** Implement inline edit pattern for project name: display mode shows name with edit affordance; edit mode shows input field with save/cancel. On save, validate non-empty via ValidationService, update via ProjectRepository, show success/failure toast. This establishes the reusable inline-edit pattern for all subsequent fields.
- **Relevant architecture area:** ProjectDetailPage (Â§7.2).
- **Dependencies:** E4-S1, E2-S1, E2-S2.
- **Acceptance criteria:**
  - User can click to edit project name.
  - Empty name is rejected with inline validation error.
  - Successful save shows toast and returns to display mode.
  - Cancel discards changes.

#### Story E4-S3: Inline Edit for Original Deep-Research Prompt

- **Goal:** Let the user capture or update the source prompt.
- **Description:** Add an â€œOriginal Promptâ€ section to the detail page. Empty state: â€œAdd your deep-research prompt.â€ Edit mode: textarea. Save updates `originalPrompt` field via ProjectRepository. Show feedback.
- **Relevant architecture area:** ProjectDetailPage (Â§7.2), Project entity â€” `originalPrompt` field.
- **Dependencies:** E4-S1, E2-S2.
- **Acceptance criteria:**
  - Empty state displays when no prompt is saved.
  - User can enter/edit prompt text in a textarea.
  - Save persists the prompt and shows success toast.
  - Prompt text survives page reload.

#### Story E4-S4: Inline Edit for Kickoff Thread URL

- **Goal:** Let the user paste and save the kickoff conversation link.
- **Description:** Add a â€œKickoff Threadâ€ section. Empty state: â€œPaste your kickoff thread URL.â€ Edit mode: text input. On save, validate URL via ValidationService. If valid, save and render as clickable link (opens in new tab). If invalid, show inline error. Show save feedback.
- **Relevant architecture area:** ProjectDetailPage (Â§7.2), Interaction flow Â§9.2, ValidationService (Â§7.6).
- **Dependencies:** E4-S1, E2-S1, E2-S2.
- **Acceptance criteria:**
  - Empty state shown when no URL saved.
  - Valid URL saves and displays as clickable link opening in new tab.
  - Malformed URL shows inline validation error; save is blocked.
  - Success toast on valid save.

-----

### Epic E5: Phase 1 Capture & Sequencing

#### Story E5-S1: Display Phase 1 Item List

- **Goal:** Show existing Phase 1 items in correct sequence order.
- **Description:** Add Phase 1 section to the detail page. Fetch items via `ProjectRepository.getPhase1Items(projectId)` (non-deleted, sorted by `sequenceNumber`). Display each item with its sequence label (â€œPrompt 1â€, â€œPrompt 3â€, etc.), prompt text, and any saved URLs as clickable links. Show empty state when no items exist: â€œNo prompt blocks yet. Add your first one.â€
- **Relevant architecture area:** Phase1Module (Â§7.3).
- **Dependencies:** E1-S3 (Phase 1 CRUD), E4-S1 (detail page scaffold).
- **Acceptance criteria:**
  - Items display in `sequenceNumber` order.
  - Sequence labels match stored numbers (gaps from deletions visible).
  - Conversation and artifact URLs render as clickable links opening in new tab.
  - Empty state displays when no Phase 1 items exist.

#### Story E5-S2: Add Phase 1 Prompt Block

- **Goal:** Let the user append a new prompt block with auto-sequencing.
- **Description:** Add an â€œAdd Prompt Blockâ€ button below the Phase 1 list (or as the primary action in the empty state). Clicking shows a textarea for prompt text. On save: validate prompt text non-empty, create item via `ProjectRepository.createPhase1Item(projectId, promptText)`, show success toast, new item appears in list with correct sequence number.
- **Relevant architecture area:** Phase1Module (Â§7.3), Interaction flow Â§9.3.
- **Dependencies:** E5-S1, E1-S3, E2-S1, E2-S2.
- **Acceptance criteria:**
  - New item appears at bottom of list with next sequence number.
  - Prompt text validation rejects empty text.
  - Success toast shown after add.
  - Textarea clears after successful add, ready for next entry.

#### Story E5-S3: Edit Phase 1 Item (Prompt Text + URLs)

- **Goal:** Let the user modify prompt text and attach optional links to an existing Phase 1 item.
- **Description:** Add inline edit affordance to each Phase 1 item. Edit mode shows: prompt text textarea, conversation URL input, artifact URL input. On save: validate prompt text non-empty, validate URLs if provided (empty allowed), update via `ProjectRepository.updatePhase1Item(id, fields)`. Sequence number must not change. Show save feedback.
- **Relevant architecture area:** Phase1Module (Â§7.3), Interaction flow Â§9.4 (Update).
- **Dependencies:** E5-S1, E2-S1, E2-S2.
- **Acceptance criteria:**
  - User can edit prompt text; empty text rejected.
  - User can add/edit/clear conversation URL and artifact URL.
  - Malformed URLs show inline validation error.
  - Sequence number unchanged after edit.
  - Save shows success toast.

#### Story E5-S4: Soft-Delete Phase 1 Item

- **Goal:** Let the user remove a Phase 1 item while preserving sequence integrity.
- **Description:** Add delete action to each Phase 1 item. On click, show confirmation dialog: â€œDelete Prompt {N}? Its number will be permanently retired.â€ On confirm: call `ProjectRepository.deletePhase1Item(id)` (sets `deleted = true`). Item disappears from list. Remaining items keep original numbers. Show success toast.
- **Relevant architecture area:** Phase1Module (Â§7.3), Interaction flow Â§9.4 (Delete), Sequence integrity rules (Â§8).
- **Dependencies:** E5-S1, E1-S3.
- **Acceptance criteria:**
  - Confirmation dialog appears before deletion.
  - After deletion, item is hidden from list.
  - Other itemsâ€™ sequence numbers are unchanged.
  - Adding a new item after deletion assigns `max + 1` (the deleted number is not reused).
  - Success toast shown after delete.

#### Story E5-S5: Phase 1 Sequence Integrity End-to-End Verification

- **Goal:** Manually verify sequence integrity survives real usage patterns.
- **Description:** Perform end-to-end manual testing: create project â†’ add 3 Phase 1 items â†’ verify numbering (1, 2, 3) â†’ delete item 2 â†’ verify list shows (1, 3) â†’ add new item â†’ verify number is 4 â†’ reload page â†’ verify order preserved â†’ edit item 1 â†’ verify number unchanged. Document results.
- **Relevant architecture area:** Sequence integrity rules (Â§8), Risk: Sequence corruption (Â§14).
- **Dependencies:** E5-S1 through E5-S4.
- **Acceptance criteria:**
  - All scenarios pass without sequence corruption.
  - Numbers persist correctly across reloads.
  - No number is ever reused.

-----

### Epic E6: Phase 2 Prompt Section

#### Story E6-S1: Display and Edit Phase 2 Prompt

- **Goal:** Complete the workflow with a separate Phase 2 capture section.
- **Description:** Add a Phase 2 section below Phase 1 on the detail page, with a distinct section header and visual divider. Display Phase 2 prompt text or empty state: â€œAdd your Phase 2 prompt.â€ Edit mode: textarea. On save: update `phase2Prompt` field via `ProjectRepository.updateProject(id, { phase2Prompt })`. Show save feedback.
- **Relevant architecture area:** Phase2Module (Â§7.4), Interaction flow Â§9.5.
- **Dependencies:** E1-S2 (Project CRUD â€” phase2Prompt is on Project entity), E4-S1 (detail page).
- **Acceptance criteria:**
  - Phase 2 section is visually separated from Phase 1 (header + divider).
  - Empty state shown when no Phase 2 prompt saved.
  - User can enter/edit Phase 2 prompt text and save.
  - Save shows success toast.
  - Phase 2 prompt persists across reloads.
  - Phase 2 is not part of the Phase 1 numbered list.

-----

### Epic E7: Progressive Disclosure, Polish & Error Handling

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

-----

## 6. Recommended Build Order

The following order respects dependencies and delivers the core value path as early as possible:

**Wave 1 â€” Foundation (can be parallelized):**

1. E1-S1: Initialize IndexedDB Schema
1. E1-S2: Project CRUD
1. E1-S3: Phase 1 Item CRUD with Sequence Logic
1. E1-S4: Unit Test Sequence Integrity
1. E2-S1: ValidationService
1. E2-S2: FeedbackService (Toast System)

**Wave 2 â€” App Shell & Navigation:**
7. E3-S1: Scaffold Vite + React + Tailwind
8. E3-S2: React Router with Page Shells
9. E3-S3: Build ProjectListPage

**Wave 3 â€” Detail Page & Header Fields:**
10. E4-S1: Load and Display Project
11. E4-S2: Inline Edit â€” Project Name
12. E4-S3: Inline Edit â€” Original Prompt
13. E4-S4: Inline Edit â€” Kickoff Thread URL

**Wave 4 â€” Core Value (Phase 1 + Phase 2):**
14. E5-S1: Display Phase 1 List
15. E5-S2: Add Phase 1 Prompt Block
16. E5-S3: Edit Phase 1 Item
17. E5-S4: Soft-Delete Phase 1 Item
18. E5-S5: Sequence Integrity End-to-End Verification
19. E6-S1: Display and Edit Phase 2 Prompt

**Wave 5 â€” Polish & Ship:**
20. E7-S1: Progressive Disclosure
21. E7-S2: Empty States
22. E7-S3: Error Boundary + ErrorLogger
23. E7-S4: Mobile Responsive Pass
24. E7-S5: Final QA

**Dependency logic:** Data layer and services (Wave 1) must land before any UI. The app shell (Wave 2) must exist before detail page work. Header field patterns (Wave 3) establish inline-edit conventions reused in Phase 1/Phase 2 (Wave 4). Polish (Wave 5) is last because it depends on all functional UI being in place.

-----

## 7. Cross-cutting Risks and Watchouts

|Area                |Risk                                                                                                                   |Watchout                                                                                                                        |
|--------------------|-----------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------|
|**Sequencing**      |Phase 1 sequence logic is the single most critical correctness requirement.                                            |Do not skip E1-S4 (unit tests) or E5-S5 (E2E verification). Any sequence bug undermines the productâ€™s entire value.             |
|**Architecture**    |The inline-edit pattern established in E4 is reused in E5 and E6. If the pattern is poorly designed, rework propagates.|Invest time in E4-S2 to get the edit/save/cancel/validation/feedback cycle right before replicating.                            |
|**Scope**           |Temptation to add markdown rendering, export, search, or templates during implementation.                              |Refer to epic.md Â§9 Scope Guardrails. If a feature isnâ€™t in the stories above, it doesnâ€™t ship in MVP.                          |
|**Data loss**       |IndexedDB data is browser-local. Users clearing browser data lose everything.                                          |Acknowledge this limitation in the UI (brief note on list page or settings). JSON export is the top post-MVP priority.          |
|**Capture friction**|If the Phase 1 add flow requires more than textarea + save button, users wonâ€™t use it during real work.                |Keep E5-S2 minimal: one textarea, one save button. URLs are added via separate edit (E5-S3).                                    |
|**QA**              |No automated E2E tests are planned for MVP.                                                                            |E5-S5 and E7-S5 are manual verification stories. If time allows, add a few Playwright smoke tests, but do not block MVP on them.|

-----

## 8. MVP Completion Criteria

The MVP is implementation-complete when all of the following are true:

1. A user can create a project from the project list page.
1. A user can open a project and see all saved data on a single detail page.
1. A user can save an original deep-research prompt.
1. A user can see and click the fixed research Space link (new tab).
1. A user can save and click a kickoff thread URL (new tab).
1. A user can add Phase 1 prompt blocks one at a time with correct auto-numbering.
1. Phase 1 order is preserved exactly across adds, edits, deletes, and reloads.
1. Deleted Phase 1 itemsâ€™ sequence numbers are never reused.
1. A user can attach optional conversation and artifact URLs to each Phase 1 item.
1. A user can save a separate Phase 2 prompt block, visually distinct from Phase 1.
1. Save operations show explicit success/failure feedback.
1. URL fields reject malformed input with clear messages.
1. The detail page uses progressive disclosure to guide the user to the next action.
1. The app handles errors gracefully (error boundary, console logging).
1. The app is usable on mobile for quick reference.
1. All success metrics pass manual verification (E7-S5).

