import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

import { db } from "@/server/db";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    DiscordProvider,
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
  adapter: PrismaAdapter(db),
  session: {
    strategy: "database",
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 6 * 60 * 60, // 6 hour
  },
  callbacks: {
    session: ({ session, user }) => {
      console.log("[CALLBACK] Session", session);
      console.log("[CALLBACK] User", user);
      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
        },
      };
    },
    redirect: ({ url, baseUrl }) => {
      // After sign in, redirect to the homepage instead of /dashboard
      if (url.startsWith(baseUrl)) {
        // For internal URLs, replace /dashboard with / if it's the sign-in callback
        if (url.includes("/api/auth/callback") || url.includes("/dashboard")) {
          return "/";
        }
        return url;
      }
      // For external URLs, redirect to the base URL
      return baseUrl;
    },
  },
} satisfies NextAuthConfig;
