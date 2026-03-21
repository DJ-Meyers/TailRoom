import { WeatherSelect } from './WeatherSelect';
import { TerrainSelect } from './TerrainSelect';

export const WeatherTerrainSection = () => {
  return (
    <div className="flex flex-wrap gap-2">
      <WeatherSelect />
      <TerrainSelect />
    </div>
  );
};
