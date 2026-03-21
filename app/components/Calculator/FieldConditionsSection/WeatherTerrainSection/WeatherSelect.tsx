import { useFieldConditions } from '~/hooks/Calc/useFieldConditions';
import { FieldConditionSelect } from './FieldConditionSelect';

const WEATHER_OPTIONS = ['Sun', 'Rain', 'Sand', 'Snow'] as const;

export const WeatherSelect = () => {
  const { weather, setWeather } = useFieldConditions();

  return (
    <FieldConditionSelect
      label="Weather"
      options={WEATHER_OPTIONS}
      value={weather}
      onChange={setWeather}
    />
  );
};
