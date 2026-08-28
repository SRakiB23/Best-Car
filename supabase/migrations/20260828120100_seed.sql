insert into public.stores (slug, name, location, sort_order) values
  ('grand-motors', 'Grand Motors', 'Dhaka, Banani', 1),
  ('city-autos', 'City Autos', 'Chattogram, GEC', 2),
  ('prime-wheels', 'Prime Wheels', 'Sylhet, Zindabazar', 3);

insert into public.products (name, price, stock) values
  ('Range Rover', 260.00, 12),
  ('Audi S3', 1474.00, 8),
  ('Blue Nissan', 8784.00, 3),
  ('Toyota Corolla', 3240.00, 21),
  ('Compact car', 597.00, 17),
  ('Red Toyota', 1120.00, 9);

insert into public.countries (code, name) values
  ('840', 'United States'),
  ('076', 'Brazil'),
  ('710', 'South Africa'),
  ('156', 'China'),
  ('356', 'India'),
  ('643', 'Russia');

-- Orders are skewed toward the present so period-over-period trends read as growth.
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
from generate_series(1, 1500)
cross join lateral (select id, price from public.products order by random() limit 1) as product
cross join lateral (select id from public.stores order by random() limit 1) as store
cross join lateral (select code from public.countries order by random() limit 1) as country;

insert into public.notifications (title, detail, created_at, read_at) values
  ('Low stock alert', 'Blue Nissan dropped below 5 units.', now() - interval '8 minutes', null),
  ('Payment received', 'A Paytm settlement cleared this morning.', now() - interval '42 minutes', now()),
  ('Warranty expiring', '3 warranties expire within 7 days.', now() - interval '2 hours', now());

insert into public.messages (sender, preview, created_at, read_at) values
  ('Rakib Hasan', 'Can you confirm the Range Rover delivery date?', now() - interval '5 minutes', null),
  ('Tanvir Ahmed', 'Invoice #147784454554 needs a reprint.', now() - interval '1 hour', now());
