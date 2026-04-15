# PRD

## Product

**Name:** Phaseboard  
**Type:** Web app / single-user micro-SaaS MVP

## Goals

- Let a user create a project record for an AI research run so they can stop losing track of prompts, threads, and artifacts.
- Let a user preserve the exact order of Phase 1 prompt blocks so later Phase 2 work can reference them reliably.
- Let a user reopen any project and jump back into the right thread or next action within seconds.
- Let the product stay simple enough to build and ship in a weekend without integrations or automation overhead.

## Background

The product addresses a repeated workflow problem in AI-assisted research and product discovery. The user starts with a deep-research prompt, launches a kickoff conversation in a research Space, receives multiple Phase 1 prompt blocks plus a Phase 2 prompt, and then manually executes those prompts across external AI tools. Over time, the user loses track of where each conversation happened, which prompt produced which artifact, and how Phase 2 should map back to the original Phase 1 order.

This MVP is intentionally narrow. It prioritizes fast manual capture, stable sequence tracking, and instant project resumption. It does not attempt automation, smart parsing, file syncing, analytics, or integrations. Scope must stay tight because adding nonessential features is a common way MVPs become slower to ship and weaker at validating the core workflow [web:57][web:61][web:68].

## Users

- Solo builders who use AI research workflows to explore, validate, and scope product ideas.
- AI-heavy indie hackers who run multi-step prompt workflows across several chat tools.
- Product-minded founders who need to preserve prompt-to-artifact lineage inside one project.
- Individual researchers or developers who want a resumable project memory board instead of scattered chat history.

## User Stories

1. As a solo builder, I want to create a project with a name and source prompt, so I can anchor all later work to one project record.
2. As an AI-heavy researcher, I want to save the kickoff thread URL, so I can return to the original research conversation without searching through chat history.
3. As a user running Phase 1 prompts, I want to add prompt blocks one at a time in immutable order, so I can preserve the exact sequence Phase 2 depends on.
4. As a user continuing the workflow later, I want to attach conversation links and artifact links to each Phase 1 item, so I can reopen the right resources quickly.
5. As a user preparing Phase 2, I want a separate Phase 2 prompt section, so I can keep downstream synthesis distinct from the ordered Phase 1 list.

## Functional Requirements

- The system must let the user create a new project with at least a project name.
- The system must allow the user to save an original deep-research prompt as freeform text or markdown within the project.
- The system must display a fixed research Space link on every project.
- The system must allow the user to save one kickoff thread URL for the project.
- The system must provide a dedicated Phase 1 section for repeated prompt-block entry.
- The system must allow the user to add one Phase 1 prompt block at a time as raw markdown or plain text.
- The system must assign each new Phase 1 prompt block the next sequence number automatically based on entry order.
- The system must preserve Phase 1 order exactly as entered.
- The system must not support drag-and-drop reordering of Phase 1 items.
- The system must not support manual renumbering of Phase 1 items.
- The system must allow deletion of a Phase 1 item.
- The system must define and implement one clear deletion policy for ordered items; the chosen policy must preserve the userâ€™s ability to trust prompt-to-artifact references.
- The system must allow each Phase 1 item to store an optional conversation URL.
- The system must allow each Phase 1 item to store an optional artifact URL.
- The system must provide a separate Phase 2 section that stores one Phase 2 prompt block outside the Phase 1 list.
- The system must keep Phase 2 visually and structurally separate from Phase 1.
- The system must show all saved project data on a single project detail page without requiring navigation across multiple subpages.
- The system must allow the user to edit project name, original prompt, kickoff thread URL, Phase 1 prompt content, optional links, and Phase 2 prompt content.
- The system must provide clear empty states for projects with missing inputs.
- The system must make the next manual action obvious on the project detail page; progressive disclosure should be used so the user sees the next relevant input without facing an oversized, all-at-once form [web:85][web:86].
- The system must persist project data between sessions.
- The system must show explicit success feedback after save operations.
- The system must show explicit failure feedback when a save fails or a required field is missing.
- The system must validate URL fields and reject obviously malformed URLs with a clear message.
- The system must allow the user to open saved external links in a new browser tab.
- The system must support a project list page that shows existing projects and allows creation of a new project.
- The system must support a project detail page as the primary workspace for capture and resumption.
- The MVP must be single-user only.
- The MVP must not require integrations with Perplexity, Claude, Cursor, Google Drive, or iCloud.
- The MVP must not require collaboration, roles, or team permissions.
- The system should record basic application errors for troubleshooting, at minimum for failed saves and invalid data submissions.
- If deployed publicly, access protection may be handled at the deployment layer; product-level multi-user authentication is not required for MVP.

## Non-functional Requirements

- Initial load for the project list and project detail pages should feel near-instant under typical conditions, with a target of under 2 seconds on a normal broadband connection.
- Save actions for common edits should complete with visible confirmation in under 1 second under typical conditions.
- The UI must be usable without training and should make the next step obvious at all times.
- Error messages must be specific, short, and actionable.
- The product must preserve data integrity for Phase 1 ordering across reloads and edits.
- The product must remain operational without third-party API dependencies.
- Deployment and maintenance overhead should stay low enough for a single developer to run the product.
- The data model should remain simple and extensible enough to support future additions such as templates or lightweight integrations without requiring a full rewrite.
- User-entered prompt content and links must be stored securely and should not be exposed to other users.
- The product should be mobile-usable for quick reference, but desktop is the primary target for MVP.

## Success Metrics

- Project creation success rate: percentage of attempts that result in a saved project, target: 95% or higher.
- Resume speed: median time from opening an existing project to clicking the correct external thread or next-action link, target: under 10 seconds.
- Capture speed: median time to add and save a new Phase 1 block, target: under 20 seconds.
- Order integrity: percentage of test sessions in which Phase 1 numbering remains correct after adds, edits, reloads, and deletions, target: 100%.
- Core workflow completion: percentage of test projects where a user can complete project setup, save at least one Phase 1 item, and save a Phase 2 block without assistance, target: 90% or higher.

## MVP Scope

### In scope

- Project list page.
- Project detail page.
- Create, view, edit, and persist projects.
- Original deep-research prompt storage.
- Fixed research Space link display.
- Kickoff thread URL capture.
- Ordered immutable Phase 1 list with auto-numbering.
- Separate Phase 2 prompt section.
- Optional conversation URL and artifact URL per Phase 1 item.
- Basic validation, save feedback, error states, and minimal troubleshooting logs.

### Out of scope

- Prompt parsing or automatic block splitting.
- Any direct integrations with AI tools or cloud storage tools.
- Artifact upload, hosting, publishing, or sync.
- Statuses, analytics, dashboards, and reporting.
- Templates and reusable workflow presets.
- Drag-and-drop reordering or manual renumbering.
- Multi-user collaboration, comments, shared workspaces, and roles.
- Billing, subscriptions, and admin back office.
- Search across project contents beyond basic page browsing.
- Automation of prompt launching or thread discovery.

## Risks

- Scope creep: adding templates, automation, or integrations could delay delivery and weaken validation of the core use case [web:57][web:61][web:68].
- Sequence corruption: if ordering logic breaks during deletion, editing, or persistence, the product loses its primary value because Phase 2 references become unreliable.
- Habit failure: if capture feels slower than the userâ€™s current manual workaround, the user will stop updating the tracker during real work.
- Storage/design mismatch: if the deletion policy for immutable ordering is unclear, users may lose trust in whether Prompt 1 still maps to Artifact 1.

## Epics

1. Project creation and persistence
2. Project detail workspace
3. Ordered Phase 1 capture and immutable sequencing
4. Phase 2 checkpoint and link attachment
5. Validation, error handling, and lightweight observability

Sources

- Scope discipline and MVP feature reduction guidance informed the PRD boundaries and risk framing [web:57][web:61][web:68].
- Progressive disclosure guidance informed the recommended input flow for repeated prompt capture [web:85][web:86].

