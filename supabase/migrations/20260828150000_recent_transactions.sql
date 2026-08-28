-- The randomised seed left every recent order as 'success'. These five mirror the
-- dashboard design, which shows a success/cancelled/pending mix. Seconds are staggered
-- so ordering is deterministic while all five still round to the same "15 Mins" label.
insert into public.orders (
  product_id, store_id, country_code, reference, payment_method, status, amount, quantity, placed_at
)
select
  (select id from public.products where name = design.product_name),
  (select id from public.stores order by sort_order limit 1),
  design.country_code,
  design.reference,
  design.payment_method,
  design.status::public.order_status,
  design.amount,
  1,
  now() - interval '15 minutes' - (design.offset_seconds * interval '1 second')
from (
  values
    ('Range Rover',    '#416645453773', 'Paypal',    'success',   1099.00, '840', 0),
    ('Red Toyota',     '#147784454554', 'Apple Pay', 'cancelled',  600.55, '076', 2),
    ('Blue Nissan',    '#147784454554', 'Stripe',    'pending',    200.10, '156', 4),
    ('Toyota Corolla', '#147784454554', 'PayU',      'success',   1569.00, '356', 6),
    ('Range Rover',    '#147784454554', 'Paytm',     'success',   1478.00, '710', 8)
) as design (product_name, reference, payment_method, status, amount, country_code, offset_seconds);
