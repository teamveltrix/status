import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    usersTable: db.query.users,
    sessionsTable: db.query.sessions,
  }),
  emailAndPassword: {
    enabled: true,
  },
});
