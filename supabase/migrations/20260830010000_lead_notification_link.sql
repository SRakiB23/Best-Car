-- The bell linked to `/admin/leads?q=<email>`, which opens the Leads page
-- filtered down to one person while every control on it — the stage tabs in
-- particular — still reads as though nothing is filtered. Staff land on what
-- looks like an empty or near-empty inbox and cannot see why.
--
-- The list is already sorted newest first, so the lead that triggered the
-- notification is at the top of the unfiltered page anyway.

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
    '/admin/leads',
    new.created_at
  );

  return new;
end;
$$;

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
    '/admin/leads'
  );

  return new;
end;
$$;

-- Notifications already in the bell would otherwise keep the old behaviour.
update public.notifications
   set link = '/admin/leads'
 where link like '/admin/leads?%';
