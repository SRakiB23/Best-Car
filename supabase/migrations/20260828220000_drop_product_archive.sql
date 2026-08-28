-- Archiving is gone: a car that has sold can no longer be removed from the UI
-- at all, so there is nothing left to set this flag.
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
group by p.id, p.name, p.price, p.stock, p.image_url, p.category;

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
    and o.placed_at >= now() - make_interval(days => window_days)
  group by p.id, p.name, p.price, p.image_url
  order by sales desc
  limit max_rows;
$$;

alter table public.products drop column archived_at;
