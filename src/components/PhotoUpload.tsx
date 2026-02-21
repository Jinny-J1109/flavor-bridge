"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { buildMenuFromScanResult, saveMenu } from "@/lib/storage";

export default function PhotoUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/scan", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Scan failed");
      }
      const scanResult = await res.json();
      const menu = buildMenuFromScanResult(scanResult);
      saveMenu(menu);
      router.push(`/results/${menu.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="w-full flex flex-col items-center gap-4 py-8">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600">Scanning menu...</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center gap-2">
      {error && (
        <p className="text-red-500 text-sm text-center">{error}</p>
      )}
      <button
        onClick={() => inputRef.current?.click()}
        className="w-full border-2 border-dashed border-gray-300 hover:border-orange-400 text-gray-600 hover:text-orange-500 font-medium py-4 px-6 rounded-2xl text-lg transition-colors"
      >
        Upload Menu Photo
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  );
}
