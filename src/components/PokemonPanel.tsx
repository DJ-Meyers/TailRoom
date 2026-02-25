import type { StatKey, ParseResult } from '../types';
import { PokemonSelector } from './PokemonSelector';
import { NatureSelector } from './NatureSelector';
import { AbilitySelector } from './AbilitySelector';
import { ItemSelector } from './ItemSelector';
import { MoveSelector } from './MoveSelector';
import { StatInputs } from './StatInputs';
import { ParseInput } from './ParseInput';
import type { PokemonState } from '../types';

const TYPE_NAMES = [
  'Normal', 'Fighting', 'Flying', 'Poison', 'Ground', 'Rock',
  'Bug', 'Ghost', 'Steel', 'Fire', 'Water', 'Grass',
  'Electric', 'Psychic', 'Ice', 'Dragon', 'Dark', 'Fairy', 'Stellar',
];

const STATUS_OPTIONS = [
  { value: '', label: '(none)' },
  { value: 'brn', label: 'Burned' },
  { value: 'par', label: 'Paralyzed' },
  { value: 'psn', label: 'Poisoned' },
  { value: 'tox', label: 'Badly Poisoned' },
  { value: 'slp', label: 'Asleep' },
  { value: 'frz', label: 'Frozen' },
];

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
}: Props) {
  return (
    <div className="pokemon-panel">
      <h2>{label}</h2>
      <ParseInput onParsed={onParsed} label={label.toLowerCase()} />
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

      <div className="selector">
        <label>Tera Type</label>
        <select value={state.teraType} onChange={(e) => onTeraTypeChange(e.target.value)}>
          <option value="">(none)</option>
          {TYPE_NAMES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div className="selector">
        <label>Status</label>
        <select value={state.status} onChange={(e) => onStatusChange(e.target.value)}>
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

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
