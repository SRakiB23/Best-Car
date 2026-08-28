-- Reads stay open so the marketing storefront can show inventory.
-- Writes require a signed-in user.
create policy "signed in users add products" on public.products
  for insert to authenticated with check (true);
create policy "signed in users edit products" on public.products
  for update to authenticated using (true) with check (true);

create policy "own profile is insertable" on public.profiles
  for insert to authenticated with check ((select auth.uid()) = id);
create policy "own settings are insertable" on public.user_settings
  for insert to authenticated with check ((select auth.uid()) = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do nothing;

create policy "product images are public" on storage.objects
  for select using (bucket_id = 'product-images');
create policy "signed in users upload product images" on storage.objects
  for insert to authenticated with check (bucket_id = 'product-images');

-- The on_auth_user_created trigger only covers users created after it existed.
insert into public.profiles (id, full_name, email)
select
  u.id,
  coalesce(u.raw_user_meta_data ->> 'full_name', initcap(replace(split_part(u.email, '@', 1), '.', ' '))),
  u.email
from auth.users u
on conflict (id) do nothing;

insert into public.user_settings (user_id)
select u.id from auth.users u
on conflict (user_id) do nothing;
