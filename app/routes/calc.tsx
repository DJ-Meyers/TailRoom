import { createFileRoute } from '@tanstack/react-router'

import { MultiCalcView } from '~/components/MultiCalcView'

export const Route = createFileRoute('/calc')({
  component: CalcPage,
})

function CalcPage() {
  return (
    <div className="max-w-[1400px] mx-auto">
      <h1 className="text-center mb-6 text-3xl">Pokemon Damage Calculator</h1>
      <MultiCalcView />
    </div>
  )
}
