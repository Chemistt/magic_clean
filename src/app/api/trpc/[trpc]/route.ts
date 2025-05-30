import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { type NextRequest } from "next/server";

import { env } from "@/env";
import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a HTTP request (e.g. when you make requests from Client Components).
 */
const createContext = async (request: NextRequest) => {
	return createTRPCContext({
		headers: request.headers,
	});
};

const HandlerContext = (request: NextRequest) =>
	fetchRequestHandler({
		endpoint: "/api/trpc",
		req: request,
		router: appRouter,
		createContext: () => createContext(request),
		onError:
			env.NODE_ENV === "development"
				? ({ path, error }) => {
						console.error(
							`❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`
						);
					}
				: undefined,
	});

export { HandlerContext as GET, HandlerContext as POST };
