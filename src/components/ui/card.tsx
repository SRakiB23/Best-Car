import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/cn";

export function Card({ className, ...props }: ComponentProps<"section">) {
  return (
    <section
      className={cn(
        "relative flex flex-col rounded-xl border border-line bg-white shadow-card",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ title, action }: { title: ReactNode; action?: ReactNode }) {
  return (
    <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5 sm:py-[15px]">
      <h2 className="text-[15px] font-semibold text-ink-900">{title}</h2>
      {action}
    </header>
  );
}

export function CardBody({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex-1 p-4 sm:p-5", className)} {...props} />;
}
