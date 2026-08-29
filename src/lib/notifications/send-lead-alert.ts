import "server-only";

import { Resend } from "resend";

import { notificationConfig } from "./config";
import { renderLeadAlertEmail, type LeadAlert } from "./lead-alert";

export type SendResult =
  | { ok: true; messageId: string }
  | { ok: false; status: number; code: string; message: string };

/**
 * Sends the admin alert through Resend. Returns a result rather than throwing so
 * the route decides the status code, and so a provider outage is reported as
 * exactly that instead of an opaque 500.
 */
export async function sendLeadAlert(alert: LeadAlert): Promise<SendResult> {
  const { apiKey, to, from, missing } = notificationConfig();

  if (!apiKey || !to) {
    console.error("lead alert not configured; missing:", missing.join(", "));

    return {
      ok: false,
      status: 503,
      code: "EMAIL_NOT_CONFIGURED",
      message: "Email delivery is not configured on this server.",
    };
  }

  const email = renderLeadAlertEmail(alert);

  try {
    const { data, error } = await new Resend(apiKey).emails.send({
      from,
      to,
      subject: email.subject,
      html: email.html,
      text: email.text,
      replyTo: alert.customer_email || undefined,
    });

    // The SDK reports provider rejections in `error` rather than by throwing.
    if (error) {
      console.error("resend rejected lead alert", `lead=${alert.lead_id}`, error.name, error.message);

      return {
        ok: false,
        status: 502,
        code: "EMAIL_REJECTED",
        message: "The email provider rejected the message.",
      };
    }

    if (!data?.id) {
      console.error("resend returned no message id", `lead=${alert.lead_id}`);

      return {
        ok: false,
        status: 502,
        code: "EMAIL_REJECTED",
        message: "The email provider did not confirm the message.",
      };
    }

    console.log(
      "lead alert sent",
      `lead=${alert.lead_id}`,
      `score=${alert.lead_score}`,
      `messageId=${data.id}`,
    );

    return { ok: true, messageId: data.id };
  } catch (cause) {
    console.error(
      "resend request failed",
      `lead=${alert.lead_id}`,
      cause instanceof Error ? cause.message : cause,
    );

    return {
      ok: false,
      status: 502,
      code: "EMAIL_UNAVAILABLE",
      message: "Could not reach the email provider.",
    };
  }
}
