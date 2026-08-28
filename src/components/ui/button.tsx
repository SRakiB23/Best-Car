import type { ComponentProps } from "react";

import { cn } from "@/lib/cn";

const variants = {
  brand: "bg-brand-500 text-white hover:bg-brand-600",
  navy: "bg-navy-900 text-white hover:bg-navy-800",
  gold: "bg-gold-300 text-night-900 hover:bg-gold-400",
  outline: "border border-line text-ink-700 hover:bg-canvas",
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
    "inline-flex shrink-0 items-center justify-center rounded-lg transition disabled:pointer-events-none disabled:opacity-50",
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
