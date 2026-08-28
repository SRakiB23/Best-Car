import Image from "next/image";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { getTranslator } from "@/lib/account-store";
import { formatAmount } from "@/lib/format";
import type { CurrencyCode, EarningSummary } from "@/lib/types";
import { TrendNote } from "./trend-note";

type WeeklyEarningCardProps = Pick<EarningSummary, "weeklyEarning" | "trend"> & {
  currency: CurrencyCode;
  className?: string;
};

export async function WeeklyEarningCard({
  weeklyEarning,
  trend,
  currency,
  className,
}: WeeklyEarningCardProps) {
  const t = await getTranslator();

  return (
    <Card className={cn("flex-row items-center justify-between gap-4 p-4 sm:p-5", className)}>
      <div>
        <p className="text-[15px] font-semibold text-brand-500">{t("Weekly Earning")}</p>

        <p className="mt-3 text-2xl font-bold text-navy-900 sm:text-[26px]">
          {formatAmount(weeklyEarning, currency)}
        </p>

        <TrendNote trend={trend} t={t} className="mt-2" />
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
