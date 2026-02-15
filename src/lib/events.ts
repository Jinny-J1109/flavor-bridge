import { getSessionId } from "./session";

type EventType =
  | "menu_scanned"
  | "dish_viewed"
  | "pronunciation_played"
  | "image_loaded"
  | "image_flagged"
  | "dish_card_time";

interface EventPayload {
  event_type: EventType;
  dish_id?: string;
  restaurant_id?: string;
  menu_id?: string;
  duration_ms?: number;
  metadata?: Record<string, unknown>;
}

export async function logEvent(payload: EventPayload): Promise<void> {
  const sessionId = getSessionId();
  if (!sessionId) return;

  try {
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, session_id: sessionId }),
    });
  } catch {
    // Silent failure — analytics should never break the UX
  }
}
