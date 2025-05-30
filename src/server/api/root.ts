import { bookingRouter } from "@/server/api/routers/booking";
import { favouritesRouter } from "@/server/api/routers/favourites";
import { profileRouter } from "@/server/api/routers/profile";
import { serviceRouter } from "@/server/api/routers/service";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
	profile: profileRouter,
	booking: bookingRouter,
	service: serviceRouter,
	favourites: favouritesRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
