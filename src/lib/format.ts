import type { CurrencyCode } from "./types";

const symbols: Record<CurrencyCode, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  BDT: "৳",
};

export const formatAmount = (value: number, currency: CurrencyCode = "USD") =>
  `${symbols[currency]}${value.toFixed(2)}`;

export const formatCountPlus = (value: number) => `${value.toLocaleString("en-US")}+`;
