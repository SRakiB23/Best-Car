"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IconLoader2, IconSparkles } from "@tabler/icons-react";

import {
  QualifyLeadDialog,
  qualifySteps,
  type QualifyPhase,
} from "@/components/leads/qualify-lead-dialog";
import { buttonClass } from "@/components/ui/button";
import type { QualifyLeadResult } from "@/lib/ai/lead-qualification";
import type { CurrencyCode } from "@/lib/types";

/**
 * The call is one request, so the checklist cannot report real progress. It
 * paces itself while the request is open and settles on the true outcome,
 * never claiming a step finished after the request has failed.
 */
const stepEveryMs = 1_400;

export function QualifyLeadButton({
  leadId,
  qualified,
  customer,
  currency = "USD",
}: {
  leadId: string;
  qualified: boolean;
  customer: string;
  currency?: CurrencyCode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<QualifyPhase>("running");
  const [step, setStep] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [result, setResult] = useState<QualifyLeadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, startRefresh] = useTransition();
  const inFlight = useRef<AbortController | null>(null);

  useEffect(() => () => inFlight.current?.abort(), []);

  const qualify = useCallback(async () => {
    inFlight.current?.abort();
    const controller = new AbortController();
    inFlight.current = controller;

    setOpen(true);
    setPhase("running");
    setStep(0);
    setElapsedMs(0);
    setResult(null);
    setError(null);

    try {
      const response = await fetch("/api/ai/qualify-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId }),
        signal: controller.signal,
      });

      const payload = await response.json();

      if (!response.ok) {
        setError(payload?.error?.message ?? "Something went wrong. Please try again.");
        setPhase("error");
        return;
      }

      setResult(payload as QualifyLeadResult);
      setPhase("done");

      // The row is re-read from the database rather than patched from the
      // response, so the table can only ever show what was actually saved.
      startRefresh(() => router.refresh());
    } catch {
      if (controller.signal.aborted) return;
      setError("Could not reach the server. Check your connection and try again.");
      setPhase("error");
    }
  }, [leadId, router]);

  // One ticker drives both the elapsed clock and the checklist, so they can
  // never disagree about how far along the request is.
  useEffect(() => {
    if (phase !== "running") return;

    const startedAt = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      setElapsedMs(elapsed);
      setStep(Math.min(Math.floor(elapsed / stepEveryMs), qualifySteps.length - 1));
    }, 100);

    return () => clearInterval(timer);
  }, [phase]);

  const busy = phase === "running" && open;

  return (
    <>
      <button
        type="button"
        onClick={qualify}
        disabled={busy}
        aria-label={`${qualified ? "Re-qualify" : "Qualify"} the inquiry from ${customer}`}
        className={buttonClass(qualified ? "outline" : "navy", "sm", "whitespace-nowrap")}
      >
        {busy ? (
          <IconLoader2 size={14} stroke={2} className="animate-spin" />
        ) : (
          <IconSparkles size={14} stroke={1.8} />
        )}
        {busy ? "Working…" : qualified ? "Re-run" : "Qualify"}
      </button>

      <QualifyLeadDialog
        open={open}
        onClose={() => setOpen(false)}
        onRetry={qualify}
        customer={customer}
        phase={phase}
        step={step}
        elapsedMs={elapsedMs}
        result={result}
        error={error}
        currency={currency}
        saving={saving}
      />
    </>
  );
}
