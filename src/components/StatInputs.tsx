import type { StatKey,StatsTable } from '~/types';
import { EV_STEP, MAX_EV_PER_STAT, MAX_TOTAL_EVS,STAT_KEYS, STAT_LABELS } from '~/types';

interface Props {
  evs: StatsTable;
  ivs: StatsTable;
  boosts: StatsTable;
  onEvChange: (stat: StatKey, value: number) => void;
  onIvChange: (stat: StatKey, value: number) => void;
  onBoostChange: (stat: StatKey, value: number) => void;
}

const BOOSTABLE_STATS: StatKey[] = ['atk', 'def', 'spa', 'spd', 'spe'];

export const StatInputs = ({ evs, ivs, boosts, onEvChange, onIvChange, onBoostChange }: Props) => {
  const totalEvs = STAT_KEYS.reduce((sum, key) => sum + evs[key], 0);
  const remaining = MAX_TOTAL_EVS - totalEvs;

  return (
    <div className="stat-inputs">
      <div className="ev-total">
        EVs: {totalEvs} / {MAX_TOTAL_EVS}
      </div>
      <div className="stat-header-row">
        <span className="stat-label" />
        <span className="header-ev">EV</span>
        <span className="header-ev-val" />
        <span className="header-iv">IV</span>
        <span className="header-boost">Boost</span>
      </div>
      {STAT_KEYS.map((stat) => {
        const maxForThisStat = Math.min(
          MAX_EV_PER_STAT,
          evs[stat] + remaining
        );
        const canBoost = BOOSTABLE_STATS.includes(stat);
        return (
          <div key={stat} className="stat-row">
            <span className="stat-label">{STAT_LABELS[stat]}</span>
            <input
              type="range"
              min={0}
              max={maxForThisStat}
              step={EV_STEP}
              value={evs[stat]}
              onChange={(e) => onEvChange(stat, Number(e.target.value))}
              className="ev-slider"
            />
            <span className="ev-value">{evs[stat]}</span>
            <input
              type="number"
              min={0}
              max={31}
              value={ivs[stat]}
              onChange={(e) => onIvChange(stat, Number(e.target.value))}
              className="iv-input"
            />
            {canBoost ? (
              <select
                value={boosts[stat]}
                onChange={(e) => onBoostChange(stat, Number(e.target.value))}
                className="boost-select"
              >
                {[-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6].map((v) => (
                  <option key={v} value={v}>
                    {v > 0 ? `+${v}` : v === 0 ? '--' : String(v)}
                  </option>
                ))}
              </select>
            ) : (
              <span className="boost-select" />
            )}
          </div>
        );
      })}
    </div>
  );
};
