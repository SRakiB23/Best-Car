/**
 * Creates (or resets) the two demo accounts the sign-in page offers in one click.
 *
 *   node --env-file=.env.local scripts/seed-demo-accounts.mjs
 *
 * Safe to re-run: an existing user has its password reset instead of being
 * recreated, so the credentials printed on the login page always work.
 */
import { createClient } from "@supabase/supabase-js";

const accounts = [
  {
    email: "admin@bestcar.com",
    password: "Admin@123",
    fullName: "Alex Morgan",
    phone: "+971 50 111 2233",
    role: "Store Administrator",
    isStaff: true,
  },
  {
    email: "user@bestcar.com",
    password: "User@123",
    fullName: "Jamie Rivera",
    phone: "+971 50 444 5566",
    role: "Customer",
    isStaff: false,
  },
];

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !secret) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY first.");
  process.exit(1);
}

const supabase = createClient(url, secret, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function findUser(email) {
  // listUsers has no email filter, and the project is small enough to page it.
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;

    const match = data.users.find((user) => user.email?.toLowerCase() === email);
    if (match) return match;
    if (data.users.length < 200) return null;
  }
  return null;
}

for (const account of accounts) {
  const metadata = { full_name: account.fullName, phone: account.phone };
  const existing = await findUser(account.email);

  let userId = existing?.id;

  if (existing) {
    const { error } = await supabase.auth.admin.updateUserById(existing.id, {
      password: account.password,
      email_confirm: true,
      user_metadata: metadata,
    });
    if (error) throw error;
    console.log(`reset  ${account.email}`);
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: account.email,
      password: account.password,
      email_confirm: true,
      user_metadata: metadata,
    });
    if (error) throw error;
    userId = data.user.id;
    console.log(`create ${account.email}`);
  }

  // The signup trigger writes the profile row, but never the staff flag.
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: account.fullName,
      email: account.email,
      phone: account.phone,
      role: account.role,
      is_staff: account.isStaff,
    })
    .eq("id", userId);

  if (profileError) throw profileError;
  console.log(`       profile updated (is_staff=${account.isStaff})`);
}

console.log("\nDemo accounts ready.");
