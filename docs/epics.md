# Epics

## 1. Planning Summary

**Product:** Phaseboard â€” a single-user, two-screen web app for manually tracking an AI research project from kickoff through Phase 1 and Phase 2.

**Delivery objective:** Ship a functional MVP that lets one user create a project, record prompts in strict order, attach links, and resume work instantly. The app must be buildable in a weekend by a solo developer.

**Key scope boundaries:**

- Two screens only: project list and project detail.
- Client-side SPA (React + Vite + Tailwind) with IndexedDB persistence â€” no backend.
- No auth, no integrations, no automation, no collaboration.
- Sequence integrity for Phase 1 prompt ordering is the non-negotiable invariant.
- Progressive disclosure guides the user through capture without a giant form.

-----

## 2. Confirmed Facts from Source Materials

- Single-user, single-developer MVP web app.
- Two pages: project list (shows all projects, allows creation) and project detail (single-page workspace).
- Project entity fields: name (required), original deep-research prompt, kickoff thread URL, Phase 2 prompt, timestamps.
- Phase 1 is an ordered list of prompt blocks; each auto-assigned the next sequence number on creation.
- Phase 1 order is immutable: no drag-and-drop, no manual renumbering.
- Phase 1 items may be deleted via soft-delete; original sequence numbers are permanently retired.
- Each Phase 1 item stores: prompt text (required), optional conversation URL, optional artifact URL.
- Phase 2 is a single prompt block stored as a field on the Project entity, separate from Phase 1.
- A fixed research Space link is displayed on every project (global constant, not user-entered).
- All project data shown on a single detail page â€” no subpage navigation.
- Progressive disclosure: first unfilled section expanded/emphasized; filled sections collapsed with edit affordance.
- Data persists in IndexedDB (via `idb` library); no server, no external runtime dependencies.
- Save operations show explicit success/failure feedback (toast system).
- URL fields validated using URL constructor; malformed URLs rejected with message.
- External links open in new tab with `rel="noopener noreferrer"`.
- Project IDs are client-generated UUIDs.
- Performance targets: page load <2 s, save confirmation <1 s.
- Basic error logging via `console.error`; optional persisted error log store.
- React error boundary at root level.
- Stack: React, Vite, Tailwind CSS, `idb` library.
- Desktop primary; mobile usable for quick reference.

-----

## 3. Planning Assumptions

- **Soft-delete is the deletion policy.** Deleted Phase 1 items are marked `deleted: true`, hidden from display, retained in storage. Sequence numbers are never reused. Gaps in numbering are shown naturally.
- **Research Space link is a single hardcoded URL** (environment variable or app config constant), not per-project.
- **No markdown rendering for MVP.** Prompt text stored and displayed as raw text in `<textarea>` / plain text views.
- **No data export for MVP.** JSON export is recommended by the architecture but not required; it is deferred.
- **No rich-text editing.** Plain textarea input only.
- **Single browser context.** No cross-device sync. Data lives in the browser that created it.
- **Deployment is a static site** (Vercel, Netlify, or GitHub Pages). No CI pipeline required for MVP.
- **Confirmation dialog required for Phase 1 deletion** to prevent accidental loss of sequence numbers.
- **Project list sorted by `updatedAt` descending** (most recently touched first).

-----

## 4. Open Questions / Blockers

|#|Question                                                            |Impact on Planning                                                                                                                                                                |
|-|--------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|1|Should deleted Phase 1 items be permanently removed or soft-deleted?|Architecture assumes soft-delete. If stakeholder wants hard-delete, data model and sequence logic change. **Plan proceeds with soft-delete.**                                     |
|2|Is the research Space link global or per-project?                   |Architecture assumes global constant. If per-project, it becomes an editable field on the Project entity and requires an additional story. **Plan proceeds with global constant.**|
|3|Is markdown rendering in read mode required for MVP?                |Architecture defers it. Adding it increases dependency count and build time. **Plan excludes it.**                                                                                |
|4|Should JSON data export be included in MVP?                         |Browser-only persistence is fragile. Architecture recommends it but doesnâ€™t require it. **Plan excludes it from MVP scope but flags it as a risk mitigation option.**             |
|5|What exactly does progressive disclosure look like?                 |Architecture proposes: first empty section expanded, filled sections collapsed with edit buttons. **Plan follows this approach; details handled in a polish story.**              |

-----

## 5. Epic Overview

|Epic ID|Epic Name                                      |Goal                                                                                                      |Primary Modules/Areas             |Dependencies          |Priority / Sequence   |
|-------|-----------------------------------------------|----------------------------------------------------------------------------------------------------------|----------------------------------|----------------------|----------------------|
|E1     |Data Model & Repository                        |Establish IndexedDB schema, all CRUD operations, sequence logic, and Result types                         |ProjectRepository, Data Model (Â§8)|None                  |1 â€” Foundation        |
|E2     |Validation & Feedback Services                 |Build pure validation functions and toast/notification system                                             |ValidationService, FeedbackService|None (can parallel E1)|2 â€” Foundation        |
|E3     |App Shell & Project List                       |Set up routing, page shells, and the project list page                                                    |Router, ProjectListPage           |E1                    |3 â€” First UI          |
|E4     |Project Detail â€” Header Fields                 |Build the detail page scaffold with name, original prompt, Space link, and kickoff URL                    |ProjectDetailPage                 |E1, E2, E3            |4 â€” Core workspace    |
|E5     |Phase 1 Capture & Sequencing                   |Implement ordered Phase 1 prompt list with add, edit, soft-delete, and sequence integrity                 |Phase1Module                      |E1, E2, E4            |5 â€” Core value        |
|E6     |Phase 2 Prompt Section                         |Implement the separate Phase 2 prompt block                                                               |Phase2Module                      |E1, E4                |6 â€” Completes workflow|
|E7     |Progressive Disclosure, Polish & Error Handling|Progressive disclosure logic, empty states, error boundary, error logging, mobile responsiveness, final QA|ProjectDetailPage, ErrorLogger    |E3â€“E6                 |7 â€” Polish            |

-----

## 6. Epic Details

### Epic E1: Data Model & Repository

- **Objective:** Establish the persistence layer so all UI work has a stable data foundation.
- **Included scope:** IndexedDB database creation (`phaseboard`), `projects` and `phase1Items` object stores, all ProjectRepository CRUD methods, Result type, sequence number assignment logic (`max + 1` including soft-deleted), soft-delete implementation, sorted/filtered retrieval of Phase 1 items.
- **Excluded scope:** UI components, validation logic, feedback/toast system, markdown rendering.
- **Dependencies:** None â€” pure data layer.
- **Main risks:** Sequence number logic errors could corrupt the core invariant. Must be unit-tested before any UI depends on it.
- **Done definition:** All ProjectRepository methods implemented and passing unit tests. Sequence integrity verified for add, delete, re-add scenarios.

### Epic E2: Validation & Feedback Services

- **Objective:** Provide reusable validation and user feedback utilities consumed by all UI modules.
- **Included scope:** ValidationService pure functions (project name, URL fields, prompt text), structured validation result type, FeedbackService (success toast, error toast, inline validation errors, auto-dismiss).
- **Excluded scope:** Wiring into specific pages (done in later epics).
- **Dependencies:** None â€” can be built in parallel with E1.
- **Main risks:** Low. Pure functions and simple UI component.
- **Done definition:** Validation functions unit-tested for valid/invalid cases. Toast component renders and auto-dismisses.

### Epic E3: App Shell & Project List

- **Objective:** Get the app navigable and let the user create and browse projects.
- **Included scope:** Vite + React + Tailwind project scaffold, React Router with `/` and `/project/:id` routes, ProjectListPage (list projects sorted by `updatedAt` desc, create new project with name validation, empty state, navigate to detail).
- **Excluded scope:** Project detail page content (just an empty shell route).
- **Dependencies:** E1 (ProjectRepository for list/create operations).
- **Main risks:** Low.
- **Done definition:** User can open app, see project list (or empty state), create a project, and land on detail page shell.

### Epic E4: Project Detail â€” Header Fields

- **Objective:** Build the primary workspace page and make header-level project fields editable.
- **Included scope:** ProjectDetailPage loads project by ID, displays/edits project name, original deep-research prompt (textarea), fixed research Space link (read-only, clickable), kickoff thread URL (editable, validated, clickable). Inline edit/save pattern with feedback. Save success/failure toasts wired.
- **Excluded scope:** Phase 1 list, Phase 2 prompt, progressive disclosure polish.
- **Dependencies:** E1 (repository), E2 (validation + feedback), E3 (routing).
- **Main risks:** Getting the inline-edit save pattern right; this pattern is reused everywhere.
- **Done definition:** User can open a project, see/edit header fields, save changes with feedback, click external links in new tab.

### Epic E5: Phase 1 Capture & Sequencing

- **Objective:** Deliver the core value â€” ordered, immutable Phase 1 prompt list with add, edit, soft-delete, and optional link attachment.
- **Included scope:** Phase1Module: display items in sequence order, â€œAdd Prompt Blockâ€ action (textarea + save), auto-sequence assignment, inline edit of prompt text / conversation URL / artifact URL, soft-delete with confirmation dialog, sequence gap display, URL validation, empty state.
- **Excluded scope:** Drag-and-drop, renumbering, any reordering affordance.
- **Dependencies:** E1 (repository sequence logic), E2 (validation + feedback), E4 (detail page scaffold).
- **Main risks:** **Sequence corruption is the highest-risk area.** Must verify: add â†’ delete â†’ add produces correct numbers; reload preserves order; soft-deleted itemsâ€™ numbers are never reused.
- **Done definition:** User can add multiple Phase 1 blocks, see correct auto-numbering, edit content/links, delete an item and see gap preserved, reload page and verify order integrity.

### Epic E6: Phase 2 Prompt Section

- **Objective:** Complete the capture workflow with a separate Phase 2 prompt block.
- **Included scope:** Phase2Module: display Phase 2 prompt (or empty state), edit/save Phase 2 text, visual separation from Phase 1 (section header, divider).
- **Excluded scope:** Linking Phase 2 to specific Phase 1 items.
- **Dependencies:** E1 (repository â€” Phase 2 is a field on Project), E4 (detail page).
- **Main risks:** Low. Simple single-field edit.
- **Done definition:** User can add/edit a Phase 2 prompt, see it visually separate from Phase 1, and persist it across reloads.

### Epic E7: Progressive Disclosure, Polish & Error Handling

- **Objective:** Make the detail page feel polished â€” guide the user to the next action, handle errors gracefully, ensure mobile usability.
- **Included scope:** Progressive disclosure logic (first unfilled section expanded, filled sections collapsed with edit button), empty states for all sections, React error boundary at root, ErrorLogger (console.error for all error paths, optional IndexedDB error store), mobile responsive layout pass, manual QA against success metrics.
- **Excluded scope:** Data export, markdown rendering, analytics, templates.
- **Dependencies:** E3â€“E6 (all UI must exist before polish pass).
- **Main risks:** Over-engineering progressive disclosure. Keep to the simple rule: first empty section = expanded; everything else = collapsed or showing saved data.
- **Done definition:** Detail page guides user to next action. Errors are caught and logged. Layout works on mobile for quick reference. Manual QA passes success metric targets.

-----

## 7. Suggested Milestones

|Milestone                               |Epics Included|Whatâ€™s True                                                                                                                                                 |
|----------------------------------------|--------------|------------------------------------------------------------------------------------------------------------------------------------------------------------|
|**M1 â€” Data & Services Foundation**     |E1, E2        |Repository fully functional with tested sequence logic. Validation and feedback utilities ready. No UI yet, but all data operations proven.                 |
|**M2 â€” Navigable App with Project CRUD**|E3, E4        |User can create projects, navigate list â†” detail, edit header fields, save with feedback. Core app skeleton is live.                                        |
|**M3 â€” Core Workflow Complete**         |E5, E6        |Full capture workflow functional: Phase 1 ordered list with add/edit/delete, Phase 2 prompt, all links attachable. The productâ€™s primary value is delivered.|
|**M4 â€” MVP Ready**                      |E7            |Progressive disclosure polished, error handling complete, mobile responsive, manual QA passed. Ready for real use.                                          |

-----

## 8. Delivery Risks

|Risk                                       |Impact                                                       |Mitigation / Planning Response                                                                                            |
|-------------------------------------------|-------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------|
|**Sequence number corruption**             |Core value destroyed â€” Phase 2 references become unreliable  |Unit test sequence logic exhaustively in E1. Test add/delete/re-add/reload scenarios. Soft-delete ensures no number reuse.|
|**Browser data loss**                      |All projects lost if browser data cleared or browser switched|Document limitation clearly. Defer JSON export to post-MVP but flag as high-priority follow-up.                           |
|**Progressive disclosure over-engineering**|Delays MVP ship, introduces UI bugs                          |Use simplest rule: first empty section expanded, rest collapsed. No inference, no smart logic.                            |
|**Scope creep**                            |MVP becomes unshippable in a weekend                         |Strict scope guardrails (see Â§9). Every feature gated against PRD in-scope list.                                          |
|**Capture friction**                       |If adding a Phase 1 block takes >20 s, user abandons tool    |Minimal form: single textarea + save. No required metadata on initial add. Links added as optional second step.           |
|**IndexedDB edge cases**                   |Safari private browsing may limit storage                    |Acceptable for MVP. IndexedDB supported in all modern browsers.                                                           |
|**Inline-edit pattern complexity**         |Inconsistent save UX across sections                         |Establish the pattern once in E4 (header fields) and reuse in E5/E6.                                                      |

-----

## 9. Scope Guardrails

The following must **not** be added during implementation:

- Prompt parsing or automatic block splitting
- Integrations with any external tools (Perplexity, Claude, Cursor, Google Drive, iCloud)
- Artifact upload, hosting, publishing, or sync
- Statuses, analytics, dashboards, or reporting
- Templates and workflow presets
- Drag-and-drop reordering or manual renumbering
- Multi-user collaboration, comments, sharing, roles
- Billing, subscriptions, admin
- Search across project contents
- Automation of prompt launching or thread discovery
- Rich-text editing or markdown rendering
- Data export/import (recommended post-MVP, not MVP)
- Cross-device sync
- CI/CD pipeline (optional, not required)

