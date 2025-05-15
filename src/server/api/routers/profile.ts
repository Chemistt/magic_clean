import { Role } from "@prisma/client";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

const cleanerProfileInputSchema = z.object({
	bio: z.string().optional(),
	yearsExperience: z.number().int().min(0).optional(),
	askingPrice: z.number().positive().optional(), // For Decimal in Prisma
	avalibility: z.string().optional(),
	age: z.number().int().positive().optional(),
});

const homeOwnerProfileInputSchema = z.object({
	address: z.string().optional(),
	preferences: z.string().optional(),
});

export const profileRouter = createTRPCRouter({
	// get current user's profile
	getCurrentUserProfile: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session.user.id;

		// fetch and return the user object
		const profile = await ctx.db.user.findUnique({
			where: { id: userId },
			include: {
				CleanerProfile: {
					include: {
						servicesOffered: {
							include: {
								category: true,
							},
						},
					},
				},
				HomeOwnerProfile: true,
			},
		});

		if (!profile) {
			throw new Error("User not found");
		}

		// convert askingPrice to number
		if (profile.CleanerProfile) {
			return {
				...profile,
				CleanerProfile: {
					...profile.CleanerProfile,
					askingPrice: profile.CleanerProfile.askingPrice.toNumber(),
				},
			};
		}
		return profile;
	}),
	// get all cleaners
	getAllCleaners: protectedProcedure.query(async ({ ctx }) => {
		const cleaners = await ctx.db.user.findMany({
			where: {
				role: Role.CLEANER,
				CleanerProfile: { isNot: undefined },
			},
			include: {
				CleanerProfile: true,
			},
		});

		return cleaners.map((cleaner) => {
			if (!cleaner.CleanerProfile) {
				return {
					...cleaner,
					CleanerProfile: undefined,
				};
			}
			return {
				...cleaner,
				CleanerProfile: {
					...cleaner.CleanerProfile,
					askingPrice: cleaner.CleanerProfile.askingPrice.toNumber(),
				},
			};
		});
	}),
	getSpecificCleanerProfile: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const cleaner = await ctx.db.user.findUnique({
				where: { id: input.id },
				include: {
					CleanerProfile: true,
				},
			});

			return cleaner;
		}),
	// mutate current user's profile (CLEANER)
	upsertCleanerProfile: protectedProcedure
		.input(cleanerProfileInputSchema)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;

			// check if user is a cleaner
			const user = await ctx.db.user.findUnique({ where: { id: userId } });
			if (user?.role !== Role.CLEANER) {
				throw new Error("User is not a cleaner.");
			}

			// Upsert (update or create if missing) the cleaner profile
			const profile = await ctx.db.cleanerProfile.upsert({
				where: { userId: userId },
				create: {
					userId: userId,
					bio: input.bio ?? "", // Bio is required in schema
					askingPrice: input.askingPrice ?? 0, // Required in schema, default to 0
					yearsExperience: input.yearsExperience ?? 0, // Required in schema
					avalibility: input.avalibility,
					age: input.age,
					isVerified: true,
				},
				update: {
					bio: input.bio,
					askingPrice: input.askingPrice,
					yearsExperience: input.yearsExperience,
					avalibility: input.avalibility,
					age: input.age,
				},
			});
			return profile;
		}),
	// mutate current user's profile (HOME OWNER)
	upsertHomeOwnerProfile: protectedProcedure
		.input(homeOwnerProfileInputSchema)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;

			// check if user is a home owner
			const user = await ctx.db.user.findUnique({ where: { id: userId } });
			if (user?.role !== Role.HOME_OWNER) {
				throw new Error("User is not a home owner.");
			}

			// Upsert (update or create if missing) the home owner profile
			const profile = await ctx.db.homeOwnerProfile.upsert({
				where: { userId: userId },
				create: {
					userId: userId,
					address: input.address,
					preferences: input.preferences,
					isVerified: true,
				},
				update: {
					address: input.address,
					preferences: input.preferences,
				},
			});
			return profile;
		}),
});
