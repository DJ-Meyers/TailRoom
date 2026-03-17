import { ClerkProvider } from '@clerk/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { Outlet, createRootRoute } from '@tanstack/react-router'
import { Navbar } from '~/components/Navbar'
import '~/index.css'
import { TRPCProvider } from '~/trpc/client'
import { getQueryClient, getTRPCClient } from '~/trpc/query-client'

const RootComponent = () => {
  const queryClient = getQueryClient()
  const trpcClient = getTRPCClient()

  return (
    <ClerkProvider
      publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
    >
      <QueryClientProvider client={queryClient}>
        <TRPCProvider queryClient={queryClient} trpcClient={trpcClient}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Navbar />
            <Outlet />
          </div>
        </TRPCProvider>
      </QueryClientProvider>
    </ClerkProvider>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
})
