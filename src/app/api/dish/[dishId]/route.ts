import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { generateDishDetails } from "@/lib/claude";

export async function GET(
  _request: NextRequest,
  { params }: { params: { dishId: string } }
) {
  try {
    const supabase = getServiceSupabase();

    // Fetch the dish
    const { data: dish, error } = await supabase
      .from("dishes")
      .select("*, restaurants(cuisine_type)")
      .eq("id", params.dishId)
      .single();

    if (error || !dish) {
      return NextResponse.json({ error: "Dish not found" }, { status: 404 });
    }

    // If details already generated, return cached
    if (dish.details_generated) {
      return NextResponse.json({ dish });
    }

    // Check global cache — another dish with same name may already have details
    const { data: cachedDish } = await supabase
      .from("dishes")
      .select("*")
      .eq("name_original", dish.name_original)
      .eq("details_generated", true)
      .limit(1)
      .single();

    let details;
    if (cachedDish) {
      // Reuse cached details from the matching dish
      details = {
        description: cachedDish.description,
        tastes_like: cachedDish.tastes_like,
        tastes_like_components: cachedDish.tastes_like_components,
        flavor_profile: cachedDish.flavor_profile,
        ingredients: cachedDish.ingredients,
        how_to_eat: cachedDish.how_to_eat,
        pronunciation: cachedDish.pronunciation,
      };
    } else {
      // Generate new details via Claude Haiku
      const cuisineType = dish.restaurants?.cuisine_type || "unknown";
      details = await generateDishDetails(dish.name_original, cuisineType);
    }

    // Update the dish record with generated details
    const { data: updatedDish, error: updateError } = await supabase
      .from("dishes")
      .update({
        description: details.description,
        tastes_like: details.tastes_like,
        tastes_like_components: details.tastes_like_components,
        flavor_profile: details.flavor_profile,
        ingredients: details.ingredients,
        how_to_eat: details.how_to_eat,
        pronunciation: details.pronunciation || dish.pronunciation,
        details_generated: true,
      })
      .eq("id", params.dishId)
      .select("*")
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({ dish: updatedDish });
  } catch (error) {
    console.error("Dish detail error:", error);
    const message = error instanceof Error ? error.message : "Failed to load dish details";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
