export const rangeDays = { "7d": 7, "30d": 30, "90d": 90, "365d": 365 } as const;

export type DateRange = keyof typeof rangeDays;

const dayFormat = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function rangeLabel(days: number, today = new Date()) {
  const start = new Date(today);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  return `${dayFormat.format(start)} - ${dayFormat.format(today)}`;
}

export const dateRangeOptions = (Object.keys(rangeDays) as DateRange[]).map((value) => ({
  value,
  label: rangeLabel(rangeDays[value]),
}));

const currentYear = new Date().getUTCFullYear();

export const chartYearOptions = [currentYear - 2, currentYear - 1, currentYear].map((year) => ({
  value: String(year),
  label: String(year),
}));

export type ChartYear = string;

export const periodDays = { week: 7, month: 30, year: 365 } as const;

export type Period = keyof typeof periodDays;

export const periodOptions = [
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "year", label: "This Year" },
] as const;

export const filterKeys = { range: "range", year: "year", period: "period" } as const;

function parse<T extends string>(
  value: string | string[] | undefined,
  allowed: readonly { value: string }[],
  fallback: T,
): T {
  return allowed.some((option) => option.value === value) ? (value as T) : fallback;
}

export type DashboardSearchParams = Record<string, string | string[] | undefined>;

export function readFilters(params: DashboardSearchParams) {
  return {
    range: parse<DateRange>(params.range, dateRangeOptions, "7d"),
    period: parse<Period>(params.period, periodOptions, "week"),
    year: parse<ChartYear>(params.year, chartYearOptions, String(currentYear)),
  };
}

export const comparisonLabel: Record<DateRange, string> = {
  "7d": "last week",
  "30d": "last month",
  "90d": "last quarter",
  "365d": "last year",
};

export const periodComparison: Record<Period, string> = {
  week: "last week",
  month: "last month",
  year: "last year",
};
