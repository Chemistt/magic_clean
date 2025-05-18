import { BookingStatus, PaymentStatus, Role } from "@prisma/client";
import { TRPCError } from "@trpc/server";
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
				name: booking.service.name,
				description: booking.service.description,
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
	updateBookingStatus: protectedProcedure
		.input(
			z.object({
				bookingId: z.number(),
				status: z.nativeEnum(BookingStatus).optional(),
				paymentStatus: z.nativeEnum(PaymentStatus).optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { id: userId, role } = ctx.session.user;

			// Fetch the booking with owner and cleaner IDs
			const booking = await ctx.db.booking.findUnique({
				where: { id: input.bookingId },
			});
			if (!booking) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Booking not found",
				});
			}

			// Only allow involved users
			if (booking.homeOwnerId !== userId && booking.cleanerId !== userId) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "You are not authorized to update this booking",
				});
			}

			const updateData: Partial<{
				status: BookingStatus;
				paymentStatus: PaymentStatus;
			}> = {};

			// Handle status update (if provided)
			if (input.status && input.status !== booking.status) {
				switch (role) {
					case Role.CLEANER: {
						if (
							(booking.status === BookingStatus.PENDING &&
								(input.status === BookingStatus.CONFIRMED ||
									input.status === BookingStatus.REJECTED)) ||
							(booking.status === BookingStatus.CONFIRMED &&
								(input.status === BookingStatus.COMPLETED ||
									input.status === BookingStatus.CANCELLED_BY_CLEANER))
						) {
							updateData.status = input.status;
						} else {
							throw new TRPCError({
								code: "BAD_REQUEST",
								message: "Invalid status transition for cleaner",
							});
						}
						break;
					}
					case Role.HOME_OWNER: {
						if (
							booking.status === BookingStatus.CONFIRMED &&
							input.status === BookingStatus.CANCELLED_BY_OWNER
						) {
							updateData.status = input.status;
						} else {
							throw new TRPCError({
								code: "BAD_REQUEST",
								message: "Invalid status transition for home owner",
							});
						}
						break;
					}
					default: {
						throw new TRPCError({
							code: "BAD_REQUEST",
							message: "You are not allowed to update booking status",
						});
					}
				}
			}

			// Handle paymentStatus update (if provided)
			if (
				input.paymentStatus &&
				input.paymentStatus !== booking.paymentStatus
			) {
				if (role !== Role.HOME_OWNER) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: "Only home owner can update payment status",
					});
				}
				updateData.paymentStatus = input.paymentStatus;
			}

			if (Object.keys(updateData).length === 0) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "No valid updates provided",
				});
			}

			const updatedBooking = await ctx.db.booking.update({
				where: { id: input.bookingId },
				data: updateData,
			});
			return updatedBooking;
		}),
});
