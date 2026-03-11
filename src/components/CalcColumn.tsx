import { AddCalcInput } from '~/components/AddCalcInput';
import { CalcEntryRow } from '~/components/CalcEntryRow';
import { CalcListControls } from '~/components/CalcListControls';
import { useCalcListView } from '~/hooks/useCalcListView';
import type { CalcEntry, FieldConditions, PokemonState, SelectedPokemonModifiers, StatKey } from '~/types';

interface Props {
  title: string;
  mode: 'offensive' | 'defensive';
  entries: CalcEntry[];
  selectedPokemon: PokemonState;
  onAdd: (entry: Omit<CalcEntry, 'id'>) => void;
  onRemove: (id: string) => void;
  onToggleExpanded: (id: string) => void;
  onSpeciesChange: (id: string, species: string) => void;
  onOpponentUpdate: (id: string, patch: Partial<PokemonState>) => void;
  onEvChange: (id: string, stat: StatKey, value: number) => void;
  onIvChange: (id: string, stat: StatKey, value: number) => void;
  onBoostChange: (id: string, stat: StatKey, value: number) => void;
  onMoveChange: (id: string, move: string) => void;
  onFieldChange: (id: string, field: FieldConditions) => void;
  onSelectedPokemonModifiersUpdate: (id: string, patch: Partial<SelectedPokemonModifiers>) => void;
  onSelectedPokemonBoostChange: (id: string, stat: StatKey, value: number) => void;
}

export const CalcColumn = ({
  title,
  mode,
  entries,
  selectedPokemon,
  onAdd,
  onRemove,
  onToggleExpanded,
  onSpeciesChange,
  onOpponentUpdate,
  onEvChange,
  onIvChange,
  onBoostChange,
  onMoveChange,
  onFieldChange,
  onSelectedPokemonModifiersUpdate,
  onSelectedPokemonBoostChange,
}: Props) => {
  const { groups, viewState, setSortBy, setGroupBy, setSearchQuery } = useCalcListView(
    entries,
    selectedPokemon,
    mode,
  );

  return (
    <div className="flex-1 min-w-0">
      <h3 className="text-base text-text-heading mb-3 pb-2 border-b-2 border-primary">{title}</h3>
      <CalcListControls
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
          {group.entries.map(({ entry, result }) => (
            <CalcEntryRow
              key={entry.id}
              entry={entry}
              selectedPokemon={selectedPokemon}
              mode={mode}
              precomputedResult={result}
              onToggleExpanded={() => onToggleExpanded(entry.id)}
              onRemove={() => onRemove(entry.id)}
              onSpeciesChange={(species) => onSpeciesChange(entry.id, species)}
              onOpponentUpdate={(patch) => onOpponentUpdate(entry.id, patch)}
              onEvChange={(stat, value) => onEvChange(entry.id, stat, value)}
              onIvChange={(stat, value) => onIvChange(entry.id, stat, value)}
              onBoostChange={(stat, value) => onBoostChange(entry.id, stat, value)}
              onMoveChange={(move) => onMoveChange(entry.id, move)}
              onFieldChange={(field) => onFieldChange(entry.id, field)}
              onSelectedPokemonModifiersUpdate={(patch) => onSelectedPokemonModifiersUpdate(entry.id, patch)}
              onSelectedPokemonBoostChange={(stat, value) => onSelectedPokemonBoostChange(entry.id, stat, value)}
            />
          ))}
        </div>
      ))}
      <AddCalcInput mode={mode} onAdd={onAdd} />
    </div>
  );
};
