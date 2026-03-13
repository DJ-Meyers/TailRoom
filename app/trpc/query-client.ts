import { QueryClient } from '@tanstack/react-query';
import { createTRPCClient, httpBatchStreamLink } from '@trpc/client';
import superjson from 'superjson';

import type { AppRouter } from '~/trpc/router';

let queryClient: QueryClient | undefined;
let trpcClient: ReturnType<typeof createTRPCClient<AppRouter>> | undefined;

const getUrl = () => {
  const base = typeof window !== 'undefined' ? '' : 'http://localhost:3000';
  return `${base}/api/trpc`;
};

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
        httpBatchStreamLink({
          transformer: superjson,
          url: getUrl(),
        }),
      ],
    });
  }
  return trpcClient;
};
