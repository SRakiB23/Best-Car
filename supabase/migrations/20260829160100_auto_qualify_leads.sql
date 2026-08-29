-- Leads are now qualified the moment they arrive, before any human opens the
-- admin panel. That call has no staff session behind it, so `is_staff()` is false
-- and `apply_lead_qualification` would refuse the write.
--
-- Rather than sniff the caller's JWT role — brittle, and easy to get wrong in a
-- way that quietly grants too much — the guard is moved into the grant. The body
-- moves to an internal function that no public role may execute, and the staff
-- entry point keeps its check and delegates. Privilege comes from GRANT, which is
-- the one place Postgres enforces it for us.
create or replace function public.apply_lead_qualification_internal(
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

-- Only the server, holding the secret key, may reach this.
revoke all on function public.apply_lead_qualification_internal(uuid, jsonb, text, uuid) from public;
revoke all on function public.apply_lead_qualification_internal(uuid, jsonb, text, uuid) from anon;
revoke all on function public.apply_lead_qualification_internal(uuid, jsonb, text, uuid) from authenticated;
grant execute on function public.apply_lead_qualification_internal(uuid, jsonb, text, uuid) to service_role;

comment on function public.apply_lead_qualification_internal(uuid, jsonb, text, uuid) is
  'Unguarded qualification write for the automatic path. Executable by service_role only; staff go through apply_lead_qualification.';

-- The staff entry point keeps its own check and now delegates the body, so the
-- validation rules cannot drift between the manual and automatic paths.
create or replace function public.apply_lead_qualification(
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
begin
  if not public.is_staff() then
    raise exception 'FORBIDDEN';
  end if;

  return public.apply_lead_qualification_internal(
    p_lead_id, p_result, p_model, p_interaction_id
  );
end;
$$;
