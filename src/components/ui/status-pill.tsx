import type { BookingStatus, PaymentStatus } from "@/lib/types";

const tones: Record<PaymentStatus | BookingStatus, { label: string; className: string }> = {
  success: { label: "Success", className: "bg-positive" },
  cancelled: { label: "Cancelled", className: "bg-negative" },
  pending: { label: "Pending", className: "bg-info" },
  confirmed: { label: "Confirmed", className: "bg-positive" },
};

export function StatusPill({ status }: { status: PaymentStatus | BookingStatus }) {
  const { label, className } = tones[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium text-white ${className}`}
    >
      <span className="size-1.5 rounded-full bg-white" />
      {label}
    </span>
  );
}
