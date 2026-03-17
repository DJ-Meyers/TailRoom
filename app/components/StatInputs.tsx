import { useMemo } from 'react';

import { Pokemon } from '@smogon/calc';

import { gen } from '~/data/gen';
import type { StatKey, StatsTable } from '~/types';
import { EV_STEP, MAX_EV_PER_STAT, MAX_TOTAL_EVS, STAT_KEYS, STAT_LABELS } from '~/types';

interface Props {
  species: string;
  nature: string;
  level: number;
  evs: StatsTable;
  ivs: StatsTable;
  boosts: StatsTable;
  hideBoosts?: boolean;
  onEvChange: (stat: StatKey, value: number) => void;
  onIvChange: (stat: StatKey, value: number) => void;
  onBoostChange: (stat: StatKey, value: number) => void;
}

const BOOSTABLE_STATS: StatKey[] = ['atk', 'def', 'spa', 'spd', 'spe'];

export const StatInputs = ({ species, nature, level, evs, ivs, boosts, hideBoosts, onEvChange, onIvChange, onBoostChange }: Props) => {
  const totalEvs = STAT_KEYS.reduce((sum, key) => sum + evs[key], 0);

  const rawStats = useMemo(() => {
    try {
      const poke = new Pokemon(gen, species, { level, nature, evs, ivs });
      return poke.rawStats;
    } catch {
      return null;
    }
  }, [species, nature, level, evs, ivs]);

  return (
    <div className="flex flex-col h-full">
      <div className="text-xs font-semibold text-text-muted mb-2 text-center">
        EVs: {totalEvs} / {MAX_TOTAL_EVS}
      </div>
      <div className="flex items-center gap-1.5 mb-1 text-[0.7rem] font-semibold text-text-dim">
        <span className="w-8" />
        <span className="w-14 text-center">EV</span>
        <span className="w-12 text-center">IV</span>
        {!hideBoosts && <span className="w-14 text-center">Boost</span>}
        <span className="w-10 text-center">Stat</span>
      </div>
      {STAT_KEYS.map((stat) => {
        const canBoost = BOOSTABLE_STATS.includes(stat);
        return (
          <div key={stat} className="flex items-center gap-1.5 mb-1 flex-1">
            <span className="w-8 text-xs font-semibold text-text-label">
              {STAT_LABELS[stat]}
            </span>
            <input
              type="number"
              min={0}
              max={MAX_EV_PER_STAT}
              step={EV_STEP}
              value={evs[stat]}
              onChange={(e) => onEvChange(stat, Number(e.target.value))}
              className="w-14 px-1 py-0.5 border border-border rounded text-xs text-center bg-surface text-text focus:outline-none focus:border-primary"
            />
            <input
              type="number"
              min={0}
              max={31}
              value={ivs[stat]}
              onChange={(e) => onIvChange(stat, Number(e.target.value))}
              className="w-12 px-1 py-0.5 border border-border rounded text-xs text-center bg-surface text-text focus:outline-none focus:border-primary"
            />
            {!hideBoosts && (canBoost ? (
              <select
                value={boosts[stat]}
                onChange={(e) => onBoostChange(stat, Number(e.target.value))}
                className="w-14 p-0.5 border border-border rounded text-xs text-center bg-surface focus:outline-none focus:border-primary"
              >
                {[-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6].map((v) => (
                  <option key={v} value={v}>
                    {v > 0 ? `+${v}` : v === 0 ? '--' : String(v)}
                  </option>
                ))}
              </select>
            ) : (
              <span className="w-14" />
            ))}
            <span className="w-10 text-xs font-semibold text-text tabular-nums text-center">
              {rawStats ? rawStats[stat] : '—'}
            </span>
          </div>
        );
      })}
    </div>
  );
};
