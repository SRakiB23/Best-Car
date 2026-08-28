const units: [string, number][] = [
  ["Year", 365 * 24 * 60],
  ["Month", 30 * 24 * 60],
  ["Day", 24 * 60],
  ["Hour", 60],
  ["Min", 1],
];

export function relativeTime(timestamp: string, now: Date = new Date()) {
  const minutes = Math.max(0, Math.round((now.getTime() - new Date(timestamp).getTime()) / 60000));

  for (const [unit, size] of units) {
    if (minutes >= size) {
      const value = Math.floor(minutes / size);
      return `${value} ${unit}${value > 1 ? "s" : ""}`;
    }
  }

  return "Just now";
}
