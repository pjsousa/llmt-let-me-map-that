### Epic E6: Phase 2 Prompt Section

- **Objective:** Complete the capture workflow with a separate Phase 2 prompt block.
- **Included scope:** Phase2Module: display Phase 2 prompt (or empty state), edit/save Phase 2 text, visual separation from Phase 1 (section header, divider).
- **Excluded scope:** Linking Phase 2 to specific Phase 1 items.
- **Dependencies:** E1 (repository â€” Phase 2 is a field on Project), E4 (detail page).
- **Main risks:** Low. Simple single-field edit.
- **Done definition:** User can add/edit a Phase 2 prompt, see it visually separate from Phase 1, and persist it across reloads.

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


