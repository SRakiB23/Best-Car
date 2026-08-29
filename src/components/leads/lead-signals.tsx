import { IconBolt, IconCalendarClock, IconClock, IconInfinity } from "@tabler/icons-react";

import { cn } from "@/lib/cn";
import type { LeadPriority, LeadStatus } from "@/lib/types";

/** Bands match `priorityForScore` in the AI layer, which the service enforces. */
const priorityTones: Record<LeadPriority, string> = {
  high: "bg-negative text-white",
  medium: "bg-gold-400 text-night-900",
  low: "bg-surface text-ink-500",
};

const priorityLabels: Record<LeadPriority, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export function PriorityPill({ priority }: { priority: LeadPriority }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium",
        priorityTones[priority],
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          priority === "low" ? "bg-ink-400" : "bg-white",
        )}
      />
      {priorityLabels[priority]}
    </span>
  );
}

const statusTones: Record<LeadStatus, string> = {
  new: "bg-info/10 text-info",
  qualified: "bg-gold-100 text-gold-600",
  contacted: "bg-positive/10 text-positive",
  closed: "bg-surface text-ink-500",
};

const statusLabels: Record<LeadStatus, string> = {
  new: "New",
  qualified: "Qualified",
  contacted: "Contacted",
  closed: "Closed",
};

export function LeadStatusPill({ status }: { status: LeadStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-1 text-[11px] font-medium",
        statusTones[status],
      )}
    >
      {statusLabels[status]}
    </span>
  );
}

/**
 * Reads as a filling bar rather than a bare number so a glance across the column
 * ranks the list without comparing digits.
 */
export function LeadScore({ score }: { score: number | null }) {
  if (score === null) {
    return <span className="text-[13px] text-ink-400">&mdash;</span>;
  }

  const tone = score >= 70 ? "bg-negative" : score >= 40 ? "bg-gold-400" : "bg-ink-400";

  return (
    <div className="w-16">
      <p className="text-[15px] font-bold leading-none text-navy-900">
        {score}
        <span className="ml-0.5 text-[11px] font-normal text-ink-400">/100</span>
      </p>
      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-line">
        <div className={cn("h-full rounded-full", tone)} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

const urgencyMeta: Record<string, { label: string; icon: typeof IconBolt; className: string }> = {
  immediate: { label: "Immediate", icon: IconBolt, className: "text-negative" },
  within_a_week: { label: "Within a week", icon: IconClock, className: "text-gold-600" },
  within_a_month: { label: "Within a month", icon: IconCalendarClock, className: "text-ink-700" },
  flexible: { label: "Flexible", icon: IconInfinity, className: "text-ink-500" },
};

export function LeadUrgency({ urgency }: { urgency: string | null }) {
  const meta = urgency ? urgencyMeta[urgency] : undefined;

  // An urgency we did not map, or the model's own "unknown", both mean the
  // customer never said. Showing "Unknown" is the honest answer.
  if (!meta) {
    return <span className="whitespace-nowrap text-[13px] text-ink-400">Unknown</span>;
  }

  return (
    <span className={cn("flex items-center gap-1.5 whitespace-nowrap text-[13px]", meta.className)}>
      <meta.icon size={14} stroke={1.8} />
      {meta.label}
    </span>
  );
}

const intentLabels: Record<string, string> = {
  rental_inquiry: "Rental inquiry",
  price_check: "Price check",
  availability_check: "Availability check",
  long_term_or_corporate: "Long term / corporate",
  support_or_complaint: "Support or complaint",
  browsing: "Browsing",
  spam: "Spam",
  unknown: "Unclear",
};

export function intentLabel(intent: string | null) {
  if (!intent) return null;
  return intentLabels[intent] ?? intent.replaceAll("_", " ");
}
