import { createClerkClient } from '@clerk/backend';
import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';

import { db } from '~/db';

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
  publishableKey: process.env.VITE_CLERK_PUBLISHABLE_KEY,
});

export const createTRPCContext = async ({
  request,
}: {
  request: Request;
}) => {
  const requestState = await clerk.authenticateRequest(request, {
    publishableKey: process.env.VITE_CLERK_PUBLISHABLE_KEY,
  });
  const auth = requestState.toAuth();

  return {
    db,
    userId: auth?.userId ?? undefined,
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
