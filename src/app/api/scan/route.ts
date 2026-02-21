import { NextRequest, NextResponse } from "next/server";
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

    return NextResponse.json(result);
  } catch (error) {
    console.error("Scan error:", error);
    const message = error instanceof Error ? error.message : "Failed to scan menu";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
