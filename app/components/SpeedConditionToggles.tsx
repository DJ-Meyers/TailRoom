import type { SpeedConditions } from '~/types';

const WEATHER_OPTIONS: SpeedConditions['weather'][] = ['Sun', 'Rain', 'Sand', 'Snow'];
const TERRAIN_OPTIONS: SpeedConditions['terrain'][] = ['Electric', 'Grassy', 'Psychic', 'Misty'];

interface Props {
  conditions: SpeedConditions;
  onChange: (conditions: SpeedConditions) => void;
}

export const SpeedConditionToggles = ({ conditions, onChange }: Props) => (
  <div className="flex flex-wrap items-center gap-2 mb-2">
    <label className="text-xs cursor-pointer flex items-center gap-1 whitespace-nowrap">
      <input
        type="checkbox"
        checked={conditions.yourTailwind}
        onChange={() => onChange({ ...conditions, yourTailwind: !conditions.yourTailwind })}
        className="w-auto"
      />
      Your Tailwind
    </label>
    <label className="text-xs cursor-pointer flex items-center gap-1 whitespace-nowrap">
      <input
        type="checkbox"
        checked={conditions.enemyTailwind}
        onChange={() => onChange({ ...conditions, enemyTailwind: !conditions.enemyTailwind })}
        className="w-auto"
      />
      Enemy Tailwind
    </label>
    <select
      value={conditions.weather ?? ''}
      onChange={(e) =>
        onChange({ ...conditions, weather: (e.target.value || undefined) as SpeedConditions['weather'] })
      }
      className="bg-surface border border-border rounded px-1 py-0.5 text-xs text-text focus:outline-none focus:border-primary"
    >
      <option value="">Weather</option>
      {WEATHER_OPTIONS.map((w) => (
        <option key={w} value={w}>{w}</option>
      ))}
    </select>
    <select
      value={conditions.terrain ?? ''}
      onChange={(e) =>
        onChange({ ...conditions, terrain: (e.target.value || undefined) as SpeedConditions['terrain'] })
      }
      className="bg-surface border border-border rounded px-1 py-0.5 text-xs text-text focus:outline-none focus:border-primary"
    >
      <option value="">Terrain</option>
      {TERRAIN_OPTIONS.map((t) => (
        <option key={t} value={t}>{t}</option>
      ))}
    </select>
  </div>
);
