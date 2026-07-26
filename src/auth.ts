import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

import { getDatabase } from "@/lib/db";
import { accounts, sessions, users } from "@/lib/db/schema";

export const { auth, handlers, signIn, signOut } = NextAuth(() => ({
  adapter: DrizzleAdapter(getDatabase(), {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
  }),
  pages: {
    error: "/auth/result",
  },
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
  providers: [Google],
}));
