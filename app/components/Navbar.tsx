import { useUser } from '@clerk/react'
import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

import { useTRPC } from '~/trpc/client'

const devBypass = import.meta.env.DEV && import.meta.env.VITE_DEV_BYPASS_AUTH === 'true'

function Logo({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <defs>
        <clipPath id="logo-right-circle">
          <rect x="-10" y="-10" width="52" height="84"/>
          <circle cx="32" cy="28" r="32"/>
        </clipPath>
      </defs>
      <g clipPath="url(#logo-right-circle)">
        <g strokeWidth="2.5">
          <path d="M72 18 H30 q-10 0 -10 -7 q0 -7 7 -7 q5 0 5 5"/>
          <path d="M72 28 H14 q-12 0 -12 -8 q0 -7 7 -7 q5 0 5 5"/>
          <path d="M72 38 H22 q-9 0 -9 7 q0 7 7 7 q5 0 5 -5"/>
        </g>
        <g strokeWidth="2">
          <line x1="40" y1="8" x2="72" y2="8"/>
          <line x1="40" y1="-4" x2="40" y2="28"/>
          <line x1="52" y1="-4" x2="52" y2="28"/>
          <line x1="40" y1="28" x2="54" y2="64"/>
          <line x1="52" y1="28" x2="100" y2="64"/>
          <line x1="48" y1="48" x2="72" y2="48"/>
        </g>
      </g>
    </svg>
  )
}

export function Navbar() {
  const { user } = useUser()
  const trpc = useTRPC()
  const { data: me } = useQuery({
    ...trpc.user.me.queryOptions(),
    enabled: !!user || devBypass,
  })

  return (
    <nav className="flex items-center gap-6 mb-6 pb-3 border-b border-border">
      <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary hover:text-primary-hover no-underline">
        <Logo className="w-7 h-7" />
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
