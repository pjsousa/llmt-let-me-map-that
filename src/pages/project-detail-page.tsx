import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProject, updateProject, getPhase1Items, createPhase1Item, updatePhase1Item, deletePhase1Item } from "@/data";
import type { Project, Phase1Item } from "@/data";
import { useFeedbackContext } from "@/feedback";
import { validateProjectName, validatePromptText, validateUrl } from "@/validation";
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

  const handleStartEditPrompt = () => {
    setPromptDraft(project!.originalPrompt ?? "");
    setEditingPrompt(true);
    setPromptValidationError("");
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
      addSuccess("Original prompt saved");
    } else {
      addError(result.error);
    }
  };

  const handleCancelEditPrompt = () => {
    setEditingPrompt(false);
    setPromptValidationError("");
    setPromptDraft("");
  };

  const handleStartEditUrl = () => {
    setUrlDraft(project!.kickoffThreadUrl ?? "");
    setEditingUrl(true);
    setUrlValidationError("");
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
      addSuccess("Kickoff thread URL saved");
    } else {
      addError(result.error);
    }
  };

  const handleCancelEditUrl = () => {
    setEditingUrl(false);
    setUrlValidationError("");
    setUrlDraft("");
  };

  const handleStartAddPrompt = () => {
    setAddingPrompt(true);
    setNewPromptText("");
    setNewPromptValidationError("");
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
    } else {
      addError(result.error);
    }
  };

  const handleCancelAddPrompt = () => {
    setAddingPrompt(false);
    setNewPromptText("");
    setNewPromptValidationError("");
  };

  const handleStartEditItem = (item: Phase1Item) => {
    setEditingItemId(item.id);
    setEditPromptDraft(item.promptText);
    setEditConversationUrlDraft(item.conversationUrl);
    setEditArtifactUrlDraft(item.artifactUrl);
    setEditPromptValidationError("");
    setEditConversationUrlValidationError("");
    setEditArtifactUrlValidationError("");
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
  };

  const handleStartDelete = (item: Phase1Item) => {
    setDeletingItemId(item.id);
  };

  const handleConfirmDelete = async () => {
    const result = await deletePhase1Item(deletingItemId!);
    if (result.success) {
      addSuccess("Prompt block deleted");
      await refreshItems();
      setDeletingItemId(null);
    } else {
      addError(result.error);
    }
  };

  const handleCancelDelete = () => {
    setDeletingItemId(null);
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
            <div className="mt-2 flex gap-2">
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
              <div className="whitespace-pre-wrap text-gray-700">
                {project.originalPrompt}
              </div>
            ) : (
              <p className="italic text-gray-400">Add your deep-research prompt.</p>
            )}
            <button
              onClick={handleStartEditPrompt}
              className="mt-1 text-sm text-blue-600 hover:underline"
            >
              Edit
            </button>
          </div>
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
            <div className="mt-2 flex gap-2">
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
              <a
                href={project.kickoffThreadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {project.kickoffThreadUrl}
              </a>
            ) : (
              <p className="italic text-gray-400">
                Paste your kickoff thread URL.
              </p>
            )}
            <button
              onClick={handleStartEditUrl}
              className="mt-1 text-sm text-blue-600 hover:underline"
            >
              Edit
            </button>
          </div>
        )}
      </section>

      <section className="mt-6">
        <h3 className="text-lg font-medium text-gray-900">Phase 1 Prompts</h3>

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
                    <div className="mt-3 flex gap-2">
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
                    <div className="mt-2 flex gap-2">
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
                    <div className="flex items-baseline justify-between">
                      <span className="font-semibold text-gray-900">
                        Prompt {item.sequenceNumber}
                      </span>
                      <div className="flex gap-3">
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
                    <div className="whitespace-pre-wrap text-gray-700">
                      {item.promptText}
                    </div>
                    <div className="mt-2 flex gap-4">
                      {item.conversationUrl && (
                        <a
                          href={item.conversationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Conversation
                        </a>
                      )}
                      {item.artifactUrl && (
                        <a
                          href={item.artifactUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Artifact
                        </a>
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
            <div className="mt-2 flex gap-2">
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
    </div>
  );
}