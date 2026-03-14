import { QueryClient } from '@tanstack/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';

import type { AppRouter } from '~/trpc/router';

let queryClient: QueryClient | undefined;
let trpcClient: ReturnType<typeof createTRPCClient<AppRouter>> | undefined;

export const getQueryClient = () => {
  if (!queryClient) {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 30 * 1000,
        },
      },
    });
  }
  return queryClient;
};

export const getTRPCClient = () => {
  if (!trpcClient) {
    trpcClient = createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          transformer: superjson,
          url: '/api/trpc',
          async headers() {
            const token = await window.Clerk?.session?.getToken();
            return token ? { authorization: `Bearer ${token}` } : {};
          },
        }),
      ],
    });
  }
  return trpcClient;
};
