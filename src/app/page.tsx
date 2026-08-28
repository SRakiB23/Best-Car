import Image from "next/image";
import Link from "next/link";

import { buttonClass } from "@/components/ui/button";

export default function StorefrontPage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-canvas px-6">
      <div className="flex flex-col items-center gap-5 text-center">
        <Image src="/Logo.svg" alt="BestCar" width={160} height={50} priority />

        <p className="max-w-sm text-[13px] text-ink-500">
          The customer storefront lives here. It has not been designed yet.
        </p>

        <Link href="/admin" className={buttonClass("brand")}>
          Go to dashboard
        </Link>
      </div>
    </main>
  );
}
