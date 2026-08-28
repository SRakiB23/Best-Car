-- Supabase grants execute on new public functions to anon by default privileges,
-- so revoking from PUBLIC left the storefront key able to cancel bookings.
revoke execute on function public.cancel_booking(text) from anon;
