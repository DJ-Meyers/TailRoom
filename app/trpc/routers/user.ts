import { eq } from 'drizzle-orm';

import { users } from '~/db/schema';
import { protectedProcedure, router } from '~/trpc/init';

function slugFromClerkId(clerkId: string): string {
  // Clerk IDs look like "user_2NNEqL2nrIRdJ194ndJqAHwEfxC"
  // Strip the "user_" prefix and take a short, URL-friendly segment
  const raw = clerkId.startsWith('user_') ? clerkId.slice(5) : clerkId;
  return raw.slice(0, 12).toLowerCase();
}

export const userRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => {
    const [existing] = await ctx.db
      .select()
      .from(users)
      .where(eq(users.clerkId, ctx.userId));

    if (existing) return existing;

    const slug = slugFromClerkId(ctx.userId);
    const [created] = await ctx.db
      .insert(users)
      .values({ clerkId: ctx.userId, slug })
      .onConflictDoNothing()
      .returning();

    // If onConflictDoNothing didn't insert (slug collision), retry with suffix
    if (!created) {
      let candidate = slug;
      let suffix = 2;
      while (true) {
        candidate = `${slug}-${suffix}`;
        const [retry] = await ctx.db
          .insert(users)
          .values({ clerkId: ctx.userId, slug: candidate })
          .onConflictDoNothing()
          .returning();
        if (retry) return retry;
        suffix++;
      }
    }

    return created;
  }),
});
