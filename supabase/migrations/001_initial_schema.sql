-- Flavor Bridge initial schema

-- Restaurants table
create table if not exists restaurants (
  id uuid primary key default gen_random_uuid(),
  name text,
  cuisine_type text,
  address text,
  latitude double precision,
  longitude double precision,
  created_at timestamptz default now()
);

-- Menus table
create table if not exists menus (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid references restaurants(id) on delete cascade,
  image_url text,
  scanned_at timestamptz default now(),
  created_at timestamptz default now()
);

-- Dishes table
create table if not exists dishes (
  id uuid primary key default gen_random_uuid(),
  menu_id uuid references menus(id) on delete cascade,
  restaurant_id uuid references restaurants(id) on delete cascade,
  name_original text not null,
  name_english text,
  pronunciation text,
  description text,
  tastes_like text,
  tastes_like_components jsonb,
  flavor_profile jsonb,
  ingredients jsonb,
  how_to_eat text,
  price text,
  flavor_tags jsonb default '[]'::jsonb,
  image_url text,
  image_model text,
  flagged boolean default false,
  details_generated boolean default false,
  created_at timestamptz default now()
);

-- Scan events table
create table if not exists scan_events (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  restaurant_id uuid references restaurants(id) on delete set null,
  menu_id uuid references menus(id) on delete set null,
  event_type text not null,
  metadata jsonb,
  created_at timestamptz default now()
);

-- Dish interactions table
create table if not exists dish_interactions (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  dish_id uuid references dishes(id) on delete cascade,
  restaurant_id uuid references restaurants(id) on delete set null,
  interaction_type text not null,
  duration_ms integer,
  metadata jsonb,
  created_at timestamptz default now()
);

-- Indexes for performance
create index if not exists idx_menus_restaurant on menus(restaurant_id);
create index if not exists idx_dishes_menu on dishes(menu_id);
create index if not exists idx_dishes_restaurant on dishes(restaurant_id);
create index if not exists idx_dishes_name on dishes(name_original);
create index if not exists idx_scan_events_session on scan_events(session_id);
create index if not exists idx_dish_interactions_session on dish_interactions(session_id);
create index if not exists idx_dish_interactions_dish on dish_interactions(dish_id);

-- RLS policies (Phase 9 will enable these)
-- alter table restaurants enable row level security;
-- alter table menus enable row level security;
-- alter table dishes enable row level security;
-- alter table scan_events enable row level security;
-- alter table dish_interactions enable row level security;
