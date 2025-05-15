import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const bookingRouter = createTRPCRouter({
	getBookings: protectedProcedure.query(async ({ ctx }) => {
		return ctx.db.booking.findMany();
	}),
	// createBooking: protectedProcedure
	// 	.input(createBookingSchema)
	// 	.mutation(async ({ ctx, input }) => {
	// 		return undefined;
	// 	}),
});
