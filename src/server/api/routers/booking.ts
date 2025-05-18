import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const bookingRouter = createTRPCRouter({
	getBookings: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session.user.id;

		const bookingData = await ctx.db.booking.findMany({
			where: {
				homeOwnerId: userId,
			},
			include: {
				cleaner: true,
				service: {
					include: {
						category: true,
					},
				},
			},
		});

		return bookingData.map((booking) => ({
			...booking,
			priceAtBooking: booking.priceAtBooking.toNumber(),
			cleaner: {
				id: booking.cleaner.id,
				name: booking.cleaner.name ?? "",
			},
			service: {
				category: {
					name: booking.service.category.name,
				},
			},
		}));
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
