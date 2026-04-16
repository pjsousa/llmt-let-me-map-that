import { useReducer, useEffect, useCallback } from "react";
import { feedbackReducer } from "./toast-reducer";
import type { FeedbackState } from "./types";

const AUTO_DISMISS_MS = 3000;

export function useFeedback() {
  const [toasts, dispatch] = useReducer(feedbackReducer, [] as FeedbackState);

  const addSuccess = useCallback((message: string) => {
    dispatch({ type: "ADD_SUCCESS", message });
  }, []);

  const addError = useCallback((message: string) => {
    dispatch({ type: "ADD_ERROR", message });
  }, []);

  const dismiss = useCallback((id: string) => {
    dispatch({ type: "DISMISS", id });
  }, []);

  useEffect(() => {
    if (toasts.length === 0) return;

    const timers = toasts.map((toast) =>
      setTimeout(() => {
        dispatch({ type: "DISMISS", id: toast.id });
      }, AUTO_DISMISS_MS)
    );

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [toasts]);

  return { toasts, addSuccess, addError, dismiss };
}