import { useFieldConditions } from '~/hooks/Calc/useFieldConditions';
import type { FieldConditions } from '~/types';

const WEATHER_OPTIONS: FieldConditions['weather'][] = ['Sun', 'Rain', 'Sand', 'Snow'];

export const WeatherSelect = () => {
  const { weather, setWeather } = useFieldConditions();
  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setWeather((e.target.value || undefined) as FieldConditions['weather']);

  return (
    <label className="flex flex-col min-w-[100px]">
      <span className="text-[0.7rem] font-semibold text-text-dim mb-0.5">Weather</span>
      <select
        value={weather ?? ''}
        onChange={onChange}
        className="px-1 py-0.5 border border-border rounded text-xs bg-surface focus:outline-none focus:border-primary"
      >
        <option value="">(none)</option>
        {WEATHER_OPTIONS.map((w) => (
          <option key={w} value={w}>{w}</option>
        ))}
      </select>
    </label>
  );
};
