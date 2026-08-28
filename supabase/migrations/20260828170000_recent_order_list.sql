-- The sales screen shows a manageable, recent slice rather than the full history.
-- The underlying orders table keeps every row, because the dashboard's revenue,
-- trend and yearly chart aggregates need three years of history to be meaningful.
-- Raise or drop this limit to widen the list.
create view public.recent_order_list with (security_invoker = true) as
select *
from public.order_list
order by placed_at desc
limit 30;
