export interface Restaurant {
  id: string;
  name: string | null;
  cuisine_type: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

export interface Menu {
  id: string;
  restaurant_id: string;
  image_url: string | null;
  scanned_at: string;
  created_at: string;
}

export interface Dish {
  id: string;
  menu_id: string;
  restaurant_id: string;
  name_original: string;
  name_english: string | null;
  pronunciation: string | null;
  description: string | null;
  tastes_like: string | null;
  tastes_like_components: TastesLikeComponent[] | null;
  flavor_profile: FlavorProfile | null;
  ingredients: string[] | null;
  how_to_eat: string | null;
  price: string | null;
  flavor_tags: string[] | null;
  image_url: string | null;
  image_model: string | null;
  flagged: boolean;
  details_generated: boolean;
  created_at: string;
}

export interface TastesLikeComponent {
  familiar_food: string;
  similarity: string;
}

export interface FlavorProfile {
  sour: number;
  savory: number;
  spicy: number;
  sweet: number;
  bitter: number;
}

export interface ScanEvent {
  id: string;
  session_id: string;
  restaurant_id: string | null;
  menu_id: string | null;
  event_type: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface DishInteraction {
  id: string;
  session_id: string;
  dish_id: string;
  restaurant_id: string | null;
  interaction_type: string;
  duration_ms: number | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface ScannedDish {
  name_original: string;
  name_english: string | null;
  pronunciation: string | null;
  price: string | null;
  flavor_tags: string[];
}

export interface DishDetails {
  description: string;
  tastes_like: string;
  tastes_like_components: TastesLikeComponent[];
  flavor_profile: FlavorProfile;
  ingredients: string[];
  how_to_eat: string;
  pronunciation: string;
}
