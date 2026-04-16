import { describe, it, expect, beforeEach } from "vitest";
import {
  createProject,
  createPhase1Item,
  getPhase1Items,
  updatePhase1Item,
  deletePhase1Item,
  resetDatabase,
  closeDatabase,
  openDatabase,
} from "../index";
import type { Result } from "../result";
import type { Project, Phase1Item } from "../types";

function unwrap<T>(result: Result<T>): T {
  if (!result.success) throw new Error(result.error);
  return result.data;
}

beforeEach(async () => {
  await resetDatabase();
});

describe("sequence integrity", () => {
  it("empty project — first Phase1Item gets sequenceNumber 1", async () => {
    const project = unwrap(await createProject("Test Project"));

    const item = unwrap(
      await createPhase1Item(project.id, "First prompt"),
    );

    expect(item.sequenceNumber).toBe(1);
  });

  it("consecutive adds — sequence numbers 1, 2, 3", async () => {
    const project = unwrap(await createProject("Test Project"));

    const item1 = unwrap(
      await createPhase1Item(project.id, "Prompt 1"),
    );
    const item2 = unwrap(
      await createPhase1Item(project.id, "Prompt 2"),
    );
    const item3 = unwrap(
      await createPhase1Item(project.id, "Prompt 3"),
    );

    expect(item1.sequenceNumber).toBe(1);
    expect(item2.sequenceNumber).toBe(2);
    expect(item3.sequenceNumber).toBe(3);
  });

  it("delete-gap — deleted sequence number is never reused", async () => {
    const project = unwrap(await createProject("Test Project"));

    const item1 = unwrap(
      await createPhase1Item(project.id, "Prompt 1"),
    );
    const item2 = unwrap(
      await createPhase1Item(project.id, "Prompt 2"),
    );
    const item3 = unwrap(
      await createPhase1Item(project.id, "Prompt 3"),
    );

    unwrap(await deletePhase1Item(item2.id));

    const item4 = unwrap(
      await createPhase1Item(project.id, "Prompt 4"),
    );
    expect(item4.sequenceNumber).toBe(4);
  });

  it("delete-middle-add — new items get correct sequence numbers, deleted item retains its number", async () => {
    const project = unwrap(await createProject("Test Project"));

    const item1 = unwrap(
      await createPhase1Item(project.id, "Prompt 1"),
    );
    const item2 = unwrap(
      await createPhase1Item(project.id, "Prompt 2"),
    );
    const item3 = unwrap(
      await createPhase1Item(project.id, "Prompt 3"),
    );

    unwrap(await deletePhase1Item(item2.id));

    const item4 = unwrap(
      await createPhase1Item(project.id, "Prompt 4"),
    );
    const item5 = unwrap(
      await createPhase1Item(project.id, "Prompt 5"),
    );

    expect(item4.sequenceNumber).toBe(4);
    expect(item5.sequenceNumber).toBe(5);

    const activeItems = unwrap(await getPhase1Items(project.id));
    const activeSeqNums = activeItems.map((i) => i.sequenceNumber);
    expect(activeSeqNums).toEqual([1, 3, 4, 5]);

    const dbResult = await openDatabase();
    const db = unwrap(dbResult);
    const deleted = (await db.get("phase1Items", item2.id)) as Phase1Item;
    expect(deleted.sequenceNumber).toBe(2);
    expect(deleted.deleted).toBe(true);
  });

  it("all-deleted then add — sequence continues from max deleted number", async () => {
    const project = unwrap(await createProject("Test Project"));

    const item1 = unwrap(
      await createPhase1Item(project.id, "Prompt 1"),
    );
    const item2 = unwrap(
      await createPhase1Item(project.id, "Prompt 2"),
    );
    const item3 = unwrap(
      await createPhase1Item(project.id, "Prompt 3"),
    );

    unwrap(await deletePhase1Item(item1.id));
    unwrap(await deletePhase1Item(item2.id));
    unwrap(await deletePhase1Item(item3.id));

    const item4 = unwrap(
      await createPhase1Item(project.id, "Prompt 4"),
    );
    expect(item4.sequenceNumber).toBe(4);
  });

  it("cross-project isolation — sequence numbers are independent per project", async () => {
    const projA = unwrap(await createProject("Project A"));
    const projB = unwrap(await createProject("Project B"));

    const a1 = unwrap(await createPhase1Item(projA.id, "A-1"));
    const a2 = unwrap(await createPhase1Item(projA.id, "A-2"));
    const b1 = unwrap(await createPhase1Item(projB.id, "B-1"));

    expect(a1.sequenceNumber).toBe(1);
    expect(a2.sequenceNumber).toBe(2);
    expect(b1.sequenceNumber).toBe(1);
  });

  it("getPhase1Items excludes soft-deleted items and sorts by sequenceNumber ascending", async () => {
    const project = unwrap(await createProject("Test Project"));

    const item1 = unwrap(
      await createPhase1Item(project.id, "Prompt 1"),
    );
    const item2 = unwrap(
      await createPhase1Item(project.id, "Prompt 2"),
    );
    const item3 = unwrap(
      await createPhase1Item(project.id, "Prompt 3"),
    );

    unwrap(await deletePhase1Item(item2.id));

    const items = unwrap(await getPhase1Items(project.id));

    expect(items).toHaveLength(2);
    expect(items[0].id).toBe(item1.id);
    expect(items[1].id).toBe(item3.id);
    expect(items[0].sequenceNumber).toBe(1);
    expect(items[1].sequenceNumber).toBe(3);
  });

  it("reload/reopen — items and sequence numbers persist after database close and reopen", async () => {
    const project = unwrap(await createProject("Test Project"));

    unwrap(await createPhase1Item(project.id, "Prompt 1"));
    unwrap(await createPhase1Item(project.id, "Prompt 2"));
    unwrap(await createPhase1Item(project.id, "Prompt 3"));

    await closeDatabase();

    unwrap(await openDatabase());

    const items = unwrap(await getPhase1Items(project.id));
    expect(items).toHaveLength(3);
    expect(items[0].sequenceNumber).toBe(1);
    expect(items[1].sequenceNumber).toBe(2);
    expect(items[2].sequenceNumber).toBe(3);
  });

  it("updatePhase1Item immutability — sequenceNumber and projectId cannot be changed", async () => {
    const project = unwrap(await createProject("Test Project"));

    const item = unwrap(
      await createPhase1Item(project.id, "Prompt 1"),
    );

    const originalSeqNum = item.sequenceNumber;
    const originalProjectId = item.projectId;

    const updated = unwrap(
      await updatePhase1Item(item.id, {
        promptText: "Updated prompt",
        sequenceNumber: 999,
        projectId: "malicious-project-id",
      } as Parameters<typeof updatePhase1Item>[1]),
    );

    expect(updated.sequenceNumber).toBe(originalSeqNum);
    expect(updated.projectId).toBe(originalProjectId);
    expect(updated.promptText).toBe("Updated prompt");
  });
});