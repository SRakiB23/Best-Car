-- `is_staff` decides who reaches the admin area, and it lives on a row its own
-- owner is allowed to update. The publishable key plus a customer's own session
-- is enough to reach PostgREST directly, so nothing stopped a customer from
-- patching their profile with is_staff = true and becoming staff.
--
-- Two independent locks, because either one alone is a single edit away from
-- being undone: the column grant stops the write reaching the table at all, and
-- the policy re-checks the value against what is already stored.

revoke update on public.profiles from anon, authenticated;

-- Exactly the fields the profile form writes. `role` and `is_staff` are set by
-- staff tooling, never by the account holder.
grant update (full_name, email, phone, avatar_url, updated_at)
  on public.profiles to authenticated;

drop policy if exists "own profile is writable" on public.profiles;

-- public.is_staff() reads the row as it stands before this statement, so the
-- check passes only when the update leaves the flag exactly as it was.
create policy "own profile is writable" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check (
    (select auth.uid()) = id
    and is_staff = public.is_staff()
  );

comment on column public.profiles.is_staff is
  'Grants admin access. Not writable by the account holder: see the update grant and policy in 20260830000000_lock_staff_flag.sql.';

-- The audit log's writer function was granted to anon so the public
-- recommendation endpoint could log its own calls. That let anyone holding the
-- publishable key insert unbounded rows of arbitrary JSON straight into the
-- table staff would read during an incident. Only the server writes these rows
-- now, with the secret key, so the anon grant goes away.
drop function if exists public.log_ai_interaction(text, text, jsonb, jsonb, text, text, int);

-- The caller is now trusted server code rather than a session, so who the call
-- belonged to has to be passed in: auth.uid() is null under the secret key.
create function public.log_ai_interaction(
  p_feature text,
  p_model text,
  p_request jsonb,
  p_response jsonb default null,
  p_status text default 'success',
  p_error text default null,
  p_latency_ms int default null,
  p_user_id uuid default null
)
returns uuid
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_id uuid;
  v_max_bytes constant int := 64 * 1024;
begin
  if p_feature is null or p_feature not in ('vehicle_recommendation', 'lead_qualification') then
    raise exception 'UNKNOWN_FEATURE';
  end if;

  if pg_column_size(p_request) > v_max_bytes or pg_column_size(p_response) > v_max_bytes then
    raise exception 'PAYLOAD_TOO_LARGE';
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
    coalesce(p_user_id, auth.uid())
  )
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.log_ai_interaction(text, text, jsonb, jsonb, text, text, int, uuid) from public;
grant execute on function public.log_ai_interaction(text, text, jsonb, jsonb, text, text, int, uuid) to service_role;
