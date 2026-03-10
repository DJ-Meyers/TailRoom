import type { FieldConditions } from '~/types';

const WEATHER_OPTIONS: FieldConditions['weather'][] = ['Sun', 'Rain', 'Sand', 'Snow', 'Hail'];
const TERRAIN_OPTIONS: FieldConditions['terrain'][] = ['Electric', 'Grassy', 'Psychic', 'Misty'];

interface Props {
  field: FieldConditions;
  idPrefix: string;
  onChange: (field: FieldConditions) => void;
}

export const FieldConditionInputs = ({ field, idPrefix, onChange }: Props) => {
  const setWeather = (weather: string) => {
    onChange({ ...field, weather: (weather || undefined) as FieldConditions['weather'] });
  };

  const setTerrain = (terrain: string) => {
    onChange({ ...field, terrain: (terrain || undefined) as FieldConditions['terrain'] });
  };

  const toggleRuin = (key: 'isBeadsOfRuin' | 'isSwordOfRuin' | 'isTabletsOfRuin' | 'isVesselOfRuin') => {
    onChange({ ...field, [key]: !field[key] });
  };

  const toggleAttackerSide = (key: keyof NonNullable<FieldConditions['attackerSide']>) => {
    const side = field.attackerSide ?? {};
    onChange({ ...field, attackerSide: { ...side, [key]: !side[key] } });
  };

  const toggleDefenderSide = (key: keyof NonNullable<FieldConditions['defenderSide']>) => {
    const side = field.defenderSide ?? {};
    onChange({ ...field, defenderSide: { ...side, [key]: !side[key] } });
  };

  return (
    <div className="pt-2 mt-2 border-t border-border-section flex flex-col gap-1.5">
      <div className="flex flex-wrap gap-2">
        <div className="flex flex-col min-w-[100px]">
          <label htmlFor={`${idPrefix}-weather`} className="text-[0.7rem] font-semibold text-text-dim mb-0.5">Weather</label>
          <select
            id={`${idPrefix}-weather`}
            value={field.weather ?? ''}
            onChange={(e) => setWeather(e.target.value)}
            className="px-1 py-0.5 border border-border rounded text-xs bg-surface focus:outline-none focus:border-primary"
          >
            <option value="">(none)</option>
            {WEATHER_OPTIONS.map((w) => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col min-w-[100px]">
          <label htmlFor={`${idPrefix}-terrain`} className="text-[0.7rem] font-semibold text-text-dim mb-0.5">Terrain</label>
          <select
            id={`${idPrefix}-terrain`}
            value={field.terrain ?? ''}
            onChange={(e) => setTerrain(e.target.value)}
            className="px-1 py-0.5 border border-border rounded text-xs bg-surface focus:outline-none focus:border-primary"
          >
            <option value="">(none)</option>
            {TERRAIN_OPTIONS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <fieldset className="border border-border-section rounded px-2 pt-1 pb-1.5 flex flex-wrap gap-x-2.5 gap-y-1">
          <legend className="text-[0.7rem] font-semibold text-text-dim px-1">Ruin Abilities</legend>
          <label className="text-xs cursor-pointer flex items-center gap-1 whitespace-nowrap"><input type="checkbox" checked={!!field.isBeadsOfRuin} onChange={() => toggleRuin('isBeadsOfRuin')} className="w-auto" /> Beads</label>
          <label className="text-xs cursor-pointer flex items-center gap-1 whitespace-nowrap"><input type="checkbox" checked={!!field.isSwordOfRuin} onChange={() => toggleRuin('isSwordOfRuin')} className="w-auto" /> Sword</label>
          <label className="text-xs cursor-pointer flex items-center gap-1 whitespace-nowrap"><input type="checkbox" checked={!!field.isTabletsOfRuin} onChange={() => toggleRuin('isTabletsOfRuin')} className="w-auto" /> Tablets</label>
          <label className="text-xs cursor-pointer flex items-center gap-1 whitespace-nowrap"><input type="checkbox" checked={!!field.isVesselOfRuin} onChange={() => toggleRuin('isVesselOfRuin')} className="w-auto" /> Vessel</label>
        </fieldset>
      </div>
      <div className="flex flex-wrap gap-2">
        <fieldset className="border border-border-section rounded px-2 pt-1 pb-1.5 flex flex-wrap gap-x-2.5 gap-y-1">
          <legend className="text-[0.7rem] font-semibold text-text-dim px-1">Attacker Side</legend>
          <label className="text-xs cursor-pointer flex items-center gap-1 whitespace-nowrap"><input type="checkbox" checked={!!field.attackerSide?.isHelpingHand} onChange={() => toggleAttackerSide('isHelpingHand')} className="w-auto" /> Helping Hand</label>
          <label className="text-xs cursor-pointer flex items-center gap-1 whitespace-nowrap"><input type="checkbox" checked={!!field.attackerSide?.isTailwind} onChange={() => toggleAttackerSide('isTailwind')} className="w-auto" /> Tailwind</label>
        </fieldset>
        <fieldset className="border border-border-section rounded px-2 pt-1 pb-1.5 flex flex-wrap gap-x-2.5 gap-y-1">
          <legend className="text-[0.7rem] font-semibold text-text-dim px-1">Defender Side</legend>
          <label className="text-xs cursor-pointer flex items-center gap-1 whitespace-nowrap"><input type="checkbox" checked={!!field.defenderSide?.isReflect} onChange={() => toggleDefenderSide('isReflect')} className="w-auto" /> Reflect</label>
          <label className="text-xs cursor-pointer flex items-center gap-1 whitespace-nowrap"><input type="checkbox" checked={!!field.defenderSide?.isLightScreen} onChange={() => toggleDefenderSide('isLightScreen')} className="w-auto" /> Light Screen</label>
          <label className="text-xs cursor-pointer flex items-center gap-1 whitespace-nowrap"><input type="checkbox" checked={!!field.defenderSide?.isAuroraVeil} onChange={() => toggleDefenderSide('isAuroraVeil')} className="w-auto" /> Aurora Veil</label>
          <label className="text-xs cursor-pointer flex items-center gap-1 whitespace-nowrap"><input type="checkbox" checked={!!field.defenderSide?.isFriendGuard} onChange={() => toggleDefenderSide('isFriendGuard')} className="w-auto" /> Friend Guard</label>
          <label className="text-xs cursor-pointer flex items-center gap-1 whitespace-nowrap"><input type="checkbox" checked={!!field.defenderSide?.isTailwind} onChange={() => toggleDefenderSide('isTailwind')} className="w-auto" /> Tailwind</label>
        </fieldset>
      </div>
    </div>
  );
};
