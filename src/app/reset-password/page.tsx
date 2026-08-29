import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";

import { AuthCard } from "@/components/site/auth-card";
import { currentUser } from "@/lib/auth";
import { recoveryCookie } from "@/lib/password-reset";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = {
  title: "BestCar — Set a new password",
};

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage() {
  // Both halves are required: a session, and the marker proving it came from an
  // emailed link. The action checks the same pair, so this only decides which
  // screen to render.
  const [store, user] = await Promise.all([cookies(), currentUser()]);
  const verified = store.has(recoveryCookie) && user !== null;

  if (!verified) {
    return (
      <AuthCard
        title="This link is no longer valid"
        description="Reset links expire after a while and can only be used once."
      >
        <Link
          href="/forgot-password"
          className="flex h-10 w-full items-center justify-center rounded-lg bg-brand-500 text-[13px] font-semibold text-white transition hover:bg-brand-600"
        >
          Request a new link
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Set a new password"
      description="Choose a password you don't use anywhere else. You'll stay signed in on this device."
      footer="Signing in elsewhere? Those sessions will be signed out."
    >
      <ResetPasswordForm email={user.email ?? ""} />
    </AuthCard>
  );
}
