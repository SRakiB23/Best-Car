import { ProductRowActions } from "@/components/products/product-row-actions";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { SearchField } from "@/components/ui/search-field";
import { SortLink } from "@/components/ui/sort-link";
import { StockPill } from "@/components/ui/stock-pill";
import { Table, TableHeadRow, Td, Th } from "@/components/ui/table";
import { Thumbnail } from "@/components/ui/thumbnail";
import { getPreferences, getTranslator } from "@/lib/account-store";
import { getProducts, productSortKeys } from "@/lib/data";
import { formatAmount } from "@/lib/format";
import { pageCount, readListParams } from "@/lib/list-params";
import type { DashboardSearchParams } from "@/lib/filters";

const columns = [
  { label: "Product", sortKey: "name" },
  { label: "Category", sortKey: "category" },
  { label: "Price", sortKey: "price" },
  { label: "Stock", sortKey: "stock" },
  { label: "Units Sold", sortKey: "sales" },
  { label: "Revenue" },
  { label: "Actions" },
] as const;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<DashboardSearchParams>;
}) {
  const params = readListParams(await searchParams, productSortKeys, "sales");
  const [{ currency, lowStockThreshold }, t, { rows, total }] = await Promise.all([
    getPreferences(),
    getTranslator(),
    getProducts(params),
  ]);

  return (
    <div className="space-y-4 lg:space-y-6">
      <PageHeader
        title={t("Products")}
        description={t("Every car in the catalogue, ranked by units sold.")}
      />

      <Card>
        <CardHeader
          title={t("All Products")}
          action={<SearchField key={params.q} value={params.q} placeholder={t("Search products")} />}
        />

        {rows.length === 0 ? (
          <EmptyState title={t("No products found")} hint={t("Try a different search term.")} />
        ) : (
          <>
            <Table>
              <TableHeadRow>
                {columns.map((column) => (
                  <Th key={column.label} className={column.label === "Actions" ? "text-right" : ""}>
                    {"sortKey" in column ? (
                      <SortLink
                        label={t(column.label)}
                        sortKey={column.sortKey}
                        activeKey={params.sort}
                        direction={params.dir}
                      />
                    ) : (
                      t(column.label)
                    )}
                  </Th>
                ))}
              </TableHeadRow>

              <tbody>
                {rows.map((product) => (
                  <tr key={product.id} className="border-t border-line">
                    <Td>
                      <div className="flex items-center gap-3">
                        <Thumbnail src={product.image} alt={product.name} />
                        <p className="truncate text-[13px] font-semibold text-navy-900">
                          {product.name}
                        </p>
                      </div>
                    </Td>
                    <Td className="whitespace-nowrap text-[13px] text-ink-500">
                      {product.category}
                    </Td>
                    <Td className="whitespace-nowrap text-[13px] text-ink-700">
                      {formatAmount(product.price, currency)}
                    </Td>
                    <Td>
                      <StockPill stock={product.stock} threshold={lowStockThreshold} />
                    </Td>
                    <Td className="text-[13px] text-ink-700">
                      {product.sales.toLocaleString("en-US")}
                    </Td>
                    <Td className="whitespace-nowrap text-[13px] font-semibold text-navy-900">
                      {formatAmount(product.revenue, currency)}
                    </Td>
                    <Td>
                      <ProductRowActions
                        product={{
                          id: product.id,
                          name: product.name,
                          category: product.category,
                          price: product.price,
                          stock: product.stock,
                          image: product.image,
                        }}
                        sales={product.sales}
                      />
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <Pagination
              page={params.page}
              totalPages={pageCount(total)}
              totalRows={total}
              shown={rows.length}
            />
          </>
        )}
      </Card>
    </div>
  );
}
