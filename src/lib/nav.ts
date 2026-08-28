import type { Icon } from "@tabler/icons-react";
import { IconBox, IconDiscount, IconGift, IconLayoutGrid, IconUserEdit } from "@tabler/icons-react";

const icons = "/sidebar-icons";

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
      { label: "Dashboard", href: "/", icon: IconLayoutGrid },
      {
        label: "Super Admin",
        href: "/super-admin",
        icon: IconUserEdit,
        children: [
          { label: "Companies", href: "/super-admin/companies" },
          { label: "Subscriptions", href: "/super-admin/subscriptions" },
          { label: "Packages", href: "/super-admin/packages" },
        ],
      },
    ],
  },
  {
    title: "Inventory",
    items: [
      { label: "Products", href: "/products", icon: IconBox },
      { label: "Create Product", href: "/products/create", icon: `${icons}/create-product.svg` },
      { label: "Expired Products", href: "/products/expired", icon: `${icons}/expired.svg` },
      { label: "Low Stocks", href: "/products/low-stock", icon: `${icons}/stock.svg` },
      { label: "Category", href: "/categories", icon: `${icons}/category.svg` },
      { label: "Sub Category", href: "/sub-categories", icon: `${icons}/sub-catagory.svg` },
      { label: "Brands", href: "/brands", icon: `${icons}/brands.svg` },
      { label: "Units", href: "/units", icon: `${icons}/units.svg` },
      {
        label: "Variant Attributes",
        href: "/variant-attributes",
        icon: `${icons}/vatrient.svg`,
      },
      { label: "Warranties", href: "/warranties", icon: `${icons}/warranties.svg` },
      { label: "Print Barcode", href: "/print-barcode", icon: `${icons}/barcode.svg` },
      { label: "Print QR Code", href: "/print-qr-code", icon: `${icons}/qrcode.svg` },
    ],
  },
  {
    title: "Stock",
    items: [
      { label: "Manage Stock", href: "/stock", icon: `${icons}/manage-stock.svg` },
      { label: "Stock Adjustment", href: "/stock/adjustment", icon: `${icons}/stock-adjustment.svg` },
      { label: "Stock Transfer", href: "/stock/transfer", icon: `${icons}/stock-transfer.svg` },
    ],
  },
  {
    title: "Sales",
    items: [
      {
        label: "Sales",
        href: "/sales",
        icon: `${icons}/sales.svg`,
        children: [
          { label: "Online Orders", href: "/sales/online-orders" },
          { label: "POS Orders", href: "/sales/pos-orders" },
        ],
      },
      { label: "Invoices", href: "/invoices", icon: `${icons}/invoice.svg` },
      { label: "Sales Return", href: "/sales-return", icon: `${icons}/sales-return.svg` },
      { label: "Quotation", href: "/quotation", icon: `${icons}/quotation.svg` },
      {
        label: "POS",
        href: "/pos",
        icon: `${icons}/POS.svg`,
        children: [
          { label: "POS 1", href: "/pos/1" },
          { label: "POS 2", href: "/pos/2" },
        ],
      },
    ],
  },
  {
    title: "Promo",
    items: [
      { label: "Coupons", href: "/coupons", icon: IconDiscount },
      { label: "Gift Cards", href: "/gift-cards", icon: IconGift },
    ],
  },
];
