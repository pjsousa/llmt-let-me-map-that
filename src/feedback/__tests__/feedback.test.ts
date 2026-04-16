import { describe, it, expect } from "vitest";
import { feedbackReducer } from "../toast-reducer";
import { FeedbackState } from "../types";

describe("feedbackReducer", () => {
  const initialState: FeedbackState = [];

  it("ADD_SUCCESS adds a toast with kind 'success' and a generated id", () => {
    const state = feedbackReducer(initialState, {
      type: "ADD_SUCCESS",
      message: "Saved!",
    });

    expect(state).toHaveLength(1);
    expect(state[0].kind).toBe("success");
    expect(state[0].message).toBe("Saved!");
    expect(typeof state[0].id).toBe("string");
    expect(state[0].id.length).toBeGreaterThan(0);
    expect(typeof state[0].createdAt).toBe("number");
  });

  it("ADD_ERROR adds a toast with kind 'error' and a generated id", () => {
    const state = feedbackReducer(initialState, {
      type: "ADD_ERROR",
      message: "Something went wrong",
    });

    expect(state).toHaveLength(1);
    expect(state[0].kind).toBe("error");
    expect(state[0].message).toBe("Something went wrong");
    expect(typeof state[0].id).toBe("string");
    expect(state[0].id.length).toBeGreaterThan(0);
  });

  it("DISMISS removes a toast by id", () => {
    const withToast = feedbackReducer(initialState, {
      type: "ADD_SUCCESS",
      message: "Will be dismissed",
    });

    const afterDismiss = feedbackReducer(withToast, {
      type: "DISMISS",
      id: withToast[0].id,
    });

    expect(afterDismiss).toHaveLength(0);
  });

  it("DISMISS on a non-existent id returns state unchanged", () => {
    const withToast = feedbackReducer(initialState, {
      type: "ADD_SUCCESS",
      message: "Stays",
    });

    const result = feedbackReducer(withToast, {
      type: "DISMISS",
      id: "non-existent-id",
    });

    expect(result).toEqual(withToast);
  });

  it("multiple ADD actions stack toasts in order of creation", () => {
    let state = feedbackReducer(initialState, {
      type: "ADD_SUCCESS",
      message: "First",
    });
    state = feedbackReducer(state, {
      type: "ADD_ERROR",
      message: "Second",
    });
    state = feedbackReducer(state, {
      type: "ADD_SUCCESS",
      message: "Third",
    });

    expect(state).toHaveLength(3);
    expect(state[0].message).toBe("First");
    expect(state[0].kind).toBe("success");
    expect(state[1].message).toBe("Second");
    expect(state[1].kind).toBe("error");
    expect(state[2].message).toBe("Third");
    expect(state[2].kind).toBe("success");
  });

  it("after ADD_SUCCESS + DISMISS, the toast is removed", () => {
    const withToast = feedbackReducer(initialState, {
      type: "ADD_SUCCESS",
      message: "Temporary",
    });

    const afterDismiss = feedbackReducer(withToast, {
      type: "DISMISS",
      id: withToast[0].id,
    });

    expect(afterDismiss).toEqual([]);
  });

  it("after multiple ADDs, only the dismissed toast is removed", () => {
    let state = feedbackReducer(initialState, {
      type: "ADD_SUCCESS",
      message: "Keep this",
    });
    state = feedbackReducer(state, {
      type: "ADD_ERROR",
      message: "Remove this",
    });
    state = feedbackReducer(state, {
      type: "ADD_SUCCESS",
      message: "Also keep this",
    });

    const targetId = state[1].id;
    const afterDismiss = feedbackReducer(state, {
      type: "DISMISS",
      id: targetId,
    });

    expect(afterDismiss).toHaveLength(2);
    expect(afterDismiss[0].message).toBe("Keep this");
    expect(afterDismiss[1].message).toBe("Also keep this");
  });

  it("each ADD generates a unique id", () => {
    let state = feedbackReducer(initialState, {
      type: "ADD_SUCCESS",
      message: "A",
    });
    state = feedbackReducer(state, {
      type: "ADD_SUCCESS",
      message: "B",
    });

    const ids = state.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
