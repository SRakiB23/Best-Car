import { cn } from "@/lib/cn";

export function StockPill({ stock, threshold }: { stock: number; threshold: number }) {
  const low = stock <= threshold;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-medium",
        low ? "bg-negative/10 text-negative" : "bg-positive/10 text-positive",
      )}
    >
      <span className={cn("size-1.5 rounded-full", low ? "bg-negative" : "bg-positive")} />
      {stock}
    </span>
  );
}
