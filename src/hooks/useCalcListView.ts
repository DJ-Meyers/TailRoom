import { useMemo, useState } from 'react';

import type { CalcEntry, PokemonState } from '~/types';
import {
  classifyKoTier,
  computeDamage,
  type DamageCalcResult,
  type KoTier,
  KO_TIER_LABELS_DEFENSIVE,
  KO_TIER_LABELS_OFFENSIVE,
} from '~/utils/calcDamage';

export type SortBy = 'none' | 'damage-desc' | 'damage-asc' | 'name-asc' | 'name-desc';
export type GroupBy = 'none' | 'species' | 'ko-tier';

export interface EnrichedEntry {
  entry: CalcEntry;
  result: DamageCalcResult | null;
  damagePercent: number;
  koTier: KoTier;
}

export interface CalcListGroup {
  label: string;
  entries: EnrichedEntry[];
}

export interface CalcListViewState {
  sortBy: SortBy;
  groupBy: GroupBy;
  searchQuery: string;
}

export const useCalcListView = (
  entries: CalcEntry[],
  selectedPokemon: PokemonState,
  mode: 'offensive' | 'defensive',
) => {
  const [sortBy, setSortBy] = useState<SortBy>('none');
  const [groupBy, setGroupBy] = useState<GroupBy>('none');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Enrich — compute damage results for each entry
  const enriched = useMemo(() => {
    return entries.map((entry): EnrichedEntry => {
      const selectedWithMods = { ...selectedPokemon, ...entry.selectedPokemonModifiers };
      const attacker = mode === 'offensive' ? selectedWithMods : entry.opponent;
      const defender = mode === 'offensive' ? entry.opponent : selectedWithMods;
      const result = computeDamage(attacker, defender, entry.move, entry.fieldConditions);
      const defenderMaxHp = result?.defenderMaxHp ?? 1;
      const damagePercent = result ? (result.range[1] / defenderMaxHp) * 100 : 0;
      const koTier = classifyKoTier(result);
      return { entry, result, damagePercent, koTier };
    });
  }, [entries, selectedPokemon, mode]);

  // 2. Filter — case-insensitive substring match
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return enriched;
    const q = searchQuery.toLowerCase();
    return enriched.filter((e) => {
      const { opponent } = e.entry;
      return (
        opponent.species.toLowerCase().includes(q) ||
        e.entry.move.toLowerCase().includes(q) ||
        opponent.item.toLowerCase().includes(q) ||
        e.entry.name.toLowerCase().includes(q)
      );
    });
  }, [enriched, searchQuery]);

  // 3. Sort
  const sorted = useMemo(() => {
    if (sortBy === 'none') return filtered;
    const arr = [...filtered];
    switch (sortBy) {
      case 'damage-desc':
        arr.sort((a, b) => b.damagePercent - a.damagePercent);
        break;
      case 'damage-asc':
        arr.sort((a, b) => a.damagePercent - b.damagePercent);
        break;
      case 'name-asc':
        arr.sort((a, b) => a.entry.opponent.species.localeCompare(b.entry.opponent.species));
        break;
      case 'name-desc':
        arr.sort((a, b) => b.entry.opponent.species.localeCompare(a.entry.opponent.species));
        break;
    }
    return arr;
  }, [filtered, sortBy]);

  // 4. Group
  const groups = useMemo((): CalcListGroup[] => {
    if (groupBy === 'none') {
      return [{ label: '', entries: sorted }];
    }

    if (groupBy === 'species') {
      const map = new Map<string, EnrichedEntry[]>();
      for (const e of sorted) {
        const key = e.entry.opponent.species || 'Unknown';
        let group = map.get(key);
        if (!group) {
          group = [];
          map.set(key, group);
        }
        group.push(e);
      }
      return Array.from(map, ([label, entries]) => ({ label, entries }));
    }

    // ko-tier grouping
    const tierLabels = mode === 'offensive' ? KO_TIER_LABELS_OFFENSIVE : KO_TIER_LABELS_DEFENSIVE;
    const tiers: KoTier[] = mode === 'defensive'
      ? [4, 3, 2, 1, 0, 5] // defensive: survivability first
      : [0, 1, 2, 3, 4, 5]; // offensive: kill potential first

    const buckets = new Map<KoTier, EnrichedEntry[]>();
    for (const e of sorted) {
      let bucket = buckets.get(e.koTier);
      if (!bucket) {
        bucket = [];
        buckets.set(e.koTier, bucket);
      }
      bucket.push(e);
    }

    return tiers
      .filter((t) => buckets.has(t))
      .map((t) => ({ label: tierLabels[t], entries: buckets.get(t)! }));
  }, [sorted, groupBy, mode]);

  return {
    groups,
    viewState: { sortBy, groupBy, searchQuery } as CalcListViewState,
    setSortBy,
    setGroupBy,
    setSearchQuery,
  };
};
