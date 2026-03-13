import {
  createStartHandler,
  defaultStreamHandler,
} from '@tanstack/react-start/server';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

import { createTRPCContext } from '~/trpc/init';
import { appRouter } from '~/trpc/router';

const startHandler = createStartHandler(defaultStreamHandler);

function createServerEntry(entry: { fetch: typeof startHandler }) {
  return {
    async fetch(request: Request, ...args: unknown[]) {
      const url = new URL(request.url);

      // Intercept tRPC requests
      if (url.pathname.startsWith('/api/trpc')) {
        return fetchRequestHandler({
          endpoint: '/api/trpc',
          req: request,
          router: appRouter,
          createContext: () => createTRPCContext({ request }),
        });
      }

      return entry.fetch(request, ...(args as []));
    },
  };
}

const server = createServerEntry({ fetch: startHandler });
export default server;
