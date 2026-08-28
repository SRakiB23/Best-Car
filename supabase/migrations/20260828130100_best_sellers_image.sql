drop function public.best_sellers(int, int);

create function public.best_sellers(window_days int, max_rows int)
returns table (id uuid, name text, price numeric, image_url text, sales bigint)
language sql
stable
set search_path = ''
as $$
  select p.id, p.name, p.price, p.image_url, sum(o.quantity)::bigint as sales
  from public.orders o
  join public.products p on p.id = o.product_id
  where o.status = 'success'
    and o.placed_at >= now() - make_interval(days => window_days)
  group by p.id, p.name, p.price, p.image_url
  order by sales desc
  limit max_rows;
$$;
