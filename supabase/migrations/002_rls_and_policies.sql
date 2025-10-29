-- 002_rls_and_policies.sql
-- Habilitar RLS y políticas ejemplo

-- Habilitar extensiones necesarias
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Habilitar RLS
alter table profiles enable row level security;
alter table carts enable row level security;
alter table cart_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table products enable row level security;
alter table categories enable row level security;

-- Policy helpers (assume JWT contains 'role' claim)
-- Profiles: users can read/update their own profile, admin can read all
create policy "profiles_select_owner_or_admin" on profiles for select using (
  auth.uid() = id or auth.jwt() ->> 'role' = 'admin'
);
create policy "profiles_update_owner" on profiles for update using (
  auth.uid() = id
);

-- Carts: only owner can select/insert/update/delete
create policy "carts_owner" on carts for all using (
  carts.user_id = auth.uid()
) with check (
  carts.user_id = auth.uid()
);

-- Cart items: only owner via cart ownership
create policy "cart_items_owner" on cart_items for all using (
  exists (select 1 from carts where carts.id = cart_items.cart_id and carts.user_id = auth.uid())
) with check (
  exists (select 1 from carts where carts.id = cart_items.cart_id and carts.user_id = auth.uid())
);

-- Orders: users can read/insert their orders; admin can select all
create policy "orders_insert_owner" on orders for insert with check (
  orders.user_id = auth.uid()
);
create policy "orders_select_owner_or_admin" on orders for select using (
  orders.user_id = auth.uid() or auth.jwt() ->> 'role' = 'admin'
);
create policy "orders_update_owner" on orders for update using (
  orders.user_id = auth.uid()
);

-- Products: public can select only active products; admin can full manage
create policy "products_select_public_active" on products for select using (
  is_active = true or auth.jwt() ->> 'role' = 'admin'
);
create policy "products_admin_all" on products for insert, update, delete using (
  auth.jwt() ->> 'role' = 'admin'
) with check (
  auth.jwt() ->> 'role' = 'admin'
);

-- Categories: public select; admin manage
create policy "categories_select_public" on categories for select using (
  true
);
create policy "categories_admin" on categories for insert, update, delete using (
  auth.jwt() ->> 'role' = 'admin'
);

-- Nota: Ajusta los nombres de las políticas según tu flujo. Recomendado probar cada política usando Jwt con claim 'role'.
