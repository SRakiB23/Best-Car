"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function useSetParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return useCallback(
    (values: Record<string, string>) => {
      const params = new URLSearchParams(searchParams);

      for (const [name, value] of Object.entries(values)) {
        if (value) params.set(name, value);
        else params.delete(name);
      }

      router.push(`${pathname}?${params}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );
}

export function useSetParam() {
  const setParams = useSetParams();

  return useCallback((name: string, value: string) => setParams({ [name]: value }), [setParams]);
}
