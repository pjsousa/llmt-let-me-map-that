import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getAllProjects, createProject } from "@/data";
import type { Project } from "@/data";
import { validateProjectName } from "@/validation";
import { useFeedbackContext } from "@/feedback";

export default function ProjectListPage() {
  const navigate = useNavigate();
  const { addSuccess, addError } = useFeedbackContext();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [validationError, setValidationError] = useState("");

  const fetchProjects = useCallback(async () => {
    const result = await getAllProjects();
    if (result.success) {
      setProjects(result.data);
      setLoading(false);
      setLoadError(false);
    } else {
      setLoading(false);
      setLoadError(true);
      addError(result.error);
    }
  }, [addError]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  async function handleCreateProject() {
    const trimmed = newProjectName.trim();
    const validation = validateProjectName(trimmed);
    if (!validation.valid) {
      setValidationError(validation.errors[0].message);
      return;
    }

    const result = await createProject(trimmed);
    if (result.success) {
      addSuccess("Project created");
      navigate(`/project/${result.data.id}`);
    } else {
      addError(result.error);
    }
  }

  function handleRetry() {
    setLoading(true);
    setLoadError(false);
    fetchProjects();
  }

  function handleNameChange(value: string) {
    setNewProjectName(value);
    if (validationError) {
      setValidationError("");
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>

      {loading && (
        <p className="mt-4 text-center text-gray-500">Loading…</p>
      )}

      {!loading && loadError && (
        <div className="mt-4">
          <p className="text-red-600">Failed to load projects.</p>
          <button
            type="button"
            onClick={handleRetry}
            className="mt-2 rounded bg-gray-900 px-4 py-2 text-white hover:bg-gray-800"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !loadError && projects.length === 0 && (
        <p className="mt-4 text-gray-500">
          No projects yet. Create your first one.
        </p>
      )}

      {!loading && !loadError && projects.length > 0 && (
        <ul className="mt-4 flex flex-col gap-2">
          {projects.map((project) => (
            <li key={project.id}>
              <Link
                to={`/project/${project.id}`}
                className="block rounded border border-gray-200 bg-white px-4 py-3 hover:bg-gray-50"
              >
                <span className="font-medium text-gray-900">
                  {project.name}
                </span>
                <span className="ml-2 text-sm text-gray-500">
                  {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900">New Project</h2>
        <div className="mt-2">
          <input
            type="text"
            value={newProjectName}
            onChange={(e) => handleNameChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreateProject();
            }}
            placeholder="Project name"
            className="rounded border border-gray-300 px-3 py-2"
          />
          {validationError && (
            <p className="mt-1 text-sm text-red-600">{validationError}</p>
          )}
        </div>
        <button
          type="button"
          onClick={handleCreateProject}
          className="mt-2 rounded bg-gray-900 px-4 py-2 text-white hover:bg-gray-800"
        >
          Create
        </button>
      </div>
    </div>
  );
}