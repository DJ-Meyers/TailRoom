import type { PokemonState } from './pokemon';

export type SpeedTier = 'faster' | 'tie' | 'slower';

export interface SpeedEntry {
  id: string;
  name: string;
  notes: string;
  pokemon: PokemonState;
  isExpanded: boolean;
  tailwind: boolean;
}

export interface SpeedConditions {
  yourTailwind: boolean;
  yourBoost: number;
  weather?: 'Sun' | 'Rain' | 'Sand' | 'Snow' | 'Hail';
  terrain?: 'Electric' | 'Grassy' | 'Psychic' | 'Misty';
}
