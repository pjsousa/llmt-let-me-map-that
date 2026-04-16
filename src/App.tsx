import { ToastContainer } from "./feedback";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-900">Phaseboard</h1>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-8">
        <p className="text-gray-500">No project selected.</p>
      </main>
      <ToastContainer />
    </div>
  );
}