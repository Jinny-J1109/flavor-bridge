"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { StoredDish } from "@/types";
import { getDish, findCachedDetails, updateDish } from "@/lib/storage";
import FlavorTags from "@/components/FlavorTags";
import FlavorRadar from "@/components/FlavorRadar";
import PronunciationPlayer from "@/components/PronunciationPlayer";
import DishImage from "@/components/DishImage";

export default function DishDetailPage() {
  const { dishId } = useParams<{ dishId: string }>();
  const [dish, setDish] = useState<StoredDish | null>(null);
  const [cuisineType, setCuisineType] = useState<string>("unknown");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDish() {
      const result = getDish(dishId);
      if (!result) {
        setError("Dish not found");
        setLoading(false);
        return;
      }

      const { dish: storedDish, menu } = result;
      setCuisineType(menu.cuisine_type || "unknown");

      if (storedDish.details_generated) {
        setDish(storedDish);
        setLoading(false);
        return;
      }

      // Check localStorage cache for same dish name
      const cached = findCachedDetails(storedDish.name_original);
      if (cached) {
        const updates: Partial<StoredDish> = {
          description: cached.description,
          tastes_like: cached.tastes_like,
          tastes_like_components: cached.tastes_like_components,
          flavor_profile: cached.flavor_profile,
          ingredients: cached.ingredients,
          how_to_eat: cached.how_to_eat,
          pronunciation: cached.pronunciation || storedDish.pronunciation,
          details_generated: true,
        };
        updateDish(dishId, updates);
        setDish({ ...storedDish, ...updates });
        setLoading(false);
        return;
      }

      // Fetch details from API
      try {
        const res = await fetch("/api/dish/details", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name_original: storedDish.name_original,
            cuisine_type: menu.cuisine_type || "unknown",
          }),
        });
        if (!res.ok) throw new Error("Failed to load dish details");
        const details = await res.json();
        const updates: Partial<StoredDish> = {
          description: details.description,
          tastes_like: details.tastes_like,
          tastes_like_components: details.tastes_like_components,
          flavor_profile: details.flavor_profile,
          ingredients: details.ingredients,
          how_to_eat: details.how_to_eat,
          pronunciation: details.pronunciation || storedDish.pronunciation,
          details_generated: true,
        };
        updateDish(dishId, updates);
        setDish({ ...storedDish, ...updates });
      } catch {
        setError("Could not load dish details. Please try again.");
        setDish(storedDish);
      } finally {
        setLoading(false);
      }
    }
    loadDish();
  }, [dishId]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-48 bg-gray-200 rounded-xl" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
        <div className="h-32 bg-gray-200 rounded-xl" />
      </div>
    );
  }

  if (error || !dish) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error || "Dish not found"}</p>
        <Link href="/" className="text-orange-500 underline mt-2 inline-block">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Back link */}
      <Link
        href={`/results/${dish.menu_id}`}
        className="text-sm text-gray-500 hover:text-orange-500"
      >
        &larr; Back to menu
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {dish.name_original}
        </h1>
        {dish.name_english && dish.name_english !== dish.name_original && (
          <p className="text-lg text-gray-600">{dish.name_english}</p>
        )}
        {dish.pronunciation && (
          <div className="flex items-center gap-2 mt-1">
            <PronunciationPlayer
              text={dish.name_original}
              pronunciation={dish.pronunciation}
            />
          </div>
        )}
        {dish.price && (
          <p className="text-lg font-medium text-gray-700 mt-1">{dish.price}</p>
        )}
      </div>

      {/* AI Image */}
      <DishImage dish={dish} cuisineType={cuisineType} />

      {/* Flavor Tags */}
      {dish.flavor_tags && dish.flavor_tags.length > 0 && (
        <FlavorTags tags={dish.flavor_tags} />
      )}

      {/* Tastes Like */}
      {dish.tastes_like && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-orange-700 mb-1">
            Tastes like...
          </h2>
          <p className="text-gray-800">{dish.tastes_like}</p>
          {dish.tastes_like_components && dish.tastes_like_components.length > 0 && (
            <ul className="mt-2 space-y-1">
              {dish.tastes_like_components.map((comp, i) => (
                <li key={i} className="text-sm text-gray-600">
                  <span className="font-medium">{comp.familiar_food}</span>
                  {" — "}
                  {comp.similarity}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Description */}
      {dish.description && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 mb-1">
            About this dish
          </h2>
          <p className="text-gray-800">{dish.description}</p>
        </div>
      )}

      {/* Flavor Radar */}
      {dish.flavor_profile && <FlavorRadar profile={dish.flavor_profile} />}

      {/* Ingredients */}
      {dish.ingredients && dish.ingredients.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 mb-2">
            Key Ingredients
          </h2>
          <div className="flex flex-wrap gap-2">
            {dish.ingredients.map((ingredient) => (
              <span
                key={ingredient}
                className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full"
              >
                {ingredient}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* How to Eat */}
      {dish.how_to_eat && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-blue-700 mb-1">
            How to eat
          </h2>
          <p className="text-gray-800">{dish.how_to_eat}</p>
        </div>
      )}
    </div>
  );
}
