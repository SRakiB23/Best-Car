import "server-only";

import { Resend } from "resend";

import { emailSenderConfig } from "./config";
import { renderPasswordResetEmail, type PasswordResetEmail } from "./password-reset-email";

export type SendPasswordResetResult = { ok: true; messageId: string } | { ok: false; reason: string };

/**
 * Sent through Resend rather than Supabase's built-in mailer. The built-in one
 * is throttled to a handful of messages an hour on a free project — the same
 * limit `signUpFailure` already has to apologise for — and its template lives
 * in a dashboard rather than in code review.
 *
 * Returns a result instead of throwing: the caller must answer the visitor
 * identically whether or not the address exists, so it cannot afford to let a
 * delivery failure change the response.
 */
export async function sendPasswordResetEmail(
  to: string,
  email: PasswordResetEmail,
): Promise<SendPasswordResetResult> {
  const { apiKey, from } = emailSenderConfig();

  if (!apiKey) {
    console.error("password reset email not sent; RESEND_API_KEY is not set");
    return { ok: false, reason: "EMAIL_NOT_CONFIGURED" };
  }

  const rendered = renderPasswordResetEmail(email);

  try {
    const { data, error } = await new Resend(apiKey).emails.send({
      from,
      to,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
    });

    // The SDK reports provider rejections in `error` rather than by throwing.
    if (error) {
      console.error("resend rejected password reset", error.name, error.message);
      return { ok: false, reason: "EMAIL_REJECTED" };
    }

    if (!data?.id) {
      console.error("resend returned no message id for password reset");
      return { ok: false, reason: "EMAIL_REJECTED" };
    }

    console.log("password reset email sent", `messageId=${data.id}`);
    return { ok: true, messageId: data.id };
  } catch (cause) {
    console.error("resend request failed", cause instanceof Error ? cause.message : cause);
    return { ok: false, reason: "EMAIL_UNAVAILABLE" };
  }
}
