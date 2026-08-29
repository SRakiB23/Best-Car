"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { IconAlertTriangle, IconCar, IconSparkles } from "@tabler/icons-react";

import { IconDrowning } from "@/components/site/drowning-icon";
import { Modal } from "@/components/ui/modal";
import { buttonClass } from "@/components/ui/button";
import type { RecommendResult } from "@/lib/ai/recommendation";
import { today } from "@/lib/booking";

const examples = [
  "I need a comfortable SUV for 5 people for 6 days. I have two large suitcases and my budget is around $900 per day.",
  "Something cheap and automatic for a weekend city trip, just me and my partner.",
  "Electric car for a week of business travel, comfort matters more than price.",
];

/**
 * Floating entry point so the assistant never competes with the page layout.
 * Answers persist while the page is open, so reopening does not re-ask the model.
 */
export function AiAdvisor() {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RecommendResult | null>(null);
  const inFlight = useRef<AbortController | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();

    if (prompt.trim().length < 10) {
      setError("Tell us a little more about your trip.");
      return;
    }

    inFlight.current?.abort();
    const controller = new AbortController();
    inFlight.current = controller;

    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          ...(startDate ? { startDate } : {}),
          ...(endDate ? { endDate } : {}),
        }),
        signal: controller.signal,
      });

      const payload = await response.json();

      if (!response.ok) {
        setError(payload?.error?.message ?? "Something went wrong. Please try again.");
        setResult(null);
        return;
      }

      setResult(payload as RecommendResult);
    } catch (cause) {
      if (controller.signal.aborted) return;
      console.error(cause);
      setError("We could not reach the assistant. Please check your connection and try again.");
    } finally {
      if (!controller.signal.aborted) setPending(false);
    }
  }

  return (
    <>
      <div className="fixed bottom-5 right-5 z-50 sm:bottom-8 sm:right-8">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-label="Drowning in options? Let AI pick your car"
          className="relative flex items-center gap-2.5 rounded-full bg-gold-300 py-3 pl-4 pr-5 text-night-900 shadow-float transition hover:bg-gold-400 hover:scale-105 active:scale-95 sm:gap-3 sm:py-3.5 sm:pl-5 sm:pr-6"
        >
          {/* The glow lives on its own layer fading in and out. Pulsing box-shadow on
              the button itself would repaint this pill on every frame, forever. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 rounded-full shadow-[0_0_26px_6px_rgb(223_180_106/0.6)] animate-glow"
          />

          {/* Ripples stay anchored to the icon; on the full pill they would run off-screen. */}
          <span className="relative grid shrink-0 place-items-center">
            <span className="pointer-events-none absolute size-9 rounded-full bg-negative/70 animate-halo sm:size-10" />
            <span
              className="pointer-events-none absolute size-9 rounded-full bg-negative/55 animate-halo sm:size-10"
              style={{ animationDelay: "1.1s" }}
            />

            <span className="relative animate-heartbeat">
              <IconDrowning size={28} className="sm:hidden" />
              <IconDrowning size={32} className="hidden sm:block" />
            </span>
          </span>

          <span className="text-left leading-tight">
            <span className="block text-sm font-bold sm:text-base">Drowning in options?</span>
            <span className="block text-[11px] font-medium text-night-900/70 sm:text-xs">
              Let AI pick your car
            </span>
          </span>
        </button>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Find my car"
        description="Describe your trip and we'll shortlist cars from our fleet."
        className="max-w-2xl"
      >
        <div className="max-h-[70vh] overflow-y-auto px-5 py-5">
          <form onSubmit={submit}>
            <label htmlFor="ai-prompt" className="text-sm font-medium text-ink-700">
              What do you need?
            </label>
            <textarea
              id="ai-prompt"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              rows={3}
              maxLength={1000}
              placeholder="I need a comfortable SUV for 5 people for 6 days. I have two large suitcases and my budget is around $900 per day."
              className="mt-2 w-full resize-none rounded-2xl border border-line bg-canvas px-4 py-3 text-sm text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-gold-400 focus:bg-white"
            />

            <div className="mt-3 flex flex-wrap gap-2">
              {examples.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => setPrompt(example)}
                  className="rounded-full border border-line px-3 py-1.5 text-left text-xs text-ink-500 transition hover:border-gold-400 hover:text-ink-900"
                >
                  {example.length > 44 ? `${example.slice(0, 44)}…` : example}
                </button>
              ))}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3 sm:items-end">
              <div>
                <label htmlFor="ai-start" className="text-xs font-medium text-ink-500">
                  Pick-up (optional)
                </label>
                <input
                  id="ai-start"
                  type="date"
                  min={today()}
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="mt-1 h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm text-ink-900 outline-none focus:border-gold-400 focus:bg-white"
                />
              </div>

              <div>
                <label htmlFor="ai-end" className="text-xs font-medium text-ink-500">
                  Drop-off (optional)
                </label>
                <input
                  id="ai-end"
                  type="date"
                  min={startDate || today()}
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  className="mt-1 h-11 w-full rounded-xl border border-line bg-canvas px-3 text-sm text-ink-900 outline-none focus:border-gold-400 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={pending}
                className={buttonClass("gold", "md", "h-11 w-full text-base font-semibold")}
              >
                <IconSparkles size={18} stroke={1.8} />
                {pending ? "Thinking…" : "Find my car"}
              </button>
            </div>

            {error ? (
              <p className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                <IconAlertTriangle size={18} stroke={1.8} className="mt-0.5 shrink-0" />
                {error}
              </p>
            ) : null}
          </form>

          {pending ? <AdvisorLoading /> : null}
          {!pending && result ? (
            <AdvisorResult result={result} onNavigate={() => setOpen(false)} />
          ) : null}
        </div>
      </Modal>
    </>
  );
}

/** Mirrors the real pipeline stages so the wait doubles as an explanation. */
const stages = [
  "Reading your requirements…",
  "Searching the fleet…",
  "Checking availability for your dates…",
  "Ranking the best matches…",
];

function AdvisorLoading() {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setStage((current) => Math.min(current + 1, stages.length - 1)),
      2200,
    );
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mt-6 border-t border-line pt-6" aria-live="polite" aria-busy>
      <div className="relative overflow-hidden rounded-2xl bg-night-900 px-6 py-8">
        <div className="relative mx-auto flex h-16 w-full max-w-xs items-end justify-center">
          <IconCar size={44} stroke={1.5} className="relative z-10 text-gold-300 animate-bob" />
        </div>

        {/* Dashed centre line scrolling right-to-left under the car. */}
        <div
          className="mx-auto h-0.5 w-full max-w-xs rounded-full animate-road"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to right, var(--color-gold-400) 0 24px, transparent 24px 48px)",
          }}
        />

        <p className="mt-6 text-center text-sm font-medium text-white">{stages[stage]}</p>

        <div className="mx-auto mt-3 h-1 w-full max-w-xs overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/3 rounded-full bg-gold-300 animate-shimmer" />
        </div>
      </div>
    </div>
  );
}

function AdvisorResult({
  result,
  onNavigate,
}: {
  result: RecommendResult;
  onNavigate: () => void;
}) {
  return (
    <div className="mt-6 space-y-4 border-t border-line pt-6" aria-live="polite">
      <p className="text-sm leading-relaxed text-ink-700">{result.summary}</p>

      {result.relaxed.length > 0 ? (
        <Note>No car matched everything, so we set aside your {formatList(result.relaxed)}.</Note>
      ) : null}

      {result.unmetRequirements.map((item) => (
        <Note key={item}>{item}</Note>
      ))}

      {result.recommendations.map((item) => (
        <article
          key={item.vehicle.id}
          className="overflow-hidden rounded-2xl border border-line bg-white sm:flex"
        >
          <div className="relative aspect-16/10 shrink-0 bg-mist sm:aspect-auto sm:w-44">
            {item.vehicle.imageUrl ? (
              <Image
                src={item.vehicle.imageUrl}
                alt={item.vehicle.name}
                fill
                sizes="(min-width: 640px) 11rem, 100vw"
                className="object-cover"
              />
            ) : (
              <div className="grid h-full place-items-center">
                <IconCar size={32} stroke={1.5} className="text-ink-400" />
              </div>
            )}
            <span className="absolute left-3 top-3 rounded-full bg-night-900/80 px-2.5 py-1 text-[11px] font-medium text-gold-300 backdrop-blur">
              #{item.rank} pick
            </span>
          </div>

          <div className="flex flex-1 flex-col p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-ink-900">{item.vehicle.name}</h3>
                <p className="mt-0.5 text-xs text-ink-500">
                  {item.vehicle.category} · {item.vehicle.seats} seats ·{" "}
                  {item.vehicle.transmission} · {item.vehicle.fuelType} ·{" "}
                  {item.vehicle.luggageCapacity} large{" "}
                  {item.vehicle.luggageCapacity === 1 ? "suitcase" : "suitcases"}
                </p>
              </div>
              {item.matchScore !== null ? (
                <div className="text-right">
                  <p className="text-lg font-bold text-ink-900">{item.matchScore}%</p>
                  <p className="text-[11px] text-ink-400">match</p>
                </div>
              ) : null}
            </div>

            <p className="mt-2 text-xs leading-relaxed text-ink-700">{item.explanation}</p>

            <ul className="mt-2 flex flex-wrap gap-1.5">
              {item.reasons.map((reason) => (
                <li
                  key={reason}
                  className="rounded-full bg-canvas px-2.5 py-1 text-[11px] font-medium text-ink-700"
                >
                  {reason}
                </li>
              ))}
            </ul>

            <div className="mt-auto flex flex-wrap items-end justify-between gap-2 pt-4">
              <p className="text-base font-bold text-ink-900">
                ${item.vehicle.pricePerDay.toFixed(2)}
                <span className="ml-1 text-xs font-normal text-ink-500">/ day</span>
                {item.estimate ? (
                  <span className="ml-1.5 text-xs font-normal text-ink-500">
                    · ${item.estimate.total.toFixed(2)} for {item.estimate.days} days
                  </span>
                ) : null}
              </p>

              <Link
                href={`/cars/${item.vehicle.id}`}
                onClick={onNavigate}
                className={buttonClass("gold", "md", "h-10 px-4 text-sm font-semibold")}
              >
                Rent Now
              </Link>
            </div>
          </div>
        </article>
      ))}

      {result.alternative ? (
        <div className="rounded-2xl border border-dashed border-line p-4">
          <p className="text-[11px] font-medium uppercase tracking-wide text-ink-400">
            Worth a look
          </p>
          <div className="mt-1.5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-ink-900">{result.alternative.vehicle.name}</h4>
              <p className="mt-0.5 max-w-md text-xs text-ink-500">{result.alternative.reason}</p>
            </div>
            <Link
              href={`/cars/${result.alternative.vehicle.id}`}
              onClick={onNavigate}
              className={buttonClass("outline", "md", "h-9 px-3 text-xs")}
            >
              View
            </Link>
          </div>
        </div>
      ) : null}

      <p className="text-[11px] text-ink-400">
        Suggestions are generated by AI from live fleet data. Prices and availability come from our
        booking system.
      </p>
    </div>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-2 rounded-xl bg-gold-300/15 px-3 py-2.5 text-xs text-ink-700">
      <IconAlertTriangle size={16} stroke={1.8} className="mt-0.5 shrink-0 text-gold-400" />
      {children}
    </p>
  );
}

function formatList(items: string[]) {
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
}
