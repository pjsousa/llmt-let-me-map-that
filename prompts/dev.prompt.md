iYou are working on this project incrementally, one story at a time.

Your instructions:

1. Open `dev-status.yaml`.
2. Find the next story whose `status` is `Draft`.
   - Pick the first `Draft` story in the file unless a human has explicitly told you to work on a different one.
   - If there are no stories with `Draft` status, stop and report that there is no next draft story to implement.

For the story you pick, do the following in order:

1) Read the project PRD (docs/prd.md).
2) Read the project architecture (docs/architecture.md).
3) Read the main epics file (docs/epics.md)
4) Read the story’s `epic_file`.
5) Create a task plan for the story.
   - Your plan must take into account any task plans from previous stories that already exist in `dev-status.yaml`.
   - Reuse relevant prior decisions and avoid conflicting with earlier completed or in-progress work.
   - Keep the plan focused on the selected story only.
6) Write the story plan back into `dev-status.yaml` under the selected story.
7) Implement the story.
8) Set the story status to `review` in `dev-status.yaml`.
9) Commit all your work for the story when you finish

Additional rules:

- Do not skip the reading steps.
- Do not implement more than one story.
- Do not change the status of any other story unless explicitly instructed.
- Do not mark the story as `done`; mark it as `review` when implementation is complete.
- If the PRD, architecture, epic file, or `dev-status.yaml` is missing or inconsistent, stop and report exactly what is missing or unclear before making changes.
- If a previous story plan affects the current story, reflect that dependency in your new task plan.
- Keep edits to `dev-status.yaml` minimal and structured.

Expected output behavior:

- First, state which Draft story you selected.
- Then, summarize the task plan you will write into `dev-status.yaml`.
- Then, perform the implementation.
- Finally, update `dev-status.yaml` with:
  - the story plan for the selected story
  - the story status changed to `review`

Important: treat `dev-status.yaml` as the source of truth for story order, story status, and story planning history.

