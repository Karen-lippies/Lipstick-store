-- ============================================================
-- FIX: auto-create a profile whenever any new user signs up
-- Works even when email confirmation is turned on.
-- Fixes the bug where new accounts had no "profiles" row.
-- ============================================================

-- 1) Create the auto-profile function
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, phone, is_admin)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name',
             new.raw_user_meta_data ->> 'name', ''),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    false
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- 2) Attach it: fires on every new signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- SECURITY UPGRADE: stop customers from making THEMSELVES admin
-- (replaces the old "update own profile" policy)
-- ============================================================
drop policy if exists "Users can update their own profile" on public.profiles;

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and is_admin = (select is_admin from public.profiles where id = auth.uid())
  );