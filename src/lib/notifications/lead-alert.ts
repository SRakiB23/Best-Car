import { z } from "zod";

/**
 * The payload Zapier forwards after the qualification webhook fires. It mirrors
 * `LeadQualifiedPayload` in `src/lib/zapier.ts`, but is validated independently:
 * the request arrives over the network from a system we do not control, so what
 * we send and what we accept are separate contracts on purpose.
 */
export const leadAlertSchema = z.object({
  event: z.string().trim().min(1).max(60),
  lead_id: z.uuid("Expected a lead id."),
  customer_name: z.string().trim().min(1).max(160),
  customer_email: z.string().trim().max(200),
  // Optional on the inquiry form, so an empty string is the honest value here.
  customer_phone: z.string().trim().max(64).default(""),
  vehicle: nullableText(200),
  pickup_date: nullableText(40),
  return_date: nullableText(40),
  rental_duration: nullableText(80),
  estimated_budget_amount: z.number().nonnegative().max(1_000_000).nullable().default(null),
  estimated_budget_period: nullableText(40),
  lead_score: z.number().int().min(0).max(100),
  priority: z.string().trim().min(1).max(40),
  urgency: nullableText(40),
  intent: nullableText(60),
  vehicle_preference: nullableText(300),
  summary: z.string().trim().min(1).max(4_000),
  recommended_action: z.string().trim().min(1).max(2_000),
  missing_information: z.string().trim().max(600).default(""),
  /**
   * Rendered as a link in an email, so the protocol is checked rather than
   * trusted. A `javascript:` or `data:` URL is a valid URL and would be a
   * handed-over click target.
   */
  admin_url: z
    .url("Expected a valid admin URL.")
    .refine(
      (value) => value.startsWith("http://") || value.startsWith("https://"),
      "Only http and https links are allowed.",
    )
    .nullable()
    .default(null),
});

export type LeadAlert = z.infer<typeof leadAlertSchema>;

/** Zapier sends absent values as null or an empty string; both mean "unknown". */
function nullableText(max: number) {
  return z
    .string()
    .trim()
    .max(max)
    .nullable()
    .default(null)
    .transform((value) => (value === "" ? null : value));
}

// ---------------------------------------------------------------------------
// Email rendering
// ---------------------------------------------------------------------------

const placeholder = "Not stated";

export function leadAlertSubject(alert: LeadAlert) {
  return `🚨 High-Priority Rental Lead — ${alert.customer_name}`;
}

function budgetLine(alert: LeadAlert) {
  if (alert.estimated_budget_amount === null) return null;

  const period =
    alert.estimated_budget_period === "per_day"
      ? " per day"
      : alert.estimated_budget_period === "total"
        ? " total"
        : "";

  return `$${alert.estimated_budget_amount.toFixed(2)}${period}`;
}

/** Enum values arrive as snake_case; nobody wants to read that in an email. */
function humanise(value: string | null) {
  if (!value) return null;
  return value.replaceAll("_", " ").replace(/^./, (first) => first.toUpperCase());
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

type Row = [label: string, value: string | null];

/**
 * Built as a table with inline styles because that is what survives Outlook and
 * Gmail. No external stylesheet, no web fonts, no images.
 */
export function renderLeadAlertEmail(alert: LeadAlert) {
  const customer: Row[] = [
    ["Name", alert.customer_name],
    ["Email", alert.customer_email],
    ["Phone", alert.customer_phone || null],
  ];

  const rental: Row[] = [
    ["Vehicle", alert.vehicle],
    ["Pickup", alert.pickup_date],
    ["Return", alert.return_date],
    ["Duration", alert.rental_duration],
    ["Budget", budgetLine(alert)],
    ["Vehicle preference", alert.vehicle_preference],
  ];

  const qualification: Row[] = [
    ["Score", `${alert.lead_score}/100`],
    ["Priority", humanise(alert.priority)],
    ["Urgency", humanise(alert.urgency)],
    ["Intent", humanise(alert.intent)],
  ];

  return {
    subject: leadAlertSubject(alert),
    html: html(alert, { customer, rental, qualification }),
    text: text(alert, { customer, rental, qualification }),
  };
}

type Sections = { customer: Row[]; rental: Row[]; qualification: Row[] };

function html(alert: LeadAlert, sections: Sections) {
  const rows = (items: Row[]) =>
    items
      .map(
        ([label, value]) => `
          <tr>
            <td style="padding:6px 16px 6px 0;color:#646b72;font-size:13px;white-space:nowrap;vertical-align:top;">${escapeHtml(label)}</td>
            <td style="padding:6px 0;color:${value ? "#1b2436" : "#92a0b6"};font-size:14px;font-weight:${value ? 600 : 400};">${escapeHtml(value ?? placeholder)}</td>
          </tr>`,
      )
      .join("");

  const heading = (label: string) =>
    `<p style="margin:28px 0 10px;color:#b5822f;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">${label}</p>`;

  const prose = (body: string) =>
    `<p style="margin:0;color:#3f4a5c;font-size:14px;line-height:1.65;">${escapeHtml(body)}</p>`;

  return `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;">
      <tr>
        <td style="padding:22px 28px;background:#14181d;">
          <p style="margin:0;color:#ffffff;font-size:17px;font-weight:700;">🚨 High-Priority Rental Lead</p>
          <p style="margin:5px 0 0;color:#a8b1bb;font-size:13px;">
            ${escapeHtml(alert.customer_name)} · ${alert.lead_score}/100 · ${escapeHtml(humanise(alert.priority) ?? "")}
          </p>
        </td>
      </tr>

      <tr>
        <td style="padding:4px 28px 30px;">
          ${heading("Customer")}
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">${rows(sections.customer)}</table>

          ${heading("Rental details")}
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">${rows(sections.rental)}</table>

          ${heading("AI qualification")}
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">${rows(sections.qualification)}</table>

          ${heading("AI summary")}
          ${prose(alert.summary)}

          ${heading("Recommended action")}
          <div style="padding:14px 16px;background:#faf1e2;border-radius:10px;">
            <p style="margin:0;color:#1b2436;font-size:14px;font-weight:600;line-height:1.6;">${escapeHtml(alert.recommended_action)}</p>
          </div>

          ${heading("Missing information")}
          ${prose(alert.missing_information || "Nothing important is missing.")}

          ${
            alert.admin_url
              ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:30px;">
                   <tr>
                     <td style="border-radius:9px;background:#14181d;">
                       <a href="${escapeHtml(alert.admin_url)}" style="display:inline-block;padding:12px 26px;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;">View Lead</a>
                     </td>
                   </tr>
                 </table>`
              : ""
          }
        </td>
      </tr>

      <tr>
        <td style="padding:16px 28px;background:#f4f5f7;">
          <p style="margin:0;color:#92a0b6;font-size:11px;">
            Scored automatically from the customer's own words. Lead ${escapeHtml(alert.lead_id)}.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/** Not decoration: some clients and most notification bots show only this. */
function text(alert: LeadAlert, sections: Sections) {
  const block = (title: string, items: Row[]) =>
    [title, ...items.map(([label, value]) => `  ${label}: ${value ?? placeholder}`)].join("\n");

  return [
    "HIGH-PRIORITY RENTAL LEAD",
    `${alert.customer_name} · ${alert.lead_score}/100 · ${humanise(alert.priority)}`,
    "",
    block("CUSTOMER", sections.customer),
    "",
    block("RENTAL DETAILS", sections.rental),
    "",
    block("AI QUALIFICATION", sections.qualification),
    "",
    "AI SUMMARY",
    alert.summary,
    "",
    "RECOMMENDED ACTION",
    alert.recommended_action,
    "",
    "MISSING INFORMATION",
    alert.missing_information || "Nothing important is missing.",
    ...(alert.admin_url ? ["", `VIEW LEAD: ${alert.admin_url}`] : []),
    "",
    `Lead ${alert.lead_id}`,
  ].join("\n");
}
