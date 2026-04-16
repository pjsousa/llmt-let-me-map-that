import { useFeedback } from "./use-feedback";
import { FeedbackContext } from "./feedback-context";
import type { ReactNode } from "react";

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const feedback = useFeedback();

  return (
    <FeedbackContext.Provider value={feedback}>
      {children}
    </FeedbackContext.Provider>
  );
}