"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { Dish } from "@/types";

const DAILY_CAP = 20;
const CAP_KEY = "flavor-bridge-image-cap";

function getImageCount(): { date: string; count: number } {
  if (typeof window === "undefined") return { date: "", count: 0 };
  try {
    const stored = JSON.parse(localStorage.getItem(CAP_KEY) || "{}");
    const today = new Date().toISOString().split("T")[0];
    if (stored.date === today) return stored;
    return { date: today, count: 0 };
  } catch {
    return { date: new Date().toISOString().split("T")[0], count: 0 };
  }
}

function incrementImageCount() {
  const current = getImageCount();
  current.count++;
  localStorage.setItem(CAP_KEY, JSON.stringify(current));
}

export default function DishImage({ dish }: { dish: Dish }) {
  const [imageUrl, setImageUrl] = useState<string | null>(dish.image_url);
  const [loading, setLoading] = useState(!dish.image_url);
  const [error, setError] = useState<string | null>(null);
  const [flagged, setFlagged] = useState(false);

  useEffect(() => {
    if (dish.image_url) return;

    const cap = getImageCount();
    if (cap.count >= DAILY_CAP) {
      setLoading(false);
      setError("Daily image limit reached");
      return;
    }

    async function loadImage() {
      try {
        const res = await fetch(`/api/image/${dish.id}`, { method: "POST" });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to generate image");
        }
        const data = await res.json();
        setImageUrl(data.image_url);
        incrementImageCount();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Image unavailable");
      } finally {
        setLoading(false);
      }
    }
    loadImage();
  }, [dish.id, dish.image_url]);

  async function handleFlag() {
    setFlagged(true);
    await fetch(`/api/image/${dish.id}`, { method: "PATCH" });
  }

  if (loading) {
    return (
      <div className="w-full aspect-square bg-gray-100 rounded-xl animate-pulse flex items-center justify-center">
        <p className="text-sm text-gray-400">Generating image...</p>
      </div>
    );
  }

  if (error || !imageUrl) {
    return (
      <div className="w-full aspect-square bg-gray-100 rounded-xl flex items-center justify-center">
        <p className="text-sm text-gray-400">{error || "No image available"}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <div className="relative w-full aspect-square rounded-xl overflow-hidden">
        <Image
          src={imageUrl}
          alt={dish.name_original}
          fill
          className="object-cover"
          sizes="(max-width: 512px) 100vw, 512px"
        />
      </div>
      {!flagged ? (
        <button
          onClick={handleFlag}
          className="absolute bottom-2 right-2 bg-white/80 backdrop-blur text-xs text-gray-500 hover:text-red-500 px-2 py-1 rounded-lg transition-colors"
        >
          Wrong image?
        </button>
      ) : (
        <span className="absolute bottom-2 right-2 bg-white/80 backdrop-blur text-xs text-gray-400 px-2 py-1 rounded-lg">
          Flagged — thanks!
        </span>
      )}
    </div>
  );
}
