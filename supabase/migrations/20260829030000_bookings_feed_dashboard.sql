-- Storefront bookings have to reach the dashboard. Rather than teach every
-- metric about a second table, each booking posts itself to the orders ledger
-- the dashboard already aggregates: amount = total, quantity = days rented.

insert into public.countries (code, name) values ('050', 'Bangladesh')
on conflict (code) do nothing;

create function public.booking_posts_to_ledger()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_vehicle public.products;
  v_store uuid;
begin
  select * into v_vehicle from public.products where id = new.vehicle_id;
  select id into v_store from public.stores order by sort_order limit 1;

  insert into public.orders (
    product_id,
    store_id,
    country_code,
    reference,
    payment_method,
    status,
    amount,
    quantity,
    placed_at
  )
  values (
    new.vehicle_id,
    v_store,
    '050',
    new.reference,
    'Online',
    case when new.status = 'confirmed' then 'success' else 'cancelled' end::public.order_status,
    new.total_amount,
    new.days,
    new.created_at
  );

  insert into public.notifications (title, detail, created_at)
  values (
    'New booking',
    format(
      '%s booked the %s for %s day(s) from %s. Reference %s.',
      new.customer_name,
      coalesce(v_vehicle.name, 'vehicle'),
      new.days,
      to_char(new.start_date, 'DD Mon'),
      new.reference
    ),
    new.created_at
  );

  return new;
end;
$$;

create trigger bookings_post_to_ledger
after insert on public.bookings
for each row execute function public.booking_posts_to_ledger();

-- A cancelled booking must stop counting towards revenue.
create function public.booking_status_syncs_ledger()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.orders
  set status = case when new.status = 'confirmed' then 'success' else 'cancelled' end::public.order_status
  where reference = new.reference;

  return new;
end;
$$;

create trigger bookings_sync_ledger_status
after update of status on public.bookings
for each row
when (old.status is distinct from new.status)
execute function public.booking_status_syncs_ledger();

-- Backfill anything booked before this bridge existed.
insert into public.orders (
  product_id, store_id, country_code, reference, payment_method, status, amount, quantity, placed_at
)
select
  b.vehicle_id,
  (select id from public.stores order by sort_order limit 1),
  '050',
  b.reference,
  'Online',
  case when b.status = 'confirmed' then 'success' else 'cancelled' end::public.order_status,
  b.total_amount,
  b.days,
  b.created_at
from public.bookings b
where not exists (select 1 from public.orders o where o.reference = b.reference);
