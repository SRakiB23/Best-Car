-- Until now any signed-in user reached the admin dashboard. Public registration
-- makes that unsafe, so staff are marked explicitly and customers never are.
alter table public.profiles add column is_staff boolean not null default false;

update public.profiles set is_staff = true where email = 'sazzad.sell@bestcar.com';

create function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select p.is_staff from public.profiles p where p.id = (select auth.uid())),
    false
  );
$$;

grant execute on function public.is_staff() to authenticated;

-- Registration passes the name and phone as user metadata; carry them through
-- so a customer never retypes their details at checkout.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'phone', '')
  );
  insert into public.user_settings (user_id) values (new.id);
  return new;
end;
$$;

-- A booking belonged to nobody, so customers could never look theirs up.
alter table public.bookings add column user_id uuid references auth.users (id) on delete set null;

create index bookings_user_idx on public.bookings (user_id, created_at desc);

update public.bookings b
set user_id = p.id
from public.profiles p
where b.user_id is null and lower(p.email) = lower(b.customer_email);

create policy "customers read their own bookings" on public.bookings
  for select to authenticated using (user_id = (select auth.uid()));

-- Staff keep the full list; the earlier blanket policy is now too generous.
drop policy if exists "signed in users read bookings" on public.bookings;

create policy "staff read every booking" on public.bookings
  for select to authenticated using (public.is_staff());

create or replace function public.create_booking(
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
  v_user uuid := (select auth.uid());
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
  if v_user is null then
    raise exception 'AUTH_REQUIRED';
  end if;

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
      user_id,
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
      v_user,
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

-- A booking reference is guessable enough that it should not be a public key
-- to someone's name, email and phone number.
create or replace function public.booking_payload(p_reference text)
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
  where b.reference = p_reference
    and (b.user_id = (select auth.uid()) or public.is_staff());
$$;

-- Customers may cancel their own booking; staff may cancel any.
create or replace function public.cancel_booking(p_reference text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_booking public.bookings;
begin
  select * into v_booking from public.bookings where reference = p_reference;

  if not found then
    raise exception 'BOOKING_NOT_FOUND';
  end if;

  if not (v_booking.user_id = (select auth.uid()) or public.is_staff()) then
    raise exception 'NOT_YOUR_BOOKING';
  end if;

  if v_booking.status = 'cancelled' then
    return public.booking_payload(p_reference);
  end if;

  update public.bookings set status = 'cancelled' where id = v_booking.id;

  return public.booking_payload(p_reference);
end;
$$;

-- Adding the owner at the end keeps the existing column order the view needs.
create or replace view public.booking_list with (security_invoker = true) as
select
  b.id,
  b.reference,
  b.customer_name,
  b.customer_email,
  b.customer_phone,
  b.pickup_location,
  b.start_date,
  b.end_date,
  b.days,
  b.price_per_day,
  b.total_amount,
  b.status,
  b.created_at,
  p.name as vehicle_name,
  p.image_url as vehicle_image,
  p.category as vehicle_category,
  b.user_id
from public.bookings b
join public.products p on p.id = b.vehicle_id;

revoke execute on function public.create_booking(uuid, date, date, text, text, text, text, text) from anon;
revoke execute on function public.booking_payload(text) from anon;
grant execute on function public.cancel_booking(text) to authenticated;
