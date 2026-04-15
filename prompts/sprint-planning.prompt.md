Update the dev agent backlog by adding every user story found in `docs/epics/epic-*.md` to `dev-status.yaml`.

## Objective
Read all epic files matching `docs/epics/epic-*.md`, extract each user story, and add it to `dev-status.yaml` so the dev agent can later work through them.

## Requirements
- Update the existing `dev-status.yaml` file in place.
- Add one `stories` entry for each user story found in the epic files.
- For each story, populate:
  - `id`: the story ID/key from the epic file
  - `title`: the story title from the epic file
  - `status`: `"Draft"`
  - `epic_file`: the path to the source epic file
  - `plan`: an empty array
- Do **not** populate any `task` items inside `plan`.
- Do **not** invent, summarize, rewrite, or merge stories.
- Preserve existing YAML structure and unrelated fields.
- Avoid duplicate story entries if a story is already present.

## Expected YAML shape
```yaml
project: <existing project name>
last_updated: <update appropriately>

stories:
  - id: "<story id key>"
    title: "<story title>"
    status: "Draft"
    epic_file: "<path to the epic file>"
    plan: []
```

## Execution rules
1. Scan all files matching `docs/epics/epic-*.md`.
2. Extract every user story ID and title exactly as written.
3. Open `dev-status.yaml`.
4. Add any missing stories to the `stories` list.
5. Keep existing entries intact.
6. Leave every story's `plan` empty: `[]`.
7. Save the updated `dev-status.yaml`.

## Validation
Before finishing, verify:
- Every story from every `docs/epics/epic-*.md` file is present in `dev-status.yaml`.
- No `plan` contains any populated `task` items.
- No duplicate story IDs were introduced.
- YAML remains valid.

