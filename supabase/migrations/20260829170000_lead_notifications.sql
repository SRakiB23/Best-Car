-- Bookings already ring the bell in the topbar; leads did not, so an inquiry sat
-- unseen until someone happened to open the Leads page. Same shape as
-- `booking_posts_to_ledger`: a security definer trigger owned by the table owner,
-- because `notifications` has no insert policy for any public role.
create or replace function public.lead_posts_notification()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_vehicle text;
begin
  select p.name into v_vehicle from public.products p where p.id = new.vehicle_id;

  insert into public.notifications (title, detail, link, created_at)
  values (
    'New lead',
    format(
      '%s asked about %s%s.',
      new.customer_name,
      coalesce(v_vehicle, 'the fleet'),
      case
        when new.pickup_date is not null
          then format(' for %s', to_char(new.pickup_date, 'DD Mon'))
        else ''
      end
    ),
    '/admin/leads?q=' || new.customer_email,
    new.created_at
  );

  return new;
end;
$$;

create trigger lead_notifies_staff
  after insert on public.leads
  for each row execute function public.lead_posts_notification();

-- The score arrives seconds later, from the automatic qualification run. A high
-- priority is the one result worth interrupting someone for, and it is only
-- announced on the transition so re-running the model cannot spam the bell.
create or replace function public.lead_priority_notification()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.notifications (title, detail, link)
  values (
    'High-priority lead',
    format(
      '%s scored %s/100. %s',
      new.customer_name,
      new.lead_score,
      coalesce(nullif(btrim(new.recommended_action), ''), 'Follow up today.')
    ),
    '/admin/leads?q=' || new.customer_email
  );

  return new;
end;
$$;

create trigger lead_priority_notifies_staff
  after update of priority on public.leads
  for each row
  when (new.priority = 'high' and old.priority is distinct from 'high')
  execute function public.lead_priority_notification();
