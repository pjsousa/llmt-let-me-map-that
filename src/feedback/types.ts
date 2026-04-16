export interface Toast {
  id: string;
  message: string;
  kind: "success" | "error";
  createdAt: number;
}

export type FeedbackAction =
  | { type: "ADD_SUCCESS"; message: string }
  | { type: "ADD_ERROR"; message: string }
  | { type: "DISMISS"; id: string };

export type FeedbackState = Toast[];
