import { createContext, useContext } from "react";
import type { FeedbackContextShape } from "./feedback-context-shape";

export const FeedbackContext = createContext<FeedbackContextShape | null>(null);

export function useFeedbackContext(): FeedbackContextShape {
  const ctx = useContext(FeedbackContext);
  if (!ctx) {
    throw new Error("useFeedbackContext must be used within a FeedbackProvider");
  }
  return ctx;
}