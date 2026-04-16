import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "./feedback";
import { ErrorBoundary } from "./error";
import ProjectListPage from "./pages/project-list-page";
import ProjectDetailPage from "./pages/project-detail-page";

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="min-h-screen overflow-x-hidden bg-gray-50">
          <header className="border-b border-gray-200 bg-white px-4 py-4 sm:px-6">
            <h1 className="text-xl font-semibold text-gray-900">Phaseboard</h1>
          </header>
          <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
            <Routes>
              <Route path="/" element={<ProjectListPage />} />
              <Route path="/project/:id" element={<ProjectDetailPage />} />
            </Routes>
          </main>
          <ToastContainer />
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}