import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

export async function generateDishImage(
  dishName: string,
  description: string,
  cuisineType: string
): Promise<string> {
  const prompt = `A photo-realistic top-down shot of ${dishName}, a ${cuisineType} dish: ${description}. Served on a ceramic plate, restaurant table setting, natural lighting, professional food photography style, appetizing, warm tones.`;

  const output = await replicate.run(
    "black-forest-labs/flux-schnell",
    {
      input: {
        prompt,
        num_outputs: 1,
        aspect_ratio: "1:1",
        output_format: "webp",
        output_quality: 80,
      },
    }
  );

  // FLUX returns an array of ReadableStream or URLs
  const results = output as unknown[];
  if (results && results.length > 0) {
    const result = results[0];
    // Could be a URL string or a ReadableStream
    if (typeof result === "string") {
      return result;
    }
    // If it's a ReadableStream, read it to get the URL
    if (result && typeof result === "object" && "url" in (result as Record<string, unknown>)) {
      return (result as { url: string }).url;
    }
  }
  throw new Error("No image generated");
}
