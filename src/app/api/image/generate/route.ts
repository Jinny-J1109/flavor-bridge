import { NextRequest, NextResponse } from "next/server";
import { generateDishImage } from "@/lib/replicate";

export async function POST(request: NextRequest) {
  try {
    const { name_original, description, cuisine_type } = await request.json();

    if (!name_original || !cuisine_type) {
      return NextResponse.json(
        { error: "name_original and cuisine_type are required" },
        { status: 400 }
      );
    }

    const imageUrl = await generateDishImage(
      name_original,
      description || name_original,
      cuisine_type
    );

    return NextResponse.json({ image_url: imageUrl });
  } catch (error) {
    console.error("Image generation error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate image";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
