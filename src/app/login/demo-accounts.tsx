"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  IconArrowRight,
  IconCheck,
  IconCopy,
  IconLayoutDashboard,
  IconLoader2,
  IconUser,
} from "@tabler/icons-react";

import { FormMessage } from "@/components/ui/form-parts";
import { signInAsDemo } from "@/lib/auth-actions";
import { cn } from "@/lib/cn";
import { demoAccounts, type DemoAccount } from "@/lib/demo-accounts";
import { idleForm } from "@/lib/form-state";

export function DemoAccounts() {
  return (
    <div className="grid gap-3">
      {demoAccounts.map((account) => (
        <DemoCard key={account.role} account={account} />
      ))}
    </div>
  );
}

function DemoCard({ account }: { account: DemoAccount }) {
  const [state, action] = useActionState(signInAsDemo, idleForm);
  const admin = account.role === "admin";

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border transition duration-200",
        admin
          ? "border-navy-900/10 bg-linear-to-br from-navy-900 to-navy-800 text-white"
          : "border-line bg-white",
      )}
    >
      <form action={action}>
        <input type="hidden" name="role" value={account.role} />

        <EnterButton account={account} admin={admin} />
      </form>

      <div
        className={cn(
          "flex flex-wrap items-center gap-x-4 gap-y-1 border-t px-4 py-2.5 text-xs",
          admin ? "border-white/10 text-white/70" : "border-line bg-canvas text-ink-500",
        )}
      >
        <Credential value={account.email} admin={admin} />
        <Credential value={account.password} admin={admin} />
      </div>

      {state.status === "error" && (
        <div className="border-t border-line bg-white px-4 py-2">
          <FormMessage state={state} />
        </div>
      )}
    </div>
  );
}

function EnterButton({ account, admin }: { account: DemoAccount; admin: boolean }) {
  const { pending } = useFormStatus();
  const Glyph = admin ? IconLayoutDashboard : IconUser;

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "flex w-full items-center gap-3.5 px-4 py-3.5 text-left transition disabled:opacity-70",
        admin ? "hover:bg-white/5" : "hover:bg-canvas",
      )}
    >
      <span
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-xl",
          admin ? "bg-gold-300 text-night-900" : "bg-brand-100 text-brand-600",
        )}
      >
        <Glyph size={20} stroke={1.8} />
      </span>

      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block text-[15px] font-semibold",
            admin ? "text-white" : "text-navy-900",
          )}
        >
          {account.label}
        </span>
        <span className={cn("block text-xs", admin ? "text-white/60" : "text-ink-500")}>
          {pending ? `Signing in…` : account.blurb}
        </span>
      </span>

      <span
        className={cn(
          "grid size-8 shrink-0 place-items-center rounded-full transition group-hover:translate-x-0.5",
          admin ? "bg-white/10 text-white" : "bg-canvas text-ink-500",
        )}
        aria-hidden
      >
        {pending ? (
          <IconLoader2 size={16} className="animate-spin" />
        ) : (
          <IconArrowRight size={16} stroke={2} />
        )}
      </span>
    </button>
  );
}

function Credential({ value, admin }: { value: string; admin: boolean }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access can be denied; the value is readable on screen anyway.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      title="Copy"
      className={cn(
        "inline-flex items-center gap-1.5 font-mono transition",
        admin ? "hover:text-white" : "hover:text-navy-900",
      )}
    >
      {value}
      {copied ? (
        <IconCheck size={13} stroke={2.2} className="text-positive" />
      ) : (
        <IconCopy size={13} stroke={1.8} className="opacity-60" />
      )}
    </button>
  );
}
