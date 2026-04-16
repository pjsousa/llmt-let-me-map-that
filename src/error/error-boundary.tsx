import React from "react";
import { logError } from "./error-logger";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    logError("Uncaught error in component tree", error);
    logError("Component stack", errorInfo.componentStack);
    this.setState({ hasError: true });
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="text-center py-12 text-gray-700">
          <p>Something went wrong. Try refreshing the page.</p>
          <button
            className="mt-4 bg-gray-900 text-white rounded px-4 py-2 hover:bg-gray-800"
            onClick={() => window.location.reload()}
          >
            Refresh page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
