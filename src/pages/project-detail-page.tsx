import { Link, useParams } from "react-router-dom";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <Link to="/" className="text-blue-600 hover:underline">
        &larr; Back to projects
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-gray-900">
        Project Detail
      </h1>
      <p className="mt-4 text-gray-500">
        Project ID: {id ?? "unknown"}
      </p>
    </div>
  );
}