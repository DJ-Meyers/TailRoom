import { useUser } from '@clerk/react'
import { Link } from '@tanstack/react-router'

export function Navbar() {
  const { user } = useUser()

  return (
    <nav className="flex items-center gap-6 mb-6 pb-3 border-b border-border">
      <Link to="/" className="text-xl font-bold text-primary hover:text-primary-hover no-underline">
        Tailroom
      </Link>

      <div className="flex items-center gap-4">
        <Link
          to="/teams"
          className="text-text-muted hover:text-text no-underline [&.active]:text-primary"
          activeProps={{ className: 'active text-primary' }}
        >
          Teams
        </Link>
        <Link
          to="/pokemon"
          className="text-text-muted hover:text-text no-underline [&.active]:text-primary"
          activeProps={{ className: 'active text-primary' }}
        >
          Pokémon
        </Link>
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
