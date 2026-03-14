import { SignUp } from '@clerk/react'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/sign-up')({
  component: SignUpPage,
})

function SignUpPage() {
  return (
    <div className="flex justify-center py-12">
      <SignUp />
    </div>
  )
}
