import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProject } from "@/data";
import type { Project } from "@/data";
import { useFeedbackContext } from "@/feedback";
import { RESEARCH_SPACE_URL } from "@/constants";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addError } = useFeedbackContext();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

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

      <h2 className="mt-4 text-2xl font-semibold text-gray-900">
        {project.name}
      </h2>

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