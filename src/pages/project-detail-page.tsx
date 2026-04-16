import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProject, updateProject } from "@/data";
import type { Project } from "@/data";
import { useFeedbackContext } from "@/feedback";
import { validateProjectName } from "@/validation";
import { RESEARCH_SPACE_URL } from "@/constants";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addSuccess, addError } = useFeedbackContext();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [nameValidationError, setNameValidationError] = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (id === undefined) {
      navigate("/", { replace: true });
      addError("Invalid project ID");
      return;
    }

    let cancelled = false;

    (async () => {
      const result = await getProject(id);
      if (cancelled) return;

      if (result.success) {
        setProject(result.data);
        setLoading(false);
      } else {
        navigate("/", { replace: true });
        addError(result.error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, navigate, addError]);

  const handleStartEditName = () => {
    setNameDraft(project!.name);
    setEditingName(true);
    setNameValidationError("");
  };

  const handleSaveName = async () => {
    const trimmed = nameDraft.trim();
    const validation = validateProjectName(trimmed);
    if (!validation.valid) {
      setNameValidationError(validation.errors[0].message);
      return;
    }
    const result = await updateProject(project!.id, { name: trimmed });
    if (result.success) {
      setProject(result.data);
      setEditingName(false);
      addSuccess("Project name updated");
    } else {
      addError(result.error);
    }
  };

  const handleCancelEditName = () => {
    setEditingName(false);
    setNameValidationError("");
    setNameDraft("");
  };

  useEffect(() => {
    if (editingName && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [editingName]);

  if (loading) {
    return (
      <div className="py-12 text-center text-gray-500">Loading…</div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div>
      <a href="/" className="text-blue-600 hover:underline">
        &larr; Back to projects
      </a>

      {editingName ? (
        <div className="mt-4">
          <input
            ref={nameInputRef}
            type="text"
            value={nameDraft}
            onChange={(e) => {
              setNameDraft(e.target.value);
              setNameValidationError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveName();
              if (e.key === "Escape") handleCancelEditName();
            }}
            className="border border-gray-300 rounded px-3 py-2 text-gray-900 text-2xl font-semibold w-full"
          />
          {nameValidationError && (
            <p className="mt-1 text-sm text-red-600">{nameValidationError}</p>
          )}
          <div className="mt-2 flex gap-2">
            <button
              onClick={handleSaveName}
              className="bg-gray-900 text-white rounded px-4 py-2 hover:bg-gray-800"
            >
              Save
            </button>
            <button
              onClick={handleCancelEditName}
              className="border border-gray-300 rounded px-4 py-2 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <h2 className="mt-4 text-2xl font-semibold text-gray-900">
          {project.name}
          <button
            onClick={handleStartEditName}
            className="ml-3 text-sm text-blue-600 hover:underline font-normal"
          >
            Edit
          </button>
        </h2>
      )}

      <section className="mt-6">
        <h3 className="text-lg font-medium text-gray-900">Original Prompt</h3>
        {project.originalPrompt ? (
          <div className="mt-2 whitespace-pre-wrap text-gray-700">
            {project.originalPrompt}
          </div>
        ) : (
          <p className="mt-2 italic text-gray-400">
            No original prompt yet.
          </p>
        )}
      </section>

      <section className="mt-6">
        <h3 className="text-lg font-medium text-gray-900">Research Space</h3>
        <a
          href={RESEARCH_SPACE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-blue-600 hover:underline"
        >
          {RESEARCH_SPACE_URL}
        </a>
      </section>

      <section className="mt-6">
        <h3 className="text-lg font-medium text-gray-900">Kickoff Thread</h3>
        {project.kickoffThreadUrl ? (
          <a
            href={project.kickoffThreadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-blue-600 hover:underline"
          >
            {project.kickoffThreadUrl}
          </a>
        ) : (
          <p className="mt-2 italic text-gray-400">
            No kickoff thread URL yet.
          </p>
        )}
      </section>
    </div>
  );
}