"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="text-4xl">&#x1f615;</div>
      <h2 className="text-xl font-semibold text-gray-900">Something went wrong</h2>
      <p className="text-gray-500 text-center max-w-sm">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <button
        onClick={reset}
        className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-2 rounded-xl transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
