import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { IconSparkles } from "@tabler/icons-react";

import { DemoAccounts } from "./demo-accounts";
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
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Link href="/">
            <Image
              src="/Logo.svg"
              alt="BestCar"
              width={150}
              height={46}
              priority
              style={{ height: "auto" }}
            />
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
          <div className="border-b border-line bg-linear-to-b from-canvas to-white px-6 py-5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand-700">
              <IconSparkles size={13} stroke={2} />
              Demo access
            </span>

            <h1 className="mt-3 text-lg font-semibold text-navy-900">Sign in to BestCar</h1>
            <p className="mt-1 text-[13px] text-ink-500">
              Pick a ready-made account to explore in one click, or use your own below.
            </p>
          </div>

          <div className="px-6 py-5">
            <DemoAccounts />

            <p className="mt-3 text-center text-xs text-ink-400">
              Tap any email or password to copy it.
            </p>

            <div className="my-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-line" />
              <span className="text-[11px] font-medium uppercase tracking-wide text-ink-400">
                Or sign in manually
              </span>
              <span className="h-px flex-1 bg-line" />
            </div>

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
      </div>
    </main>
  );
}
