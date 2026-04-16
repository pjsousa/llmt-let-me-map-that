import type { Toast } from "./types";

export interface FeedbackContextShape {
  addSuccess(message: string): void;
  addError(message: string): void;
  dismiss(id: string): void;
  toasts: Toast[];
}