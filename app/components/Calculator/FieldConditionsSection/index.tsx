import { AttackerSideSection } from './AttackerSideSection';
import { DefenderSideSection } from './DefenderSideSection';
import { RuinAbilitiesSection } from './RuinAbilitiesSection';
import { WeatherTerrainSection } from './WeatherTerrainSection';

export const FieldConditionsSection = () => {
  return (
    <div className="py-2 my-2 border-y border-border-section flex flex-col gap-1.5">
      <WeatherTerrainSection />
      <div className="flex flex-wrap gap-2">
        <RuinAbilitiesSection />
      </div>
      <div className="flex flex-wrap gap-2">
        <AttackerSideSection />
        <DefenderSideSection />
      </div>
    </div>
  );
};
