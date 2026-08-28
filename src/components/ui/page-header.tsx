export function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div>
      <h1 className="text-lg font-semibold text-navy-900">{title}</h1>
      {description && <p className="mt-1 text-[13px] text-ink-500">{description}</p>}
    </div>
  );
}
