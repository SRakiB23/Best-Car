import { IconSearchOff } from "@tabler/icons-react";

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="grid place-items-center gap-2 px-5 py-16 text-center">
      <span className="grid size-11 place-items-center rounded-full bg-canvas text-ink-400">
        <IconSearchOff size={20} stroke={1.6} />
      </span>
      <p className="text-[13px] font-semibold text-navy-900">{title}</p>
      {hint && <p className="max-w-xs text-xs text-ink-500">{hint}</p>}
    </div>
  );
}
