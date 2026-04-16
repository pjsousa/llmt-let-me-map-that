import { openDatabase } from "./database";
import { Result } from "./result";
import { Project } from "./types";
import { logError } from "@/error/error-logger";

export async function createProject(name: string): Promise<Result<Project>> {
  const dbResult = await openDatabase();
  if (!dbResult.success) return dbResult;

  try {
    const now = new Date().toISOString();
    const project: Project = {
      id: crypto.randomUUID(),
      name,
      originalPrompt: "",
      kickoffThreadUrl: "",
      phase2Prompt: "",
      createdAt: now,
      updatedAt: now,
    };

    await dbResult.data.put("projects", project);
    return { success: true, data: project };
  } catch (err) {
    const error =
      err instanceof Error
        ? err.message
        : "Unknown error creating project";
    logError("Failed to create project", err);
    return { success: false, error };
  }
}

export async function getProject(id: string): Promise<Result<Project>> {
  const dbResult = await openDatabase();
  if (!dbResult.success) return dbResult;

  try {
    const project = await dbResult.data.get("projects", id);
    if (!project) {
      return { success: false, error: `Project not found: ${id}` };
    }
    return { success: true, data: project as Project };
  } catch (err) {
    const error =
      err instanceof Error
        ? err.message
        : "Unknown error reading project";
    logError("Failed to read project", err);
    return { success: false, error };
  }
}

export async function getAllProjects(): Promise<Result<Project[]>> {
  const dbResult = await openDatabase();
  if (!dbResult.success) return dbResult;

  try {
    const projects = await dbResult.data.getAll("projects");
    const sorted = (projects as Project[]).sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
    return { success: true, data: sorted };
  } catch (err) {
    const error =
      err instanceof Error
        ? err.message
        : "Unknown error reading projects";
    logError("Failed to read all projects", err);
    return { success: false, error };
  }
}

export async function updateProject(
  id: string,
  fields: Partial<Omit<Project, "id" | "createdAt">>,
): Promise<Result<Project>> {
  const dbResult = await openDatabase();
  if (!dbResult.success) return dbResult;

  try {
    const existing = await dbResult.data.get("projects", id);
    if (!existing) {
      return { success: false, error: `Project not found: ${id}` };
    }

    const updated: Project = {
      ...(existing as Project),
      ...fields,
      id: (existing as Project).id,
      createdAt: (existing as Project).createdAt,
      updatedAt: new Date().toISOString(),
    };

    await dbResult.data.put("projects", updated);
    return { success: true, data: updated };
  } catch (err) {
    const error =
      err instanceof Error
        ? err.message
        : "Unknown error updating project";
    logError("Failed to update project", err);
    return { success: false, error };
  }
}
