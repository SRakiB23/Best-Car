"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { IconRefresh } from "@tabler/icons-react";

import { cn } from "@/lib/cn";

export function RefreshButton({ className, label }: { className?: string; label: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      aria-label={label}
      disabled={pending}
      onClick={() => startTransition(() => router.refresh())}
      className={cn("transition disabled:opacity-60", className)}
    >
      <IconRefresh size={16} stroke={1.8} className={cn(pending && "animate-spin")} />
    </button>
  );
}
