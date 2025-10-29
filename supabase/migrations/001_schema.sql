-- 001_schema.sql
-- Tablas principales: profiles, categories, products, carts, cart_items, orders, order_items

create table if not exists profiles (
  id uuid primary key default auth.uid(),
  email text unique,
  full_name text,
  phone text,
  role text default 'user',
  created_at timestamptz default now()
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id) on delete set null,
  name text not null,
  description text,
  price numeric(10,2) not null default 0,
  stock int not null default 0,
  images text[], -- array of image URLs
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now()
);

create table if not exists cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid references carts(id) on delete cascade,
  product_id uuid references products(id),
  quantity int not null default 1,
  created_at timestamptz default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  total numeric(10,2) not null default 0,
  status text default 'pending',
  shipping_address jsonb,
  created_at timestamptz default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id),
  price numeric(10,2),
  quantity int not null default 1
);
