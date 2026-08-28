import type { Icon } from "@tabler/icons-react";
import { IconBox, IconDiscount, IconGift, IconLayoutGrid, IconUserEdit } from "@tabler/icons-react";

const icons = "/sidebar-icons";

export const adminRoot = "/admin";

export type NavIconSource = string | Icon;

export type NavItem = {
  label: string;
  href: string;
  icon: NavIconSource;
  children?: { label: string; href: string }[];
};

export type NavSection = {
  title?: string;
  items: NavItem[];
};

export const navSections: NavSection[] = [
  {
    title: "Main",
    items: [
      { label: "Dashboard", href: "/admin", icon: IconLayoutGrid },
      {
        label: "Super Admin",
        href: "/admin/super-admin",
        icon: IconUserEdit,
        children: [
          { label: "Companies", href: "/admin/super-admin/companies" },
          { label: "Subscriptions", href: "/admin/super-admin/subscriptions" },
          { label: "Packages", href: "/admin/super-admin/packages" },
        ],
      },
    ],
  },
  {
    title: "Inventory",
    items: [
      { label: "Products", href: "/admin/products", icon: IconBox },
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
        children: [
          { label: "Online Orders", href: "/admin/sales/online-orders" },
          { label: "POS Orders", href: "/admin/sales/pos-orders" },
        ],
      },
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
