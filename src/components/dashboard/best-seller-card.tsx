import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Thumbnail } from "@/components/ui/thumbnail";
import { getTranslator } from "@/lib/account-store";
import { formatAmount } from "@/lib/format";
import type { BestSeller, CurrencyCode } from "@/lib/types";

type BestSellerCardProps = {
  items: BestSeller[];
  currency: CurrencyCode;
  action?: React.ReactNode;
  className?: string;
};

export async function BestSellerCard({ items, currency, action, className }: BestSellerCardProps) {
  const t = await getTranslator();

  return (
    <Card className={className}>
      <CardHeader title={t("Best Seller")} action={action} />

      <CardBody className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <Thumbnail src={item.image} alt={item.name} />

            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-navy-900">{item.name}</p>
              <p className="mt-0.5 text-xs text-ink-500">{formatAmount(item.price, currency)}</p>
            </div>

            <div className="shrink-0 text-right">
              <p className="text-xs text-ink-500">Sales</p>
              <p className="mt-0.5 text-[13px] font-semibold text-navy-900">
                {item.sales.toLocaleString("en-US")}
              </p>
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
