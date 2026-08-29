-- The storefront only ever needed a price and a picture, but the recommender has
-- to reason about whether a car actually fits the trip. These columns exist so the
-- model is handed facts instead of guessing them from the model name.
alter table public.products
  add column seats int not null default 5 check (seats between 1 and 9),
  add column transmission text not null default 'Automatic'
    check (transmission in ('Automatic', 'Manual')),
  add column fuel_type text not null default 'Petrol'
    check (fuel_type in ('Petrol', 'Diesel', 'Hybrid', 'Electric')),
  add column luggage_capacity int not null default 2 check (luggage_capacity between 0 and 8);

comment on column public.products.luggage_capacity is 'Large suitcases that fit in the boot.';

update public.products set
  seats = v.seats,
  transmission = v.transmission,
  fuel_type = v.fuel_type,
  luggage_capacity = v.luggage
from (values
  ('Range Rover',       5, 'Automatic', 'Diesel',   3),
  ('Audi S3',           4, 'Automatic', 'Petrol',   2),
  ('Blue Nissan',       7, 'Automatic', 'Petrol',   4),
  ('Toyota Corolla',    5, 'Manual',    'Petrol',   2),
  ('Compact car',       4, 'Manual',    'Petrol',   1),
  ('Red Toyota',        5, 'Automatic', 'Hybrid',   2),
  ('Aston Martin DB11', 4, 'Automatic', 'Petrol',   1),
  ('BMW X5',            7, 'Automatic', 'Diesel',   4),
  ('Mercedes C-Class',  5, 'Automatic', 'Petrol',   2),
  ('Tesla Model 3',     5, 'Automatic', 'Electric', 2),
  ('Audi A6',           5, 'Automatic', 'Diesel',   3)
) as v(name, seats, transmission, fuel_type, luggage)
where public.products.name = v.name;

-- Candidate retrieval for the recommender. Availability lives in public.bookings,
-- which customers cannot read, so this has to be security definer. Every hard
-- constraint is applied here: whatever the model sees is already bookable.
create function public.vehicle_candidates(
  p_start date default null,
  p_end date default null,
  p_min_seats int default null,
  p_min_luggage int default null,
  p_max_price_per_day numeric default null,
  p_category text default null,
  p_transmission text default null,
  p_limit int default 12
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
  limit least(greatest(coalesce(p_limit, 12), 1), 25);
$$;

revoke all on function public.vehicle_candidates(date, date, int, int, numeric, text, text, int) from public;
grant execute on function public.vehicle_candidates(date, date, int, int, numeric, text, text, int) to anon, authenticated;
