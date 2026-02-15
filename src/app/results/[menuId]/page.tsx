import Link from "next/link";
import { getServiceSupabase } from "@/lib/supabase";
import type { Dish, Restaurant, Menu } from "@/types";
import DishCard from "@/components/DishCard";

export const dynamic = "force-dynamic";

export default async function ResultsPage({
  params,
}: {
  params: { menuId: string };
}) {
  const supabase = getServiceSupabase();

  const { data: menu } = await supabase
    .from("menus")
    .select("*")
    .eq("id", params.menuId)
    .single<Menu>();

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

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("*")
    .eq("id", menu.restaurant_id)
    .single<Restaurant>();

  const { data: dishes } = await supabase
    .from("dishes")
    .select("*")
    .eq("menu_id", params.menuId)
    .order("created_at", { ascending: true })
    .returns<Dish[]>();

  return (
    <div className="flex flex-col gap-4">
      <div>
        {restaurant?.name && (
          <h1 className="text-2xl font-bold text-gray-900">
            {restaurant.name}
          </h1>
        )}
        {restaurant?.cuisine_type && (
          <p className="text-sm text-gray-500">{restaurant.cuisine_type} cuisine</p>
        )}
        <p className="text-sm text-gray-400 mt-1">
          {dishes?.length || 0} dishes found
        </p>
      </div>

      {dishes && dishes.length > 0 ? (
        <div className="flex flex-col gap-3">
          {dishes.map((dish) => (
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
