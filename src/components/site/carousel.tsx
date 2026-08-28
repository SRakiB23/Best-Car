"use client";

import { Children, type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

import { cn } from "@/lib/cn";

type CarouselProps = {
  children: ReactNode;
  label: string;
  slideClassName?: string;
  className?: string;
  tone?: "light" | "dark";
  gap?: number;
  controls?: "icons" | "labels";
};

const tones = {
  light: {
    control: "border-line bg-white text-ink-900 hover:bg-gold-100",
    label: "text-ink-900 hover:text-gold-600",
    dot: "bg-ink-400/40",
    activeDot: "bg-gold-500",
  },
  dark: {
    control: "border-white/15 bg-white/5 text-white hover:border-gold-300 hover:text-gold-300",
    label: "text-white hover:text-gold-300",
    dot: "bg-white/25",
    activeDot: "bg-gold-300",
  },
};

export function Carousel({
  children,
  label,
  slideClassName,
  className,
  tone = "light",
  gap = 24,
  controls = "icons",
}: CarouselProps) {
  const trackRef = useRef<HTMLUListElement>(null);
  const settleRef = useRef<number | null>(null);
  const [active, setActive] = useState(0);
  const slides = Children.toArray(children);
  const styles = tones[tone];

  const metrics = useCallback(() => {
    const track = trackRef.current;
    if (!track) return null;

    const step = (track.firstElementChild?.clientWidth ?? 0) + gap;
    return { track, step, half: track.scrollWidth / 2 };
  }, [gap]);

  const normalize = useCallback(() => {
    const data = metrics();
    if (!data) return;

    if (data.track.scrollLeft >= data.half) data.track.scrollLeft -= data.half;
    else if (data.track.scrollLeft < 0) data.track.scrollLeft += data.half;
  }, [metrics]);

  const sync = useCallback(() => {
    const data = metrics();
    if (!data || !data.step) return;

    setActive(Math.round(data.track.scrollLeft / data.step) % slides.length);

    if (settleRef.current) window.clearTimeout(settleRef.current);
    settleRef.current = window.setTimeout(normalize, 220);
  }, [metrics, normalize, slides.length]);

  useEffect(() => {
    window.addEventListener("resize", sync);
    return () => {
      window.removeEventListener("resize", sync);
      if (settleRef.current) window.clearTimeout(settleRef.current);
    };
  }, [sync]);

  const go = (direction: 1 | -1) => {
    const data = metrics();
    if (!data) return;

    if (direction === -1 && data.track.scrollLeft - data.step < 0) {
      data.track.scrollLeft += data.half;
    }

    data.track.scrollBy({ left: direction * data.step, behavior: "smooth" });
  };

  const goTo = (index: number) => {
    const data = metrics();
    if (!data) return;

    data.track.scrollTo({ left: index * data.step, behavior: "smooth" });
  };

  return (
    <div className={cn("relative", className)}>
      <ul
        ref={trackRef}
        onScroll={sync}
        aria-label={label}
        style={{ gap }}
        className="scrollbar-none flex snap-x snap-mandatory overflow-x-auto pb-4"
      >
        {[...slides, ...slides].map((slide, index) => (
          <li
            key={index}
            aria-hidden={index >= slides.length}
            className={cn("min-w-0 shrink-0 snap-start basis-full", slideClassName)}
          >
            {slide}
          </li>
        ))}
      </ul>

      <div
        className={cn(
          "mt-6 flex items-center gap-6 sm:mt-8",
          controls === "labels" ? "justify-between" : "justify-center",
        )}
      >
        <button
          type="button"
          aria-label="Previous"
          onClick={() => go(-1)}
          className={cn(
            "transition active:scale-95",
            controls === "labels"
              ? cn("inline-flex items-center gap-2 text-sm font-medium", styles.label)
              : cn(
                  "grid size-11 place-items-center rounded-full border hover:scale-105",
                  styles.control,
                ),
          )}
        >
          <IconChevronLeft size={18} />
          {controls === "labels" ? <span className="hidden sm:inline">Previous</span> : null}
        </button>

        <div className="flex items-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === active}
              onClick={() => goTo(index)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                index === active ? cn("w-6", styles.activeDot) : cn("w-1.5", styles.dot),
              )}
            />
          ))}
        </div>

        <button
          type="button"
          aria-label="Next"
          onClick={() => go(1)}
          className={cn(
            "transition active:scale-95",
            controls === "labels"
              ? cn("inline-flex items-center gap-2 text-sm font-medium", styles.label)
              : cn(
                  "grid size-11 place-items-center rounded-full border hover:scale-105",
                  styles.control,
                ),
          )}
        >
          {controls === "labels" ? <span className="hidden sm:inline">Next</span> : null}
          <IconChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
