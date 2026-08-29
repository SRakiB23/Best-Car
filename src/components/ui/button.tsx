import type { ComponentProps } from "react";

import { cn } from "@/lib/cn";

/**
 * A light sweeps across the button on hover. Painted over the label on purpose —
 * it is translucent, and clipping it below the text would hide it entirely.
 */
const sheen =
  "before:pointer-events-none before:absolute before:inset-y-0 before:-left-full before:w-1/2 before:skew-x-12 before:bg-linear-to-r before:from-transparent before:via-white/30 before:to-transparent before:transition-transform before:duration-500 before:ease-out before:content-[''] hover:before:translate-x-[400%] motion-reduce:before:hidden";

/** Prominent calls to action rise towards the cursor; quiet chrome stays put. */
const lift = "hover:-translate-y-0.5 hover:shadow-float motion-reduce:hover:translate-y-0";

const variants = {
  brand: cn("bg-brand-500 text-white hover:bg-brand-600", lift, sheen),
  navy: cn("bg-navy-900 text-white hover:bg-navy-800", lift, sheen),
  gold: cn("bg-gold-300 text-night-900 hover:bg-gold-400", lift, sheen),
  outline: "border border-line text-ink-700 hover:border-gold-400 hover:bg-canvas hover:text-ink-900",
  surface: "bg-surface text-ink-500 hover:bg-line hover:text-navy-900",
  soft: "bg-canvas text-ink-700 hover:bg-line",
  ghost: "text-ink-500 hover:bg-canvas hover:text-ink-900",
};

const sizes = {
  md: "h-9 gap-2 px-3 text-[13px] font-medium",
  sm: "gap-1.5 px-3 py-1.5 text-xs font-medium",
  icon: "size-9",
};

type Variant = keyof typeof variants;
type Size = keyof typeof sizes;

export function buttonClass(variant: Variant = "outline", size: Size = "md", className?: string) {
  return cn(
    "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-lg transition duration-200 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 motion-reduce:active:scale-100",
    variants[variant],
    sizes[size],
    className,
  );
}

export function Button({
  variant,
  size,
  className,
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return <button type="button" className={buttonClass(variant, size, className)} {...props} />;
}
