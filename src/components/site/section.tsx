import type { ComponentProps } from "react";

import { cn } from "@/lib/cn";

export function Container({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("mx-auto w-full max-w-360 px-4 sm:px-6 lg:px-10 xl:px-20 pb-10 lg:pb-24", className)}
      {...props}
    />
  );
}

export function SectionHeading({
  title,
  subtitle,
  className,
  titleClassName,
  tone = "light",
}: {
  title: string;
  subtitle?: string;
  className?: string;
  titleClassName?: string;
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";

  return (
    <div className={cn("text-center", className)}>
      <h2
        className={cn(
          "mx-auto max-w-158 text-3xl font-medium tracking-tight sm:text-4xl lg:text-5xl lg:leading-tight",
          dark ? "text-white" : "text-ink-900",
          titleClassName,
        )}
      >
        {title}
      </h2>
      <span className="mx-auto mt-3 block h-0.5 w-16 rounded-full bg-gold-400" />
      {subtitle ? (
        <p
          className={cn(
            "mx-auto mt-4 max-w-132.25 text-base font-normal lg:text-lg",
            dark ? "text-night-muted" : "text-ink-500",
          )}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
