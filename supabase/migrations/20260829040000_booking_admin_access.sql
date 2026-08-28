-- The storefront writes bookings through security definer functions, so the
-- table had no select policy at all. Staff need to read them.
create policy "signed in users read bookings" on public.bookings
  for select to authenticated using (true);

create view public.booking_list with (security_invoker = true) as
select
  b.id,
  b.reference,
  b.customer_name,
  b.customer_email,
  b.customer_phone,
  b.pickup_location,
  b.start_date,
  b.end_date,
  b.days,
  b.price_per_day,
  b.total_amount,
  b.status,
  b.created_at,
  p.name as vehicle_name,
  p.image_url as vehicle_image,
  p.category as vehicle_category
from public.bookings b
join public.products p on p.id = b.vehicle_id;

-- Marking the inbox read only lived in component state; persist it.
create policy "signed in users update notifications" on public.notifications
  for update to authenticated using (true) with check (true);
create policy "signed in users update messages" on public.messages
  for update to authenticated using (true) with check (true);
