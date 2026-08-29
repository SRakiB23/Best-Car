"use client";

import Link from "next/link";
import { useEffect } from "react";
import { IconAlertTriangle } from "@tabler/icons-react";

import { Card, CardBody } from "@/components/ui/card";
import { Button, buttonClass } from "@/components/ui/button";
import { adminRoot } from "@/lib/nav";

/**
 * Scoped to the dashboard, so the sidebar and topbar stay put and a failed
 * screen costs one panel rather than the whole session. Errors thrown by the
 * admin layout itself still fall through to the root boundary.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("admin error", error.digest ?? "", error.message);
  }, [error]);

  return (
    <Card>
      <CardBody className="grid place-items-center gap-3 py-20 text-center">
        <span className="grid size-12 place-items-center rounded-full bg-brand-50 text-brand-500">
          <IconAlertTriangle size={22} stroke={1.6} />
        </span>

        <h1 className="text-lg font-semibold text-navy-900">This screen failed to load</h1>
        <p className="max-w-sm text-[13px] text-ink-500">
          The data behind it could not be fetched. Retrying is safe — nothing was written.
        </p>

        <div className="mt-2 flex flex-wrap justify-center gap-2">
          <Button variant="brand" onClick={reset}>
            Try again
          </Button>
          <Link href={adminRoot} className={buttonClass("outline")}>
            Back to dashboard
          </Link>
        </div>

        {error.digest && (
          <code className="mt-2 rounded-md bg-canvas px-2 py-1 text-xs text-ink-500">
            {error.digest}
          </code>
        )}
      </CardBody>
    </Card>
  );
}
