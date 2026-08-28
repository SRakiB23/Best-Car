"use client";

import { useTransition } from "react";

import { signOut } from "@/lib/auth-actions";

export function SignOutButton({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => signOut())}
      className={className}
    >
      {pending ? "Signing out…" : children}
    </button>
  );
}
