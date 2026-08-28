-- Cancelling frees the dates for another customer: the no-overlap constraint
-- only covers confirmed rows, and the ledger trigger voids the matching order.
create function public.cancel_booking(p_reference text)
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

  if v_booking.status = 'cancelled' then
    return public.booking_payload(p_reference);
  end if;

  update public.bookings set status = 'cancelled' where id = v_booking.id;

  return public.booking_payload(p_reference);
end;
$$;

revoke all on function public.cancel_booking(text) from public;
grant execute on function public.cancel_booking(text) to authenticated;
