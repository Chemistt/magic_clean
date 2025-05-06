import NextAuth from "next-auth";
import { cache } from "react";

import { authConfig } from "./config";

const { auth: uncachedAuth, handlers, signIn, signOut } = NextAuth(authConfig);

const auth = cache(async () => {
	const session = await uncachedAuth();
	return session;
});

export { auth, handlers, signIn, signOut };
