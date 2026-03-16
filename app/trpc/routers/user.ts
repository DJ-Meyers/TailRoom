import { eq } from 'drizzle-orm';

import { users } from '~/db/schema';
import { protectedProcedure, router } from '~/trpc/init';

function generateSlug(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let slug = '';
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  for (const b of bytes) {
    slug += chars[b % chars.length];
  }
  return slug;
}

export const userRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => {
    const [existing] = await ctx.db
      .select()
      .from(users)
      .where(eq(users.clerkId, ctx.userId));

    if (existing) return existing;

    const slug = generateSlug();
    const [created] = await ctx.db
      .insert(users)
      .values({ clerkId: ctx.userId, slug })
      .onConflictDoNothing()
      .returning();

    // If onConflictDoNothing didn't insert (slug collision), retry with a new slug
    if (!created) {
      for (let attempt = 0; attempt < 5; attempt++) {
        const [retry] = await ctx.db
          .insert(users)
          .values({ clerkId: ctx.userId, slug: generateSlug() })
          .onConflictDoNothing()
          .returning();
        if (retry) return retry;
      }
      throw new Error('Failed to generate unique slug after multiple attempts');
    }

    return created;
  }),
});
