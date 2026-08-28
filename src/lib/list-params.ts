export const perPage = 10;

export type SortDirection = "asc" | "desc";

export type ListParams<Key extends string> = {
  q: string;
  sort: Key;
  dir: SortDirection;
  page: number;
};

export const listKeys = { search: "q", sort: "sort", dir: "dir", page: "page" } as const;

type Raw = Record<string, string | string[] | undefined>;

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : (value ?? "");
}

export function readListParams<Key extends string>(
  params: Raw,
  sortKeys: readonly Key[],
  fallbackSort: Key,
): ListParams<Key> {
  const sort = single(params[listKeys.sort]) as Key;
  const page = Number(single(params[listKeys.page]));

  return {
    q: single(params[listKeys.search]).trim(),
    sort: sortKeys.includes(sort) ? sort : fallbackSort,
    dir: single(params[listKeys.dir]) === "asc" ? "asc" : "desc",
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

export function pageRange(page: number) {
  const from = (page - 1) * perPage;
  return { from, to: from + perPage - 1 };
}

export function pageCount(total: number) {
  return Math.max(1, Math.ceil(total / perPage));
}
