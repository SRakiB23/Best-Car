"use client";

import { cn } from "@/lib/cn";
import { Sidebar } from "./sidebar";
import { Topbar, type TopbarData } from "./topbar";
import { ShellProvider, useShell } from "./shell-context";

function ShellFrame({ children, topbar }: { children: React.ReactNode; topbar: TopbarData }) {
  const { collapsed } = useShell();

  return (
    <div className="min-h-dvh">
      <Sidebar />

      <div
        className={cn(
          "flex min-h-dvh flex-col transition-[padding] duration-200",
          collapsed ? "lg:pl-[76px]" : "lg:pl-[240px]",
        )}
      >
        <Topbar {...topbar} />

        <main className="flex-1 p-4 lg:p-6">{children}</main>

        <footer className="flex flex-col gap-1 border-t border-line px-4 py-4 text-xs text-ink-400 sm:flex-row sm:items-center sm:justify-between lg:px-6">
          <p>{new Date().getFullYear()} © All Right Reserved</p>
          <p>Designed &amp; Developed</p>
        </footer>
      </div>
    </div>
  );
}

export function AppShell({
  children,
  topbar,
}: {
  children: React.ReactNode;
  topbar: TopbarData;
}) {
  return (
    <ShellProvider>
      <ShellFrame topbar={topbar}>{children}</ShellFrame>
    </ShellProvider>
  );
}
