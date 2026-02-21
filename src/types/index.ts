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

export interface StoredDish {
  id: string;
  menu_id: string;
  name_original: string;
  name_english: string | null;
  pronunciation: string | null;
  price: string | null;
  flavor_tags: string[];
  description: string | null;
  tastes_like: string | null;
  tastes_like_components: TastesLikeComponent[] | null;
  flavor_profile: FlavorProfile | null;
  ingredients: string[] | null;
  how_to_eat: string | null;
  image_url: string | null;
  flagged: boolean;
  details_generated: boolean;
}

export interface StoredMenu {
  id: string;
  restaurant_name: string | null;
  cuisine_type: string | null;
  dishes: StoredDish[];
  scanned_at: string;
}
