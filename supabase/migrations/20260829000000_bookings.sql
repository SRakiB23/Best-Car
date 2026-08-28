create extension if not exists btree_gist;

create type public.booking_status as enum ('confirmed', 'cancelled');

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  vehicle_id uuid not null references public.products (id) on delete restrict,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  pickup_location text not null default '',
  start_date date not null,
  end_date date not null,
  days int generated always as ((end_date - start_date) + 1) stored,
  price_per_day numeric(12, 2) not null check (price_per_day >= 0),
  total_amount numeric(12, 2) not null check (total_amount >= 0),
  status public.booking_status not null default 'confirmed',
  idempotency_key text unique,
  created_at timestamptz not null default now(),
  constraint bookings_dates_ordered check (end_date >= start_date),
  constraint bookings_no_overlap exclude using gist (
    vehicle_id with =,
    daterange(start_date, end_date, '[]') with &&
  ) where (status = 'confirmed')
);

create index bookings_vehicle_idx on public.bookings (vehicle_id, start_date);
create index bookings_created_at_idx on public.bookings (created_at desc);

alter table public.bookings enable row level security;

comment on table public.bookings is 'Storefront rentals. Writes only through security definer functions so pricing stays server-side.';

create function public.booking_reference()
returns text
language sql
volatile
set search_path = ''
as $$
  select 'BC-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));
$$;

create function public.vehicle_is_available(p_vehicle_id uuid, p_start date, p_end date)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select not exists (
    select 1
    from public.bookings b
    where b.vehicle_id = p_vehicle_id
      and b.status = 'confirmed'
      and daterange(b.start_date, b.end_date, '[]') && daterange(p_start, p_end, '[]')
  );
$$;

create function public.vehicle_booked_ranges(p_vehicle_id uuid)
returns table (start_date date, end_date date)
language sql
stable
security definer
set search_path = ''
as $$
  select b.start_date, b.end_date
  from public.bookings b
  where b.vehicle_id = p_vehicle_id
    and b.status = 'confirmed'
    and b.end_date >= current_date
  order by b.start_date;
$$;

create function public.create_booking(
  p_vehicle_id uuid,
  p_start date,
  p_end date,
  p_name text,
  p_email text,
  p_phone text,
  p_location text default '',
  p_idempotency_key text default null
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_name text := btrim(coalesce(p_name, ''));
  v_email text := lower(btrim(coalesce(p_email, '')));
  v_phone text := btrim(coalesce(p_phone, ''));
  v_location text := btrim(coalesce(p_location, ''));
  v_price numeric(12, 2);
  v_days int;
  v_total numeric(12, 2);
  v_booking public.bookings;
  v_existing public.bookings;
begin
  if p_idempotency_key is not null then
    select * into v_existing from public.bookings where idempotency_key = p_idempotency_key;
    if found then
      return public.booking_payload(v_existing.reference);
    end if;
  end if;

  if char_length(v_name) < 2 or char_length(v_name) > 120 then
    raise exception 'INVALID_NAME';
  end if;

  if v_email !~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    raise exception 'INVALID_EMAIL';
  end if;

  if char_length(v_phone) < 6 or char_length(v_phone) > 32 then
    raise exception 'INVALID_PHONE';
  end if;

  if p_start is null or p_end is null then
    raise exception 'INVALID_DATES';
  end if;

  if p_start < current_date then
    raise exception 'START_IN_PAST';
  end if;

  if p_end < p_start then
    raise exception 'END_BEFORE_START';
  end if;

  if (p_end - p_start) + 1 > 90 then
    raise exception 'RANGE_TOO_LONG';
  end if;

  select p.price into v_price from public.products p where p.id = p_vehicle_id;

  if not found then
    raise exception 'VEHICLE_NOT_FOUND';
  end if;

  v_days := (p_end - p_start) + 1;
  v_total := round(v_price * v_days, 2);

  begin
    insert into public.bookings (
      reference,
      vehicle_id,
      customer_name,
      customer_email,
      customer_phone,
      pickup_location,
      start_date,
      end_date,
      price_per_day,
      total_amount,
      idempotency_key
    )
    values (
      public.booking_reference(),
      p_vehicle_id,
      v_name,
      v_email,
      v_phone,
      v_location,
      p_start,
      p_end,
      v_price,
      v_total,
      p_idempotency_key
    )
    returning * into v_booking;
  exception
    when exclusion_violation then
      raise exception 'VEHICLE_UNAVAILABLE';
    when unique_violation then
      select * into v_existing from public.bookings where idempotency_key = p_idempotency_key;
      if found then
        return public.booking_payload(v_existing.reference);
      end if;
      raise;
  end;

  return public.booking_payload(v_booking.reference);
end;
$$;

create function public.booking_payload(p_reference text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'reference', b.reference,
    'status', b.status,
    'customer_name', b.customer_name,
    'customer_email', b.customer_email,
    'customer_phone', b.customer_phone,
    'pickup_location', b.pickup_location,
    'start_date', b.start_date,
    'end_date', b.end_date,
    'days', b.days,
    'price_per_day', b.price_per_day,
    'total_amount', b.total_amount,
    'created_at', b.created_at,
    'vehicle', jsonb_build_object(
      'id', p.id,
      'name', p.name,
      'category', p.category,
      'image_url', p.image_url
    )
  )
  from public.bookings b
  join public.products p on p.id = b.vehicle_id
  where b.reference = p_reference;
$$;

revoke all on function public.create_booking(uuid, date, date, text, text, text, text, text) from public;
revoke all on function public.booking_payload(text) from public;
revoke all on function public.vehicle_is_available(uuid, date, date) from public;
revoke all on function public.vehicle_booked_ranges(uuid) from public;

grant execute on function public.create_booking(uuid, date, date, text, text, text, text, text) to anon, authenticated;
grant execute on function public.booking_payload(text) to anon, authenticated;
grant execute on function public.vehicle_is_available(uuid, date, date) to anon, authenticated;
grant execute on function public.vehicle_booked_ranges(uuid) to anon, authenticated;
