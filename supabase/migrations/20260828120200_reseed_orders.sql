-- The previous seed used uncorrelated LATERAL subqueries, so Postgres evaluated
-- them once and every order received the same product, store and country.
-- Ordering by md5 of the outer row number correlates them, giving one draw per row.
delete from public.orders;

insert into public.orders (
  product_id, store_id, country_code, reference, payment_method, status, amount, quantity, placed_at
)
select
  product.id,
  store.id,
  country.code,
  '#' || lpad((floor(random() * 1000000000000))::bigint::text, 12, '0'),
  (array['Paypal', 'Apple Pay', 'Stripe', 'PayU', 'Paytm'])[1 + floor(random() * 5)],
  (array['success', 'success', 'success', 'success', 'success', 'pending', 'cancelled'])[1 + floor(random() * 7)]::public.order_status,
  round((product.price * (0.8 + random() * 0.6))::numeric, 2),
  1 + floor(random() * 3)::int,
  now() - (interval '1080 days' * power(random(), 1.8))
from generate_series(1, 1500) as series (n)
cross join lateral (
  select id, price from public.products order by md5(series.n::text || id::text) limit 1
) as product
cross join lateral (
  select id from public.stores order by md5(series.n::text || 's' || id::text) limit 1
) as store
cross join lateral (
  select code from public.countries order by md5(series.n::text || 'c' || code) limit 1
) as country;
