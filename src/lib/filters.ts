export const dateRangeOptions = [
  { value: "7d", label: "01 Jan 2024 - 07 Jan 2024" },
  { value: "30d", label: "01 Jan 2024 - 31 Jan 2024" },
  { value: "90d", label: "01 Jan 2024 - 31 Mar 2024" },
  { value: "365d", label: "01 Jan 2024 - 31 Dec 2024" },
] as const;

export const chartYearOptions = [
  { value: "2021", label: "2021" },
  { value: "2022", label: "2022" },
  { value: "2023", label: "2023" },
] as const;

export const periodOptions = [
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "year", label: "This Year" },
] as const;

export type DateRange = (typeof dateRangeOptions)[number]["value"];
export type ChartYear = (typeof chartYearOptions)[number]["value"];
export type Period = (typeof periodOptions)[number]["value"];

export const filterKeys = { range: "range", year: "year", period: "period" } as const;

function parse<T extends string>(
  value: string | string[] | undefined,
  allowed: readonly { value: T }[],
  fallback: T,
): T {
  return allowed.some((option) => option.value === value) ? (value as T) : fallback;
}

export type DashboardSearchParams = Record<string, string | string[] | undefined>;

export function readFilters(params: DashboardSearchParams) {
  return {
    range: parse<DateRange>(params.range, dateRangeOptions, "7d"),
    year: parse<ChartYear>(params.year, chartYearOptions, "2023"),
    period: parse<Period>(params.period, periodOptions, "week"),
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
