alter table public.products
  add column category text not null default 'Sedan'
  check (category in ('SUV', 'Sedan', 'Hatchback', 'Coupe', 'Pickup'));

update public.products set category = case name
  when 'Range Rover' then 'SUV'
  when 'Blue Nissan' then 'SUV'
  when 'Audi S3' then 'Coupe'
  when 'Compact car' then 'Hatchback'
  else 'Sedan'
end;

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
