import { AbilitySelector } from '~/components/AbilitySelector';
import { ItemSelector } from '~/components/ItemSelector';
import { MoveSelector } from '~/components/MoveSelector';
import { NatureSelector } from '~/components/NatureSelector';
import { ParseInput } from '~/components/ParseInput';
import { PokemonSelector } from '~/components/PokemonSelector';
import { StatInputs } from '~/components/StatInputs';
import { Typeahead } from '~/components/Typeahead';
import { STATUS_LABELS, STATUS_VALUES, TYPE_NAMES } from '~/constants';
import type { ParseResult, StatKey } from '~/types';
import type { PokemonState } from '~/types';
import type { ParseContext } from '~/utils/parser';

interface Props {
  label: string;
  state: PokemonState;
  abilities: string[];
  showMove: boolean;
  hideModifiers?: boolean;
  compact?: boolean;
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

export const PokemonPanel = ({
  label,
  state,
  abilities,
  showMove,
  hideModifiers,
  compact,
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
}: Props) => {
  const id = label.toLowerCase();
  return (
    <div className={compact ? 'flex-1' : 'flex-1 bg-surface rounded-lg p-5 shadow-md'}>
      {!compact && <h2 className="text-center mb-4 text-lg text-text-heading">{label}</h2>}
      <ParseInput onParsed={onParsed} label={id} parseContext={parseContext} />
      <div className="flex gap-4 max-md:flex-col">
        <div className="flex-1 min-w-0">
          <PokemonSelector
            id={`${id}-species`}
            value={state.species}
            onChange={onSpeciesChange}
          />
          <NatureSelector id={`${id}-nature`} value={state.nature} onChange={onNatureChange} />
          <AbilitySelector
            id={`${id}-ability`}
            value={state.ability}
            onChange={onAbilityChange}
            abilities={abilities}
          />
          <ItemSelector id={`${id}-item`} value={state.item} onChange={onItemChange} />
          {!hideModifiers && (
            <>
              <Typeahead
                id={`${id}-tera-type`}
                label="Tera Type"
                value={state.teraType}
                onChange={onTeraTypeChange}
                options={TYPE_NAMES}
                placeholder="Search types..."
                allowEmpty
                emptyLabel="(none)"
              />
              <Typeahead
                id={`${id}-status`}
                label="Status"
                value={state.status}
                onChange={onStatusChange}
                options={STATUS_VALUES}
                placeholder="Search status..."
                allowEmpty
                emptyLabel="(none)"
                getLabel={(v) => STATUS_LABELS[v] ?? v}
              />
            </>
          )}
          {showMove && (
            <>
              <MoveSelector id={`${id}-move`} value={state.move} onChange={onMoveChange} />
              {!hideModifiers && (
                <div className="mb-3">
                  <label className="flex items-center gap-1 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={state.isCrit}
                      onChange={(e) => onIsCritChange(e.target.checked)}
                      className="w-auto"
                    />
                    {' '}Critical Hit
                  </label>
                </div>
              )}
            </>
          )}
        </div>
        <div className="shrink-0">
          <StatInputs
            evs={state.evs}
            ivs={state.ivs}
            boosts={state.boosts}
            hideBoosts={hideModifiers}
            onEvChange={onEvChange}
            onIvChange={onIvChange}
            onBoostChange={onBoostChange}
          />
        </div>
      </div>
    </div>
  );
};
