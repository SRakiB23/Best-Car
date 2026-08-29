-- Audit trail for every model call: what we asked, what came back, how long it took.
-- Useful for debugging bad recommendations, costing, and spotting prompt abuse.
create table public.ai_interactions (
  id uuid primary key default gen_random_uuid(),
  feature text not null,
  model text not null,
  status text not null default 'success' check (status in ('success', 'error')),
  request jsonb not null,
  response jsonb,
  error text,
  latency_ms int check (latency_ms >= 0),
  user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index ai_interactions_feature_idx on public.ai_interactions (feature, created_at desc);
create index ai_interactions_created_at_idx on public.ai_interactions (created_at desc);

alter table public.ai_interactions enable row level security;

comment on table public.ai_interactions is 'Model call log. Writes only through log_ai_interaction so callers cannot forge rows.';

-- Prompts and model output can echo whatever a customer typed, so the log is
-- staff-only. There is deliberately no insert/update/delete policy: the security
-- definer function below is the sole write path.
create policy "staff read ai interactions" on public.ai_interactions
  for select to authenticated using (public.is_staff());

create function public.log_ai_interaction(
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
  if p_feature is null or p_feature not in ('vehicle_recommendation') then
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

revoke all on function public.log_ai_interaction(text, text, jsonb, jsonb, text, text, int) from public;
grant execute on function public.log_ai_interaction(text, text, jsonb, jsonb, text, text, int) to anon, authenticated;
