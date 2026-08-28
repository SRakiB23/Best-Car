import Image from "next/image";

import { Card } from "@/components/ui/card";
import { RefreshButton } from "@/components/ui/refresh-button";
import { cn } from "@/lib/cn";

const tones = {
  brand: "bg-brand-strong",
  navy: "bg-navy-900",
};

type CountStatCardProps = {
  icon: string;
  value: string;
  label: string;
  tone: keyof typeof tones;
};

export function CountStatCard({ icon, value, label, tone }: CountStatCardProps) {
  return (
    <Card className={cn("border-transparent p-4 text-white sm:p-5", tones[tone])}>
      <RefreshButton
        label={`Refresh ${label}`}
        className="absolute right-4 top-4 text-white/70 hover:text-white sm:right-5 sm:top-5"
      />

      <Image src={icon} alt="" width={45} height={45} className="mb-6" />

      <p className="text-2xl font-bold leading-tight">{value}</p>
      <p className="mt-1 text-[13px] text-white/80">{label}</p>
    </Card>
  );
}
