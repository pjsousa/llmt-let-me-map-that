import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProject, updateProject, getPhase1Items, createPhase1Item, updatePhase1Item, deletePhase1Item } from "@/data";
import type { Project, Phase1Item } from "@/data";
import { useFeedbackContext } from "@/feedback";
import { validateProjectName, validatePromptText, validateUrl } from "@/validation";
import { RESEARCH_SPACE_URL } from "@/constants";

type SectionId = "name" | "originalPrompt" | "kickoffThreadUrl" | "phase1" | "phase2";

function isSectionFilled(sectionId: SectionId, project: Project, items: Phase1Item[]): boolean {
  switch (sectionId) {
    case "name":
      return true;
    case "originalPrompt":
      return !!project.originalPrompt;
    case "kickoffThreadUrl":
      return !!project.kickoffThreadUrl;
    case "phase1":
      return items.length > 0;
    case "phase2":
      return !!project.phase2Prompt;
  }
}

function getFirstUnfilledSection(project: Project, items: Phase1Item[]): SectionId | null {
  const sections: SectionId[] = ["name", "originalPrompt", "kickoffThreadUrl", "phase1", "phase2"];
  for (const section of sections) {
    if (!isSectionFilled(section, project, items)) {
      return section;
    }
  }
  return null;
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "…";
}

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

  const [editingPrompt, setEditingPrompt] = useState(false);
  const [promptDraft, setPromptDraft] = useState("");
  const [promptValidationError, setPromptValidationError] = useState("");
  const promptTextareaRef = useRef<HTMLTextAreaElement>(null);

  const [editingUrl, setEditingUrl] = useState(false);
  const [urlDraft, setUrlDraft] = useState("");
  const [urlValidationError, setUrlValidationError] = useState("");
  const urlInputRef = useRef<HTMLInputElement>(null);

  const [items, setItems] = useState<Phase1Item[]>([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [itemsError, setItemsError] = useState(false);

  const [addingPrompt, setAddingPrompt] = useState(false);
  const [newPromptText, setNewPromptText] = useState("");
  const [newPromptValidationError, setNewPromptValidationError] = useState("");
  const newPromptTextareaRef = useRef<HTMLTextAreaElement>(null);

  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editPromptDraft, setEditPromptDraft] = useState("");
  const [editConversationUrlDraft, setEditConversationUrlDraft] = useState("");
  const [editArtifactUrlDraft, setEditArtifactUrlDraft] = useState("");
  const [editPromptValidationError, setEditPromptValidationError] = useState("");
  const [editConversationUrlValidationError, setEditConversationUrlValidationError] = useState("");
  const [editArtifactUrlValidationError, setEditArtifactUrlValidationError] = useState("");
  const editItemPromptRef = useRef<HTMLTextAreaElement>(null);

  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  const [editingPhase2, setEditingPhase2] = useState(false);
  const [phase2Draft, setPhase2Draft] = useState("");
  const [phase2ValidationError, setPhase2ValidationError] = useState("");
  const phase2TextareaRef = useRef<HTMLTextAreaElement>(null);

  const [expandedSection, setExpandedSection] = useState<SectionId | null>(null);

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

  const refreshItems = useCallback(async () => {
    if (!project) return;
    const result = await getPhase1Items(project.id);
    if (result.success) {
      setItems(result.data);
    } else {
      addError(result.error);
    }
  }, [project, addError]);

  useEffect(() => {
    if (!project) return;

    let cancelled = false;

    (async () => {
      const result = await getPhase1Items(project.id);
      if (cancelled) return;

      if (result.success) {
        setItems(result.data);
        setItemsLoading(false);
      } else {
        setItemsLoading(false);
        setItemsError(true);
        addError(result.error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [project, addError]);

  const effectiveExpandedSection: SectionId = useMemo(() => {
    if (editingName) return "name";
    if (editingPrompt) return "originalPrompt";
    if (editingUrl) return "kickoffThreadUrl";
    if (addingPrompt || editingItemId || deletingItemId) return "phase1";
    if (editingPhase2) return "phase2";
    if (expandedSection !== null) return expandedSection;
    if (project) {
      const first = getFirstUnfilledSection(project, items);
      if (first !== null) return first;
    }
    return "phase2";
  }, [editingName, editingPrompt, editingUrl, addingPrompt, editingItemId, deletingItemId, editingPhase2, expandedSection, project, items]);

  const autoExpandedSection = useMemo(() => {
    if (expandedSection !== null) return null;
    if (!project) return null;
    return getFirstUnfilledSection(project, items);
  }, [expandedSection, project, items]);

  const handleStartEditName = () => {
    setNameDraft(project!.name);
    setEditingName(true);
    setNameValidationError("");
    setExpandedSection("name");
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
      setExpandedSection(null);
      addSuccess("Project name updated");
    } else {
      addError(result.error);
    }
  };

  const handleCancelEditName = () => {
    setEditingName(false);
    setNameValidationError("");
    setNameDraft("");
    setExpandedSection(null);
  };

  const handleStartEditPrompt = () => {
    setPromptDraft(project!.originalPrompt ?? "");
    setEditingPrompt(true);
    setPromptValidationError("");
    setExpandedSection("originalPrompt");
  };

  const handleSavePrompt = async () => {
    const trimmed = promptDraft.trim();
    const validation = validatePromptText(trimmed);
    if (!validation.valid) {
      setPromptValidationError(validation.errors[0].message);
      return;
    }
    const result = await updateProject(project!.id, {
      originalPrompt: trimmed,
    });
    if (result.success) {
      setProject(result.data);
      setEditingPrompt(false);
      setExpandedSection(null);
      addSuccess("Original prompt saved");
    } else {
      addError(result.error);
    }
  };

  const handleCancelEditPrompt = () => {
    setEditingPrompt(false);
    setPromptValidationError("");
    setPromptDraft("");
    setExpandedSection(null);
  };

  const handleStartEditUrl = () => {
    setUrlDraft(project!.kickoffThreadUrl ?? "");
    setEditingUrl(true);
    setUrlValidationError("");
    setExpandedSection("kickoffThreadUrl");
  };

  const handleSaveUrl = async () => {
    const trimmed = urlDraft.trim();
    const validation = validateUrl(trimmed);
    if (!validation.valid) {
      setUrlValidationError(validation.errors[0].message);
      return;
    }
    const result = await updateProject(project!.id, {
      kickoffThreadUrl: trimmed,
    });
    if (result.success) {
      setProject(result.data);
      setEditingUrl(false);
      setExpandedSection(null);
      addSuccess("Kickoff thread URL saved");
    } else {
      addError(result.error);
    }
  };

  const handleCancelEditUrl = () => {
    setEditingUrl(false);
    setUrlValidationError("");
    setUrlDraft("");
    setExpandedSection(null);
  };

  const handleStartAddPrompt = () => {
    setAddingPrompt(true);
    setNewPromptText("");
    setNewPromptValidationError("");
    setExpandedSection("phase1");
  };

  const handleSaveNewPrompt = async () => {
    const trimmed = newPromptText.trim();
    const validation = validatePromptText(trimmed);
    if (!validation.valid) {
      setNewPromptValidationError(validation.errors[0].message);
      return;
    }
    const result = await createPhase1Item(project!.id, trimmed);
    if (result.success) {
      addSuccess("Prompt block added");
      await refreshItems();
      setAddingPrompt(false);
      setNewPromptText("");
      setNewPromptValidationError("");
      setExpandedSection(null);
    } else {
      addError(result.error);
    }
  };

  const handleCancelAddPrompt = () => {
    setAddingPrompt(false);
    setNewPromptText("");
    setNewPromptValidationError("");
    setExpandedSection(null);
  };

  const handleStartEditItem = (item: Phase1Item) => {
    setEditingItemId(item.id);
    setEditPromptDraft(item.promptText);
    setEditConversationUrlDraft(item.conversationUrl);
    setEditArtifactUrlDraft(item.artifactUrl);
    setEditPromptValidationError("");
    setEditConversationUrlValidationError("");
    setEditArtifactUrlValidationError("");
    setExpandedSection("phase1");
  };

  const handleSaveEditItem = async () => {
    const trimmedPrompt = editPromptDraft.trim();
    const trimmedConvUrl = editConversationUrlDraft.trim();
    const trimmedArtUrl = editArtifactUrlDraft.trim();

    const promptValidation = validatePromptText(trimmedPrompt);
    if (!promptValidation.valid) {
      setEditPromptValidationError(promptValidation.errors[0].message);
      return;
    }

    const convUrlValidation = validateUrl(trimmedConvUrl);
    if (!convUrlValidation.valid) {
      setEditConversationUrlValidationError(convUrlValidation.errors[0].message);
      return;
    }

    const artUrlValidation = validateUrl(trimmedArtUrl);
    if (!artUrlValidation.valid) {
      setEditArtifactUrlValidationError(artUrlValidation.errors[0].message);
      return;
    }

    const result = await updatePhase1Item(editingItemId!, {
      promptText: trimmedPrompt,
      conversationUrl: trimmedConvUrl,
      artifactUrl: trimmedArtUrl,
    });

    if (result.success) {
      addSuccess("Prompt block updated");
      await refreshItems();
      setEditingItemId(null);
      setEditPromptDraft("");
      setEditConversationUrlDraft("");
      setEditArtifactUrlDraft("");
      setEditPromptValidationError("");
      setEditConversationUrlValidationError("");
      setEditArtifactUrlValidationError("");
      setExpandedSection(null);
    } else {
      addError(result.error);
    }
  };

  const handleCancelEditItem = () => {
    setEditingItemId(null);
    setEditPromptDraft("");
    setEditConversationUrlDraft("");
    setEditArtifactUrlDraft("");
    setEditPromptValidationError("");
    setEditConversationUrlValidationError("");
    setEditArtifactUrlValidationError("");
    setExpandedSection(null);
  };

  const handleStartDelete = (item: Phase1Item) => {
    setDeletingItemId(item.id);
    setExpandedSection("phase1");
  };

  const handleConfirmDelete = async () => {
    const result = await deletePhase1Item(deletingItemId!);
    if (result.success) {
      addSuccess("Prompt block deleted");
      await refreshItems();
      setDeletingItemId(null);
      setExpandedSection(null);
    } else {
      addError(result.error);
    }
  };

  const handleCancelDelete = () => {
    setDeletingItemId(null);
    setExpandedSection(null);
  };

  const handleStartEditPhase2 = () => {
    setPhase2Draft(project!.phase2Prompt ?? "");
    setEditingPhase2(true);
    setPhase2ValidationError("");
    setExpandedSection("phase2");
  };

  const handleSavePhase2 = async () => {
    const trimmed = phase2Draft.trim();
    const validation = validatePromptText(trimmed);
    if (!validation.valid) {
      setPhase2ValidationError(validation.errors[0].message);
      return;
    }
    const result = await updateProject(project!.id, {
      phase2Prompt: trimmed,
    });
    if (result.success) {
      setProject(result.data);
      setEditingPhase2(false);
      setExpandedSection(null);
      addSuccess("Phase 2 prompt saved");
    } else {
      addError(result.error);
    }
  };

  const handleCancelEditPhase2 = () => {
    setEditingPhase2(false);
    setPhase2ValidationError("");
    setPhase2Draft("");
    setExpandedSection(null);
  };

  useEffect(() => {
    if (editingName && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [editingName]);

  useEffect(() => {
    if (editingPrompt && promptTextareaRef.current) {
      promptTextareaRef.current.focus();
    }
  }, [editingPrompt]);

  useEffect(() => {
    if (editingUrl && urlInputRef.current) {
      urlInputRef.current.focus();
    }
  }, [editingUrl]);

  useEffect(() => {
    if (addingPrompt && newPromptTextareaRef.current) {
      newPromptTextareaRef.current.focus();
    }
  }, [addingPrompt]);

  useEffect(() => {
    if (editingItemId && editItemPromptRef.current) {
      editItemPromptRef.current.focus();
    }
  }, [editingItemId]);

  useEffect(() => {
    if (editingPhase2 && phase2TextareaRef.current) {
      phase2TextareaRef.current.focus();
    }
  }, [editingPhase2]);

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

      {/* Name section */}
      {effectiveExpandedSection === "name" ? (
        <section className="mt-4 border-l-[3px] border-blue-500 pl-3">
          <h2 className="text-2xl font-semibold text-gray-900">
            Project Name
            {autoExpandedSection === "name" && (
              <span className="ml-2 text-xs font-normal text-blue-500">Next step</span>
            )}
          </h2>
          {editingName ? (
            <div className="mt-2">
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
              <div className="mt-2 flex flex-wrap gap-2">
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
            <div className="mt-2">
              <p className="text-xl font-semibold text-gray-900">{project.name}</p>
              <button
                onClick={handleStartEditName}
                className="mt-1 text-sm text-blue-600 hover:underline"
              >
                Edit
              </button>
            </div>
          )}
        </section>
      ) : (
        <section className="mt-4">
          <h2 className="flex flex-wrap items-center gap-2 text-2xl font-semibold text-gray-900">
            {project.name}
            <button
              onClick={handleStartEditName}
              className="text-sm text-blue-600 hover:underline font-normal"
            >
              Edit
            </button>
          </h2>
        </section>
      )}

      {/* Original Prompt section */}
      {effectiveExpandedSection === "originalPrompt" ? (
        <section className="mt-6 border-l-[3px] border-blue-500 pl-3">
          <h3 className="text-lg font-medium text-gray-900">
            Original Prompt
            {autoExpandedSection === "originalPrompt" && (
              <span className="ml-2 text-xs font-normal text-blue-500">Next step</span>
            )}
          </h3>
          {editingPrompt ? (
            <div className="mt-2">
              <textarea
                ref={promptTextareaRef}
                rows={6}
                value={promptDraft}
                onChange={(e) => {
                  setPromptDraft(e.target.value);
                  setPromptValidationError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") handleCancelEditPrompt();
                }}
                className="border border-gray-300 rounded px-3 py-2 w-full text-gray-900"
              />
              {promptValidationError && (
                <p className="mt-1 text-sm text-red-600">{promptValidationError}</p>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  onClick={handleSavePrompt}
                  className="bg-gray-900 text-white rounded px-4 py-2 hover:bg-gray-800"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEditPrompt}
                  className="border border-gray-300 rounded px-4 py-2 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-2">
              {project.originalPrompt ? (
                <>
                  <div className="whitespace-pre-wrap break-words text-gray-700">
                    {project.originalPrompt}
                  </div>
                  <button
                    onClick={handleStartEditPrompt}
                    className="mt-1 text-sm text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                </>
              ) : (
                <>
                  <p className="italic text-gray-400">Add your deep-research prompt.</p>
                  <button
                    onClick={handleStartEditPrompt}
                    className="mt-1 text-sm text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                </>
              )}
            </div>
          )}
        </section>
      ) : (
        <section className="mt-6">
          <h3 className="text-lg font-medium text-gray-900">Original Prompt</h3>
          <div className="mt-1">
            {project.originalPrompt ? (
              <div className="flex items-start gap-2">
                <p className="min-w-0 overflow-hidden truncate text-sm text-gray-600">{truncate(project.originalPrompt, 80)}</p>
                <button
                  onClick={() => setExpandedSection("originalPrompt")}
                  className="text-sm text-blue-600 hover:underline whitespace-nowrap"
                >
                  Expand
                </button>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <p className="italic text-gray-400">Add your deep-research prompt.</p>
                <button
                  onClick={handleStartEditPrompt}
                  className="text-sm text-blue-600 hover:underline whitespace-nowrap"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Research Space section — always visible, not affected by progressive disclosure */}
      <section className="mt-6">
        <h3 className="text-lg font-medium text-gray-900">Research Space</h3>
        <a
          href={RESEARCH_SPACE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-blue-600 hover:underline break-all"
        >
          {RESEARCH_SPACE_URL}
        </a>
      </section>

      {/* Kickoff Thread section */}
      {effectiveExpandedSection === "kickoffThreadUrl" ? (
        <section className="mt-6 border-l-[3px] border-blue-500 pl-3">
          <h3 className="text-lg font-medium text-gray-900">
            Kickoff Thread
            {autoExpandedSection === "kickoffThreadUrl" && (
              <span className="ml-2 text-xs font-normal text-blue-500">Next step</span>
            )}
          </h3>
          {editingUrl ? (
            <div className="mt-2">
              <input
                ref={urlInputRef}
                type="text"
                value={urlDraft}
                onChange={(e) => {
                  setUrlDraft(e.target.value);
                  setUrlValidationError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveUrl();
                  if (e.key === "Escape") handleCancelEditUrl();
                }}
                className="border border-gray-300 rounded px-3 py-2 w-full text-gray-900"
              />
              {urlValidationError && (
                <p className="mt-1 text-sm text-red-600">{urlValidationError}</p>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  onClick={handleSaveUrl}
                  className="bg-gray-900 text-white rounded px-4 py-2 hover:bg-gray-800"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEditUrl}
                  className="border border-gray-300 rounded px-4 py-2 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-2">
              {project.kickoffThreadUrl ? (
                <>
                  <a
                    href={project.kickoffThreadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    {project.kickoffThreadUrl}
                  </a>
                  <div className="mt-1">
                    <button
                      onClick={handleStartEditUrl}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="italic text-gray-400">Paste your kickoff thread URL.</p>
                  <button
                    onClick={handleStartEditUrl}
                    className="mt-1 text-sm text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                </>
              )}
            </div>
          )}
        </section>
      ) : (
        <section className="mt-6">
          <h3 className="text-lg font-medium text-gray-900">Kickoff Thread</h3>
          <div className="mt-1">
            {project.kickoffThreadUrl ? (
              <div className="flex items-start gap-2">
                <a
                  href={project.kickoffThreadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-w-0 break-all text-sm text-blue-600 hover:underline"
                >
                  {project.kickoffThreadUrl}
                </a>
                <button
                  onClick={() => setExpandedSection("kickoffThreadUrl")}
                  className="text-sm text-blue-600 hover:underline whitespace-nowrap"
                >
                  Expand
                </button>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <p className="italic text-gray-400">Paste your kickoff thread URL.</p>
                <button
                  onClick={handleStartEditUrl}
                  className="text-sm text-blue-600 hover:underline whitespace-nowrap"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Phase 1 Prompts section */}
      {effectiveExpandedSection === "phase1" ? (
        <section className="mt-6 border-l-[3px] border-blue-500 pl-3">
          <h3 className="text-lg font-medium text-gray-900">
            Phase 1 Prompts
            {autoExpandedSection === "phase1" && (
              <span className="ml-2 text-xs font-normal text-blue-500">Next step</span>
            )}
          </h3>

          {itemsLoading ? (
            <p className="mt-2 text-center text-gray-500">Loading…</p>
          ) : itemsError ? (
            <div className="mt-2">
              <p className="text-gray-700">Failed to load prompt blocks.</p>
              <button
                onClick={() => {
                  setItemsLoading(true);
                  setItemsError(false);
                  refreshItems();
                }}
                className="mt-1 text-sm text-blue-600 hover:underline"
              >
                Retry
              </button>
            </div>
          ) : items.length === 0 && !addingPrompt ? (
            <p className="mt-2 text-gray-500">
              No prompt blocks yet.{" "}
              <button
                onClick={handleStartAddPrompt}
                className="text-blue-600 hover:underline"
              >
                Add your first one.
              </button>
            </p>
          ) : (
            <div className="mt-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="mt-4 rounded border border-gray-200 bg-white p-4"
                >
                  {editingItemId === item.id ? (
                    <>
                      <span className="font-semibold text-gray-900">
                        Prompt {item.sequenceNumber}
                      </span>
                      <textarea
                        ref={editItemPromptRef}
                        rows={6}
                        value={editPromptDraft}
                        onChange={(e) => {
                          setEditPromptDraft(e.target.value);
                          setEditPromptValidationError("");
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Escape") handleCancelEditItem();
                        }}
                        className="mt-2 border border-gray-300 rounded px-3 py-2 w-full text-gray-900"
                      />
                      {editPromptValidationError && (
                        <p className="mt-1 text-sm text-red-600">
                          {editPromptValidationError}
                        </p>
                      )}
                      <label className="mt-3 block text-sm font-medium text-gray-700">
                        Conversation URL
                      </label>
                      <input
                        type="text"
                        value={editConversationUrlDraft}
                        onChange={(e) => {
                          setEditConversationUrlDraft(e.target.value);
                          setEditConversationUrlValidationError("");
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveEditItem();
                          if (e.key === "Escape") handleCancelEditItem();
                        }}
                        className="mt-1 border border-gray-300 rounded px-3 py-2 w-full text-gray-900"
                      />
                      {editConversationUrlValidationError && (
                        <p className="mt-1 text-sm text-red-600">
                          {editConversationUrlValidationError}
                        </p>
                      )}
                      <label className="mt-3 block text-sm font-medium text-gray-700">
                        Artifact URL
                      </label>
                      <input
                        type="text"
                        value={editArtifactUrlDraft}
                        onChange={(e) => {
                          setEditArtifactUrlDraft(e.target.value);
                          setEditArtifactUrlValidationError("");
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveEditItem();
                          if (e.key === "Escape") handleCancelEditItem();
                        }}
                        className="mt-1 border border-gray-300 rounded px-3 py-2 w-full text-gray-900"
                      />
                      {editArtifactUrlValidationError && (
                        <p className="mt-1 text-sm text-red-600">
                          {editArtifactUrlValidationError}
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          onClick={handleSaveEditItem}
                          className="bg-gray-900 text-white rounded px-4 py-2 hover:bg-gray-800"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEditItem}
                          className="border border-gray-300 rounded px-4 py-2 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : deletingItemId === item.id ? (
                    <div>
                      <p className="text-gray-900">
                        Delete Prompt {item.sequenceNumber}? Its number will be
                        permanently retired.
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button
                          onClick={handleConfirmDelete}
                          className="bg-red-600 text-white rounded px-4 py-2 hover:bg-red-500"
                        >
                          Delete
                        </button>
                        <button
                          onClick={handleCancelDelete}
                          className="border border-gray-300 rounded px-4 py-2 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="font-semibold text-gray-900">
                          Prompt {item.sequenceNumber}
                        </span>
                        <div className="flex flex-wrap gap-3">
                          <button
                            onClick={() => handleStartEditItem(item)}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleStartDelete(item)}
                            className="text-sm text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <div className="whitespace-pre-wrap break-words text-gray-700">
                        {item.promptText}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-4">
                        {item.conversationUrl ? (
                          <a
                            href={item.conversationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Conversation
                          </a>
                        ) : (
                          <span className="italic text-gray-400">No conversation link</span>
                        )}
                        {item.artifactUrl ? (
                          <a
                            href={item.artifactUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Artifact
                          </a>
                        ) : (
                          <span className="italic text-gray-400">No artifact link</span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
              {items.length > 0 && (
                <button
                  onClick={handleStartAddPrompt}
                  className="mt-4 text-sm text-blue-600 hover:underline"
                >
                  Add Prompt Block
                </button>
              )}
            </div>
          )}

          {addingPrompt && (
            <div className="mt-4">
              <textarea
                ref={newPromptTextareaRef}
                rows={6}
                value={newPromptText}
                onChange={(e) => {
                  setNewPromptText(e.target.value);
                  setNewPromptValidationError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") handleCancelAddPrompt();
                }}
                className="border border-gray-300 rounded px-3 py-2 w-full text-gray-900"
              />
              {newPromptValidationError && (
                <p className="mt-1 text-sm text-red-600">
                  {newPromptValidationError}
                </p>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  onClick={handleSaveNewPrompt}
                  className="bg-gray-900 text-white rounded px-4 py-2 hover:bg-gray-800"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelAddPrompt}
                  className="border border-gray-300 rounded px-4 py-2 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>
      ) : (
        <section className="mt-6">
          <h3 className="text-lg font-medium text-gray-900">Phase 1 Prompts</h3>
          <div className="mt-1">
            {!itemsLoading && items.length > 0 ? (
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-500">
                  {items.length} prompt block{items.length !== 1 ? "s" : ""}
                </p>
                <button
                  onClick={() => setExpandedSection("phase1")}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Expand
                </button>
              </div>
            ) : !itemsLoading && items.length === 0 ? (
              <div className="flex items-start gap-2">
                <p className="text-sm text-gray-500">No prompt blocks yet.</p>
                <button
                  onClick={() => {
                    setExpandedSection("phase1");
                    handleStartAddPrompt();
                  }}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Add
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Loading…</p>
            )}
          </div>
        </section>
      )}

      <div className="my-8 border-t border-gray-200" />

      {/* Phase 2 Prompt section */}
      {effectiveExpandedSection === "phase2" ? (
        <section className="border-l-[3px] border-blue-500 pl-3">
          <h3 className="text-lg font-medium text-gray-900">
            Phase 2 Prompt
            {autoExpandedSection === "phase2" && (
              <span className="ml-2 text-xs font-normal text-blue-500">Next step</span>
            )}
          </h3>
          {editingPhase2 ? (
            <div className="mt-2">
              <textarea
                ref={phase2TextareaRef}
                rows={6}
                value={phase2Draft}
                onChange={(e) => {
                  setPhase2Draft(e.target.value);
                  setPhase2ValidationError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") handleCancelEditPhase2();
                }}
                className="border border-gray-300 rounded px-3 py-2 w-full text-gray-900"
              />
              {phase2ValidationError && (
                <p className="mt-1 text-sm text-red-600">{phase2ValidationError}</p>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  onClick={handleSavePhase2}
                  className="bg-gray-900 text-white rounded px-4 py-2 hover:bg-gray-800"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEditPhase2}
                  className="border border-gray-300 rounded px-4 py-2 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-2">
              {project.phase2Prompt ? (
                <>
                  <div className="whitespace-pre-wrap break-words text-gray-700">
                    {project.phase2Prompt}
                  </div>
                  <button
                    onClick={handleStartEditPhase2}
                    className="mt-1 text-sm text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                </>
              ) : (
                <>
                  <p className="italic text-gray-400">Add your Phase 2 prompt.</p>
                  <button
                    onClick={handleStartEditPhase2}
                    className="mt-1 text-sm text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                </>
              )}
            </div>
          )}
        </section>
      ) : (
        <section>
          <h3 className="text-lg font-medium text-gray-900">Phase 2 Prompt</h3>
          <div className="mt-1">
            {project.phase2Prompt ? (
              <div className="flex items-start gap-2">
                <p className="min-w-0 overflow-hidden truncate text-sm text-gray-600">{truncate(project.phase2Prompt, 80)}</p>
                <button
                  onClick={() => setExpandedSection("phase2")}
                  className="text-sm text-blue-600 hover:underline whitespace-nowrap"
                >
                  Expand
                </button>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <p className="italic text-gray-400">Add your Phase 2 prompt.</p>
                <button
                  onClick={handleStartEditPhase2}
                  className="text-sm text-blue-600 hover:underline whitespace-nowrap"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}