"use client";

import {
  IconAlertTriangle,
  IconCheck,
  IconLoader2,
  IconSparkles,
  IconTargetArrow,
} from "@tabler/icons-react";

import { LeadScore, LeadUrgency, PriorityPill, intentLabel } from "@/components/leads/lead-signals";
import { buttonClass } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/cn";
import type { QualifyLeadResult } from "@/lib/ai/lead-qualification";
import { formatAmount } from "@/lib/format";
import type { CurrencyCode } from "@/lib/types";

/** Named after what the service is actually doing while the request is open. */
export const qualifySteps = [
  "Reading the inquiry",
  "Classifying intent",
  "Extracting trip details",
  "Scoring and recommending",
];

export type QualifyPhase = "running" | "done" | "error";

type QualifyLeadDialogProps = {
  open: boolean;
  onClose: () => void;
  onRetry: () => void;
  customer: string;
  phase: QualifyPhase;
  step: number;
  elapsedMs: number;
  result: QualifyLeadResult | null;
  error: string | null;
  currency: CurrencyCode;
  saving: boolean;
};

export function QualifyLeadDialog({
  open,
  onClose,
  onRetry,
  customer,
  phase,
  step,
  elapsedMs,
  result,
  error,
  currency,
  saving,
}: QualifyLeadDialogProps) {
  return (
    <Modal
      open={open}
      onClose={phase === "running" ? () => {} : onClose}
      title={`Qualifying ${customer}`}
      description={
        phase === "done"
          ? "Scored and saved. Here is what the model found."
          : "The model reads only this inquiry and what we already hold on the record."
      }
      className="max-w-2xl"
    >
      <div className="px-5 py-4">
        <StepList phase={phase} step={step} elapsedMs={elapsedMs} />

        {phase === "error" ? <ErrorPanel message={error} /> : null}

        {phase === "done" && result ? <ResultPanel result={result} currency={currency} /> : null}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-3.5">
        <p className="text-[11px] text-ink-400">
          {result ? `${result.model} · ${(elapsedMs / 1000).toFixed(1)}s` : "\u00a0"}
        </p>

        <div className="flex items-center gap-2">
          {phase === "error" ? (
            <button type="button" onClick={onRetry} className={buttonClass("navy", "sm")}>
              <IconSparkles size={14} stroke={1.8} />
              Try again
            </button>
          ) : null}

          {phase === "done" ? (
            <button type="button" onClick={onRetry} className={buttonClass("outline", "sm")}>
              Re-run
            </button>
          ) : null}

          <button
            type="button"
            onClick={onClose}
            disabled={phase === "running" || saving}
            className={buttonClass(phase === "done" ? "navy" : "soft", "sm")}
          >
            {saving ? <IconLoader2 size={14} stroke={2} className="animate-spin" /> : null}
            {phase === "done" ? "Done" : "Close"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function StepList({
  phase,
  step,
  elapsedMs,
}: {
  phase: QualifyPhase;
  step: number;
  elapsedMs: number;
}) {
  return (
    <ol className="space-y-2.5">
      {qualifySteps.map((label, index) => {
        // On success every step is settled, whatever the ticker had reached.
        const state =
          phase === "done"
            ? "done"
            : phase === "error"
              ? index < step
                ? "done"
                : index === step
                  ? "failed"
                  : "waiting"
              : index < step
                ? "done"
                : index === step
                  ? "active"
                  : "waiting";

        return (
          <li key={label} className="flex items-center gap-2.5">
            <StepMarker state={state} />

            <span
              className={cn(
                "text-[13px]",
                state === "waiting" && "text-ink-400",
                state === "active" && "font-medium text-navy-900",
                state === "done" && "text-ink-700",
                state === "failed" && "font-medium text-negative",
              )}
            >
              {label}
            </span>

            {state === "active" ? (
              <span className="ml-auto text-[11px] tabular-nums text-ink-400">
                {(elapsedMs / 1000).toFixed(1)}s
              </span>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

function StepMarker({ state }: { state: "waiting" | "active" | "done" | "failed" }) {
  if (state === "done") {
    return (
      <span className="grid size-5 shrink-0 place-items-center rounded-full bg-positive text-white">
        <IconCheck size={13} stroke={2.4} />
      </span>
    );
  }

  if (state === "active") {
    return (
      <span className="grid size-5 shrink-0 place-items-center rounded-full bg-navy-900 text-white">
        <IconLoader2 size={13} stroke={2.2} className="animate-spin" />
      </span>
    );
  }

  if (state === "failed") {
    return (
      <span className="grid size-5 shrink-0 place-items-center rounded-full bg-negative text-white">
        <IconAlertTriangle size={12} stroke={2.2} />
      </span>
    );
  }

  return <span className="size-5 shrink-0 rounded-full border border-line" />;
}

function ErrorPanel({ message }: { message: string | null }) {
  return (
    <p
      role="alert"
      className="mt-4 flex items-start gap-2 rounded-xl bg-negative/8 px-3.5 py-3 text-[13px] leading-relaxed text-negative"
    >
      <IconAlertTriangle size={16} stroke={1.8} className="mt-px shrink-0" />
      {message ?? "Something went wrong. Please try again."}
    </p>
  );
}

function ResultPanel({
  result,
  currency,
}: {
  result: QualifyLeadResult;
  currency: CurrencyCode;
}) {
  const { qualification: q } = result;
  const intent = intentLabel(q.intent);

  const budget = q.estimatedBudget
    ? `${formatAmount(q.estimatedBudget.amount, currency)}${
        q.estimatedBudget.period === "per_day" ? " / day" : ""
      }`
    : null;

  const duration = q.rentalDuration
    ? (q.rentalDuration.label ??
      (q.rentalDuration.days === null
        ? null
        : `${q.rentalDuration.days} ${q.rentalDuration.days === 1 ? "day" : "days"}`))
    : null;

  const vehicle = q.vehiclePreference
    ? (q.vehiclePreference.description ?? q.vehiclePreference.category)
    : null;

  return (
    <div className="mt-4 space-y-4 border-t border-line pt-4">
      <div className="flex flex-wrap items-center gap-4">
        <LeadScore score={q.leadScore} />
        <PriorityPill priority={q.priority} />
        <LeadUrgency urgency={q.urgency} />
      </div>

      <dl className="grid gap-3 rounded-xl bg-canvas p-3.5 sm:grid-cols-2">
        <Fact label="Intent" value={intent} />
        <Fact label="Budget" value={budget} />
        <Fact label="Duration" value={duration} />
        <Fact label="Vehicle" value={vehicle} />
      </dl>

      <div>
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
          <IconSparkles size={13} stroke={1.8} />
          AI summary
        </p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-700">{q.summary}</p>
      </div>

      <div className="rounded-xl bg-gold-100 px-3.5 py-3">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-gold-600">
          <IconTargetArrow size={13} stroke={1.8} />
          Recommended action
        </p>
        <p className="mt-1.5 text-[13px] font-medium leading-relaxed text-navy-900">
          {q.recommendedAction}
        </p>
      </div>

      {q.missingInformation.length > 0 ? (
        <p className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-ink-400">Still unknown:</span>
          {q.missingInformation.map((item) => (
            <span
              key={item}
              className="rounded-full bg-surface px-2 py-0.5 text-[11px] text-ink-500"
            >
              {item}
            </span>
          ))}
        </p>
      ) : null}

      {/* Values our own checks overrode. Staff should see when we disagreed. */}
      {result.adjustments.length > 0 ? (
        <div className="rounded-xl border border-line px-3.5 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">
            Corrected by our checks
          </p>
          <ul className="mt-1.5 space-y-1">
            {result.adjustments.map((item) => (
              <li key={item} className="text-xs leading-relaxed text-ink-500">
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wide text-ink-400">{label}</dt>
      <dd className={cn("mt-0.5 text-[13px]", value ? "text-ink-700" : "text-ink-400")}>
        {value ?? "Not stated"}
      </dd>
    </div>
  );
}
