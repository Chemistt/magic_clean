import { Role } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const favouritesRouter = createTRPCRouter({
	getCurrentUserFavourites: protectedProcedure.query(async ({ ctx }) => {
		const { id: userId, role } = ctx.session.user;
		if (role !== Role.HOME_OWNER) {
			throw new TRPCError({
				code: "UNAUTHORIZED",
				message: "You are not authorized to access this resource",
			});
		}
		const favourites = await ctx.db.shortlist.findMany({
			where: {
				homeOwnerId: userId,
			},
			include: {
				cleaner: true,
			},
		});

		return favourites.map((favourite) => ({
			id: favourite.id,
			createdAt: favourite.createdAt.toISOString(),
			cleaner: {
				id: favourite.cleaner.id,
				name: favourite.cleaner.name ?? "",
			},
		}));
	}),
	getShortlist: protectedProcedure.query(async ({ ctx }) => {
		const { id: userId, role } = ctx.session.user;

		if (role !== Role.HOME_OWNER) {
			return [];
		}

		const shortlist = await ctx.db.shortlist.findMany({
			where: { homeOwnerId: userId },
			select: { cleanerId: true },
		});
		return shortlist.map((item) => item.cleanerId);
	}),
	addToShortlist: protectedProcedure
		.input(z.object({ cleanerId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const { id: userId, role } = ctx.session.user;
			const cleanerId = input.cleanerId;

			if (role !== Role.HOME_OWNER) {
				throw new Error("User is not a home owner.");
			}

			const shortlist = await ctx.db.shortlist.create({
				data: {
					homeOwnerId: userId,
					cleanerId: cleanerId,
				},
			});
			return shortlist;
		}),
	removeFromShortlist: protectedProcedure
		.input(z.object({ cleanerId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const { id: userId, role } = ctx.session.user;
			const cleanerId = input.cleanerId;

			if (role !== Role.HOME_OWNER) {
				throw new Error("User is not a home owner.");
			}

			const shortlist = await ctx.db.shortlist.delete({
				where: {
					homeOwnerId_cleanerId: {
						homeOwnerId: userId,
						cleanerId: cleanerId,
					},
				},
			});
			return shortlist;
		}),
});
