import { UserProfile } from '@clerk/react'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/account')({
  component: AccountPage,
})

function AccountPage() {
  return (
    <div className="flex justify-center">
      <UserProfile />
    </div>
  )
}
