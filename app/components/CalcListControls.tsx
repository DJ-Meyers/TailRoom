import type { CalcListViewState, GroupBy, SortBy } from '~/hooks/useCalcListView';

interface Props {
  viewState: CalcListViewState;
  onSortChange: (sort: SortBy) => void;
  onGroupChange: (group: GroupBy) => void;
  onSearchChange: (query: string) => void;
}

export const CalcListControls = ({
  viewState,
  onSortChange,
  onGroupChange,
  onSearchChange,
}: Props) => (
  <div className="flex items-center gap-2 mb-2">
    <input
      type="text"
      value={viewState.searchQuery}
      onChange={(e) => onSearchChange(e.target.value)}
      placeholder="Filter by species, move, or item..."
      className="flex-1 min-w-0 bg-surface border border-border rounded px-2 py-1 text-xs text-text placeholder:text-text-faint focus:outline-none focus:border-primary"
    />
    <select
      value={viewState.sortBy}
      onChange={(e) => onSortChange(e.target.value as SortBy)}
      className="bg-surface border border-border rounded px-2 py-1 text-xs text-text focus:outline-none focus:border-primary"
    >
      <option value="none">Sort</option>
      <option value="damage-desc">Damage ↓</option>
      <option value="damage-asc">Damage ↑</option>
      <option value="name-asc">Name A-Z</option>
      <option value="name-desc">Name Z-A</option>
    </select>
    <select
      value={viewState.groupBy}
      onChange={(e) => onGroupChange(e.target.value as GroupBy)}
      className="bg-surface border border-border rounded px-2 py-1 text-xs text-text focus:outline-none focus:border-primary"
    >
      <option value="none">Group</option>
      <option value="species">Species</option>
      <option value="ko-tier">KO Tier</option>
    </select>
  </div>
);
