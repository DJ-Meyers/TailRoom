import { useAuth } from '@clerk/react'
import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  const devBypass = import.meta.env.DEV && import.meta.env.VITE_DEV_BYPASS_AUTH === 'true'

  if (devBypass) {
    return <Outlet />
  }

  return <AuthGate />
}

function AuthGate() {
  const { isLoaded, isSignedIn } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate({ to: '/sign-in' })
    }
  }, [isLoaded, isSignedIn, navigate])

  if (!isLoaded || !isSignedIn) {
    return null
  }

  return <Outlet />
}
