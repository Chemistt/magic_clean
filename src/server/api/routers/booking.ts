import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const bookingRouter = createTRPCRouter({
	getBookings: protectedProcedure.query(async ({ ctx }) => {
		return ctx.db.booking.findMany();
	}),
	createBooking: protectedProcedure
		.input(
			z.object({
				cleanerId: z.string(),
				serviceId: z.number().int(),
				bookingTime: z.string(), // ISO string
				durationMinutes: z.number().int(),
				notes: z.string().optional(),
				priceAtBooking: z.number(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const homeOwnerId = ctx.session.user.id;
			const booking = await ctx.db.booking.create({
				data: {
					homeOwnerId,
					cleanerId: input.cleanerId,
					serviceId: input.serviceId,
					bookingTime: new Date(input.bookingTime),
					durationMinutes: input.durationMinutes,
					notes: input.notes,
					priceAtBooking: input.priceAtBooking,
					// status and paymentStatus will use Prisma defaults
				},
			});
			return booking;
		}),
});
