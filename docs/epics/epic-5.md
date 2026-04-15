### Epic E5: Phase 1 Capture & Sequencing

- **Objective:** Deliver the core value â€” ordered, immutable Phase 1 prompt list with add, edit, soft-delete, and optional link attachment.
- **Included scope:** Phase1Module: display items in sequence order, â€œAdd Prompt Blockâ€ action (textarea + save), auto-sequence assignment, inline edit of prompt text / conversation URL / artifact URL, soft-delete with confirmation dialog, sequence gap display, URL validation, empty state.
- **Excluded scope:** Drag-and-drop, renumbering, any reordering affordance.
- **Dependencies:** E1 (repository sequence logic), E2 (validation + feedback), E4 (detail page scaffold).
- **Main risks:** **Sequence corruption is the highest-risk area.** Must verify: add â†’ delete â†’ add produces correct numbers; reload preserves order; soft-deleted itemsâ€™ numbers are never reused.
- **Done definition:** User can add multiple Phase 1 blocks, see correct auto-numbering, edit content/links, delete an item and see gap preserved, reload page and verify order integrity.

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


