import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins/admin";

import { db } from "@/db";

export const auth = betterAuth({
  appName: "Atelier",
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: { enabled: true, minPasswordLength: 8, autoSignIn: true },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // slide the expiry at most once a day
    // Skip the DB lookup for 5 minutes; revoked sessions on other devices
    // stay valid until this expires.
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
  // admin() adds user.role (default "user"); sign-up can't set it.
  // nextCookies must stay last so cookies set in server actions are forwarded.
  plugins: [admin(), nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
