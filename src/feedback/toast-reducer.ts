import { FeedbackState, FeedbackAction, Toast } from "./types";

export function feedbackReducer(
  state: FeedbackState,
  action: FeedbackAction,
): FeedbackState {
  switch (action.type) {
    case "ADD_SUCCESS":
      return [
        ...state,
        {
          id: crypto.randomUUID(),
          message: action.message,
          kind: "success",
          createdAt: Date.now(),
        } satisfies Toast,
      ];

    case "ADD_ERROR":
      return [
        ...state,
        {
          id: crypto.randomUUID(),
          message: action.message,
          kind: "error",
          createdAt: Date.now(),
        } satisfies Toast,
      ];

    case "DISMISS":
      return state.filter((toast) => toast.id !== action.id);
  }
}
