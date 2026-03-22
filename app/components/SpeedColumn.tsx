import { AddSpeedInput } from '~/components/AddSpeedInput';
import { SpeedConditionToggles } from '~/components/SpeedConditionToggles';
import { SpeedEntryRow } from '~/components/SpeedEntryRow';
import { SpeedListControls } from '~/components/SpeedListControls';
import { WindIcon } from '~/components/icons';
import { useSpeedListView } from '~/hooks/useSpeedListView';
import type { PokemonState, SpeedConditions, SpeedEntry, StatKey } from '~/types';

interface Props {
  entries: SpeedEntry[];
  selectedPokemon: PokemonState;
  conditions: SpeedConditions;
  onConditionsChange: (conditions: SpeedConditions) => void;
  onAdd: (entry: Omit<SpeedEntry, 'id'>) => void;
  onRemove: (id: string) => void;
  onToggleExpanded: (id: string) => void;
  onToggleTailwind: (id: string) => void;
  onSpeciesChange: (id: string, species: string) => void;
  onPokemonUpdate: (id: string, patch: Partial<PokemonState>) => void;
  onEvChange: (id: string, stat: StatKey, value: number) => void;
  onIvChange: (id: string, stat: StatKey, value: number) => void;
  onBoostChange: (id: string, stat: StatKey, value: number) => void;
  onNameChange: (id: string, name: string) => void;
  onNotesChange: (id: string, notes: string) => void;
}

export const SpeedColumn = ({
  entries,
  selectedPokemon,
  conditions,
  onConditionsChange,
  onAdd,
  onRemove,
  onToggleExpanded,
  onToggleTailwind,
  onSpeciesChange,
  onPokemonUpdate,
  onEvChange,
  onIvChange,
  onBoostChange,
  onNameChange,
  onNotesChange,
}: Props) => {
  const { groups, yourSpeed, viewState, setSortBy, setGroupBy, setSearchQuery } =
    useSpeedListView(entries, selectedPokemon, conditions);

  return (
    <div className="flex-1 min-w-0">
      <h3 className="sticky top-0 z-10 bg-bg text-base text-text-heading mb-3 pb-2 border-b-2 border-primary">Speed Calcs</h3>
      <SpeedConditionToggles conditions={conditions} onChange={onConditionsChange} />
      <div className="text-sm text-text-dim mb-2">
        Your speed: {conditions.yourTailwind && <WindIcon />}<span className="font-semibold text-text">{yourSpeed}</span>
      </div>
      <AddSpeedInput onAdd={onAdd} />
      <SpeedListControls
        viewState={viewState}
        onSortChange={setSortBy}
        onGroupChange={setGroupBy}
        onSearchChange={setSearchQuery}
      />
      {groups.map((group) => (
        <div key={group.label || '__ungrouped'}>
          {group.label && (
            <div className="text-xs font-semibold text-text-dim uppercase tracking-wide mt-3 mb-1 px-1">
              {group.label}
            </div>
          )}
          {group.entries.map(({ entry, speed, tier }) => (
            <SpeedEntryRow
              key={entry.id}
              entry={entry}
              speed={speed}
              tier={tier}
              hasTailwind={entry.tailwind}
              onToggleTailwind={() => onToggleTailwind(entry.id)}
              onToggleExpanded={() => onToggleExpanded(entry.id)}
              onRemove={() => onRemove(entry.id)}
              onSpeciesChange={(species) => onSpeciesChange(entry.id, species)}
              onPokemonUpdate={(patch) => onPokemonUpdate(entry.id, patch)}
              onEvChange={(stat, value) => onEvChange(entry.id, stat, value)}
              onIvChange={(stat, value) => onIvChange(entry.id, stat, value)}
              onBoostChange={(stat, value) => onBoostChange(entry.id, stat, value)}
              onNameChange={(name) => onNameChange(entry.id, name)}
              onNotesChange={(notes) => onNotesChange(entry.id, notes)}
            />
          ))}
        </div>
      ))}
    </div>
  );
};
