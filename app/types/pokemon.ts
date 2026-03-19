import type { StatsTable } from './stats';

export interface PokemonState {
  species: string;
  level: number;
  nature: string;
  ability: string;
  item: string;
  evs: StatsTable;
  ivs: StatsTable;
  move: string;
  teraType: string;
  boosts: StatsTable;
  status: string;
  isCrit: boolean;
  abilityOn: boolean;
  boostedStat: string;
}

export interface SelectedPokemonModifiers {
  teraType: string;
  boosts: StatsTable;
  status: string;
  isCrit: boolean;
  abilityOn: boolean;
  boostedStat: string;
}
