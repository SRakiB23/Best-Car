import type { Metadata } from "next";
import Link from "next/link";

import { AuthCard } from "@/components/site/auth-card";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = {
  title: "BestCar — Forgot password",
};

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <AuthCard
      title="Forgot your password?"
      description="Enter the email on your account and we'll send you a link to set a new password."
      footer={
        <>
          Remembered it?{" "}
          <Link href="/login" className="font-medium text-brand-500 hover:text-brand-600">
            Back to sign in
          </Link>
        </>
      }
    >
      <ForgotPasswordForm linkExpired={error === "link"} />
    </AuthCard>
  );
}
