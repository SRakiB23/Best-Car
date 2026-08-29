/**
 * Verifying a recovery token signs the visitor in, which on its own would turn
 * `/reset-password` into a page any signed-in person could use to change their
 * password without knowing the current one — a downgrade on the admin form,
 * which asks for it. This cookie is the proof that the session arrived through
 * an emailed link: `/auth/confirm` sets it, the reset action requires it, and
 * the action deletes it so a link works exactly once.
 */
export const recoveryCookie = "bc-recovery";

/** Long enough to choose a password, short enough that a shared device forgets. */
export const recoveryCookieMaxAge = 15 * 60;

/**
 * Supabase's default email OTP lifetime. Stated in the email so the recipient
 * knows whether the link in an old thread is worth clicking; change it here if
 * you change it in the Supabase dashboard.
 */
export const recoveryLinkMinutes = 60;

/** Shown whether or not the address has an account, so the form cannot be used to probe for one. */
export const resetRequestedMessage =
  "If that address has an account, a reset link is on its way. Check your inbox and spam folder.";
