import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

import { teams } from '~/db/schema';
import { protectedProcedure, router } from '~/trpc/init';

export const teamRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(teams)
      .where(eq(teams.userId, ctx.userId))
      .orderBy(teams.createdAt);
  }),

  get: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [team] = await ctx.db
        .select()
        .from(teams)
        .where(and(eq(teams.id, input.id), eq(teams.userId, ctx.userId)));
      return team ?? null;
    }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const [team] = await ctx.db
        .insert(teams)
        .values({ userId: ctx.userId, name: input.name })
        .returning();
      return team!;
    }),

  update: protectedProcedure
    .input(z.object({ id: z.string().uuid(), name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const [team] = await ctx.db
        .update(teams)
        .set({ name: input.name })
        .where(and(eq(teams.id, input.id), eq(teams.userId, ctx.userId)))
        .returning();
      return team ?? null;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(teams)
        .where(and(eq(teams.id, input.id), eq(teams.userId, ctx.userId)));
      return { success: true };
    }),
});
