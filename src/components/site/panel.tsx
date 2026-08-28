import type { ComponentProps, ElementType } from "react";

import { cn } from "@/lib/cn";

const tones = {
  mist: "bg-mist",
  white: "bg-white",
  navy: "bg-navy-900 text-white",
};

const elevations = {
  none: "",
  card: "shadow-card",
  float: "shadow-float",
};

type Tone = keyof typeof tones;
type Elevation = keyof typeof elevations;

export function panelClass(tone: Tone = "white", elevation: Elevation = "card", className?: string) {
  return cn("rounded-2xl p-5 sm:p-6 lg:p-7", tones[tone], elevations[elevation], className);
}

/** Rounded surface used for every storefront card, floating panel and feature tile. */
export function Panel<T extends ElementType = "div">({
  as,
  tone,
  elevation,
  className,
  ...props
}: { as?: T; tone?: Tone; elevation?: Elevation } & Omit<ComponentProps<T>, "as">) {
  const Component = (as ?? "div") as ElementType;

  return <Component className={panelClass(tone, elevation, className)} {...props} />;
}
