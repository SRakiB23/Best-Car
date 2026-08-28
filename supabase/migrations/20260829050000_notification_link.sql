alter table public.notifications add column link text not null default '';

comment on column public.notifications.link is
  'Optional admin route the notification opens, e.g. the booking it announces.';

create or replace function public.booking_posts_to_ledger()
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

  insert into public.notifications (title, detail, link, created_at)
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
    '/admin/sales/online-orders?q=' || new.reference,
    new.created_at
  );

  return new;
end;
$$;

-- Point the notifications raised before this column existed at their booking.
update public.notifications n
set link = '/admin/sales/online-orders?q=' || b.reference
from public.bookings b
where n.link = '' and n.detail like '%' || b.reference || '%';
