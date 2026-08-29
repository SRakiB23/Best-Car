"use client";

import Link from "next/link";
import { useEffect } from "react";
import { IconAlertTriangle } from "@tabler/icons-react";

import { Container } from "@/components/site/section";
import { buttonClass } from "@/components/ui/button";

/**
 * Catches anything that throws below the root layout. Without it a failed
 * server component drops the visitor on an unstyled Next.js error screen with
 * no way back into the site.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // The message itself is already on the server; this catches the ones that
    // only happen in someone's browser.
    console.error("unhandled error", error.digest ?? "", error.message);
  }, [error]);

  return (
    <main className="grid min-h-dvh place-items-center bg-mist py-16">
      <Container className="max-w-lg">
        <div className="flex flex-col items-center rounded-3xl bg-white p-8 text-center shadow-float lg:p-12">
          <span className="grid size-14 place-items-center rounded-full bg-mist text-ink-500">
            <IconAlertTriangle size={26} stroke={1.6} />
          </span>

          <h1 className="mt-5 text-2xl font-bold text-ink-900 lg:text-3xl">
            Something went wrong
          </h1>
          <p className="mt-3 text-sm text-ink-500">
            The page could not be loaded. Nothing you had booked or saved has been affected.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={reset}
              className={buttonClass("navy", "md", "h-11 px-6 font-semibold")}
            >
              Try again
            </button>
            <Link href="/" className={buttonClass("outline", "md", "h-11 px-6 font-semibold")}>
              Back to home
            </Link>
          </div>

          {/* The one thing worth quoting when someone reports this. */}
          {error.digest && (
            <p className="mt-6 text-xs text-ink-400">
              Reference <span className="font-medium text-ink-500">{error.digest}</span>
            </p>
          )}
        </div>
      </Container>
    </main>
  );
}
