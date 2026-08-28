import Image from "next/image";
import { ArrowUp } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { formatAmount } from "@/lib/format";
import type { EarningSummary } from "@/lib/types";

type WeeklyEarningCardProps = Pick<EarningSummary, "weeklyEarning" | "trend"> & {
  className?: string;
};

export function WeeklyEarningCard({ weeklyEarning, trend, className }: WeeklyEarningCardProps) {
  const rising = trend.direction === "up";

  return (
    <Card className={cn("flex-row items-center justify-between gap-4 p-4 sm:p-5", className)}>
      <div>
        <p className="text-[15px] font-semibold text-brand-500">Weekly Earning</p>

        <p className="mt-3 text-2xl font-bold text-navy-900 sm:text-[26px]">
          {formatAmount(weeklyEarning)}
        </p>

        <p className="mt-2 flex items-center gap-1 text-[13px] text-ink-500">
          <ArrowUp
            className={cn("size-3.5", rising ? "text-positive" : "rotate-180 text-negative")}
            strokeWidth={2.5}
          />
          <span className={cn("font-semibold", rising ? "text-positive" : "text-negative")}>
            {trend.percent}%
          </span>
          {rising ? "increase" : "decrease"} compare to {trend.comparedTo}
        </p>
      </div>

      <Image
        src="/earning.png"
        alt=""
        width={80}
        height={80}
        className="hidden size-[72px] shrink-0 sm:block"
      />
    </Card>
  );
}
