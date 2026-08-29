/**
 * The public origin of this deployment, used to build links that leave the app
 * and come back: the admin link in a lead alert, and the recovery link in a
 * password reset email. Falls back to the dev origin so a missing variable
 * costs a working link rather than the whole email.
 */
export function appOrigin() {
  return (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}
