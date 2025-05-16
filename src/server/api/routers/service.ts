import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const serviceRouter = createTRPCRouter({
	getCurrentUserServices: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session.user.id;

		return ctx.db.service.findMany({
			where: { cleanerProfileId: userId },
			include: {
				category: true,
			},
		});
	}),
	getCategories: protectedProcedure.query(async ({ ctx }) => {
		return ctx.db.serviceCategory.findMany();
	}),
	upsertService: protectedProcedure
		.input(
			z.object({
				id: z.number().int().optional(),
				name: z.string(),
				description: z.string(),
				isActive: z.boolean(),
				categoryId: z.number().int(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;

			const cleanerProfile = await ctx.db.cleanerProfile.findUnique({
				where: { userId },
			});

			if (!cleanerProfile) {
				throw new Error("Cleaner profile not found");
			}

			return ctx.db.service.upsert({
				where: { id: input.id },
				update: {
					...input,
					cleanerProfileId: cleanerProfile.id,
				},
				create: {
					...input,
					cleanerProfileId: cleanerProfile.id,
				},
			});
		}),
	deleteService: protectedProcedure
		.input(z.object({ id: z.number().int() }))
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;

			const cleanerProfile = await ctx.db.cleanerProfile.findUnique({
				where: { userId },
			});

			if (!cleanerProfile) {
				throw new Error("Cleaner profile not found");
			}
			return ctx.db.service.delete({
				where: { id: input.id, cleanerProfileId: userId },
			});
		}),
});
