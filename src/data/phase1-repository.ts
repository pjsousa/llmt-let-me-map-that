import { openDatabase, PhaseboardDB } from "./database";
import { Result } from "./result";
import { Phase1Item } from "./types";

async function getAllPhase1ItemsForSeq(
  projectId: string,
  db: PhaseboardDB,
): Promise<Phase1Item[]> {
  const all = await db.getAllFromIndex("phase1Items", "projectId", projectId);
  return all as Phase1Item[];
}

export async function createPhase1Item(
  projectId: string,
  promptText: string,
): Promise<Result<Phase1Item>> {
  const dbResult = await openDatabase();
  if (!dbResult.success) return dbResult;

  try {
    const allItems = await getAllPhase1ItemsForSeq(projectId, dbResult.data);

    const maxSeq = allItems.reduce(
      (max, item) => Math.max(max, item.sequenceNumber),
      0,
    );
    const nextSeqNum = maxSeq + 1;

    const now = new Date().toISOString();
    const item: Phase1Item = {
      id: crypto.randomUUID(),
      projectId,
      sequenceNumber: nextSeqNum,
      promptText,
      conversationUrl: "",
      artifactUrl: "",
      deleted: false,
      createdAt: now,
      updatedAt: now,
    };

    await dbResult.data.put("phase1Items", item);
    return { success: true, data: item };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Unknown error creating phase1 item",
    };
  }
}

export async function getPhase1Items(
  projectId: string,
): Promise<Result<Phase1Item[]>> {
  const dbResult = await openDatabase();
  if (!dbResult.success) return dbResult;

  try {
    const all = await dbResult.data.getAllFromIndex(
      "phase1Items",
      "projectId",
      projectId,
    );
    const items = (all as Phase1Item[])
      .filter((item) => !item.deleted)
      .sort((a, b) => a.sequenceNumber - b.sequenceNumber);
    return { success: true, data: items };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Unknown error reading phase1 items",
    };
  }
}

export async function updatePhase1Item(
  id: string,
  fields: Partial<Omit<Phase1Item, "id" | "createdAt" | "sequenceNumber" | "projectId">>,
): Promise<Result<Phase1Item>> {
  const dbResult = await openDatabase();
  if (!dbResult.success) return dbResult;

  try {
    const existing = await dbResult.data.get("phase1Items", id);
    if (!existing) {
      return { success: false, error: `Phase1 item not found: ${id}` };
    }

    const prev = existing as Phase1Item;
    const updated: Phase1Item = {
      ...prev,
      ...fields,
      id: prev.id,
      createdAt: prev.createdAt,
      sequenceNumber: prev.sequenceNumber,
      projectId: prev.projectId,
      updatedAt: new Date().toISOString(),
    };

    await dbResult.data.put("phase1Items", updated);
    return { success: true, data: updated };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Unknown error updating phase1 item",
    };
  }
}

export async function deletePhase1Item(
  id: string,
): Promise<Result<void>> {
  const dbResult = await openDatabase();
  if (!dbResult.success) return dbResult;

  try {
    const existing = await dbResult.data.get("phase1Items", id);
    if (!existing) {
      return { success: false, error: `Phase1 item not found: ${id}` };
    }

    const prev = existing as Phase1Item;
    const updated: Phase1Item = {
      ...prev,
      deleted: true,
      updatedAt: new Date().toISOString(),
    };

    await dbResult.data.put("phase1Items", updated);
    return { success: true, data: undefined };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Unknown error deleting phase1 item",
    };
  }
}