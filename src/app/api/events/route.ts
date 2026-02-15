import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session_id, event_type, dish_id, restaurant_id, menu_id, duration_ms, metadata } = body;

    if (!session_id || !event_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    // Dish-specific interactions go to dish_interactions
    if (dish_id && ["dish_viewed", "pronunciation_played", "image_loaded", "image_flagged", "dish_card_time"].includes(event_type)) {
      await supabase.from("dish_interactions").insert({
        session_id,
        dish_id,
        restaurant_id,
        interaction_type: event_type,
        duration_ms: duration_ms || null,
        metadata: metadata || null,
      });
    }

    // All events go to scan_events as a general log
    await supabase.from("scan_events").insert({
      session_id,
      restaurant_id: restaurant_id || null,
      menu_id: menu_id || null,
      event_type,
      metadata: { dish_id, duration_ms, ...metadata },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Event logging error:", error);
    return NextResponse.json({ error: "Failed to log event" }, { status: 500 });
  }
}
