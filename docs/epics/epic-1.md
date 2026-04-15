### Epic E1: Data Model & Repository

- **Objective:** Establish the persistence layer so all UI work has a stable data foundation.
- **Included scope:** IndexedDB database creation (`phaseboard`), `projects` and `phase1Items` object stores, all ProjectRepository CRUD methods, Result type, sequence number assignment logic (`max + 1` including soft-deleted), soft-delete implementation, sorted/filtered retrieval of Phase 1 items.
- **Excluded scope:** UI components, validation logic, feedback/toast system, markdown rendering.
- **Dependencies:** None â€” pure data layer.
- **Main risks:** Sequence number logic errors could corrupt the core invariant. Must be unit-tested before any UI depends on it.
- **Done definition:** All ProjectRepository methods implemented and passing unit tests. Sequence integrity verified for add, delete, re-add scenarios.

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

