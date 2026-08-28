import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "BestCar — Sign in",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <main className="grid min-h-dvh place-items-center bg-canvas px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <Image src="/Logo.svg" alt="BestCar" width={150} height={46} priority />
        </div>

        <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
          <h1 className="text-lg font-semibold text-navy-900">Sign in</h1>
          <p className="mb-5 mt-1 text-[13px] text-ink-500">
            Use your BestCar account to book a car or reach the dashboard.
          </p>

          <LoginForm next={next ?? ""} />

          <p className="mt-5 text-center text-[13px] text-ink-500">
            New to BestCar?{" "}
            <Link
              href={next ? `/register?next=${encodeURIComponent(next)}` : "/register"}
              className="font-medium text-brand-500 hover:text-brand-600"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
