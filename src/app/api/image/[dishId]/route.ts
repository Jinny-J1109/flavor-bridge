import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { generateDishImage } from "@/lib/replicate";

const MAX_IMAGES_PER_DAY = 100; // Server-side daily cap

export async function POST(
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

    // If image already exists, return cached
    if (dish.image_url) {
      return NextResponse.json({ image_url: dish.image_url });
    }

    // Check global cache — another dish with same name may already have an image
    const { data: cachedDish } = await supabase
      .from("dishes")
      .select("image_url, image_model")
      .eq("name_original", dish.name_original)
      .not("image_url", "is", null)
      .limit(1)
      .single();

    if (cachedDish?.image_url) {
      // Reuse cached image
      await supabase
        .from("dishes")
        .update({ image_url: cachedDish.image_url, image_model: cachedDish.image_model })
        .eq("id", params.dishId);

      return NextResponse.json({ image_url: cachedDish.image_url });
    }

    // Server-side daily cap
    const today = new Date().toISOString().split("T")[0];
    const { count } = await supabase
      .from("dishes")
      .select("id", { count: "exact", head: true })
      .not("image_url", "is", null)
      .gte("created_at", `${today}T00:00:00Z`);

    if ((count || 0) >= MAX_IMAGES_PER_DAY) {
      return NextResponse.json(
        { error: "Daily image generation limit reached. Try again tomorrow." },
        { status: 429 }
      );
    }

    // Generate image via Replicate
    const description = dish.description || dish.name_english || dish.name_original;
    const cuisineType = dish.restaurants?.cuisine_type || "international";
    const imageUrl = await generateDishImage(dish.name_original, description, cuisineType);

    // Download the image and store in Supabase Storage
    const imageRes = await fetch(imageUrl);
    const imageBuffer = Buffer.from(await imageRes.arrayBuffer());
    const storagePath = `dishes/${params.dishId}.webp`;

    await supabase.storage
      .from("dish-images")
      .upload(storagePath, imageBuffer, {
        contentType: "image/webp",
        upsert: true,
      });

    const { data: publicUrlData } = supabase.storage
      .from("dish-images")
      .getPublicUrl(storagePath);

    // Update dish record
    await supabase
      .from("dishes")
      .update({
        image_url: publicUrlData.publicUrl,
        image_model: "flux-schnell",
      })
      .eq("id", params.dishId);

    return NextResponse.json({ image_url: publicUrlData.publicUrl });
  } catch (error) {
    console.error("Image generation error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate image";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Flag an image as wrong
export async function PATCH(
  _request: NextRequest,
  { params }: { params: { dishId: string } }
) {
  try {
    const supabase = getServiceSupabase();
    const { error } = await supabase
      .from("dishes")
      .update({ flagged: true })
      .eq("id", params.dishId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Flag error:", error);
    return NextResponse.json({ error: "Failed to flag image" }, { status: 500 });
  }
}
