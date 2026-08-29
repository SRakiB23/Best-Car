-- A phone number is now mandatory on the inquiry form. A rental gets confirmed by
-- phone, and emailing a high-priority lead back loses the hours that made it
-- high-priority in the first place.
--
-- Enforced inside the function rather than as a column constraint, for the same
-- reason as the dates: `create_lead` is granted to anon, so the form's own
-- validation is not a boundary, but the column must keep its '' default for the
-- leads captured before this rule.
create or replace function public.create_lead(
  p_name text,
  p_email text,
  p_message text,
  p_phone text default '',
  p_vehicle_id uuid default null,
  p_source text default 'website',
  p_pickup_date date default null,
  p_return_date date default null
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
  v_message text := btrim(coalesce(p_message, ''));
  v_recent int;
  v_lead public.leads;
begin
  if char_length(v_name) < 2 or char_length(v_name) > 120 then
    raise exception 'INVALID_NAME';
  end if;

  if v_email !~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    raise exception 'INVALID_EMAIL';
  end if;

  if v_phone = '' then
    raise exception 'MISSING_PHONE';
  end if;

  if char_length(v_phone) < 6 or char_length(v_phone) > 32 then
    raise exception 'INVALID_PHONE';
  end if;

  if char_length(v_message) < 15 or char_length(v_message) > 2000 then
    raise exception 'INVALID_MESSAGE';
  end if;

  if p_pickup_date is null or p_return_date is null then
    raise exception 'MISSING_DATES';
  end if;

  -- A trip that already started is a typo, not a plan. Rejected rather than
  -- stored, so the model is never scored against a date in the past.
  if p_pickup_date < current_date then
    raise exception 'INVALID_DATES';
  end if;

  if p_return_date < p_pickup_date then
    raise exception 'INVALID_DATES';
  end if;

  -- Cheap flood guard. The endpoint is public and every lead costs a model call
  -- later, so one address cannot fill the pipeline on its own.
  select count(*) into v_recent
  from public.leads l
  where l.customer_email = v_email
    and l.created_at > now() - interval '1 hour';

  if v_recent >= 5 then
    raise exception 'TOO_MANY_INQUIRIES';
  end if;

  insert into public.leads (
    customer_name, customer_email, customer_phone, message, source, vehicle_id, user_id,
    pickup_date, return_date
  )
  values (
    v_name,
    v_email,
    v_phone,
    v_message,
    left(coalesce(nullif(btrim(p_source), ''), 'website'), 40),
    p_vehicle_id,
    (select auth.uid()),
    p_pickup_date,
    p_return_date
  )
  returning * into v_lead;

  return jsonb_build_object('id', v_lead.id, 'created_at', v_lead.created_at);
end;
$$;
