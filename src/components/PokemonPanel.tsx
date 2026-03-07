import type { StatKey, ParseResult } from '../types';
import type { ParseContext } from '../parser';
import { PokemonSelector } from './PokemonSelector';
import { NatureSelector } from './NatureSelector';
import { AbilitySelector } from './AbilitySelector';
import { ItemSelector } from './ItemSelector';
import { MoveSelector } from './MoveSelector';
import { StatInputs } from './StatInputs';
import { ParseInput } from './ParseInput';
import { Typeahead } from './Typeahead';
import type { PokemonState } from '../types';

const TYPE_NAMES = [
  'Normal', 'Fighting', 'Flying', 'Poison', 'Ground', 'Rock',
  'Bug', 'Ghost', 'Steel', 'Fire', 'Water', 'Grass',
  'Electric', 'Psychic', 'Ice', 'Dragon', 'Dark', 'Fairy', 'Stellar',
];

const STATUS_VALUES = ['brn', 'par', 'psn', 'tox', 'slp', 'frz'];
const STATUS_LABELS: Record<string, string> = {
  brn: 'Burned',
  par: 'Paralyzed',
  psn: 'Poisoned',
  tox: 'Badly Poisoned',
  slp: 'Asleep',
  frz: 'Frozen',
};

interface Props {
  label: string;
  state: PokemonState;
  abilities: string[];
  showMove: boolean;
  onSpeciesChange: (species: string) => void;
  onNatureChange: (nature: string) => void;
  onAbilityChange: (ability: string) => void;
  onItemChange: (item: string) => void;
  onMoveChange: (move: string) => void;
  onEvChange: (stat: StatKey, value: number) => void;
  onIvChange: (stat: StatKey, value: number) => void;
  onTeraTypeChange: (teraType: string) => void;
  onBoostChange: (stat: StatKey, value: number) => void;
  onStatusChange: (status: string) => void;
  onIsCritChange: (isCrit: boolean) => void;
  onParsed: (result: ParseResult) => void;
  parseContext?: ParseContext;
}

export function PokemonPanel({
  label,
  state,
  abilities,
  showMove,
  onSpeciesChange,
  onNatureChange,
  onAbilityChange,
  onItemChange,
  onMoveChange,
  onEvChange,
  onIvChange,
  onTeraTypeChange,
  onBoostChange,
  onStatusChange,
  onIsCritChange,
  onParsed,
  parseContext,
}: Props) {
  return (
    <div className="pokemon-panel">
      <h2>{label}</h2>
      <ParseInput onParsed={onParsed} label={label.toLowerCase()} parseContext={parseContext} />
      <PokemonSelector
        id={`${label.toLowerCase()}-species`}
        value={state.species}
        onChange={onSpeciesChange}
      />
      <NatureSelector value={state.nature} onChange={onNatureChange} />
      <AbilitySelector
        value={state.ability}
        onChange={onAbilityChange}
        abilities={abilities}
      />
      <ItemSelector value={state.item} onChange={onItemChange} />

      <Typeahead
        id={`${label.toLowerCase()}-tera-type`}
        label="Tera Type"
        value={state.teraType}
        onChange={onTeraTypeChange}
        options={TYPE_NAMES}
        placeholder="Search types..."
        allowEmpty
        emptyLabel="(none)"
      />

      <Typeahead
        id={`${label.toLowerCase()}-status`}
        label="Status"
        value={state.status}
        onChange={onStatusChange}
        options={STATUS_VALUES}
        placeholder="Search status..."
        allowEmpty
        emptyLabel="(none)"
        getLabel={(v) => STATUS_LABELS[v] ?? v}
      />

      {showMove && (
        <>
          <MoveSelector value={state.move} onChange={onMoveChange} />
          <div className="selector crit-toggle">
            <label>
              <input
                type="checkbox"
                checked={state.isCrit}
                onChange={(e) => onIsCritChange(e.target.checked)}
              />
              {' '}Critical Hit
            </label>
          </div>
        </>
      )}

      <StatInputs
        evs={state.evs}
        ivs={state.ivs}
        boosts={state.boosts}
        onEvChange={onEvChange}
        onIvChange={onIvChange}
        onBoostChange={onBoostChange}
      />
    </div>
  );
}
