export type PasswordResetEmail = {
  name: string;
  /** Already built and origin-checked by the caller. */
  recoveryUrl: string;
  expiresInMinutes: number;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export const passwordResetSubject = "Reset your BestCar password";

/**
 * Inline styles and a table layout, same as the lead alert: that is what
 * survives Outlook and Gmail. The link is also printed as text, because a
 * client that strips the button must not strip the only way through.
 */
export function renderPasswordResetEmail({
  name,
  recoveryUrl,
  expiresInMinutes,
}: PasswordResetEmail) {
  const greeting = name ? `Hi ${name},` : "Hi,";
  const expiry = `This link expires in ${expiresInMinutes} minutes and can only be used once.`;

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;">
      <tr>
        <td style="padding:22px 28px;background:#14181d;">
          <p style="margin:0;color:#ffffff;font-size:17px;font-weight:700;">Reset your password</p>
          <p style="margin:5px 0 0;color:#a8b1bb;font-size:13px;">BestCar account security</p>
        </td>
      </tr>

      <tr>
        <td style="padding:28px;">
          <p style="margin:0 0 14px;color:#1b2436;font-size:14px;line-height:1.65;">${escapeHtml(greeting)}</p>

          <p style="margin:0 0 22px;color:#3f4a5c;font-size:14px;line-height:1.65;">
            We received a request to reset the password for your BestCar account.
            Choose a new one using the button below.
          </p>

          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td style="border-radius:9px;background:#14181d;">
                <a href="${escapeHtml(recoveryUrl)}" style="display:inline-block;padding:12px 28px;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;">Choose a new password</a>
              </td>
            </tr>
          </table>

          <p style="margin:22px 0 0;color:#646b72;font-size:13px;line-height:1.6;">${escapeHtml(expiry)}</p>

          <p style="margin:14px 0 0;color:#646b72;font-size:13px;line-height:1.6;">
            If the button does not work, paste this into your browser:<br />
            <span style="word-break:break-all;color:#3f4a5c;">${escapeHtml(recoveryUrl)}</span>
          </p>

          <div style="margin-top:26px;padding:14px 16px;background:#faf1e2;border-radius:10px;">
            <p style="margin:0;color:#1b2436;font-size:13px;line-height:1.6;">
              Did not request this? Ignore this email — your password stays as it is,
              and nobody can change it without this link.
            </p>
          </div>
        </td>
      </tr>

      <tr>
        <td style="padding:16px 28px;background:#f4f5f7;">
          <p style="margin:0;color:#92a0b6;font-size:11px;">
            Sent by BestCar because a password reset was requested for this address.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [
    "RESET YOUR BESTCAR PASSWORD",
    "",
    greeting,
    "",
    "We received a request to reset the password for your BestCar account.",
    "Open the link below to choose a new one:",
    "",
    recoveryUrl,
    "",
    expiry,
    "",
    "Did not request this? Ignore this email — your password stays as it is.",
  ].join("\n");

  return { subject: passwordResetSubject, html, text };
}
