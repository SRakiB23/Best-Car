"use client";

import { useCallback, useSyncExternalStore } from "react";

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

export function useStoredState(key: string, initial: string) {
  const value = useSyncExternalStore(
    subscribe,
    () => window.localStorage.getItem(key) ?? initial,
    () => initial,
  );

  const update = useCallback(
    (next: string) => {
      window.localStorage.setItem(key, next);
      listeners.forEach((listener) => listener());
    },
    [key],
  );

  return [value, update] as const;
}
