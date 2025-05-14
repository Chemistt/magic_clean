import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const bookingRouter = createTRPCRouter({
	get: protectedProcedure.query(async ({ ctx }) => {
		return ctx.db.booking.findMany();
	}),
});
