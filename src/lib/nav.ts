import type { Icon } from "@tabler/icons-react";
import {
  IconBox,
  IconDiscount,
  IconGift,
  IconLayoutGrid,
  IconUserEdit,
  IconUserSearch,
} from "@tabler/icons-react";

const icons = "/sidebar-icons";

export const adminRoot = "/admin";

/**
 * Where a signed-in customer lands: the storefront, not their booking list. A
 * customer signs in to browse and book far more often than to review what they
 * already have. Lives here rather than in `auth.ts` because the sign-in page is
 * a client component and must not pull in a `server-only` module.
 */
export const customerHome = "/";

export type NavIconSource = string | Icon;

/**
 * Most of this menu comes from the dashboard template and has no screen behind
 * it. Rather than let someone click through to a stub, anything without
 * `ready: true` renders as a disabled row marked "Soon" and is left out of the
 * search index. Build the screen, add the flag, and the row lights up.
 */
export type NavItem = {
  label: string;
  href: string;
  icon: NavIconSource;
  ready?: boolean;
  children?: NavChild[];
};

export type NavChild = {
  label: string;
  href: string;
  ready?: boolean;
};

export type NavSection = {
  title?: string;
  items: NavItem[];
};

function covers(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

// Several routes nest inside others, so a plain prefix test lights up both
// "Products" and "Create Product". Only the most specific match wins.
export function isNavActive(pathname: string, href: string) {
  if (!covers(pathname, href)) return false;

  return !navHrefs.some(
    (other) => other.length > href.length && covers(pathname, other),
  );
}

export const navSections: NavSection[] = [
  {
    title: "Main",
    items: [
      { label: "Dashboard", href: "/admin", icon: IconLayoutGrid, ready: true },
      { label: "Super Admin", href: "/admin/super-admin", icon: IconUserEdit },
    ],
  },
  {
    title: "Inventory",
    items: [
      { label: "Products", href: "/admin/products", icon: IconBox, ready: true },
      { label: "Create Product", href: "/admin/products/create", icon: `${icons}/create-product.svg` },
      { label: "Expired Products", href: "/admin/products/expired", icon: `${icons}/expired.svg` },
      { label: "Low Stocks", href: "/admin/products/low-stock", icon: `${icons}/stock.svg` },
      { label: "Category", href: "/admin/categories", icon: `${icons}/category.svg` },
      { label: "Sub Category", href: "/admin/sub-categories", icon: `${icons}/sub-catagory.svg` },
      { label: "Brands", href: "/admin/brands", icon: `${icons}/brands.svg` },
      { label: "Units", href: "/admin/units", icon: `${icons}/units.svg` },
      {
        label: "Variant Attributes",
        href: "/admin/variant-attributes",
        icon: `${icons}/vatrient.svg`,
      },
      { label: "Warranties", href: "/admin/warranties", icon: `${icons}/warranties.svg` },
      { label: "Print Barcode", href: "/admin/print-barcode", icon: `${icons}/barcode.svg` },
      { label: "Print QR Code", href: "/admin/print-qr-code", icon: `${icons}/qrcode.svg` },
    ],
  },
  {
    title: "Stock",
    items: [
      { label: "Manage Stock", href: "/admin/stock", icon: `${icons}/manage-stock.svg` },
      { label: "Stock Adjustment", href: "/admin/stock/adjustment", icon: `${icons}/stock-adjustment.svg` },
      { label: "Stock Transfer", href: "/admin/stock/transfer", icon: `${icons}/stock-transfer.svg` },
    ],
  },
  {
    title: "Sales",
    items: [
      {
        label: "Sales",
        href: "/admin/sales",
        icon: `${icons}/sales.svg`,
        ready: true,
        children: [
          { label: "Online Orders", href: "/admin/sales/online-orders", ready: true },
          { label: "POS Orders", href: "/admin/sales/pos-orders" },
        ],
      },
      { label: "Leads", href: "/admin/leads", icon: IconUserSearch, ready: true },
      { label: "Invoices", href: "/admin/invoices", icon: `${icons}/invoice.svg` },
      { label: "Sales Return", href: "/admin/sales-return", icon: `${icons}/sales-return.svg` },
      { label: "Quotation", href: "/admin/quotation", icon: `${icons}/quotation.svg` },
      {
        label: "POS",
        href: "/admin/pos",
        icon: `${icons}/POS.svg`,
        children: [
          { label: "POS 1", href: "/admin/pos/1" },
          { label: "POS 2", href: "/admin/pos/2" },
        ],
      },
    ],
  },
  {
    title: "Promo",
    items: [
      { label: "Coupons", href: "/admin/coupons", icon: IconDiscount },
      { label: "Gift Cards", href: "/admin/gift-cards", icon: IconGift },
    ],
  },
];

const navHrefs = navSections.flatMap((section) =>
  section.items.flatMap((item) => [item.href, ...(item.children ?? []).map((child) => child.href)]),
);

/** Every destination that actually exists, for the command palette to offer. */
export const navDestinations = navSections.flatMap((section) =>
  section.items.flatMap((item) => [
    ...(item.ready ? [{ label: item.label, href: item.href, section: section.title ?? "" }] : []),
    ...(item.children ?? [])
      .filter((child) => child.ready)
      .map((child) => ({ label: child.label, href: child.href, section: item.label })),
  ]),
);
