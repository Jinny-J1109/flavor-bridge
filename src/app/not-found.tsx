import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="text-4xl">&#x1f50d;</div>
      <h2 className="text-xl font-semibold text-gray-900">Page not found</h2>
      <p className="text-gray-500">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link
        href="/"
        className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-2 rounded-xl transition-colors"
      >
        Scan a menu
      </Link>
    </div>
  );
}
