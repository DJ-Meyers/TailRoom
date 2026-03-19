import { createContext } from "react";

export interface FieldConditions {
  weather?: 'Sun' | 'Rain' | 'Sand' | 'Snow' | 'Hail';
  terrain?: 'Electric' | 'Grassy' | 'Psychic' | 'Misty';
  isBeadsOfRuin?: boolean;
  isSwordOfRuin?: boolean;
  isTabletsOfRuin?: boolean;
  isVesselOfRuin?: boolean;
  attackerSide?: {
    isHelpingHand?: boolean;
    isTailwind?: boolean;
  };
  defenderSide?: {
    isReflect?: boolean;
    isLightScreen?: boolean;
    isAuroraVeil?: boolean;
    isFriendGuard?: boolean;
    isTailwind?: boolean;
  };
}

interface CalcFieldConditionsContextValue {
  fieldConditionsState: FieldConditions;
  onChange: (patch: Partial<FieldConditions>) => void;
}

const CalcFieldConditionsContext = createContext<CalcFieldConditionsContextValue>({
  fieldConditionsState: {},
  onChange: () => {},
});

const CalcFieldConditionsProvider = CalcFieldConditionsContext.Provider;

export { CalcFieldConditionsContext, CalcFieldConditionsProvider };
export type { CalcFieldConditionsContextValue };
