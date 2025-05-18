import { Role } from "@prisma/client";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const bookingRouter = createTRPCRouter({
	getBookings: protectedProcedure.query(async ({ ctx }) => {
		const { id: userId, role } = ctx.session.user;

		const filterKey = role === Role.HOME_OWNER ? "homeOwnerId" : "cleanerId";

		const bookingData = await ctx.db.booking.findMany({
			where: {
				[filterKey]: userId,
			},
			include: {
				cleaner: true,
				homeOwner: true,
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
			opposingUser: {
				id:
					role === Role.HOME_OWNER ? booking.cleaner.id : booking.homeOwner.id,
				name:
					role === Role.HOME_OWNER
						? (booking.cleaner.name ?? "")
						: (booking.homeOwner.name ?? ""),
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
