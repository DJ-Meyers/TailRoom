import type { PokemonState } from './pokemon';

export type SpeedTier = 'faster' | 'tie' | 'slower';

export interface SpeedEntry {
  id: string;
  name: string;
  notes: string;
  pokemon: PokemonState;
  isExpanded: boolean;
}

export interface SpeedConditions {
  yourTailwind: boolean;
  enemyTailwind: boolean;
  weather?: 'Sun' | 'Rain' | 'Sand' | 'Snow' | 'Hail';
  terrain?: 'Electric' | 'Grassy' | 'Psychic' | 'Misty';
}
