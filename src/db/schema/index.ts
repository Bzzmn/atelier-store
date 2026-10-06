// Re-export every table from this barrel so drizzle-kit and the db client see it.
// Better Auth tables: run `pnpm auth:generate`, then add `export * from "./auth";`.
export * from "./catalog";
