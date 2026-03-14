import { verifyToken } from '@clerk/backend';
import { initTRPC, TRPCError } from '@trpc/server';
import type { IncomingMessage } from 'node:http';
import superjson from 'superjson';

import { db } from '~/db';

export const createTRPCContext = async ({
  req,
}: {
  req: IncomingMessage;
}) => {
  if (process.env.VITE_DEV_BYPASS_AUTH === 'true') {
    return {
      db,
      userId: process.env.VITE_DEV_USER_ID ?? 'dev-user',
    };
  }

  let userId: string | undefined;
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const payload = await verifyToken(authHeader.slice(7), {
        secretKey: process.env.CLERK_SECRET_KEY!,
      });
      userId = payload.sub;
    } catch {
      // Invalid token
    }
  }

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
