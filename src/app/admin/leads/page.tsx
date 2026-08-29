import {
  IconCalendarEvent,
  IconClock,
  IconMail,
  IconPhone,
  IconSparkles,
  IconTargetArrow,
} from "@tabler/icons-react";

import {
  LeadScore,
  LeadStatusPill,
  LeadUrgency,
  PriorityPill,
  intentLabel,
} from "@/components/leads/lead-signals";
import { LeadStatusSelect } from "@/components/leads/lead-status-select";
import { QualifyLeadButton } from "@/components/leads/qualify-lead-button";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { SearchField } from "@/components/ui/search-field";
import { SortLink } from "@/components/ui/sort-link";
import { StatusFilter, type StatusOption } from "@/components/ui/status-filter";
import { Table, TableHeadRow, Td, Th } from "@/components/ui/table";
import { getPreferences, getTranslator } from "@/lib/account-store";
import { getLeads, leadSortKeys } from "@/lib/data";
import type { DashboardSearchParams } from "@/lib/filters";
import { formatAmount } from "@/lib/format";
import { pageCount, readListParams } from "@/lib/list-params";
import type { LeadRow, LeadStatus } from "@/lib/types";

/**
 * `className` hides the two columns the score already implies, so the table fits
 * a laptop without sideways scrolling. Priority and urgency stay in the row that
 * expands underneath, so nothing is actually lost at narrow widths.
 */
const columns = [
  { label: "Customer", sortKey: "customer", className: "" },
  { label: "Inquiry", sortKey: null, className: "" },
  { label: "Lead Score", sortKey: "score", className: "" },
  { label: "Priority", sortKey: null, className: "hidden xl:table-cell" },
  { label: "Urgency", sortKey: "urgency", className: "hidden xl:table-cell" },
  { label: "Vehicle Preference", sortKey: null, className: "" },
  { label: "Stage", sortKey: "status", className: "" },
  { label: "Received", sortKey: "date", className: "" },
] as const;

const statuses: LeadStatus[] = ["new", "qualified", "contacted", "closed"];

const statusOptions: StatusOption[] = [
  { value: "", label: "All" },
  { value: "new", label: "New" },
  { value: "qualified", label: "Qualified" },
  { value: "contacted", label: "Contacted" },
  { value: "closed", label: "Closed" },
];

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<DashboardSearchParams>;
}) {
  const raw = await searchParams;
  const params = readListParams(raw, leadSortKeys, "date");
  const requested = Array.isArray(raw.status) ? raw.status[0] : raw.status;
  const status = statuses.includes(requested as LeadStatus) ? (requested as LeadStatus) : "";

  const [{ currency }, t, { rows, total }] = await Promise.all([
    getPreferences(),
    getTranslator(),
    getLeads({ ...params, status }),
  ]);

  const unqualified = rows.filter((lead) => lead.leadScore === null).length;

  return (
    <div className="space-y-4 lg:space-y-6">
      <PageHeader
        title={t("Leads")}
        description={t("Inquiries from the storefront, scored and summarised by AI.")}
      />

      <Card>
        <CardHeader
          title={
            <span className="flex items-center gap-2">
              {t("Inquiries")}
              {unqualified > 0 ? (
                <span className="rounded-md bg-gold-100 px-2 py-0.5 text-[11px] font-medium text-gold-600">
                  {unqualified} {t("awaiting qualification")}
                </span>
              ) : null}
            </span>
          }
          action={
            <div className="flex flex-wrap items-center gap-2">
              <StatusFilter value={status} options={statusOptions} />
              <SearchField
                key={params.q}
                value={params.q}
                placeholder={t("Search name, email or message")}
              />
            </div>
          }
        />

        {rows.length === 0 ? (
          <EmptyState
            title={t("No inquiries yet")}
            hint={t("Messages sent from the storefront contact form will appear here.")}
          />
        ) : (
          <>
            <Table className="min-w-[880px]">
              <TableHeadRow>
                {columns.map((column) => (
                  <Th key={column.label} className={column.className}>
                    {column.sortKey ? (
                      <SortLink
                        label={t(column.label)}
                        sortKey={column.sortKey}
                        activeKey={params.sort}
                        direction={params.dir}
                      />
                    ) : (
                      t(column.label)
                    )}
                  </Th>
                ))}
                <Th className="text-right">{t("Actions")}</Th>
              </TableHeadRow>

              <tbody>
                {rows.map((lead) => (
                  <LeadRows key={lead.id} lead={lead} currency={currency} t={t} />
                ))}
              </tbody>
            </Table>

            <Pagination
              page={params.page}
              totalPages={pageCount(total)}
              totalRows={total}
              shown={rows.length}
            />
          </>
        )}
      </Card>
    </div>
  );
}

type Translate = (key: string) => string;

/**
 * Two rows per lead. The contact and score columns stay scannable, and the AI
 * prose gets the full width underneath where it is actually readable.
 */
function LeadRows({
  lead,
  currency,
  t,
}: {
  lead: LeadRow;
  currency: Parameters<typeof formatAmount>[1];
  t: Translate;
}) {
  const qualified = lead.leadScore !== null;
  const intent = intentLabel(lead.intent);

  return (
    <>
      <tr className="border-t border-line">
        <Td>
          <p className="truncate text-[13px] font-semibold text-navy-900">{lead.customerName}</p>
          {/* `truncate` has to sit on the text itself: as a bare flex child the
              address keeps its intrinsic width and widens the whole column. */}
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-500">
            <IconMail size={12} stroke={1.6} className="shrink-0" />
            <span className="min-w-0 truncate">{lead.customerEmail}</span>
          </p>
          {lead.customerPhone ? (
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-500">
              <IconPhone size={12} stroke={1.6} />
              {lead.customerPhone}
            </p>
          ) : null}
        </Td>

        <Td className="max-w-xs">
          <p className="line-clamp-2 text-[13px] text-ink-700">{lead.message}</p>

          {/* Dates the customer chose, kept visually distinct from anything the
              model produced: a stated date needs no qualification to be acted on. */}
          {lead.pickupDate ? (
            <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-navy-900">
              <IconCalendarEvent size={12} stroke={1.8} className="text-gold-600" />
              {lead.pickupDate}
              {lead.returnDate ? ` → ${lead.returnDate}` : ""}
            </p>
          ) : null}

          <p className="mt-0.5 text-xs text-ink-400">
            {intent ? t(intent) : t("Not yet classified")}
            {lead.vehicle ? ` · ${lead.vehicle}` : ""}
          </p>
        </Td>

        <Td>
          <LeadScore score={lead.leadScore} />

          {/* Carries the two columns that drop out below xl, so a narrow screen
              still shows why a lead is ranked where it is. */}
          <div className="mt-1.5 flex flex-col items-start gap-1 xl:hidden">
            {lead.priority ? <PriorityPill priority={lead.priority} /> : null}
            <LeadUrgency urgency={lead.urgency} />
          </div>
        </Td>

        <Td className="hidden xl:table-cell">
          {lead.priority ? (
            <PriorityPill priority={lead.priority} />
          ) : (
            <span className="text-[13px] text-ink-400">&mdash;</span>
          )}
        </Td>

        <Td className="hidden xl:table-cell">
          <LeadUrgency urgency={lead.urgency} />
        </Td>

        <Td className="max-w-56">
          {lead.vehiclePreference || lead.vehiclePreferenceCategory ? (
            <>
              <p className="text-[13px] text-ink-700">
                {lead.vehiclePreference ?? lead.vehiclePreferenceCategory}
              </p>
              {lead.vehiclePreference && lead.vehiclePreferenceCategory ? (
                <p className="mt-0.5 text-xs text-ink-400">{lead.vehiclePreferenceCategory}</p>
              ) : null}
              {lead.rentalDurationLabel || lead.rentalDurationDays ? (
                <p className="mt-0.5 text-xs text-ink-500">
                  {lead.rentalDurationLabel ??
                    `${lead.rentalDurationDays} ${t(lead.rentalDurationDays === 1 ? "day" : "days")}`}
                </p>
              ) : null}
              {lead.estimatedBudgetAmount !== null ? (
                <p className="mt-0.5 text-xs font-medium text-ink-700">
                  {formatAmount(lead.estimatedBudgetAmount, currency)}
                  {lead.estimatedBudgetPeriod === "per_day" ? ` / ${t("day")}` : ""}
                </p>
              ) : null}
            </>
          ) : (
            <span className="text-[13px] text-ink-400">
              {qualified ? t("Not stated") : "\u2014"}
            </span>
          )}
        </Td>

        <Td>
          <div className="flex flex-col items-start gap-1.5">
            <LeadStatusPill status={lead.status} />
            <LeadStatusSelect leadId={lead.id} status={lead.status} />
          </div>
        </Td>

        <Td className="whitespace-nowrap text-[13px] text-ink-500">
          <span className="flex items-center gap-1">
            <IconClock size={13} stroke={1.6} />
            {lead.receivedAgo}
          </span>
        </Td>

        <Td className="align-top">
          <QualifyLeadButton
            leadId={lead.id}
            qualified={qualified}
            customer={lead.customerName}
            currency={currency}
          />
        </Td>
      </tr>

      <tr className="border-t border-line/60">
        <td colSpan={columns.length + 1} className="px-4 pb-4 pt-0 sm:px-5">
          {qualified ? (
            /* Pinned to the viewport rather than the table: this cell sits inside
               a horizontal scroll container, so prose would otherwise be laid out
               at the table's full width and run off-screen. */
            <div className="grid w-[calc(100vw-5rem)] gap-3 rounded-xl bg-canvas p-3.5 lg:w-auto lg:grid-cols-5 lg:gap-5">
              <div className="lg:col-span-3">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
                  <IconSparkles size={13} stroke={1.8} />
                  {t("AI summary")}
                </p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-700">{lead.aiSummary}</p>

                {lead.missingInformation.length > 0 ? (
                  <p className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-ink-400">{t("Still unknown")}:</span>
                    {lead.missingInformation.map((item) => (
                      <span
                        key={item}
                        className="rounded-full bg-white px-2 py-0.5 text-[11px] text-ink-500"
                      >
                        {item}
                      </span>
                    ))}
                  </p>
                ) : null}
              </div>

              <div className="lg:col-span-2">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
                  <IconTargetArrow size={13} stroke={1.8} />
                  {t("Recommended action")}
                </p>
                <p className="mt-1.5 text-[13px] font-medium leading-relaxed text-navy-900">
                  {lead.recommendedAction}
                </p>
              </div>
            </div>
          ) : (
            <p className="rounded-xl bg-canvas px-3.5 py-2.5 text-xs text-ink-500">
              {t("Not qualified yet. Run the model to score this inquiry and get a suggested next step.")}
            </p>
          )}
        </td>
      </tr>
    </>
  );
}
