import { z } from "zod";

import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "@/server/api/trpc";

export const serviceRouter = createTRPCRouter({
	getCurrentUserServices: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session.user.id;

		const cleanerProfile = await ctx.db.cleanerProfile.findUnique({
			where: { userId },
		});

		if (!cleanerProfile) {
			throw new Error("Cleaner profile not found");
		}

		return ctx.db.service.findMany({
			where: {
				cleanerProfileId: cleanerProfile.id,
			},
			include: {
				category: true,
			},
		});
	}),
	getCategories: publicProcedure.query(async ({ ctx }) => {
		return ctx.db.serviceCategory.findMany();
	}),
	getService: protectedProcedure
		.input(z.object({ id: z.number().int() }))
		.query(async ({ ctx, input }) => {
			return ctx.db.service.findUnique({ where: { id: input.id } });
		}),
	upsertService: protectedProcedure
		.input(
			z.object({
				id: z.number().int().optional(),
				name: z.string(),
				description: z.string(),
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

			if (input.id) {
				return ctx.db.service.update({
					where: {
						id: input.id,
						cleanerProfileId: cleanerProfile.id,
					},
					data: {
						...input,
						cleanerProfileId: cleanerProfile.id,
					},
				});
			}

			return ctx.db.service.create({
				data: {
					...input,
					cleanerProfileId: cleanerProfile.id,
					isActive: true,
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
