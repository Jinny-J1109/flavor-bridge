import Anthropic from "@anthropic-ai/sdk";
import type { ScannedDish, DishDetails } from "@/types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function scanMenuImage(
  imageBase64: string,
  mediaType: "image/jpeg" | "image/png" | "image/webp" | "image/gif"
): Promise<{ cuisine_type: string; restaurant_name: string | null; dishes: ScannedDish[] }> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mediaType, data: imageBase64 },
          },
          {
            type: "text",
            text: `You are analyzing a restaurant menu photo. Extract all dishes you can identify.

Return a JSON object with this exact structure:
{
  "cuisine_type": "the cuisine type (e.g. Chinese, Thai, Japanese, Mexican, etc.)",
  "restaurant_name": "restaurant name if visible, or null",
  "dishes": [
    {
      "name_original": "dish name in original language as written on menu",
      "name_english": "English translation or name (null if already in English)",
      "pronunciation": "phonetic pronunciation guide for English speakers",
      "price": "price as shown on menu or null",
      "flavor_tags": ["relevant tags like Spicy, Sweet, Sour, Savory, Crispy, etc."]
    }
  ]
}

Rules:
- Extract EVERY dish visible on the menu
- Keep original language characters if present
- Provide helpful phonetic pronunciation (e.g. "fuh" for pho, "gwoh tyeh" for 锅贴)
- Assign 1-3 flavor tags per dish based on your knowledge of the dish
- If price is visible, include it exactly as shown
- Return ONLY valid JSON, no markdown or explanation`,
          },
        ],
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";
  // Strip markdown code fences if present
  const cleaned = text.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
  return JSON.parse(cleaned);
}

export async function generateDishDetails(
  dishName: string,
  cuisineType: string
): Promise<DishDetails> {
  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `You are a food expert. Generate detailed information about the dish "${dishName}" from ${cuisineType} cuisine.

Return a JSON object with this exact structure:
{
  "description": "A 2-3 sentence vivid description of the dish — what it looks like, its textures, key flavors",
  "tastes_like": "A one-line 'tastes like' comparison using familiar Western foods (e.g. 'Like a coconut curry ramen — rich, slightly sweet, with crispy noodles on top')",
  "tastes_like_components": [
    {"familiar_food": "a familiar food it's similar to", "similarity": "how it's similar"},
    {"familiar_food": "another familiar food", "similarity": "how it's similar"},
    {"familiar_food": "a third familiar food", "similarity": "how it's similar"}
  ],
  "flavor_profile": {
    "sour": 0-10,
    "savory": 0-10,
    "spicy": 0-10,
    "sweet": 0-10,
    "bitter": 0-10
  },
  "ingredients": ["key ingredient 1", "key ingredient 2", ...],
  "how_to_eat": "One practical sentence on how this dish is traditionally eaten (utensils, dipping, mixing, etc.)",
  "pronunciation": "phonetic pronunciation guide for English speakers"
}

Rules:
- Make the "tastes like" comparison vivid, relatable, and specific
- Flavor profile scores should be 0-10 where 0 = not present, 10 = extremely strong
- List 4-8 key ingredients
- The how_to_eat should be practical and specific
- Return ONLY valid JSON, no markdown or explanation`,
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";
  const cleaned = text.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
  return JSON.parse(cleaned);
}
