### Epic E4: Project Detail â€” Header Fields

- **Objective:** Build the primary workspace page and make header-level project fields editable.
- **Included scope:** ProjectDetailPage loads project by ID, displays/edits project name, original deep-research prompt (textarea), fixed research Space link (read-only, clickable), kickoff thread URL (editable, validated, clickable). Inline edit/save pattern with feedback. Save success/failure toasts wired.
- **Excluded scope:** Phase 1 list, Phase 2 prompt, progressive disclosure polish.
- **Dependencies:** E1 (repository), E2 (validation + feedback), E3 (routing).
- **Main risks:** Getting the inline-edit save pattern right; this pattern is reused everywhere.
- **Done definition:** User can open a project, see/edit header fields, save changes with feedback, click external links in new tab.

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

