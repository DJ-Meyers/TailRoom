import type { ReactNode } from 'react'

import { ClerkProvider } from '@clerk/tanstack-react-start'
import { QueryClientProvider } from '@tanstack/react-query'
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import appCss from '~/index.css?url'
import { TRPCProvider } from '~/trpc/client'
import { getTRPCClient } from '~/trpc/query-client'
import { getQueryClient } from '~/trpc/query-client'

const RootDocument = ({ children }: { children: ReactNode }) => (
  <html lang="en">
    <head>
      <HeadContent />
    </head>
    <body>
      {children}
      <Scripts />
    </body>
  </html>
)

const RootComponent = () => {
  const queryClient = getQueryClient()
  const trpcClient = getTRPCClient()

  return (
    <RootDocument>
      <ClerkProvider
        publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
        signInUrl="/sign-in"
        signUpUrl="/sign-up"
      >
        <QueryClientProvider client={queryClient}>
          <TRPCProvider queryClient={queryClient} trpcClient={trpcClient}>
            <Outlet />
          </TRPCProvider>
        </QueryClientProvider>
      </ClerkProvider>
    </RootDocument>
  )
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  component: RootComponent,
})
