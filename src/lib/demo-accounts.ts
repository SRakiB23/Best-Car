import { adminRoot, customerHome } from "./nav";

export type DemoRole = "admin" | "customer";

export type DemoAccount = {
  role: DemoRole;
  label: string;
  blurb: string;
  email: string;
  password: string;
  /** Where the one-click button lands, so the button can promise it by name. */
  destination: string;
  destinationLabel: string;
};

/**
 * Credentials for the two accounts this demo hands out. They are printed on the
 * sign-in page on purpose: the site is a portfolio piece, and a reviewer should
 * reach the dashboard without being sent an invite first.
 *
 * `scripts/seed-demo-accounts.mjs` creates these users from the same list.
 */
export const demoAccounts: DemoAccount[] = [
  {
    role: "admin",
    label: "Admin Account",
    blurb: "Full dashboard: fleet, bookings, leads and analytics.",
    email: "admin@bestcar.com",
    password: "Admin@123",
    destination: adminRoot,
    destinationLabel: "Dashboard",
  },
  {
    role: "customer",
    label: "User Account",
    blurb: "The customer side: browse cars and manage bookings.",
    email: "user@bestcar.com",
    password: "User@123",
    destination: customerHome,
    destinationLabel: "Home",
  },
];

export function demoAccount(role: string): DemoAccount | undefined {
  return demoAccounts.find((account) => account.role === role);
}
