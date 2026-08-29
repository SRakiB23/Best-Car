-- Dates the customer stated in the inquiry form. Firm dates are the strongest
-- signal that an inquiry is close to a booking, and until now the model had to
-- infer them from prose and usually landed on "unknown".
--
-- Deliberately separate from the qualification columns: these are what the
-- customer said, not what the model concluded, and re-running qualification
-- must never overwrite them.
alter table public.leads
  add column pickup_date date,
  add column return_date date,
  add constraint leads_dates_ordered check (
    pickup_date is null or return_date is null or return_date >= pickup_date
  );

comment on column public.leads.pickup_date is 'Pick-up date stated by the customer. Null when they did not give one.';
comment on column public.leads.return_date is 'Return date stated by the customer. Null when they did not give one.';

-- Both dates are optional. The inquiry form exists for visitors who are not
-- ready to commit, so requiring them would cost us the leads it was built for.
drop function public.create_lead(text, text, text, text, uuid, text);

create function public.create_lead(
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

  -- Phone is optional here: asking for it up front loses inquiries, and the
  -- model is told to treat a blank one as unknown rather than guess.
  if v_phone <> '' and (char_length(v_phone) < 6 or char_length(v_phone) > 32) then
    raise exception 'INVALID_PHONE';
  end if;

  if char_length(v_message) < 15 or char_length(v_message) > 2000 then
    raise exception 'INVALID_MESSAGE';
  end if;

  -- A trip that already started is a typo, not a plan. Rejected rather than
  -- stored, so the model is never scored against a date in the past.
  if p_pickup_date is not null and p_pickup_date < current_date then
    raise exception 'INVALID_DATES';
  end if;

  if p_pickup_date is not null and p_return_date is not null and p_return_date < p_pickup_date then
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

revoke all on function public.create_lead(text, text, text, text, uuid, text, date, date) from public;
grant execute on function public.create_lead(text, text, text, text, uuid, text, date, date) to anon, authenticated;

-- The admin list and the qualification service both read the view, so the new
-- columns have to surface there to be of any use.
create or replace view public.lead_list with (security_invoker = true) as
select
  l.id,
  l.customer_name,
  l.customer_email,
  l.customer_phone,
  l.message,
  l.source,
  l.status,
  l.created_at,
  l.lead_score,
  l.priority,
  l.intent,
  l.estimated_budget_amount,
  l.estimated_budget_period,
  l.rental_duration_days,
  l.rental_duration_label,
  l.vehicle_preference,
  l.vehicle_preference_category,
  l.urgency,
  l.ai_summary,
  l.recommended_action,
  l.missing_information,
  l.qualification_model,
  l.qualified_at,
  l.user_id,
  p.id as vehicle_id,
  p.name as vehicle_name,
  p.image_url as vehicle_image,
  p.category as vehicle_category,
  l.pickup_date,
  l.return_date
from public.leads l
left join public.products p on p.id = l.vehicle_id;
