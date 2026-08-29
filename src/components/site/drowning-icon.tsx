/**
 * Tabler has no drowning pictogram, so this is drawn to match its house style:
 * 24px grid, 1.8 stroke, round caps. A figure with both arms up above two waves.
 */
export function IconDrowning({
  size = 24,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="4.6" r="2.1" />
      <path d="M9 10.2 5.9 5.6" />
      <path d="M15 10.2 18.1 5.6" />
      <path d="M9 10.2h6" />
      <path d="M12 10.2v3.4" />
      <path d="M2.5 16c1.6-1.6 3.2-1.6 4.75 0s3.2 1.6 4.75 0 3.2-1.6 4.75 0 3.2 1.6 4.75 0" />
      <path d="M2.5 20c1.6-1.6 3.2-1.6 4.75 0s3.2 1.6 4.75 0 3.2-1.6 4.75 0 3.2 1.6 4.75 0" />
    </svg>
  );
}
