### Epic E3: App Shell & Project List

- **Objective:** Get the app navigable and let the user create and browse projects.
- **Included scope:** Vite + React + Tailwind project scaffold, React Router with `/` and `/project/:id` routes, ProjectListPage (list projects sorted by `updatedAt` desc, create new project with name validation, empty state, navigate to detail).
- **Excluded scope:** Project detail page content (just an empty shell route).
- **Dependencies:** E1 (ProjectRepository for list/create operations).
- **Main risks:** Low.
- **Done definition:** User can open app, see project list (or empty state), create a project, and land on detail page shell.

#### Story E3-S1: Scaffold Vite + React + Tailwind Project

- **Goal:** Get the app buildable and runnable.
- **Description:** Initialize a Vite project with React and TypeScript. Install and configure Tailwind CSS. Install `idb` library. Set up the project structure with folders for pages, modules, services, and types. Verify `npm run dev` serves the app.
- **Relevant architecture area:** Architectural Approach (Â§5), stack decisions.
- **Dependencies:** None.
- **Acceptance criteria:**
  - `npm run dev` starts the app and renders a placeholder page.
  - Tailwind utility classes work in components.
  - `idb` is installed and importable.
  - TypeScript compiles without errors.

#### Story E3-S2: Set Up React Router with Page Shells

- **Goal:** Establish navigation between list and detail pages.
- **Description:** Install React Router. Create two routes: `/` â†’ ProjectListPage, `/project/:id` â†’ ProjectDetailPage. Both pages render shell components with placeholder content. Add a back-navigation link from detail to list.
- **Relevant architecture area:** Router + page shells (Â§15, order 3).
- **Dependencies:** E3-S1.
- **Acceptance criteria:**
  - Navigating to `/` renders ProjectListPage shell.
  - Navigating to `/project/some-id` renders ProjectDetailPage shell with the ID accessible from params.
  - Link from detail page navigates back to list.

#### Story E3-S3: Build ProjectListPage

- **Goal:** Let the user see all projects and create new ones.
- **Description:** Implement ProjectListPage: on mount, fetch all projects via `ProjectRepository.getAllProjects()` and display as a list (name + creation date), sorted by most recently updated. Provide a â€œNew Projectâ€ action: inline name input, validation via ValidationService, create via ProjectRepository, navigate to detail page on success. Show empty state when no projects exist (â€œNo projects yet. Create your first one.â€). Show feedback toasts for create success/failure.
- **Relevant architecture area:** ProjectListPage (Â§7.1), Interaction flow Â§9.1.
- **Dependencies:** E1-S2 (Project CRUD), E2-S1 (validation), E2-S2 (feedback).
- **Acceptance criteria:**
  - Empty state displays when no projects exist.
  - User can enter a name and create a project; validation rejects empty names.
  - After creation, app navigates to the new projectâ€™s detail page.
  - Project list shows existing projects sorted by `updatedAt` descending.
  - Success toast shown on project creation.
  - Error toast shown if creation fails.


