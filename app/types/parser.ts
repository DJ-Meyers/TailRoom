import type { StatsTable } from './stats';
import type { FieldConditions } from './field-conditions';

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
