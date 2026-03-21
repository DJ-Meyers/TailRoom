import { useCallback, useContext } from "react";
import { CalcFieldConditionsContext } from "~/context/CalcFieldConditionsContext";
import type { FieldConditions } from "~/types";

export const useFieldConditions = () => {
  const { fieldConditionsState, onChange } = useContext(CalcFieldConditionsContext);

  const setWeather = useCallback(
    (weather: FieldConditions['weather']) => onChange({ weather }),
    [onChange],
  );

  const setTerrain = useCallback(
    (terrain: FieldConditions['terrain']) => onChange({ terrain }),
    [onChange],
  );

  const toggleRuin = useCallback(
    (key: 'isBeadsOfRuin' | 'isSwordOfRuin' | 'isTabletsOfRuin' | 'isVesselOfRuin') =>
      onChange({ [key]: !fieldConditionsState[key] }),
    [fieldConditionsState, onChange],
  );

  const toggleAttackerSide = useCallback(
    (key: keyof NonNullable<FieldConditions['attackerSide']>) => {
      const side = fieldConditionsState.attackerSide ?? {};
      onChange({ attackerSide: { ...side, [key]: !side[key] } });
    },
    [fieldConditionsState, onChange],
  );

  const toggleDefenderSide = useCallback(
    (key: keyof NonNullable<FieldConditions['defenderSide']>) => {
      const side = fieldConditionsState.defenderSide ?? {};
      onChange({ defenderSide: { ...side, [key]: !side[key] } });
    },
    [fieldConditionsState, onChange],
  );

  return {
    weather: fieldConditionsState.weather,
    terrain: fieldConditionsState.terrain,
    isBeadsOfRuin: !!fieldConditionsState.isBeadsOfRuin,
    isSwordOfRuin: !!fieldConditionsState.isSwordOfRuin,
    isTabletsOfRuin: !!fieldConditionsState.isTabletsOfRuin,
    isVesselOfRuin: !!fieldConditionsState.isVesselOfRuin,
    attackerSide: fieldConditionsState.attackerSide ?? {},
    defenderSide: fieldConditionsState.defenderSide ?? {},
    setWeather,
    setTerrain,
    toggleRuin,
    toggleAttackerSide,
    toggleDefenderSide,
  };
};
