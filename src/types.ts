export type StatKey = 'hp' | 'atk' | 'def' | 'spa' | 'spd' | 'spe';

export interface StatsTable {
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
}

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

export interface ParseResult {
  species?: string;
  move?: string;
  nature?: string;
  ability?: string;
  item?: string;
  evs?: Partial<StatsTable>;
  ivs?: Partial<StatsTable>;
  level?: number;
  teraType?: string;
  boosts?: Partial<StatsTable>;
  status?: string;
  isCrit?: boolean;
  abilityOn?: boolean;
  boostedStat?: string;
  fieldConditions?: FieldConditions;
  unmatched: string[];
}

export interface SelectedPokemonModifiers {
  teraType: string;
  boosts: StatsTable;
  status: string;
  isCrit: boolean;
  abilityOn: boolean;
  boostedStat: string;
}

export interface CalcEntry {
  id: string;
  name: string;
  notes: string;
  opponent: PokemonState;
  move: string;
  fieldConditions: FieldConditions;
  selectedPokemonModifiers: SelectedPokemonModifiers;
  isExpanded: boolean;
}

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
  weather?: 'Sun' | 'Rain' | 'Sand' | 'Snow';
  terrain?: 'Electric' | 'Grassy' | 'Psychic' | 'Misty';
}

export type SpeedTier = 'faster' | 'tie' | 'slower';

export const STAT_KEYS: StatKey[] = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];

export const STAT_LABELS: Record<StatKey, string> = {
  hp: 'HP',
  atk: 'Atk',
  def: 'Def',
  spa: 'SpA',
  spd: 'SpD',
  spe: 'Spe',
};

export const MAX_EV_PER_STAT = 252;
export const MAX_TOTAL_EVS = 510;
export const EV_STEP = 4;
