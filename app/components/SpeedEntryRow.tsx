import { useCallback } from 'react';

import { ItemIcon } from '~/components/ItemIcon';
import { Modal } from '~/components/Modal';
import { PokemonIcon } from '~/components/PokemonIcon';
import { PokemonPanel } from '~/components/PokemonPanel';
import { WindIcon } from '~/components/WindIcon';
import { getSpeciesAbilities } from '~/data/gen';
import type { PokemonState, SpeedEntry, SpeedTier, StatKey } from '~/types';
import type { ParseResult } from '~/types';

interface Props {
  entry: SpeedEntry;
  speed: number;
  tier: SpeedTier;
  hasTailwind?: boolean;
  onToggleTailwind: () => void;
  onToggleExpanded: () => void;
  onRemove: () => void;
  onSpeciesChange: (species: string) => void;
  onPokemonUpdate: (patch: Partial<PokemonState>) => void;
  onEvChange: (stat: StatKey, value: number) => void;
  onIvChange: (stat: StatKey, value: number) => void;
  onBoostChange: (stat: StatKey, value: number) => void;
  onNameChange: (name: string) => void;
  onNotesChange: (notes: string) => void;
}

const TIER_COLORS: Record<SpeedTier, string> = {
  faster: 'text-ko-no-2hko',
  tie: 'text-ko-guaranteed-2hko',
  slower: 'text-ko-guaranteed-ohko',
};

const formatSpeedEvHint = (pokemon: PokemonState): string => {
  const evs = pokemon.evs.spe;
  const nature = pokemon.nature;
  // Check if nature boosts or reduces speed
  const natureHints: Record<string, { plus?: string; minus?: string }> = {
    Jolly: { plus: 'spe', minus: 'spa' },
    Timid: { plus: 'spe', minus: 'atk' },
    Hasty: { plus: 'spe', minus: 'def' },
    Naive: { plus: 'spe', minus: 'spd' },
    Brave: { minus: 'spe' },
    Quiet: { minus: 'spe' },
    Relaxed: { minus: 'spe' },
    Saucy: { minus: 'spe' },
  };
  const hint = natureHints[nature];
  const sign = hint?.plus === 'spe' ? '+' : hint?.minus === 'spe' ? '-' : '';
  return `${evs}${sign} Spe`;
};

export const SpeedEntryRow = ({
  entry,
  speed,
  tier,
  hasTailwind,
  onToggleTailwind,
  onToggleExpanded,
  onRemove,
  onSpeciesChange,
  onPokemonUpdate,
  onEvChange,
  onIvChange,
  onBoostChange,
  onNameChange,
  onNotesChange,
}: Props) => {
  const { pokemon } = entry;
  const abilities = getSpeciesAbilities(pokemon.species);
  const prefix = `speed-${entry.id}`;
  const tierColor = TIER_COLORS[tier];

  const handleParsed = useCallback(
    (parsed: ParseResult) => {
      const patch: Partial<PokemonState> = {};
      if (parsed.species) patch.species = parsed.species;
      if (parsed.nature) patch.nature = parsed.nature;
      if (parsed.ability) patch.ability = parsed.ability;
      if (parsed.item !== undefined) patch.item = parsed.item;
      if (parsed.level !== undefined) patch.level = parsed.level;
      if (parsed.teraType !== undefined) patch.teraType = parsed.teraType;
      if (parsed.status !== undefined) patch.status = parsed.status;
      if (parsed.abilityOn !== undefined) patch.abilityOn = parsed.abilityOn;
      if (parsed.boostedStat !== undefined) patch.boostedStat = parsed.boostedStat;
      if (Object.keys(patch).length > 0) onPokemonUpdate(patch);
    },
    [onPokemonUpdate],
  );

  return (
    <div className="bg-surface rounded-md mb-2 shadow-sm overflow-hidden">
      <div
        className="flex items-center gap-2 px-3 py-2.5 cursor-pointer select-none hover:bg-hover-bg"
        onClick={onToggleExpanded}
      >
        <ItemIcon item={pokemon.item} />
        <PokemonIcon
          species={pokemon.species}
          className="shrink-0 relative inline-block w-[2.4em] h-[2em] overflow-hidden align-middle"
        />
        {entry.name && <span className="text-sm font-semibold text-text-heading">{entry.name}</span>}
        <span className="flex-1" />
        <span className="shrink-0 text-xs text-text-dim">{formatSpeedEvHint(pokemon)}</span>
        <select
          value={pokemon.boosts.spe}
          onChange={(e) => {
            e.stopPropagation();
            onBoostChange('spe', Number(e.target.value));
          }}
          onClick={(e) => e.stopPropagation()}
          className={`shrink-0 w-12 bg-surface border border-border rounded px-0.5 py-0.5 text-xs text-center focus:outline-none focus:border-primary ${pokemon.boosts.spe !== 0 ? 'text-text' : 'text-text-faint'}`}
          title="Speed boost"
        >
          {[6, 5, 4, 3, 2, 1, 0, -1, -2, -3, -4, -5, -6].map((v) => (
            <option key={v} value={v}>
              {v >= 0 ? `+${v}` : String(v)}
            </option>
          ))}
        </select>
        <button
          className={`shrink-0 bg-none border-none cursor-pointer px-0.5 leading-none ${hasTailwind ? 'opacity-30' : 'opacity-100'}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleTailwind();
          }}
          title="Toggle tailwind"
        >
          <WindIcon />
        </button>
        <span className={`shrink-0 text-sm font-semibold tabular-nums ${tierColor}`}>
          {speed}
        </span>
        <button
          className="shrink-0 bg-none border-none text-lg text-text-faint cursor-pointer px-1 leading-none hover:text-error"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          &times;
        </button>
      </div>
      <Modal
        open={entry.isExpanded}
        onClose={onToggleExpanded}
        title={
          <span className="flex items-center gap-2 leading-none">
            <ItemIcon item={pokemon.item} />
            <PokemonIcon
              species={pokemon.species}
              className="shrink-0 relative inline-block w-[2.4em] h-[2em] overflow-hidden align-middle"
            />
            {entry.name && <span className="font-semibold text-text-heading">{entry.name}</span>}
            <span className="text-xs text-text-dim">{formatSpeedEvHint(pokemon)}</span>
            <span className={`font-semibold tabular-nums ${tierColor}`}>{speed}</span>
          </span>
        }
      >
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="Name (e.g. Scarf Ursh)"
            value={entry.name}
            onChange={(e) => onNameChange(e.target.value)}
            className="flex-1 min-w-0 px-2 py-1 text-sm rounded border border-border-lighter bg-surface text-text-primary placeholder:text-text-faint"
          />
        </div>
        <textarea
          placeholder="Notes..."
          value={entry.notes}
          onChange={(e) => onNotesChange(e.target.value)}
          rows={2}
          className="w-full px-2 py-1 mb-3 text-sm rounded border border-border-lighter bg-surface text-text-primary placeholder:text-text-faint resize-y"
        />
        <PokemonPanel
          label={prefix}
          state={pokemon}
          abilities={abilities}
          showMove={false}
          hideModifiers
          compact
          onSpeciesChange={onSpeciesChange}
          onNatureChange={(nature) => onPokemonUpdate({ nature })}
          onAbilityChange={(ability) => onPokemonUpdate({ ability })}
          onItemChange={(item) => onPokemonUpdate({ item })}
          onMoveChange={() => {}}
          onEvChange={onEvChange}
          onIvChange={onIvChange}
          onTeraTypeChange={(teraType) => onPokemonUpdate({ teraType })}
          onBoostChange={onBoostChange}
          onStatusChange={(status) => onPokemonUpdate({ status })}
          onIsCritChange={() => {}}
          onParsed={handleParsed}
        />
      </Modal>
    </div>
  );
};
