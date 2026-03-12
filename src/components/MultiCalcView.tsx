import { useCallback, useMemo, useState } from 'react';

import { CalcColumn } from '~/components/CalcColumn';
import { PokemonPanel } from '~/components/PokemonPanel';
import { SpeedColumn } from '~/components/SpeedColumn';
import { DEFAULT_SPEED_ENTRIES } from '~/data/defaultSpeedEntries';
import { useMultiCalc } from '~/hooks/useMultiCalc';
import { usePokemon } from '~/hooks/usePokemon';
import { useSpeedCalc } from '~/hooks/useSpeedCalc';
import type { CalcEntry, ParseResult, PokemonState } from '~/types';
import { createDefaultPokemonState, defaultBoosts, defaultEvs, defaultIvs, defaultSelectedPokemonModifiers } from '~/utils/pokemonState';

const INITIAL_OVERRIDES: Partial<PokemonState> = {
  nature: 'Careful',
  ability: 'Intimidate',
  item: 'Safety Goggles',
  evs: { ...defaultEvs(), hp: 252, def: 124, spd: 132 },
  ivs: { ...defaultIvs(), spe: 29, spa: 15 },
};

const INITIAL_OFFENSIVE_ENTRIES: CalcEntry[] = [
  {
    id: 'default-1',
    name: '',
    notes: '',
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
    name: '',
    notes: '',
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
    name: '',
    notes: '',
    move: 'Shadow Ball',
    opponent: createDefaultPokemonState('Gholdengo', '', {
      evs: { ...defaultEvs(), hp: 4 },
    }),
    fieldConditions: {},
    selectedPokemonModifiers: defaultSelectedPokemonModifiers(),
    isExpanded: false,
  },
];

const INITIAL_DEFENSIVE_ENTRIES: CalcEntry[] = [
  {
    id: 'def-default-1',
    name: '',
    notes: '',
    move: 'Sucker Punch',
    opponent: createDefaultPokemonState('Chien-Pao', '', {
      nature: 'Adamant',
      evs: { ...defaultEvs(), atk: 252 },
    }),
    fieldConditions: { isSwordOfRuin: true },
    selectedPokemonModifiers: defaultSelectedPokemonModifiers(),
    isExpanded: false,
  },
  {
    id: 'def-default-2',
    name: '',
    notes: '',
    move: 'Surging Strikes',
    opponent: createDefaultPokemonState('Urshifu-Rapid-Strike', '', {
      nature: 'Adamant',
      evs: { ...defaultEvs(), atk: 188 },
      item: 'Mystic Water',
      teraType: 'Water',
      isCrit: true,
    }),
    fieldConditions: { weather: 'Rain' },
    selectedPokemonModifiers: defaultSelectedPokemonModifiers(),
    isExpanded: false,
  },
  {
    id: 'def-default-3',
    name: '',
    notes: '',
    move: 'Blizzard',
    opponent: createDefaultPokemonState('Ninetales-Alola', '', {
      nature: 'Timid',
      evs: defaultEvs(),
    }),
    fieldConditions: { weather: 'Snow' },
    selectedPokemonModifiers: defaultSelectedPokemonModifiers(),
    isExpanded: false,
  },
];

export const MultiCalcView = () => {
  const initialOverrides = useMemo(() => INITIAL_OVERRIDES, []);
  const selectedPokemon = usePokemon('Incineroar', '', initialOverrides);
  const offensive = useMultiCalc(INITIAL_OFFENSIVE_ENTRIES);
  const defensive = useMultiCalc(INITIAL_DEFENSIVE_ENTRIES);
  const speed = useSpeedCalc(DEFAULT_SPEED_ENTRIES);
  const [selectedName, setSelectedName] = useState('');
  const [selectedNotes, setSelectedNotes] = useState('');

  const handleSelectedPokemonParsed = useCallback((parsed: ParseResult) => {
    selectedPokemon.applyParsed(parsed);
  }, [selectedPokemon]);

  return (
    <div
      className="grid grid-cols-2 gap-4 h-[calc(100vh-6rem)] max-md:flex max-md:flex-col max-md:h-auto"
      style={{ gridTemplateRows: 'minmax(auto, 1fr) minmax(0, 1fr)' }}
    >
      {/* Top Left: Your Pokemon */}
      <div>
        <PokemonPanel
          label="Your Pokemon"
          state={selectedPokemon.state}
          speciesAbilities={selectedPokemon.abilities}
          showMove={false}
          hideModifiers
          name={selectedName}
          notes={selectedNotes}
          onNameChange={setSelectedName}
          onNotesChange={setSelectedNotes}
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

      {/* Top Right: Speed Calcs */}
      <div className="overflow-y-auto min-h-0">
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

      {/* Bottom Left: Offensive Calcs */}
      <div className="overflow-y-auto min-h-0">
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
      </div>

      {/* Bottom Right: Defensive Calcs */}
      <div className="overflow-y-auto min-h-0">
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
    </div>
  );
};
