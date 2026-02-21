import Link from "next/link";
import type { StoredDish } from "@/types";
import FlavorTags from "./FlavorTags";

export default function DishCard({ dish }: { dish: StoredDish }) {
  return (
    <Link
      href={`/dish/${dish.id}`}
      className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-orange-300 hover:shadow-sm transition-all active:scale-[0.98]"
    >
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">
            {dish.name_original}
          </h3>
          {dish.name_english && dish.name_english !== dish.name_original && (
            <p className="text-sm text-gray-500 truncate">{dish.name_english}</p>
          )}
          {dish.pronunciation && (
            <p className="text-xs text-gray-400 mt-0.5 italic">
              {dish.pronunciation}
            </p>
          )}
        </div>
        {dish.price && (
          <span className="text-sm font-medium text-gray-700 shrink-0">
            {dish.price}
          </span>
        )}
      </div>
      {dish.flavor_tags && dish.flavor_tags.length > 0 && (
        <div className="mt-2">
          <FlavorTags tags={dish.flavor_tags} />
        </div>
      )}
    </Link>
  );
}
