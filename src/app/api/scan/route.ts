import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { scanMenuImage } from "@/lib/claude";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;
    if (!imageFile) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Convert to base64 for Claude
    const bytes = await imageFile.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");

    // Determine media type
    const mimeType = imageFile.type || "image/jpeg";
    const mediaType = (
      ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(mimeType)
        ? mimeType
        : "image/jpeg"
    ) as "image/jpeg" | "image/png" | "image/webp" | "image/gif";

    // Call Claude Vision OCR
    const result = await scanMenuImage(base64, mediaType);

    const supabase = getServiceSupabase();

    // Create restaurant record
    const { data: restaurant, error: restError } = await supabase
      .from("restaurants")
      .insert({
        name: result.restaurant_name,
        cuisine_type: result.cuisine_type,
      })
      .select("id")
      .single();

    if (restError) throw restError;

    // Upload image to Supabase Storage
    const imagePath = `menus/${restaurant.id}/${Date.now()}.jpg`;
    await supabase.storage
      .from("menu-images")
      .upload(imagePath, Buffer.from(bytes), {
        contentType: mediaType,
      });

    const { data: imageUrlData } = supabase.storage
      .from("menu-images")
      .getPublicUrl(imagePath);

    // Create menu record
    const { data: menu, error: menuError } = await supabase
      .from("menus")
      .insert({
        restaurant_id: restaurant.id,
        image_url: imageUrlData.publicUrl,
      })
      .select("id")
      .single();

    if (menuError) throw menuError;

    // Create dish records
    if (result.dishes.length > 0) {
      const dishRecords = result.dishes.map((dish) => ({
        menu_id: menu.id,
        restaurant_id: restaurant.id,
        name_original: dish.name_original,
        name_english: dish.name_english,
        pronunciation: dish.pronunciation,
        price: dish.price,
        flavor_tags: dish.flavor_tags,
      }));

      const { error: dishError } = await supabase.from("dishes").insert(dishRecords);
      if (dishError) throw dishError;
    }

    return NextResponse.json({ menuId: menu.id, dishCount: result.dishes.length });
  } catch (error) {
    console.error("Scan error:", error);
    const message = error instanceof Error ? error.message : "Failed to scan menu";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
