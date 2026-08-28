import type { Account, CurrencyCode, Preferences } from "./types";

export const defaultAccount: Account = {
  name: "Mike Witzel",
  role: "Store Administrator",
  email: "mike.witzel@bestcar.com",
  phone: "+1 555 0134",
  avatarUrl: "",
};

export const defaultPreferences: Preferences = {
  storeName: "BestCar Motors",
  currency: "USD",
  timezone: "Asia/Dhaka",
  lowStockThreshold: 5,
};

export const currencyOptions: { value: CurrencyCode; label: string }[] = [
  { value: "USD", label: "US Dollar ($)" },
  { value: "EUR", label: "Euro (€)" },
  { value: "GBP", label: "Pound Sterling (£)" },
  { value: "BDT", label: "Bangladeshi Taka (৳)" },
];

export const timezoneOptions = ["Asia/Dhaka", "Asia/Dubai", "Europe/London", "America/New_York"];

export function initialsFrom(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
