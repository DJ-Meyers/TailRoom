import { useFieldConditions } from '~/hooks/Calc/useFieldConditions';
import type { FieldConditions } from '~/types';

const TERRAIN_OPTIONS: FieldConditions['terrain'][] = ['Electric', 'Grassy', 'Psychic', 'Misty'];

export const TerrainSelect = () => {
  const { terrain, setTerrain } = useFieldConditions();
  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setTerrain((e.target.value || undefined) as FieldConditions['terrain']);

  return (
    <label className="flex flex-col min-w-[100px]">
      <span className="text-[0.7rem] font-semibold text-text-dim mb-0.5">Terrain</span>
      <select
        value={terrain ?? ''}
        onChange={onChange}
        className="px-1 py-0.5 border border-border rounded text-xs bg-surface focus:outline-none focus:border-primary"
      >
        <option value="">(none)</option>
        {TERRAIN_OPTIONS.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
    </label>
  );
};
