import type { StoredMenu, StoredDish, ScannedDish } from "@/types";

const MENUS_KEY = "flavor-bridge-menus";

function getAllMenus(): StoredMenu[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(MENUS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveAllMenus(menus: StoredMenu[]) {
  localStorage.setItem(MENUS_KEY, JSON.stringify(menus));
}

export function saveMenu(menu: StoredMenu): void {
  const menus = getAllMenus();
  menus.push(menu);
  saveAllMenus(menus);
}

export function getMenu(menuId: string): StoredMenu | null {
  return getAllMenus().find((m) => m.id === menuId) || null;
}

export function getDish(
  dishId: string
): { dish: StoredDish; menu: StoredMenu } | null {
  for (const menu of getAllMenus()) {
    const dish = menu.dishes.find((d) => d.id === dishId);
    if (dish) return { dish, menu };
  }
  return null;
}

export function updateDish(
  dishId: string,
  updates: Partial<StoredDish>
): void {
  const menus = getAllMenus();
  for (const menu of menus) {
    const idx = menu.dishes.findIndex((d) => d.id === dishId);
    if (idx !== -1) {
      menu.dishes[idx] = { ...menu.dishes[idx], ...updates };
      saveAllMenus(menus);
      return;
    }
  }
}

export function findCachedDetails(nameOriginal: string): StoredDish | null {
  for (const menu of getAllMenus()) {
    const dish = menu.dishes.find(
      (d) => d.name_original === nameOriginal && d.details_generated
    );
    if (dish) return dish;
  }
  return null;
}

export function findCachedImage(nameOriginal: string): string | null {
  for (const menu of getAllMenus()) {
    const dish = menu.dishes.find(
      (d) => d.name_original === nameOriginal && d.image_url
    );
    if (dish) return dish.image_url;
  }
  return null;
}

export function buildMenuFromScanResult(scanResult: {
  restaurant_name: string | null;
  cuisine_type: string;
  dishes: ScannedDish[];
}): StoredMenu {
  const menuId = crypto.randomUUID();
  return {
    id: menuId,
    restaurant_name: scanResult.restaurant_name,
    cuisine_type: scanResult.cuisine_type,
    dishes: scanResult.dishes.map((d) => ({
      id: crypto.randomUUID(),
      menu_id: menuId,
      name_original: d.name_original,
      name_english: d.name_english,
      pronunciation: d.pronunciation,
      price: d.price,
      flavor_tags: d.flavor_tags,
      description: null,
      tastes_like: null,
      tastes_like_components: null,
      flavor_profile: null,
      ingredients: null,
      how_to_eat: null,
      image_url: null,
      flagged: false,
      details_generated: false,
    })),
    scanned_at: new Date().toISOString(),
  };
}
