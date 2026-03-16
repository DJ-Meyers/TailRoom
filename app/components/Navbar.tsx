import { useUser } from '@clerk/react'
import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

import { useTRPC } from '~/trpc/client'

const devBypass = import.meta.env.DEV && import.meta.env.VITE_DEV_BYPASS_AUTH === 'true'

export function Navbar() {
  const { user } = useUser()
  const trpc = useTRPC()
  const { data: me } = useQuery({
    ...trpc.user.me.queryOptions(),
    enabled: !!user || devBypass,
  })

  return (
    <nav className="flex items-center gap-6 mb-6 pb-3 border-b border-border">
      <Link to="/" className="text-xl font-bold text-primary hover:text-primary-hover no-underline">
        Tailroom
      </Link>

      <div className="flex items-center gap-4">
        {me ? (
          <>
            <Link
              to="/u/$userSlug/teams"
              params={{ userSlug: me.slug }}
              className="text-text-muted hover:text-text no-underline [&.active]:text-primary"
              activeProps={{ className: 'active text-primary' }}
            >
              Teams
            </Link>
            <Link
              to="/u/$userSlug/pokemon"
              params={{ userSlug: me.slug }}
              className="text-text-muted hover:text-text no-underline [&.active]:text-primary"
              activeProps={{ className: 'active text-primary' }}
            >
              Pokémon
            </Link>
          </>
        ) : (
          <>
            <span className="text-text-muted">Teams</span>
            <span className="text-text-muted">Pokémon</span>
          </>
        )}
      </div>

      <div className="ml-auto">
        <Link to="/account" className="block">
          {user?.imageUrl ? (
            <img
              src={user.imageUrl}
              alt={user.fullName ?? 'Account'}
              className="w-8 h-8 rounded-full hover:ring-2 hover:ring-primary"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-sm text-text-muted hover:ring-2 hover:ring-primary">
              ?
            </div>
          )}
        </Link>
      </div>
    </nav>
  )
}
