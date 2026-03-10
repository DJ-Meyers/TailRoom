import { MoveSelector } from '~/components/MoveSelector';
import { Typeahead } from '~/components/Typeahead';
import { STATUS_LABELS, STATUS_VALUES, TYPE_NAMES } from '~/constants';
import type { SelectedPokemonModifiers, StatKey } from '~/types';

const BOOSTABLE_STATS: StatKey[] = ['atk', 'def', 'spa', 'spd', 'spe'];
const BOOST_LABELS: Record<string, string> = {
  atk: 'Atk',
  def: 'Def',
  spa: 'SpA',
  spd: 'SpD',
  spe: 'Spe',
};

interface Props {
  modifiers: SelectedPokemonModifiers;
  idPrefix: string;
  showCrit: boolean;
  move: string;
  onMoveChange: (move: string) => void;
  onUpdate: (patch: Partial<SelectedPokemonModifiers>) => void;
  onBoostChange: (stat: StatKey, value: number) => void;
}

export const SelectedPokemonModifierInputs = ({
  modifiers,
  idPrefix,
  showCrit,
  move,
  onMoveChange,
  onUpdate,
  onBoostChange,
}: Props) => (
  <div className="py-2 mb-2 border-b border-border-section">
    <div className="flex flex-wrap items-end gap-2 mb-2">
      <div className="min-w-[120px] flex-1 basis-[120px]">
        <MoveSelector
          id={`${idPrefix}-fm-move`}
          value={move}
          onChange={onMoveChange}
        />
      </div>
      <div className="min-w-[120px] flex-1 basis-[120px]">
        <Typeahead
          id={`${idPrefix}-fm-tera`}
          label="Tera Type"
          value={modifiers.teraType}
          onChange={(teraType) => onUpdate({ teraType })}
          options={TYPE_NAMES}
          placeholder="Search types..."
          allowEmpty
          emptyLabel="(none)"
          className="!mb-0"
        />
      </div>
      <div className="min-w-[120px] flex-1 basis-[120px]">
        <Typeahead
          id={`${idPrefix}-fm-status`}
          label="Status"
          value={modifiers.status}
          onChange={(status) => onUpdate({ status })}
          options={STATUS_VALUES}
          placeholder="Search status..."
          allowEmpty
          emptyLabel="(none)"
          getLabel={(v) => STATUS_LABELS[v] ?? v}
          className="!mb-0"
        />
      </div>
    </div>
    <div className="flex items-end gap-2">
      {BOOSTABLE_STATS.map((stat) => (
        <div key={stat} className="flex flex-col items-center gap-0.5">
          <label className="text-[0.7rem] font-semibold text-text-dim">{BOOST_LABELS[stat]}</label>
          <select
            value={modifiers.boosts[stat]}
            onChange={(e) => onBoostChange(stat, Number(e.target.value))}
            className="w-14 p-0.5 border border-border rounded text-xs text-center bg-surface focus:outline-none focus:border-primary"
          >
            {[-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6].map((v) => (
              <option key={v} value={v}>
                {v > 0 ? `+${v}` : v === 0 ? '--' : String(v)}
              </option>
            ))}
          </select>
        </div>
      ))}
      {showCrit && (
        <div className="flex items-center">
          <label className="text-xs cursor-pointer flex items-center gap-1 whitespace-nowrap">
            <input
              type="checkbox"
              checked={modifiers.isCrit}
              onChange={(e) => onUpdate({ isCrit: e.target.checked })}
              className="w-auto"
            />
            {' '}Crit
          </label>
        </div>
      )}
    </div>
  </div>
);
