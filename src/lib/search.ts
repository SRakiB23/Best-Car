export const minQueryLength = 2;

export type SearchHit = {
  id: string;
  href: string;
  title: string;
  subtitle: string;
  image?: string;
};

export type SearchResults = {
  products: SearchHit[];
  orders: SearchHit[];
};

export const noResults: SearchResults = { products: [], orders: [] };

// PostgREST reads commas and brackets as filter syntax, and % or _ as wildcards,
// so a query typed by hand cannot go straight into an ilike pattern.
export function likeTerm(value: string) {
  return value.replace(/[,()\\*%_]/g, " ").trim();
}
