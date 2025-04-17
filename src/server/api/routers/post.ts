import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.post.create({
        data: {
          name: input.name,
          createdBy: { connect: { id: ctx.session.user.id } },
        },
      });
    }),

  getLatest: protectedProcedure.query(async ({ ctx }) => {
    const post = await ctx.db.post.findFirst({
      orderBy: { createdAt: "desc" },
      where: { createdBy: { id: ctx.session.user.id } },
    });

    return post ?? null;
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),

  getAllUsers: publicProcedure.query(async ({ ctx }) => {
    const users = await ctx.db.account.findMany({
      select: {
        id: true,
        userId: true,
        type: true,
        provider: true,
        providerAccountId: true,
        access_token: true,
        expires_at: true,
        refresh_token: true,
        scope: true,
        token_type: true,
        id_token: true,
        session_state: true,
        refresh_token_expires_in: true,
      },
    });
    users.forEach((user) => {
      console.log("[SERVER] User", user.providerAccountId);
    });
    return users;
  }),

  getAllUsersProtected: protectedProcedure.query(async ({ ctx }) => {
    const users = await ctx.db.account.findMany({
      select: {
        id: true,
        userId: true,
        type: true,
        provider: true,
        providerAccountId: true,
        access_token: true,
        expires_at: true,
        refresh_token: true,
        scope: true,
        token_type: true,
        id_token: true,
        session_state: true,
        refresh_token_expires_in: true,
      },
    });
    return users;
  }),
});
