export interface FieldConditions {
  weather?: 'Sun' | 'Rain' | 'Sand' | 'Snow' | 'Hail';
  terrain?: 'Electric' | 'Grassy' | 'Psychic' | 'Misty';
  ruinAbilities?: {
    beads?: boolean;
    sword?: boolean;
    tablets?: boolean;
    vessel?: boolean;
  };
  attackerSide?: {
    helpingHand?: boolean;
    tailwind?: boolean;
  };
  defenderSide?: {
    reflect?: boolean;
    lightScreen?: boolean;
    auroraVeil?: boolean;
    friendGuard?: boolean;
    tailwind?: boolean;
  };
}
