-- security_invoker makes these views respect the caller's RLS on the base tables
-- rather than running as the view owner.
create view public.product_list with (security_invoker = true) as
select
  p.id,
  p.name,
  p.price,
  p.stock,
  p.image_url,
  coalesce(sum(o.quantity) filter (where o.status = 'success'), 0)::bigint as sales,
  coalesce(sum(o.amount) filter (where o.status = 'success'), 0)::numeric as revenue
from public.products p
left join public.orders o on o.product_id = p.id
group by p.id, p.name, p.price, p.stock, p.image_url;

create view public.order_list with (security_invoker = true) as
select
  o.id,
  o.reference,
  o.payment_method,
  o.status,
  o.amount,
  o.placed_at,
  p.name as product_name,
  p.image_url as product_image
from public.orders o
join public.products p on p.id = o.product_id;
