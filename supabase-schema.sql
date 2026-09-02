-- ============================================================
-- SUPABASE DATABASE SETUP (run once in the SQL Editor)
-- ============================================================
-- HOW TO RUN:
-- 1. In Supabase Dashboard, go to SQL Editor (icon looks like ">_")
-- 2. Click "New query"
-- 3. Delete the sample query, paste ALL of this in
-- 4. Click "Run" (or Ctrl + Enter)
-- 5. You can re-run it safely anytime (it won't delete your data)
-- ============================================================

-- --------------------------------------------------------
-- Enable the uuid extension (like a plugin)
-- --------------------------------------------------------
create extension if not exists "uuid-ossp";

-- ============================================================
-- 1) PROFILES TABLE (one row per user account)
--    Stores name, email, phone, address, admin flag
-- ============================================================
create table if not exists public.profiles (
    id uuid primary key references auth.users (id) on delete cascade,
    name text,
    email text,
    phone text,
    address jsonb,
    is_admin boolean default false,
    created_at timestamp with time zone default now()
);

-- ============================================================
-- 2) PRODUCTS TABLE
--    Everything the admin adds shows on the site + try-on
-- ============================================================
create table if not exists public.products (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    category text not null check (category in ('Lipstick', 'Eyeshadow', 'Eyeliner')),
    shade_code text not null default '#c0392b',
    price numeric(10, 2) not null,
    image_url text default '',
    created_at timestamp with time zone default now()
);

-- ============================================================
-- 3) CART_ITEMS TABLE
--    One row per item a customer adds to their bag
-- ============================================================
create table if not exists public.cart_items (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users (id) on delete cascade,
    product_id uuid not null,
    name text,
    price numeric(10, 2),
    shade_code text,
    category text,
    image_url text default '',
    quantity integer default 1,
    created_at timestamp with time zone default now()
);

-- ============================================================
-- 4) ORDERS TABLE
--    Saved when a customer places an order at checkout
-- ============================================================
create table if not exists public.orders (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users (id) on delete cascade,
    items jsonb,
    total numeric(10, 2),
    address jsonb,
    status text default 'pending',
    payment_status text default 'pending',
    created_at timestamp with time zone default now()
);

-- ============================================================
-- 5) STORAGE BUCKET for product images
-- ============================================================
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- ============================================================
-- 6) SECURITY (Row Level Security)
--    Enable RLS on every table so outsiders are blocked
-- ============================================================
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;

-- --------------------------------------------------------
-- PROFILES: register upstream insert, read/update your own row.
-- The admin can read all profiles.
-- --------------------------------------------------------
create policy "Users can insert their own profile"
    on public.profiles for insert
    with check (auth.uid() = id);

create policy "Users can read their own profile"
    on public.profiles for select
    using (auth.uid() = id);

create policy "Users can update their own profile"
    on public.profiles for update
    using (auth.uid() = id);

-- --------------------------------------------------------
-- PRODUCTS: anybody (even not logged in) can read.
-- Only the admin can write (add / edit / delete).
-- --------------------------------------------------------
create policy "Anyone can read products"
    on public.products for select
    using (true);

create policy "Only admin can add products"
    on public.products for insert
    with check (
        auth.uid() in (
            select id from public.profiles where is_admin = true
        )
    );

create policy "Only admin can update products"
    on public.products for update
    using (
        auth.uid() in (
            select id from public.profiles where is_admin = true
        )
    );

create policy "Only admin can delete products"
    on public.products for delete
    using (
        auth.uid() in (
            select id from public.profiles where is_admin = true
        )
    );

-- --------------------------------------------------------
-- CART_ITEMS: users can only touch their own cart rows
-- --------------------------------------------------------
create policy "Users can read own cart"
    on public.cart_items for select
    using (auth.uid() = user_id);

create policy "Users can add to own cart"
    on public.cart_items for insert
    with check (auth.uid() = user_id);

create policy "Users can update own cart"
    on public.cart_items for update
    using (auth.uid() = user_id);

create policy "Users can delete own cart"
    on public.cart_items for delete
    using (auth.uid() = user_id);

-- --------------------------------------------------------
-- ORDERS: users can read/write their own orders
-- --------------------------------------------------------
create policy "Users can read own orders"
    on public.orders for select
    using (auth.uid() = user_id);

create policy "Users can create orders"
    on public.orders for insert
    with check (auth.uid() = user_id);

-- --------------------------------------------------------
-- STORAGE: anyone can view product images (read only)
-- Only admins can upload
-- --------------------------------------------------------
create policy "Anyone can view product images"
    on storage.objects for select
    using (bucket_id = 'product-images');

create policy "Admins can upload product images"
    on storage.objects for insert
    with check (
        bucket_id = 'product-images'
        and auth.uid() in (
            select id from public.profiles where is_admin = true
        )
    );

create policy "Admins can delete product images"
    on storage.objects for delete
    using (
        bucket_id = 'product-images'
        and auth.uid() in (
            select id from public.profiles where is_admin = true
        )
    );