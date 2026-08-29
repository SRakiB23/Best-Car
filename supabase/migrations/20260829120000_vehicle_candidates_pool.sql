-- Retrieval used to cap at 25 rows ordered by price, so on a large fleet the
-- cheapest rows survived and a better-fitting expensive car never reached the
-- model. Scoring now happens in the application, so this returns a wider pool
-- and lets the scorer decide what gets cut.
create or replace function public.vehicle_candidates(
  p_start date default null,
  p_end date default null,
  p_min_seats int default null,
  p_min_luggage int default null,
  p_max_price_per_day numeric default null,
  p_category text default null,
  p_transmission text default null,
  p_limit int default 60
)
returns table (
  id uuid,
  name text,
  category text,
  price_per_day numeric,
  seats int,
  transmission text,
  fuel_type text,
  luggage_capacity int,
  image_url text,
  available boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    p.id,
    p.name,
    p.category,
    p.price,
    p.seats,
    p.transmission,
    p.fuel_type,
    p.luggage_capacity,
    p.image_url,
    case
      when p_start is null or p_end is null then true
      else not exists (
        select 1
        from public.bookings b
        where b.vehicle_id = p.id
          and b.status = 'confirmed'
          and daterange(b.start_date, b.end_date, '[]') && daterange(p_start, p_end, '[]')
      )
    end as available
  from public.products p
  where (p_min_seats is null or p.seats >= p_min_seats)
    and (p_min_luggage is null or p.luggage_capacity >= p_min_luggage)
    and (p_max_price_per_day is null or p.price <= p_max_price_per_day)
    and (p_category is null or p.category = p_category)
    and (p_transmission is null or p.transmission = p_transmission)
    and (
      p_start is null or p_end is null or not exists (
        select 1
        from public.bookings b
        where b.vehicle_id = p.id
          and b.status = 'confirmed'
          and daterange(b.start_date, b.end_date, '[]') && daterange(p_start, p_end, '[]')
      )
    )
  order by p.price asc
  limit least(greatest(coalesce(p_limit, 60), 1), 100);
$$;
