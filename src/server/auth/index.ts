import NextAuth from "next-auth";
import { cache } from "react";

import { authConfig } from "./config";

const { auth: uncachedAuth, handlers, signIn, signOut } = NextAuth(authConfig);

const auth = cache(async () => {
  const session = await uncachedAuth();
  console.log("[AUTH] Auth", session);

  return session;
});

export { auth, handlers, signIn, signOut };
