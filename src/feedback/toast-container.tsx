import type { Toast } from "./types";
import { useFeedbackContext } from "./feedback-context";

export function ToastContainer() {
  const { toasts, dismiss } = useFeedbackContext();

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 flex flex-col gap-2 sm:left-auto max-w-[calc(100vw-2rem)]">
      {toasts.map((toast: Toast) => (
        <div
          key={toast.id}
          className={`rounded px-4 py-2 text-sm shadow-lg ${
            toast.kind === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
          onClick={() => dismiss(toast.id)}
          role="alert"
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}