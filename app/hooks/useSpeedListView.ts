import { useMemo, useState } from 'react';

import type { PokemonState, SpeedConditions, SpeedEntry, SpeedTier } from '~/types';
import { computeEffectiveSpeed } from '~/utils/calcSpeed';

export type SpeedSortBy = 'speed-desc' | 'speed-asc' | 'name-asc' | 'name-desc';
export type SpeedGroupBy = 'none' | 'tier';

export interface EnrichedSpeedEntry {
  entry: SpeedEntry;
  speed: number;
  tier: SpeedTier;
}

export interface SpeedListGroup {
  label: string;
  entries: EnrichedSpeedEntry[];
}

export interface SpeedListViewState {
  sortBy: SpeedSortBy;
  groupBy: SpeedGroupBy;
  searchQuery: string;
}

const TIER_LABELS: Record<SpeedTier, string> = {
  faster: 'Faster',
  tie: 'Speed Tie',
  slower: 'Slower',
};

export const useSpeedListView = (
  entries: SpeedEntry[],
  selectedPokemon: PokemonState,
  conditions: SpeedConditions,
) => {
  const [sortBy, setSortBy] = useState<SpeedSortBy>('speed-desc');
  const [groupBy, setGroupBy] = useState<SpeedGroupBy>('tier');
  const [searchQuery, setSearchQuery] = useState('');

  // Your Pokemon's effective speed
  const yourSpeed = useMemo(
    () => computeEffectiveSpeed(selectedPokemon, conditions, true),
    [selectedPokemon, conditions],
  );

  // 1. Enrich — compute speed and classify tier
  const enriched = useMemo(() => {
    return entries.map((entry): EnrichedSpeedEntry => {
      const speed = computeEffectiveSpeed(entry.pokemon, conditions, false);
      const tier: SpeedTier =
        speed > yourSpeed ? 'faster' : speed === yourSpeed ? 'tie' : 'slower';
      return { entry, speed, tier };
    });
  }, [entries, conditions, yourSpeed]);

  // 2. Filter
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return enriched;
    const q = searchQuery.toLowerCase();
    return enriched.filter((e) =>
      e.entry.pokemon.species.toLowerCase().includes(q) ||
      e.entry.name.toLowerCase().includes(q),
    );
  }, [enriched, searchQuery]);

  // 3. Sort
  const sorted = useMemo(() => {
    const arr = [...filtered];
    switch (sortBy) {
      case 'speed-desc':
        arr.sort((a, b) => b.speed - a.speed);
        break;
      case 'speed-asc':
        arr.sort((a, b) => a.speed - b.speed);
        break;
      case 'name-asc':
        arr.sort((a, b) => a.entry.pokemon.species.localeCompare(b.entry.pokemon.species));
        break;
      case 'name-desc':
        arr.sort((a, b) => b.entry.pokemon.species.localeCompare(a.entry.pokemon.species));
        break;
    }
    return arr;
  }, [filtered, sortBy]);

  // 4. Group
  const groups = useMemo((): SpeedListGroup[] => {
    if (groupBy === 'none') {
      return [{ label: '', entries: sorted }];
    }

    // Group by tier: Faster, Speed Tie, Slower
    const tiers: SpeedTier[] = ['faster', 'tie', 'slower'];
    const buckets = new Map<SpeedTier, EnrichedSpeedEntry[]>();
    for (const e of sorted) {
      let bucket = buckets.get(e.tier);
      if (!bucket) {
        bucket = [];
        buckets.set(e.tier, bucket);
      }
      bucket.push(e);
    }

    return tiers
      .filter((t) => buckets.has(t))
      .map((t) => ({ label: TIER_LABELS[t], entries: buckets.get(t)! }));
  }, [sorted, groupBy]);

  return {
    groups,
    yourSpeed,
    viewState: { sortBy, groupBy, searchQuery } as SpeedListViewState,
    setSortBy,
    setGroupBy,
    setSearchQuery,
  };
};
