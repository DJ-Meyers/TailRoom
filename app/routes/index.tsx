import { Link, createFileRoute } from '@tanstack/react-router'
import { useCallback, useMemo } from 'react'

import { CalcColumn } from '~/components/CalcColumn'
import { PokemonPanel } from '~/components/PokemonPanel'
import { SpeedColumn } from '~/components/SpeedColumn'
import { useMultiCalc } from '~/hooks/useMultiCalc'
import { usePokemon } from '~/hooks/usePokemon'
import { useSpeedCalc } from '~/hooks/useSpeedCalc'
import type { CalcEntry, ParseResult, PokemonState, SpeedEntry } from '~/types'
import {
  createDefaultPokemonState,
  defaultEvs,
  defaultIvs,
  defaultSelectedPokemonModifiers,
} from '~/utils/pokemonState'

const INCINEROAR_OVERRIDES: Partial<PokemonState> = {
  nature: 'Careful',
  ability: 'Intimidate',
  item: 'Safety Goggles',
  evs: { ...defaultEvs(), hp: 236, atk: 20, def: 92, spd: 132, spe: 28 },
  ivs: { ...defaultIvs(), spe: 29 },
}

const SANDBOX_OFFENSIVE: CalcEntry[] = [
  {
    id: 'sandbox-off-1',
    name: '',
    notes: '',
    move: 'Knock Off',
    opponent: createDefaultPokemonState('Flutter Mane', '', {
      nature: 'Timid',
      evs: { ...defaultEvs(), hp: 4 },
      item: 'Booster Energy',
    }),
    fieldConditions: {},
    selectedPokemonModifiers: defaultSelectedPokemonModifiers(),
    isExpanded: false,
  },
  {
    id: 'sandbox-off-2',
    name: '',
    notes: '',
    move: 'Flare Blitz',
    opponent: createDefaultPokemonState('Rillaboom', '', {
      nature: 'Adamant',
      ability: 'Grassy Surge',
      evs: { ...defaultEvs(), hp: 252, def: 4 },
      item: 'Assault Vest',
    }),
    fieldConditions: {},
    selectedPokemonModifiers: defaultSelectedPokemonModifiers(),
    isExpanded: false,
  },
  {
    id: 'sandbox-off-3',
    name: '',
    notes: '',
    move: 'Flare Blitz',
    opponent: createDefaultPokemonState('Amoonguss', '', {
      nature: 'Relaxed',
      ability: 'Regenerator',
      evs: { ...defaultEvs(), hp: 252, def: 164 },
      item: 'Rocky Helmet',
    }),
    fieldConditions: {},
    selectedPokemonModifiers: defaultSelectedPokemonModifiers(),
    isExpanded: false,
  },
]

const SANDBOX_SPEED: SpeedEntry[] = [
  {
    id: 'sandbox-spd-1',
    pokemon: createDefaultPokemonState('Flutter Mane', '', {
      nature: 'Timid',
      evs: { ...defaultEvs(), spe: 252 },
      item: 'Booster Energy',
    }),
    name: 'Max Speed Flutter',
    notes: '',
    isExpanded: false,
  },
  {
    id: 'sandbox-spd-2',
    pokemon: createDefaultPokemonState('Urshifu-Rapid-Strike', '', {
      nature: 'Jolly',
      evs: { ...defaultEvs(), spe: 252 },
      item: 'Choice Scarf',
    }),
    name: 'Scarf Urshifu',
    notes: '',
    isExpanded: false,
  },
  {
    id: 'sandbox-spd-3',
    pokemon: createDefaultPokemonState('Rillaboom', '', {
      nature: 'Adamant',
      ability: 'Grassy Surge',
      evs: { ...defaultEvs(), spe: 44 },
    }),
    name: 'Rillaboom',
    notes: '',
    isExpanded: false,
  },
]

const SANDBOX_DEFENSIVE: CalcEntry[] = [
  {
    id: 'sandbox-def-1',
    name: '',
    notes: '',
    move: 'Surging Strikes',
    opponent: createDefaultPokemonState('Urshifu-Rapid-Strike', '', {
      nature: 'Jolly',
      ability: 'Unseen Fist',
      evs: { ...defaultEvs(), atk: 252 },
      item: 'Mystic Water',
      isCrit: true,
    }),
    fieldConditions: {},
    selectedPokemonModifiers: defaultSelectedPokemonModifiers(),
    isExpanded: false,
  },
  {
    id: 'sandbox-def-2',
    name: '',
    notes: '',
    move: 'Dazzling Gleam',
    opponent: createDefaultPokemonState('Flutter Mane', '', {
      nature: 'Timid',
      evs: { ...defaultEvs(), spa: 252 },
      item: 'Choice Specs',
    }),
    fieldConditions: {},
    selectedPokemonModifiers: defaultSelectedPokemonModifiers(),
    isExpanded: false,
  },
  {
    id: 'sandbox-def-3',
    name: '',
    notes: '',
    move: 'Muddy Water',
    opponent: createDefaultPokemonState('Ogerpon-Wellspring', '', {
      nature: 'Jolly',
      ability: 'Water Absorb',
      evs: { ...defaultEvs(), atk: 252 },
      item: 'Wellspring Mask',
    }),
    fieldConditions: {},
    selectedPokemonModifiers: defaultSelectedPokemonModifiers(),
    isExpanded: false,
  },
]

export const Route = createFileRoute('/')({
  component: IndexPage,
})

function IndexPage() {
  const initialOverrides = useMemo(() => INCINEROAR_OVERRIDES, [])
  const selectedPokemon = usePokemon('Incineroar', '', initialOverrides)
  const offensive = useMultiCalc(SANDBOX_OFFENSIVE)
  const defensive = useMultiCalc(SANDBOX_DEFENSIVE)
  const speed = useSpeedCalc(SANDBOX_SPEED)

  const handleSelectedPokemonParsed = useCallback(
    (parsed: ParseResult) => {
      selectedPokemon.applyParsed(parsed)
    },
    [selectedPokemon],
  )

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Hero */}
      <section className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-3">Tailroom</h1>
        <p className="text-lg text-text-muted max-w-[600px] mx-auto mb-6">
          A VGC damage calculator built for teambuilding. Save your teams, dial
          in your spreads, and share your calcs with your friends.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            to="/sign-up"
            className="px-5 py-2 rounded bg-primary text-bg font-semibold hover:bg-primary-hover no-underline"
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* Sandbox */}
      <section>
        <h2 className="text-2xl font-bold text-center mb-1">Try It Out</h2>
        <p className="text-center text-text-muted mb-6">
          Wolfe&apos;s Incineroar &mdash; adjust the spread and calcs below
        </p>

        <div className="flex gap-6 items-start max-md:flex-col mb-6">
          <div className="flex-1 min-w-0">
            <PokemonPanel
              label="Your Pokemon"
              state={selectedPokemon.state}
              abilities={selectedPokemon.abilities}
              showMove={false}
              hideModifiers
              onSpeciesChange={selectedPokemon.setSpecies}
              onNatureChange={selectedPokemon.setNature}
              onAbilityChange={selectedPokemon.setAbility}
              onItemChange={selectedPokemon.setItem}
              onMoveChange={selectedPokemon.setMove}
              onEvChange={selectedPokemon.setEv}
              onIvChange={selectedPokemon.setIv}
              onTeraTypeChange={selectedPokemon.setTeraType}
              onBoostChange={selectedPokemon.setBoost}
              onStatusChange={selectedPokemon.setStatus}
              onIsCritChange={selectedPokemon.setIsCrit}
              onParsed={handleSelectedPokemonParsed}
            />
          </div>
          <SpeedColumn
            entries={speed.entries}
            selectedPokemon={selectedPokemon.state}
            conditions={speed.conditions}
            onConditionsChange={speed.setConditions}
            onAdd={speed.add}
            onRemove={speed.remove}
            onToggleExpanded={speed.toggleExpanded}
            onSpeciesChange={speed.setSpecies}
            onPokemonUpdate={speed.updatePokemon}
            onEvChange={speed.setEv}
            onIvChange={speed.setIv}
            onBoostChange={speed.setBoost}
            onNameChange={speed.updateName}
            onNotesChange={speed.updateNotes}
          />
        </div>
        <div className="flex gap-6 items-start max-md:flex-col">
          <CalcColumn
            title="Offensive Calcs"
            mode="offensive"
            entries={offensive.entries}
            selectedPokemon={selectedPokemon.state}
            onAdd={offensive.add}
            onRemove={offensive.remove}
            onToggleExpanded={offensive.toggleExpanded}
            onSpeciesChange={offensive.setOpponentSpecies}
            onOpponentUpdate={offensive.updateOpponent}
            onEvChange={offensive.setEv}
            onIvChange={offensive.setIv}
            onBoostChange={offensive.setBoost}
            onMoveChange={offensive.updateMove}
            onFieldChange={offensive.updateField}
            onSelectedPokemonModifiersUpdate={offensive.updateSelectedPokemonModifiers}
            onSelectedPokemonBoostChange={offensive.setSelectedPokemonBoost}
            onNameChange={offensive.updateName}
            onNotesChange={offensive.updateNotes}
          />
          <CalcColumn
            title="Defensive Calcs"
            mode="defensive"
            entries={defensive.entries}
            selectedPokemon={selectedPokemon.state}
            onAdd={defensive.add}
            onRemove={defensive.remove}
            onToggleExpanded={defensive.toggleExpanded}
            onSpeciesChange={defensive.setOpponentSpecies}
            onOpponentUpdate={defensive.updateOpponent}
            onEvChange={defensive.setEv}
            onIvChange={defensive.setIv}
            onBoostChange={defensive.setBoost}
            onMoveChange={defensive.updateMove}
            onFieldChange={defensive.updateField}
            onSelectedPokemonModifiersUpdate={defensive.updateSelectedPokemonModifiers}
            onSelectedPokemonBoostChange={defensive.setSelectedPokemonBoost}
            onNameChange={defensive.updateName}
            onNotesChange={defensive.updateNotes}
          />
        </div>
      </section>
    </div>
  )
}
