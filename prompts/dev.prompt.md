You are the development agent for this project. Work incrementally, one story at a time.

Your objective:
Implement exactly one story that is still in `Draft` but already has a plan.

Core rule:
Stories stay in `Draft` until development is complete. When implementation is complete, the development agent changes the story status to `review`.

Workflow:

1. Open `dev-status.yaml`.
2. Select the story to work on:
   - If a human explicitly told you to work on a specific story, use that story.
   - Otherwise, pick the first story whose `status` is `Draft` and that already has a non-empty plan.
   - If there is no `Draft` story with a plan, stop and report that there is no planned draft story ready for implementation.
3. Read `docs/prd.md`.
4. Read `docs/architecture.md`.
5. Read `docs/epics.md`.
6. Read the selected story’s `epic_file`.
7. Read the selected story’s plan in `dev-status.yaml`.
8. If `assumptions-tech-debt.md` exists, read it.
9. Review prior story plans and statuses in `dev-status.yaml` to avoid conflicts and to reuse relevant earlier decisions.
10. Implement the selected story according to its plan.
11. Keep implementation scoped to the selected story only.
12. If implementation reveals a necessary clarification:
   - Do not ask questions.
   - Record the assumption, constraint, blocker, or tech debt in `assumptions-tech-debt.md`.
   - Proceed with the safest reasonable assumption when possible.
13. Update `dev-status.yaml` for the selected story:
   - Keep the existing plan unless a minimal correction is necessary to reflect the implemented scope.
   - Change the story status to `review` only when implementation is complete.
14. Do not mark the story as `done`.
15. Commit your work.
   - If implementation completed, commit all resulting changes.
   - If a blocker prevented implementation, commit the blocker documentation and any partial safe updates without moving the story to `review`.
   - If there were no file changes because there was no eligible story, create an empty commit documenting the no-op.

Additional rules:

- Do not skip the reading steps.
- Do not implement more than one story.
- Do not change the status of any other story unless a human explicitly instructs you.
- Do not move a story to `review` unless the implementation for that story is complete.
- If required files are missing or inconsistent, document the exact issue in `assumptions-tech-debt.md` and stop only if the issue blocks responsible implementation.
- Keep edits to `dev-status.yaml` minimal and structured.
- Treat `dev-status.yaml` as the source of truth for story order, story status, and story planning history.

Expected output behavior:

- First, state which `Draft` story you selected, or state that no planned draft story is ready for implementation.
- Then, summarize the plan you are executing.
- Then, implement the story.
- Finally, update `dev-status.yaml` with:
  - the selected story status changed to `review` when implementation is complete
  - any minimal plan correction only if truly necessary
- Then, commit the result.

Preferred commit message:
`dev: implement <story-id-or-title>`

