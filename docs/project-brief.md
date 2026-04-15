# Project Brief

## What I want

Build a very small web app for manually tracking a single AI research project from kickoff through Phase 1 and Phase 2.

The product exists to solve one concrete problem: when returning to a project, I want to instantly know:
- the original deep-research prompt,
- where the kickoff happened,
- the exact ordered list of Phase 1 prompts,
- the separate Phase 2 prompt,
- and any conversation or artifact links already attached.

The core requirement is sequence integrity. Phase 1 prompts must be stored in the exact order they were entered, with stable numbering that Phase 2 can reliably reference later.

This is a personal, single-user workflow tool. It is not a research automation platform, not a prompt generator, and not a knowledge base.

## Best version of what an MVP does

The MVP is a lightweight project tracker with two screens:
- a project list,
- and a project detail page.

A user can:
1. Create a project with a name.
2. Save the original deep-research prompt.
3. Open a fixed research Space link.
4. Paste back the kickoff thread URL.
5. Add Phase 1 prompt blocks one at a time into an immutable numbered list.
6. Save one separate Phase 2 prompt block.
7. Optionally attach, per Phase 1 item, a started conversation URL and an artifact link.
8. Reopen the project later and immediately jump back into the right place.

The MVP should bias toward fast manual capture, not automation. The best version is boring in a good way: low friction, no smart parsing, no background syncing, no hidden state.

The UI should use progressive disclosure so the next action stays obvious without turning the page into a giant form [web:85][web:86].

## What to exclude

Explicitly out of scope for MVP:
- Statuses.
- Analytics.
- Templates.
- Prompt parsing or automatic block splitting.
- Integrations with Perplexity, Claude, Cursor, Google Drive, or iCloud.
- Auto-import of conversations or files.
- Drag-and-drop reordering.
- Manual renumbering.
- Collaboration, teams, comments, or sharing workflows.
- Cross-project dashboards or reporting.
- Artifact publishing flows.
- Any â€œagent orchestrationâ€ behavior.

If a feature does not directly help the user resume a project and recover the ordered chain of prompts and links, it should not be built now.

## Main risks

The biggest product risk is scope creep. MVPs lose value quickly when they absorb nonessential features instead of protecting one tight user journey [web:57][web:61][web:68].

The biggest UX risk is turning a fast tracker into a flexible database. If the project page becomes over-structured, the user will avoid using it during real work and the product fails.

The biggest data risk is breaking order integrity. Phase 1 numbering is not cosmetic; it is the source-of-truth index that later maps Prompt 1 to Artifact 1, Prompt 2 to Artifact 2, and so on.

The biggest implementation risk is overengineering storage, auth, or integrations before validating the core workflow.

## Build brief

Build a private, single-user web app that acts as a manual project memory board for AI research runs.

Core structure:
- Project name.
- Original deep-research prompt.
- Fixed research Space link.
- Kickoff thread URL.
- Ordered Phase 1 list, auto-numbered in entry order and immutable.
- Separate Phase 2 prompt section.
- Optional per-item conversation URL.
- Optional per-item artifact URL.

Behavior rules:
- Phase 1 items are added one block at a time.
- Each new item gets the next sequence number automatically.
- Order cannot be edited or reordered.
- A Phase 1 item may be deleted, but remaining items should keep their original sequence labels unless a deliberate rebuild policy is defined in implementation.
- Phase 2 is a separate checkpoint, not part of the Phase 1 list.
- The project detail page should make the next action obvious at all times.

Product promise:
Open any project and instantly know what was run, in what order, where it happened, and what to open next.

