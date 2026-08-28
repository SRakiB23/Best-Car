-- These policies were written when "signed in" meant "staff". Now that
-- customers hold accounts too, every admin capability needs the staff test.
drop policy if exists "signed in users add products" on public.products;
drop policy if exists "signed in users edit products" on public.products;
drop policy if exists "signed in users remove products" on public.products;

create policy "staff add products" on public.products
  for insert to authenticated with check (public.is_staff());

create policy "staff edit products" on public.products
  for update to authenticated using (public.is_staff()) with check (public.is_staff());

create policy "staff remove products" on public.products
  for delete to authenticated using (public.is_staff());

drop policy if exists "signed in users update notifications" on public.notifications;
drop policy if exists "signed in users update messages" on public.messages;

create policy "staff update notifications" on public.notifications
  for update to authenticated using (public.is_staff()) with check (public.is_staff());

create policy "staff update messages" on public.messages
  for update to authenticated using (public.is_staff()) with check (public.is_staff());

-- The ledger and the inbox carry other customers' details, so they stop being
-- world readable; the fleet and lookup tables stay public for the storefront.
drop policy if exists "dashboard data is readable" on public.orders;
drop policy if exists "dashboard data is readable" on public.notifications;
drop policy if exists "dashboard data is readable" on public.messages;

create policy "staff read orders" on public.orders
  for select to authenticated using (public.is_staff());

create policy "staff read notifications" on public.notifications
  for select to authenticated using (public.is_staff());

create policy "staff read messages" on public.messages
  for select to authenticated using (public.is_staff());

drop policy if exists "signed in users upload product images" on storage.objects;
drop policy if exists "signed in users remove product images" on storage.objects;

create policy "staff upload product images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_staff());

create policy "staff remove product images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'product-images' and public.is_staff());
