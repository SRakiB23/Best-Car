import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

/** The sign-in page's chrome, reused by the password recovery screens. */
export function AuthCard({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
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
            <h1 className="text-lg font-semibold text-navy-900">{title}</h1>
            <p className="mt-1 text-[13px] text-ink-500">{description}</p>
          </div>

          <div className="px-6 py-5">{children}</div>
        </div>

        {footer ? <div className="mt-5 text-center text-[13px] text-ink-500">{footer}</div> : null}
      </div>
    </main>
  );
}
