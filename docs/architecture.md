# Architecture

## 1. System Summary

**Phaseboard** is a single-user, two-screen web app that acts as a manual memory board for AI research projects. A user creates a project, records a deep-research prompt, links a kickoff thread, adds Phase 1 prompt blocks in strict entry order, attaches conversation/artifact URLs to each, and stores a separate Phase 2 prompt. The core value proposition is instant project resumption: open a project and immediately see what was run, in what order, where it happened, and what to open next.

**Core user workflow:**

1. Create project â†’ save original prompt â†’ note kickoff thread URL.
1. Add Phase 1 prompt blocks one at a time; each auto-numbered in entry order.
1. Attach optional conversation and artifact URLs to each Phase 1 item.
1. Save a separate Phase 2 prompt block.
1. Return later, reopen project, jump to the right thread or next action within seconds.

**MVP constraints that shape the architecture:**

- Single user, no auth at the product level.
- No integrations, no background syncing, no automation.
- Two screens only: project list, project detail.
- Sequence integrity for Phase 1 is the non-negotiable invariant.
- Must be shippable in a weekend by a solo developer.

-----

## 2. Confirmed Facts from Source Materials

- Single-user, single-developer MVP web app.
- Two pages: project list and project detail.
- Project has: name (required), original deep-research prompt (freeform text/markdown), fixed research Space link (displayed, not user-entered), kickoff thread URL (user-entered, single).
- Phase 1 is an ordered list of prompt blocks added one at a time; each auto-assigned the next sequence number on creation.
- Phase 1 order is immutable: no drag-and-drop, no manual renumbering.
- Phase 1 items may be deleted; a clear deletion policy must be defined.
- Each Phase 1 item stores: prompt text (markdown/plain text), optional conversation URL, optional artifact URL.
- Phase 2 is a single prompt block stored separately from the Phase 1 list.
- All project data shown on a single project detail pageâ€”no subpage navigation.
- Progressive disclosure: show next relevant input, avoid giant all-at-once form.
- Data must persist between sessions.
- Save operations show explicit success/failure feedback.
- URL fields validated; malformed URLs rejected with clear message.
- External links open in new browser tab.
- No third-party API dependencies at runtime.
- Desktop is primary target; mobile usable for quick reference.
- Project list shows existing projects and allows new project creation.
- Basic application error logging required (at minimum, failed saves and invalid submissions).
- If publicly deployed, access protection may be handled at the deployment layer.
- Performance targets: page load <2s, save confirmation <1s, Phase 1 capture <20s, resume <10s.
- Phase 1 ordering must survive reloads, edits, and deletions at 100% integrity.

-----

## 3. Assumptions

- **Frontend-only SPA with local persistence.** No backend server. Data stored in the browser via IndexedDB (wrapped by Dexie.js or idb). This is the simplest architecture that satisfies all stated requirements for a single-user, no-integration MVP. A backend can be added later if needed.
- **Fixed research Space link is a static constant.** The PRD says â€œdisplay a fixed research Space link on every project.â€ This is interpreted as a single hardcoded URL (configurable via an environment variable or app config), not a per-project user-entered field.
- **Deletion policy: soft-delete with original numbering preserved.** When a Phase 1 item is deleted, its sequence label (e.g., â€œPrompt 3â€) is permanently retired. Remaining items keep their original numbers. This preserves prompt-to-artifact mapping trust. The item is marked deleted and hidden from the UI but retained in storage for audit. This is the safest policy given the PRDâ€™s emphasis on stable numbering.
- **Phase 2 is singular.** One Phase 2 prompt block per project, not a list.
- **No rich-text editor.** Prompt input uses a plain `<textarea>` that accepts markdown as raw text. Rendering markdown in read mode is a nice-to-have but not required for MVP.
- **No user authentication.** The app has no login. If deployed publicly, HTTP basic auth or platform-level auth (e.g., Vercel password protection) is used.
- **React + Vite as the frontend stack.** Lightweight, fast to scaffold, widely understood. Tailwind CSS for styling.
- **Single browser context.** No cross-device sync for MVP. Data lives in the browser that created it.
- **Project IDs are UUIDs.** Generated client-side.

-----

## 4. Open Questions

|#|Question                                                                                     |Why it matters                                                                                                                                                   |
|-|---------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|
|1|Should deleted Phase 1 items be permanently removed from storage, or soft-deleted and hidden?|Affects storage schema, undo potential, and whether sequence gaps are explainable in the UI. Architecture assumes soft-delete.                                   |
|2|Is the â€œfixed research Space linkâ€ a single global URL or per-project?                       |Affects data model. Architecture assumes global constant. If per-project, it becomes another field on the Project entity.                                        |
|3|Is markdown rendering in read-mode required for MVP?                                         |Affects dependency count and build time. Architecture defers rendering; raw text display is sufficient.                                                          |
|4|Should the app support data export (e.g., JSON backup) for MVP?                              |Single-browser persistence is fragile. Export would mitigate data loss risk. Architecture recommends a simple JSON export button but does not require it for MVP.|
|5|What exactly does the â€œnext action obviousâ€ progressive disclosure look like?                |Affects UI component design. Architecture proposes a simple state-driven approach (see Module 7.2).                                                              |

-----

## 5. Architectural Approach

### Recommended approach: Client-side SPA with IndexedDB persistence

The app is a single-page application built with React, bundled by Vite, styled with Tailwind CSS, and persisted entirely in the browser using IndexedDB (via the `idb` library).

### Why this fits the MVP

- **No server to deploy or maintain.** A solo developer can ship a static site to Vercel/Netlify/GitHub Pages in minutes.
- **Sub-second saves.** IndexedDB writes are local and fast, easily meeting the <1s feedback target.
- **No runtime dependencies.** No database server, no API keys, no third-party services.
- **Weekend-shippable.** Minimal infrastructure decisions.

### Alternatives considered

|Alternative                              |Why rejected                                                                                              |
|-----------------------------------------|----------------------------------------------------------------------------------------------------------|
|Backend + SQLite/Postgres                |Adds deployment complexity, server cost, and auth requirements that are unnecessary for a single-user MVP.|
|localStorage only                        |5MB limit is risky for projects with large prompt text. IndexedDB has no practical size limit.            |
|File-system persistence (e.g., JSON file)|Requires a backend or Electron wrapper. Adds complexity.                                                  |

-----

## 6. System Context

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”         â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚              â”‚         â”‚       Phaseboard SPA      â”‚
â”‚   User       â”‚â”€â”€â”€â”€â”€â”€â”€â”€â–¶â”‚  (React + Vite + Tailwind)â”‚
â”‚  (Browser)   â”‚â—€â”€â”€â”€â”€â”€â”€â”€â”€â”‚                          â”‚
â”‚              â”‚         â”‚   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜         â”‚   â”‚   IndexedDB      â”‚   â”‚
                         â”‚   â”‚   (via idb)       â”‚   â”‚
       â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”       â”‚   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
       â”‚ External â”‚       â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
       â”‚ AI tools â”‚  â—€â”€â”€ user clicks saved URLs (new tab)
       â”‚ (Claude, â”‚
       â”‚ Perplexityâ”‚
       â”‚ etc.)    â”‚
       â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Actors:** Single user (solo builder / researcher).

**System boundary:** The SPA and its IndexedDB store. External AI tools are linked-to, never integrated with.

**External systems:** None at runtime. External AI tool URLs are stored as strings and opened via `window.open()`.

-----

## 7. Module Decomposition

### 7.1 ProjectListPage

- **Purpose:** Entry point. Shows all projects; allows creating a new one.
- **Responsibilities:**
  - Fetch and display all projects (name, creation date) sorted by most-recently-updated.
  - Provide a â€œNew Projectâ€ action that creates a project with a name and navigates to the detail page.
  - Validate that project name is non-empty before creation.
  - Show empty state when no projects exist.
- **Inputs:** None (reads from storage on mount).
- **Outputs:** Navigation to ProjectDetailPage with project ID.
- **Owned data:** None (reads from ProjectRepository).
- **Dependencies:** ProjectRepository, Router.

### 7.2 ProjectDetailPage

- **Purpose:** Primary workspace. Displays all project data on a single page with progressive disclosure.
- **Responsibilities:**
  - Load full project record (including Phase 1 items and Phase 2 block) on mount.
  - Display sections in order: project name, original prompt, research Space link, kickoff thread URL, Phase 1 list, Phase 2 prompt.
  - Implement progressive disclosure: each section shows its current state (filled or empty) with an inline edit/add affordance. The â€œnext actionâ€ is visually emphasized (e.g., the first unfilled section is expanded or highlighted).
  - Coordinate inline editing and saving for each section.
  - Provide save feedback (success toast / error message) for every write.
  - Open external URLs in new tab.
- **Inputs:** Project ID (from route param).
- **Outputs:** Write operations via ProjectRepository.
- **Owned data:** Local UI state (which section is being edited, pending form values, save status).
- **Dependencies:** ProjectRepository, Phase1Module, Phase2Module, ValidationService.

### 7.3 Phase1Module

- **Purpose:** Manages the ordered Phase 1 prompt list within the project detail page.
- **Responsibilities:**
  - Display Phase 1 items in sequence order, showing sequence label, prompt text, conversation URL, artifact URL.
  - Provide â€œAdd Prompt Blockâ€ action that always appends to the end.
  - Auto-assign next sequence number: `max(existing sequence numbers) + 1`, or `1` if list is empty. This uses max-of-existing (including soft-deleted) to guarantee no number reuse.
  - Allow inline editing of prompt text, conversation URL, and artifact URL on existing items.
  - Allow deletion of a Phase 1 item (soft-delete: mark as deleted, hide from display, retain in storage).
  - Show deleted-item gaps in numbering naturally (e.g., list shows Prompt 1, Prompt 3 if Prompt 2 was deleted).
  - Validate URL fields on save.
  - Show empty state when no Phase 1 items exist (â€œNo prompt blocks yet. Add your first one.â€).
- **Inputs:** Project ID, Phase 1 items array from ProjectRepository.
- **Outputs:** Add/update/delete operations via ProjectRepository.
- **Owned data:** Local form state for the currently-being-added or edited item.
- **Dependencies:** ProjectRepository, ValidationService.
- **Notes:** Sequence number assignment is the critical invariant. The rule is simple: `nextSeqNum = max(all items including deleted) + 1`. This is computed at write time, not display time.

### 7.4 Phase2Module

- **Purpose:** Manages the single Phase 2 prompt block.
- **Responsibilities:**
  - Display Phase 2 prompt text (or empty state).
  - Allow editing and saving Phase 2 prompt text.
  - Keep Phase 2 visually separated from Phase 1 (distinct section header, visual divider).
- **Inputs:** Project ID, Phase 2 data from ProjectRepository.
- **Outputs:** Update operation via ProjectRepository.
- **Owned data:** Local edit state.
- **Dependencies:** ProjectRepository.

### 7.5 ProjectRepository

- **Purpose:** Data access layer. All reads and writes to IndexedDB go through this module.
- **Responsibilities:**
  - CRUD operations for projects.
  - CRUD operations for Phase 1 items (scoped to a project).
  - Read/write for Phase 2 prompt (scoped to a project).
  - Enforce sequence number assignment for new Phase 1 items.
  - Enforce soft-delete for Phase 1 items.
  - Return sorted Phase 1 items (by sequence number, excluding deleted).
  - Handle IndexedDB errors and surface them as typed error results.
- **Inputs:** Entity data from UI modules.
- **Outputs:** Typed results: `{ success: true, data } | { success: false, error }`.
- **Owned data:** IndexedDB schema and all stored records.
- **Dependencies:** `idb` library.
- **Notes:** This is the only module that touches IndexedDB directly.

### 7.6 ValidationService

- **Purpose:** Pure-function validation for all user inputs.
- **Responsibilities:**
  - Validate project name (non-empty, trimmed).
  - Validate URL fields (conversation URL, artifact URL, kickoff thread URL) using URL constructor; reject malformed URLs with specific message.
  - Validate prompt text (non-empty for required fields).
  - Return structured validation results: `{ valid: boolean, errors: { field: string, message: string }[] }`.
- **Inputs:** Field values.
- **Outputs:** Validation result objects.
- **Owned data:** None.
- **Dependencies:** None.

### 7.7 FeedbackService

- **Purpose:** Centralized UI feedback for save success, save failure, and validation errors.
- **Responsibilities:**
  - Show success toast after successful save.
  - Show error toast or inline error after failed save.
  - Show inline validation errors on fields.
  - Auto-dismiss success toasts after ~3 seconds.
- **Inputs:** Event triggers from UI modules.
- **Outputs:** Rendered toast/notification UI.
- **Owned data:** Toast queue state.
- **Dependencies:** None.

### 7.8 ErrorLogger

- **Purpose:** Minimal client-side error logging.
- **Responsibilities:**
  - Log failed saves, validation failures, and unhandled exceptions.
  - Log to `console.error` for MVP. Optionally write to an IndexedDB `errors` table for post-session review.
- **Inputs:** Error events.
- **Outputs:** Console output / stored error records.
- **Owned data:** Error log entries (if persisted).
- **Dependencies:** None.

-----

## 8. Data Model

### Entities

#### Project

|Field             |Type           |Constraints                      |
|------------------|---------------|---------------------------------|
|`id`              |string (UUID)  |Primary key, client-generated    |
|`name`            |string         |Required, non-empty              |
|`originalPrompt`  |string         |Optional (freeform text/markdown)|
|`kickoffThreadUrl`|string         |Optional, validated URL          |
|`phase2Prompt`    |string         |Optional (freeform text/markdown)|
|`createdAt`       |ISO 8601 string|Set on creation, immutable       |
|`updatedAt`       |ISO 8601 string|Updated on every save            |

#### Phase1Item

|Field            |Type           |Constraints                                                                             |
|-----------------|---------------|----------------------------------------------------------------------------------------|
|`id`             |string (UUID)  |Primary key, client-generated                                                           |
|`projectId`      |string (UUID)  |Foreign key â†’ Project.id                                                                |
|`sequenceNumber` |integer        |Auto-assigned, immutable after creation, unique within project (including deleted items)|
|`promptText`     |string         |Required, non-empty                                                                     |
|`conversationUrl`|string         |Optional, validated URL                                                                 |
|`artifactUrl`    |string         |Optional, validated URL                                                                 |
|`deleted`        |boolean        |Default: false. True = soft-deleted                                                     |
|`createdAt`      |ISO 8601 string|Set on creation, immutable                                                              |
|`updatedAt`      |ISO 8601 string|Updated on every save                                                                   |

### Relationships

- Project 1 â†’ many Phase1Items (via `projectId`).
- Phase 2 prompt is a field on Project, not a separate entity (it is always singular).

### Sequence integrity rules

1. On insert: `sequenceNumber = max(sequenceNumber for all Phase1Items in this project, including deleted) + 1`. If none exist, `sequenceNumber = 1`.
1. `sequenceNumber` is never modified after creation.
1. On delete: `deleted = true`. The `sequenceNumber` is permanently retired.
1. Display list: filter `deleted === false`, sort by `sequenceNumber` ascending.

### IndexedDB schema (via `idb`)

- **Database name:** `phaseboard`
- **Object stores:**
  - `projects` â€” keyPath: `id`
  - `phase1Items` â€” keyPath: `id`, index on `projectId`

-----

## 9. Interaction and Data Flows

### 9.1 Project creation flow

1. User clicks â€œNew Projectâ€ on ProjectListPage.
1. UI shows inline name input with validation.
1. User enters name â†’ ValidationService checks non-empty.
1. On submit: ProjectRepository creates a new Project record with generated UUID, name, timestamps, and empty optional fields.
1. IndexedDB write completes â†’ FeedbackService shows success toast.
1. Router navigates to ProjectDetailPage with new project ID.

### 9.2 Kickoff thread capture flow

1. User is on ProjectDetailPage. Kickoff thread URL section shows empty state (â€œPaste your kickoff thread URLâ€).
1. User clicks to edit â†’ text input appears.
1. User pastes URL â†’ on save, ValidationService validates URL format.
1. If invalid: inline error shown, save blocked.
1. If valid: ProjectRepository updates project record â†’ FeedbackService shows success â†’ field displays as clickable link (opens in new tab).

### 9.3 Phase 1 prompt entry flow

1. User is on ProjectDetailPage, Phase 1 section.
1. If no items exist: empty state shown with â€œAdd first prompt blockâ€ button.
1. If items exist: list displayed in sequence order; â€œAdd prompt blockâ€ button at bottom.
1. User clicks add â†’ textarea appears for prompt text.
1. User enters prompt â†’ clicks save.
1. ValidationService checks prompt text is non-empty.
1. Phase1Module computes `nextSeqNum` by querying max sequence number from ProjectRepository (including deleted items) + 1.
1. ProjectRepository inserts new Phase1Item with computed `sequenceNumber`.
1. IndexedDB write completes â†’ FeedbackService shows success â†’ new item appears in list with its sequence label.
1. User can then optionally edit the item to add conversation/artifact URLs.

### 9.4 Phase 1 item update/delete flow

**Update:**

1. User clicks edit on an existing Phase 1 item.
1. Inline form shows prompt text, conversation URL, artifact URL fields.
1. User edits fields â†’ clicks save.
1. ValidationService validates (prompt non-empty; URLs valid if provided).
1. ProjectRepository updates the Phase1Item (sequenceNumber unchanged).
1. FeedbackService shows success.

**Delete:**

1. User clicks delete on a Phase 1 item.
1. Confirmation dialog: â€œDelete Prompt {N}? Its number will be permanently retired.â€
1. On confirm: ProjectRepository sets `deleted = true` on the item.
1. Item disappears from displayed list. Sequence numbers of other items unchanged.
1. FeedbackService shows success.

### 9.5 Phase 2 prompt capture flow

1. User scrolls to Phase 2 section on ProjectDetailPage.
1. Empty state: â€œAdd your Phase 2 prompt.â€
1. User clicks to edit â†’ textarea appears.
1. User enters prompt text â†’ clicks save.
1. ProjectRepository updates `phase2Prompt` on the Project record.
1. FeedbackService shows success.

### 9.6 Project resume flow

1. User opens app â†’ ProjectListPage loads all projects from IndexedDB, sorted by `updatedAt` descending.
1. User clicks a project â†’ Router navigates to ProjectDetailPage.
1. ProjectDetailPage loads full project record + Phase 1 items (filtered, sorted).
1. Page renders all sections. Filled sections show data with clickable links. Empty sections show clear empty states.
1. The first unfilled section is visually emphasized as the suggested next action.
1. User clicks any saved external URL â†’ opens in new tab.

-----

## 10. Interfaces and Integration Points

### UI-to-data interface

All data access flows through `ProjectRepository`. UI components never touch IndexedDB directly.

```
ProjectListPage â”€â”€â”
ProjectDetailPage â”€â”¤â”€â”€â–¶ ProjectRepository â”€â”€â–¶ IndexedDB
Phase1Module â”€â”€â”€â”€â”€â”€â”¤
Phase2Module â”€â”€â”€â”€â”€â”€â”˜
```

### ProjectRepository interface (TypeScript-style)

```typescript
// Projects
getAllProjects(): Promise<Result<Project[]>>
getProject(id: string): Promise<Result<Project>>
createProject(name: string): Promise<Result<Project>>
updateProject(id: string, fields: Partial<Project>): Promise<Result<Project>>

// Phase 1 Items
getPhase1Items(projectId: string): Promise<Result<Phase1Item[]>>  // returns non-deleted, sorted
createPhase1Item(projectId: string, promptText: string): Promise<Result<Phase1Item>>
updatePhase1Item(id: string, fields: Partial<Phase1Item>): Promise<Result<Phase1Item>>
deletePhase1Item(id: string): Promise<Result<void>>  // soft-delete
```

### Result type

```typescript
type Result<T> = { success: true; data: T } | { success: false; error: string }
```

### Validation boundary

Validation runs in the UI layer **before** calling ProjectRepository. ProjectRepository does not duplicate validation but does enforce sequence number assignment.

### External links

All external URLs (research Space link, kickoff thread, conversation URLs, artifact URLs) are rendered as `<a href="..." target="_blank" rel="noopener noreferrer">`. No API calls to external services.

-----

## 11. Security and Privacy

- **Data sensitivity:** User-entered prompts may contain proprietary research content. Data stays in the userâ€™s browser (IndexedDB), never transmitted to any server.
- **Access model:** No product-level auth. If deployed as a static site, platform-level protection (Vercel password, Netlify identity, or HTTP basic auth) is sufficient for MVP.
- **XSS:** Prompt text stored as raw strings, rendered with Reactâ€™s default escaping. No `dangerouslySetInnerHTML` unless markdown rendering is added (in which case, use a sanitizer like DOMPurify).
- **External link safety:** All external links use `rel="noopener noreferrer"`.
- **No telemetry or analytics in MVP.**

-----

## 12. Reliability and Operational Considerations

### Persistence and recovery

- IndexedDB is durable across browser sessions but is tied to a single browser/profile.
- **Risk:** Clearing browser data destroys all projects. Mitigation: recommend (and optionally implement) a JSON export button.
- IndexedDB writes are transactional; partial writes are rolled back automatically.

### Error handling

- All ProjectRepository methods return `Result<T>`, never throw. UI modules pattern-match on success/failure.
- Unhandled exceptions caught by React error boundary at root level, which shows a recovery message.
- ErrorLogger captures failed saves, validation errors, and uncaught exceptions.

### Deployment/hosting

- Static SPA deployed to Vercel, Netlify, or GitHub Pages.
- Single `index.html` + JS/CSS bundle. No server process.
- CI: optional GitHub Actions pipeline for build + deploy.

### Observability/logging

- `console.error` for all error paths.
- Optional: IndexedDB `errorLog` store for post-session review.
- No remote logging for MVP.

-----

## 13. Scalability and Extensibility

### Sufficient for MVP

- IndexedDB handles hundreds of projects and thousands of Phase 1 items without performance issues.
- No concurrent users, no write conflicts.

### Intentionally simple

- No server, no API, no database migration tooling.
- No real-time sync, no offline-first complexity (the app is inherently offline-capable since itâ€™s all local).

### Safe extension points

- **Backend migration:** ProjectRepository is the sole data access layer. Swapping IndexedDB for REST API calls requires changes only in this module.
- **Data export/import:** Add JSON serialization methods to ProjectRepository.
- **Markdown rendering:** Add a rendering component that consumes raw prompt text; no data model changes needed.
- **Templates:** Add a `templates` object store and a template selection step in project creation.
- **Multi-device sync:** Introduce a backend + account system; ProjectRepository becomes an API client.

-----

## 14. Risks

|Risk                                 |Impact                                                             |Mitigation                                                                                                                                                               |
|-------------------------------------|-------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|**Sequence corruption**              |Phase 2 references become unreliable; core value destroyed.        |Sequence number derived from `max(all items including deleted) + 1`. Number is immutable after creation. Soft-delete ensures no number reuse. Covered by automated tests.|
|**Browser data loss**                |All projects lost if user clears browser data or switches browsers.|Warn user in UI. Implement optional JSON export. Document limitation.                                                                                                    |
|**Scope creep**                      |MVP becomes unshippable in a weekend.                              |Strict module boundaries. Every feature gated against PRD scope list.                                                                                                    |
|**Progressive disclosure complexity**|Over-engineered conditional UI becomes buggy and slow to build.    |Simple rule: first empty section is expanded; all others collapsed with edit buttons. No smart inference.                                                                |
|**IndexedDB browser support**        |Rare edge cases in Safari private browsing.                        |IndexedDB is supported in all modern browsers. Safari private browsing limits storage but does not block it as of 2024+. Acceptable for MVP.                             |
|**Capture friction**                 |If adding a Phase 1 block takes >20 seconds, user abandons tool.   |Minimal form: single textarea + save button. No required metadata on initial add. URLs added as optional second step.                                                    |

-----

## 15. Recommended Implementation Sequence

|Order|Component                     |Depends on                          |Deliverable                                                                                        |
|-----|------------------------------|------------------------------------|---------------------------------------------------------------------------------------------------|
|1    |Data model + ProjectRepository|â€”                                   |IndexedDB schema, all CRUD methods, Result types, sequence number logic. Testable in isolation.    |
|2    |ValidationService             |â€”                                   |Pure functions for name, URL, prompt text validation. Unit tested.                                 |
|3    |Router + page shells          |â€”                                   |React Router with `/` (list) and `/project/:id` (detail) routes. Empty page components.            |
|4    |ProjectListPage               |ProjectRepository                   |List projects, create project, navigate to detail.                                                 |
|5    |ProjectDetailPage scaffold    |ProjectRepository                   |Load and display project header fields (name, original prompt, kickoff URL). Inline editing + save.|
|6    |Phase1Module                  |ProjectRepository, ValidationService|Add, display, edit, soft-delete Phase 1 items with correct sequencing.                             |
|7    |Phase2Module                  |ProjectRepository                   |Edit and display Phase 2 prompt.                                                                   |
|8    |FeedbackService               |â€”                                   |Toast/notification system wired into all save paths.                                               |
|9    |Progressive disclosure polish |All above                           |Emphasize next action, collapse filled sections, empty states.                                     |
|10   |ErrorLogger + error boundary  |â€”                                   |Console logging, React error boundary, optional persisted error log.                               |
|11   |Final polish                  |All above                           |Mobile responsiveness, visual refinement, manual QA against success metrics.                       |

-----

## 16. Appendix: Mapping to PRD Scope

|PRD Requirement                                     |Architecture Coverage                                  |
|----------------------------------------------------|-------------------------------------------------------|
|Project list page                                   |ProjectListPage (7.1)                                  |
|Project detail page                                 |ProjectDetailPage (7.2)                                |
|Create/view/edit/persist projects                   |ProjectRepository (7.5) + ProjectDetailPage            |
|Original deep-research prompt storage               |Field on Project entity                                |
|Fixed research Space link display                   |Hardcoded constant rendered in ProjectDetailPage       |
|Kickoff thread URL capture                          |Field on Project entity, validated by ValidationService|
|Ordered immutable Phase 1 list with auto-numbering  |Phase1Module (7.3) + sequence rules in data model (Â§8) |
|Separate Phase 2 prompt section                     |Phase2Module (7.4) + field on Project entity           |
|Optional conversation/artifact URLs per Phase 1 item|Fields on Phase1Item entity                            |
|Validation, save feedback, error states             |ValidationService (7.6) + FeedbackService (7.7)        |
|Minimal troubleshooting logs                        |ErrorLogger (7.8)                                      |
|Single-user, no integrations                        |No auth module, no API clients                         |
|Data persistence between sessions                   |IndexedDB via ProjectRepository                        |
|Progressive disclosure                              |UI logic in ProjectDetailPage (Â§9.6)                   |
|External links open in new tab                      |`target="_blank"` on all external URL renders          |

### Explicitly out of scope (per PRD)

- Prompt parsing or automatic block splitting
- Integrations with any external tools
- Artifact upload/hosting/sync
- Statuses, analytics, dashboards, reporting
- Templates and workflow presets
- Drag-and-drop reordering or manual renumbering
- Multi-user collaboration, comments, sharing
- Billing, subscriptions, admin
- Search across project contents
- Automation of prompt launching or thread discovery

