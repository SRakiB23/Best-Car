import { cn } from "@/lib/cn";
import type { Translate } from "@/lib/i18n";
import type { Trend } from "@/lib/types";

export function TrendNote({
  trend,
  t,
  className,
}: {
  trend: Trend;
  t: Translate;
  className?: string;
}) {
  const rising = trend.direction === "up";
  const tone = rising ? "text-positive" : "text-negative";

  return (
    <p className={cn("flex items-center gap-1 text-[13px] text-ink-500", className)}>
      <span
        aria-hidden
        className={cn("h-2 w-[13px] shrink-0 bg-current", tone, !rising && "rotate-180")}
        style={{
          maskImage: "url(/sidebar-icons/Vector.svg)",
          WebkitMaskImage: "url(/sidebar-icons/Vector.svg)",
          maskSize: "contain",
          maskRepeat: "no-repeat",
          maskPosition: "center",
        }}
      />
      <span className={cn("font-semibold", tone)}>{trend.percent}%</span>
      {t(rising ? "increase compare to" : "decrease compare to")} {t(trend.comparedTo)}
    </p>
  );
}
