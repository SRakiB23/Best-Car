-- Customer inquiries. Until now the storefront could only take a booking, so a
-- visitor who was not ready to commit left no trace at all.
create type public.lead_status as enum ('new', 'qualified', 'contacted', 'closed');
create type public.lead_priority as enum ('low', 'medium', 'high');

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null default '',
  message text not null,
  source text not null default 'website',
  vehicle_id uuid references public.products (id) on delete set null,
  user_id uuid references auth.users (id) on delete set null,
  status public.lead_status not null default 'new',
  created_at timestamptz not null default now(),

  -- Everything below is written by the qualification service and is null until
  -- the model has run. Scalars rather than one jsonb blob so the admin list can
  -- sort and filter on score, priority and urgency in the database.
  lead_score int check (lead_score between 0 and 100),
  priority public.lead_priority,
  intent text,
  estimated_budget_amount numeric(12, 2) check (estimated_budget_amount >= 0),
  estimated_budget_period text check (estimated_budget_period in ('per_day', 'total', 'unknown')),
  rental_duration_days int check (rental_duration_days between 1 and 365),
  rental_duration_label text,
  vehicle_preference text,
  vehicle_preference_category text,
  urgency text,
  ai_summary text,
  recommended_action text,
  missing_information jsonb not null default '[]'::jsonb,
  qualification_model text,
  qualified_at timestamptz,
  ai_interaction_id uuid references public.ai_interactions (id) on delete set null
);

create index leads_created_at_idx on public.leads (created_at desc);
create index leads_triage_idx on public.leads (status, lead_score desc nulls last);
create index leads_user_idx on public.leads (user_id, created_at desc);

alter table public.leads enable row level security;

comment on table public.leads is 'Storefront inquiries. Writes only through security definer functions so visitors cannot forge a score or priority.';

-- A lead holds a name, an email, a phone number and whatever the customer chose
-- to type, so reads are staff-only apart from a customer's own inquiries.
create policy "staff read every lead" on public.leads
  for select to authenticated using (public.is_staff());

create policy "customers read their own leads" on public.leads
  for select to authenticated using (user_id = (select auth.uid()));

create view public.lead_list with (security_invoker = true) as
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
  p.category as vehicle_category
from public.leads l
left join public.products p on p.id = l.vehicle_id;

-- The inquiry form is open to visitors who have no account, so this is the one
-- write path granted to anon. It validates every field itself and ignores
-- anything the caller might try to set beyond the contact details.
create function public.create_lead(
  p_name text,
  p_email text,
  p_message text,
  p_phone text default '',
  p_vehicle_id uuid default null,
  p_source text default 'website'
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
    customer_name, customer_email, customer_phone, message, source, vehicle_id, user_id
  )
  values (
    v_name,
    v_email,
    v_phone,
    v_message,
    left(coalesce(nullif(btrim(p_source), ''), 'website'), 40),
    p_vehicle_id,
    (select auth.uid())
  )
  returning * into v_lead;

  return jsonb_build_object('id', v_lead.id, 'created_at', v_lead.created_at);
end;
$$;

-- Applies a qualification result. Staff-only, and it re-checks every value it is
-- given: the caller is our own service, but a model sits upstream of it.
create function public.apply_lead_qualification(
  p_lead_id uuid,
  p_result jsonb,
  p_model text,
  p_interaction_id uuid default null
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_score int;
  v_priority public.lead_priority;
  v_period text;
  v_days int;
  v_summary text;
  v_action text;
  v_missing jsonb;
begin
  if not public.is_staff() then
    raise exception 'FORBIDDEN';
  end if;

  if not exists (select 1 from public.leads where id = p_lead_id) then
    raise exception 'LEAD_NOT_FOUND';
  end if;

  v_score := (p_result ->> 'leadScore')::int;
  if v_score is null or v_score < 0 or v_score > 100 then
    raise exception 'INVALID_SCORE';
  end if;

  if (p_result ->> 'priority') not in ('low', 'medium', 'high') then
    raise exception 'INVALID_PRIORITY';
  end if;
  v_priority := (p_result ->> 'priority')::public.lead_priority;

  v_period := coalesce(p_result ->> 'estimatedBudgetPeriod', 'unknown');
  if v_period not in ('per_day', 'total', 'unknown') then
    v_period := 'unknown';
  end if;

  v_days := (p_result ->> 'rentalDurationDays')::int;
  if v_days is not null and (v_days < 1 or v_days > 365) then
    v_days := null;
  end if;

  v_summary := btrim(coalesce(p_result ->> 'summary', ''));
  v_action := btrim(coalesce(p_result ->> 'recommendedAction', ''));

  if v_summary = '' or v_action = '' then
    raise exception 'INCOMPLETE_RESULT';
  end if;

  v_missing := p_result -> 'missingInformation';
  if v_missing is null or jsonb_typeof(v_missing) <> 'array' then
    v_missing := '[]'::jsonb;
  end if;

  update public.leads
  set
    lead_score = v_score,
    priority = v_priority,
    intent = left(nullif(btrim(coalesce(p_result ->> 'intent', '')), ''), 60),
    estimated_budget_amount = (p_result ->> 'estimatedBudgetAmount')::numeric,
    estimated_budget_period = v_period,
    rental_duration_days = v_days,
    rental_duration_label = left(nullif(btrim(coalesce(p_result ->> 'rentalDurationLabel', '')), ''), 80),
    vehicle_preference = left(nullif(btrim(coalesce(p_result ->> 'vehiclePreference', '')), ''), 200),
    vehicle_preference_category = left(nullif(btrim(coalesce(p_result ->> 'vehiclePreferenceCategory', '')), ''), 40),
    urgency = left(nullif(btrim(coalesce(p_result ->> 'urgency', '')), ''), 40),
    ai_summary = left(v_summary, 1200),
    recommended_action = left(v_action, 400),
    missing_information = v_missing,
    qualification_model = left(coalesce(p_model, 'unknown'), 120),
    qualified_at = now(),
    ai_interaction_id = p_interaction_id,
    -- A lead someone has already picked up keeps its place in the pipeline;
    -- re-running the model must not drag it backwards.
    status = case when status = 'new' then 'qualified' else status end
  where id = p_lead_id;

  return public.lead_payload(p_lead_id);
end;
$$;

create function public.lead_payload(p_lead_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'id', l.id,
    'status', l.status,
    'lead_score', l.lead_score,
    'priority', l.priority,
    'intent', l.intent,
    'estimated_budget_amount', l.estimated_budget_amount,
    'estimated_budget_period', l.estimated_budget_period,
    'rental_duration_days', l.rental_duration_days,
    'rental_duration_label', l.rental_duration_label,
    'vehicle_preference', l.vehicle_preference,
    'vehicle_preference_category', l.vehicle_preference_category,
    'urgency', l.urgency,
    'ai_summary', l.ai_summary,
    'recommended_action', l.recommended_action,
    'missing_information', l.missing_information,
    'qualification_model', l.qualification_model,
    'qualified_at', l.qualified_at
  )
  from public.leads l
  where l.id = p_lead_id
    and (public.is_staff() or l.user_id = (select auth.uid()));
$$;

-- Staff move a lead through the pipeline by hand; the model never sets this.
create function public.set_lead_status(p_lead_id uuid, p_status text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  if not public.is_staff() then
    raise exception 'FORBIDDEN';
  end if;

  if p_status not in ('new', 'qualified', 'contacted', 'closed') then
    raise exception 'INVALID_STATUS';
  end if;

  update public.leads
  set status = p_status::public.lead_status
  where id = p_lead_id;

  if not found then
    raise exception 'LEAD_NOT_FOUND';
  end if;

  return public.lead_payload(p_lead_id);
end;
$$;

revoke all on function public.create_lead(text, text, text, text, uuid, text) from public;
revoke all on function public.apply_lead_qualification(uuid, jsonb, text, uuid) from public;
revoke all on function public.lead_payload(uuid) from public;
revoke all on function public.set_lead_status(uuid, text) from public;

grant execute on function public.create_lead(text, text, text, text, uuid, text) to anon, authenticated;
grant execute on function public.apply_lead_qualification(uuid, jsonb, text, uuid) to authenticated;
grant execute on function public.lead_payload(uuid) to authenticated;
grant execute on function public.set_lead_status(uuid, text) to authenticated;

-- The audit log whitelists features by name, so qualification calls would be
-- rejected until it knows about them.
create or replace function public.log_ai_interaction(
  p_feature text,
  p_model text,
  p_request jsonb,
  p_response jsonb default null,
  p_status text default 'success',
  p_error text default null,
  p_latency_ms int default null
)
returns uuid
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  if p_feature is null or p_feature not in ('vehicle_recommendation', 'lead_qualification') then
    raise exception 'UNKNOWN_FEATURE';
  end if;

  insert into public.ai_interactions (
    feature, model, status, request, response, error, latency_ms, user_id
  )
  values (
    p_feature,
    left(coalesce(p_model, 'unknown'), 120),
    case when p_status = 'error' then 'error' else 'success' end,
    coalesce(p_request, '{}'::jsonb),
    p_response,
    left(p_error, 2000),
    p_latency_ms,
    auth.uid()
  )
  returning id into v_id;

  return v_id;
end;
$$;
