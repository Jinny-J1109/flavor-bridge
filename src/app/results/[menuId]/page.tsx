"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { StoredMenu } from "@/types";
import { getMenu } from "@/lib/storage";
import DishCard from "@/components/DishCard";

export default function ResultsPage() {
  const { menuId } = useParams<{ menuId: string }>();
  const [menu, setMenu] = useState<StoredMenu | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setMenu(getMenu(menuId));
    setLoaded(true);
  }, [menuId]);

  if (!loaded) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-20 bg-gray-200 rounded-xl" />
        <div className="h-20 bg-gray-200 rounded-xl" />
        <div className="h-20 bg-gray-200 rounded-xl" />
      </div>
    );
  }

  if (!menu) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Menu not found</p>
        <Link href="/" className="text-orange-500 underline mt-2 inline-block">
          Scan a new menu
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        {menu.restaurant_name && (
          <h1 className="text-2xl font-bold text-gray-900">
            {menu.restaurant_name}
          </h1>
        )}
        {menu.cuisine_type && (
          <p className="text-sm text-gray-500">{menu.cuisine_type} cuisine</p>
        )}
        <p className="text-sm text-gray-400 mt-1">
          {menu.dishes.length} dishes found
        </p>
      </div>

      {menu.dishes.length > 0 ? (
        <div className="flex flex-col gap-3">
          {menu.dishes.map((dish) => (
            <DishCard key={dish.id} dish={dish} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No dishes detected in this menu.</p>
        </div>
      )}

      <Link
        href="/"
        className="text-center text-orange-500 font-medium py-3"
      >
        Scan another menu
      </Link>
    </div>
  );
}
