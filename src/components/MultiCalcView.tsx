import { useCallback, useMemo } from 'react';

import { CalcColumn } from '~/components/CalcColumn';
import { PokemonPanel } from '~/components/PokemonPanel';
import { useMultiCalc } from '~/hooks/useMultiCalc';
import { usePokemon } from '~/hooks/usePokemon';
import type { CalcEntry, ParseResult, PokemonState } from '~/types';
import { createDefaultPokemonState, defaultBoosts, defaultEvs, defaultSelectedPokemonModifiers } from '~/utils/pokemonState';

const INITIAL_OVERRIDES: Partial<PokemonState> = {
  nature: 'Timid',
  item: 'Choice Specs',
  evs: { ...defaultEvs(), spa: 252 },
};

const INITIAL_OFFENSIVE_ENTRIES: CalcEntry[] = [
  {
    id: 'default-1',
    move: 'Dazzling Gleam',
    opponent: createDefaultPokemonState('Incineroar', '', {
      nature: 'Impish',
      evs: { ...defaultEvs(), hp: 252, spd: 44 },
      item: 'Assault Vest',
    }),
    fieldConditions: {},
    selectedPokemonModifiers: {
      ...defaultSelectedPokemonModifiers(),
      teraType: 'Fairy',
    },
    isExpanded: false,
  },
  {
    id: 'default-2',
    move: 'Moonblast',
    opponent: createDefaultPokemonState('Dondozo', '', {
      evs: { ...defaultEvs(), hp: 4, spd: 76 },
      boosts: { ...defaultBoosts(), spd: 2 },
    }),
    fieldConditions: {},
    selectedPokemonModifiers: defaultSelectedPokemonModifiers(),
    isExpanded: false,
  },
  {
    id: 'default-3',
    move: 'Shadow Ball',
    opponent: createDefaultPokemonState('Gholdengo', '', {
      evs: { ...defaultEvs(), hp: 4 },
    }),
    fieldConditions: {},
    selectedPokemonModifiers: defaultSelectedPokemonModifiers(),
    isExpanded: false,
  },
];

export const MultiCalcView = () => {
  const initialOverrides = useMemo(() => INITIAL_OVERRIDES, []);
  const selectedPokemon = usePokemon('Flutter Mane', '', initialOverrides);
  const offensive = useMultiCalc(INITIAL_OFFENSIVE_ENTRIES);
  const defensive = useMultiCalc();

  const handleSelectedPokemonParsed = useCallback((parsed: ParseResult) => {
    selectedPokemon.applyParsed(parsed);
  }, [selectedPokemon]);

  return (
    <div>
      <div className="max-w-[600px] mx-auto mb-6">
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
        />
      </div>
    </div>
  );
};
