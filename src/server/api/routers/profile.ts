import { Role } from "@prisma/client";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

// Zod schema for Cleaner Profile update input
const cleanerProfileInputSchema = z.object({
	bio: z.string().optional(),
	yearsExperience: z.number().int().min(0).optional(),
	hourlyRate: z.number().positive().optional(), // Use number for transport, Prisma handles Decimal
	// Add other fields as needed
});

// Zod schema for Home Owner Profile update input
const homeOwnerProfileInputSchema = z.object({
	address: z.string().optional(),
	preferences: z.string().optional(),
	// Add other fields as needed
});

export const profileRouter = createTRPCRouter({
	// Procedure to get the current user's profile
	get: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session.user.id;
		const userWithProfile = await ctx.db.user.findUnique({
			where: { id: userId },
			include: {
				CleanerProfile: true, // Include cleaner profile
				HomeOwnerProfile: true, // Include home owner profile
			},
		});

		if (!userWithProfile) {
			throw new Error("User not found"); // Should not happen for protected procedure
		}

		// Return the user object which contains the role and nested profiles
		return userWithProfile;
	}),
	// Procedure to update Cleaner Profile details
	updateCleanerProfile: protectedProcedure
		.input(cleanerProfileInputSchema)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;

			// 1. Verify user has the CLEANER role
			const user = await ctx.db.user.findUnique({ where: { id: userId } });
			if (user?.role !== Role.CLEANER) {
				throw new Error("User is not a cleaner.");
			}

			// 2. Upsert (update or create if missing) the cleaner profile
			// Using upsert is robust in case the initialization step failed or was skipped
			const profile = await ctx.db.cleanerProfile.upsert({
				where: { userId: userId },
				create: {
					userId: userId,
					...input,
					// Convert number back to Decimal for Prisma if needed,
					// Prisma client often handles this conversion automatically
					// hourlyRate: input.hourlyRate ? new Prisma.Decimal(input.hourlyRate) : undefined,
				},
				update: {
					...input,
					// hourlyRate: input.hourlyRate ? new Prisma.Decimal(input.hourlyRate) : undefined,
				},
			});
			return profile;
		}),

	// Procedure to update Home Owner Profile details
	updateHomeOwnerProfile: protectedProcedure
		.input(homeOwnerProfileInputSchema)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;

			// 1. Verify user has the HOME_OWNER role (or allow if they are switching back?)
			// Adjust logic based on whether roles are fixed or changeable
			const user = await ctx.db.user.findUnique({ where: { id: userId } });
			if (user?.role !== Role.HOME_OWNER) {
				throw new Error("User is not a home owner.");
			}

			// 2. Upsert the home owner profile
			const profile = await ctx.db.homeOwnerProfile.upsert({
				where: { userId: userId },
				create: {
					userId: userId,
					...input,
				},
				update: {
					...input,
				},
			});
			return profile;
		}),
});
