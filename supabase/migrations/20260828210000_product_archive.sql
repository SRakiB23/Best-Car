-- orders.product_id cascades on delete, so removing a car that has sold would
-- take its order history with it and move every dashboard total. Cars with
-- sales are archived instead: hidden from the catalogue, orders untouched.
alter table public.products add column archived_at timestamptz;

create policy "signed in users remove products" on public.products
  for delete to authenticated using (true);

create or replace view public.product_list with (security_invoker = true) as
select
  p.id,
  p.name,
  p.price,
  p.stock,
  p.image_url,
  coalesce(sum(o.quantity) filter (where o.status = 'success'), 0)::bigint as sales,
  coalesce(sum(o.amount) filter (where o.status = 'success'), 0)::numeric as revenue,
  p.category
from public.products p
left join public.orders o on o.product_id = p.id
where p.archived_at is null
group by p.id, p.name, p.price, p.stock, p.image_url, p.category;

-- Best sellers reads the products table directly, so it needs the same filter.
drop function public.best_sellers(int, int);

create function public.best_sellers(window_days int, max_rows int)
returns table (id uuid, name text, price numeric, sales bigint, image_url text)
language sql
stable
set search_path = ''
as $$
  select p.id, p.name, p.price, sum(o.quantity)::bigint as sales, p.image_url
  from public.orders o
  join public.products p on p.id = o.product_id
  where o.status = 'success'
    and p.archived_at is null
    and o.placed_at >= now() - make_interval(days => window_days)
  group by p.id, p.name, p.price, p.image_url
  order by sales desc
  limit max_rows;
$$;
