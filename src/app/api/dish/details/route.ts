import { NextRequest, NextResponse } from "next/server";
import { generateDishDetails } from "@/lib/claude";

export async function POST(request: NextRequest) {
  try {
    const { name_original, cuisine_type } = await request.json();

    if (!name_original || !cuisine_type) {
      return NextResponse.json(
        { error: "name_original and cuisine_type are required" },
        { status: 400 }
      );
    }

    const details = await generateDishDetails(name_original, cuisine_type);
    return NextResponse.json(details);
  } catch (error) {
    console.error("Dish detail error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate dish details";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
