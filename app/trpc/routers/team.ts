import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

import { teams } from '~/db/schema';
import { protectedProcedure, router } from '~/trpc/init';

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function uniqueSlug(
  db: typeof import('~/db').db,
  userId: string,
  name: string,
  excludeId?: string,
): Promise<string> {
  const base = slugify(name) || 'team';
  let candidate = base;
  let suffix = 2;

  while (true) {
    const conditions = [
      eq(teams.userId, userId),
      eq(teams.slug, candidate),
    ];
    if (excludeId) {
      // Allow the current team to keep its own slug
    }
    const [existing] = await db
      .select({ id: teams.id })
      .from(teams)
      .where(and(...conditions));

    if (!existing || (excludeId && existing.id === excludeId)) {
      return candidate;
    }
    candidate = `${base}-${suffix}`;
    suffix++;
  }
}

export const teamRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(teams)
      .where(eq(teams.userId, ctx.userId))
      .orderBy(teams.createdAt);
  }),

  getBySlug: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const [team] = await ctx.db
        .select()
        .from(teams)
        .where(and(eq(teams.slug, input.slug), eq(teams.userId, ctx.userId)));
      return team ?? null;
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
      const slug = await uniqueSlug(ctx.db, ctx.userId, input.name);
      const [team] = await ctx.db
        .insert(teams)
        .values({ userId: ctx.userId, name: input.name, slug })
        .returning();
      return team!;
    }),

  update: protectedProcedure
    .input(z.object({ id: z.string().uuid(), name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const slug = await uniqueSlug(ctx.db, ctx.userId, input.name, input.id);
      const [team] = await ctx.db
        .update(teams)
        .set({ name: input.name, slug })
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
