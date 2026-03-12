import type { SpeedGroupBy, SpeedListViewState, SpeedSortBy } from '~/hooks/useSpeedListView';

interface Props {
  viewState: SpeedListViewState;
  onSortChange: (sort: SpeedSortBy) => void;
  onGroupChange: (group: SpeedGroupBy) => void;
  onSearchChange: (query: string) => void;
}

export const SpeedListControls = ({
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
      placeholder="Filter by species..."
      className="flex-1 min-w-0 bg-surface border border-border rounded px-2 py-1 text-xs text-text placeholder:text-text-faint focus:outline-none focus:border-primary"
    />
    <select
      value={viewState.sortBy}
      onChange={(e) => onSortChange(e.target.value as SpeedSortBy)}
      className="bg-surface border border-border rounded px-2 py-1 text-xs text-text focus:outline-none focus:border-primary"
    >
      <option value="speed-desc">Speed ↓</option>
      <option value="speed-asc">Speed ↑</option>
      <option value="name-asc">Name A-Z</option>
      <option value="name-desc">Name Z-A</option>
    </select>
    <select
      value={viewState.groupBy}
      onChange={(e) => onGroupChange(e.target.value as SpeedGroupBy)}
      className="bg-surface border border-border rounded px-2 py-1 text-xs text-text focus:outline-none focus:border-primary"
    >
      <option value="tier">By Tier</option>
      <option value="none">No Group</option>
    </select>
  </div>
);
