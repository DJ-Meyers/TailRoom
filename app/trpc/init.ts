import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';

import { db } from '~/db';

export const createTRPCContext = async ({
  request,
}: {
  request: Request;
}) => {
  // TODO: Phase 4 will add Clerk auth here
  // For now, use a placeholder userId from a header (for testing)
  const userId = request.headers.get('x-user-id') ?? undefined;

  return {
    db,
    userId,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({ ctx: { ...ctx, userId: ctx.userId } });
});
