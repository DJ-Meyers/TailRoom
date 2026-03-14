import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: IndexPage,
})

function IndexPage() {
  return (
    <div className="max-w-[1400px] mx-auto">
      <h1 className="text-center mb-6 text-3xl">Pokemon Damage Calculator</h1>
      <p className="text-center text-text-muted">
        <a href="/calc" className="text-primary hover:text-primary-hover">
          Go to Calculator
        </a>
      </p>
    </div>
  )
}
