import type {
  CalcEntry,
  FieldConditions,
  PokemonState,
  SelectedPokemonModifiers,
  SpeedEntry,
  StatsTable,
} from '~/types';
import { createDefaultPokemonState, defaultSelectedPokemonModifiers } from '~/utils/pokemonState';

// ---- DB row types (inferred from select queries) ----

type DbCalcEntry = {
  id: string;
  pokemonId: string;
  mode: string;
  sortOrder: number;
  name: string;
  notes: string;
  move: string;
  opponentSpecies: string;
  opponentNature: string;
  opponentAbility: string;
  opponentItem: string;
  opponentMove: string;
  opponentTeraType: string;
  opponentStatus: string;
  opponentBoostedStat: string;
  opponentLevel: number;
  opponentEvs: unknown;
  opponentIvs: unknown;
  opponentBoosts: unknown;
  opponentIsCrit: boolean;
  opponentAbilityOn: boolean;
  fieldConditions: unknown;
  selectedPokemonModifiers: unknown;
};

type DbSpeedEntry = {
  id: string;
  pokemonId: string;
  sortOrder: number;
  name: string;
  notes: string;
  species: string;
  nature: string;
  ability: string;
  item: string;
  teraType: string;
  status: string;
  boostedStat: string;
  level: number;
  evs: unknown;
  ivs: unknown;
  boosts: unknown;
  abilityOn: boolean;
};

type DbPokemon = {
  id: string;
  userId: string;
  name: string;
  notes: string;
  species: string;
  nature: string;
  ability: string;
  item: string;
  move: string;
  teraType: string;
  status: string;
  boostedStat: string;
  level: number;
  evs: unknown;
  ivs: unknown;
  boosts: unknown;
  isCrit: boolean;
  abilityOn: boolean;
};

// ---- Helpers ----

const asStatsTable = (val: unknown): StatsTable =>
  val as StatsTable;

const asFieldConditions = (val: unknown): FieldConditions =>
  (val ?? {}) as FieldConditions;

const asSelectedPokemonModifiers = (val: unknown): SelectedPokemonModifiers =>
  (val ?? defaultSelectedPokemonModifiers()) as SelectedPokemonModifiers;

// ---- DB → Client ----

export const dbCalcEntryToCalcEntry = (row: DbCalcEntry): CalcEntry => ({
  id: row.id,
  name: row.name,
  notes: row.notes,
  move: row.move,
  opponent: createDefaultPokemonState(row.opponentSpecies, row.opponentMove, {
    nature: row.opponentNature,
    ability: row.opponentAbility,
    item: row.opponentItem,
    teraType: row.opponentTeraType,
    status: row.opponentStatus,
    boostedStat: row.opponentBoostedStat,
    level: row.opponentLevel,
    evs: asStatsTable(row.opponentEvs),
    ivs: asStatsTable(row.opponentIvs),
    boosts: asStatsTable(row.opponentBoosts),
    isCrit: row.opponentIsCrit,
    abilityOn: row.opponentAbilityOn,
  }),
  fieldConditions: asFieldConditions(row.fieldConditions),
  selectedPokemonModifiers: asSelectedPokemonModifiers(row.selectedPokemonModifiers),
  isExpanded: false,
});

export const dbSpeedEntryToSpeedEntry = (row: DbSpeedEntry): SpeedEntry => ({
  id: row.id,
  name: row.name,
  notes: row.notes,
  pokemon: createDefaultPokemonState(row.species, '', {
    nature: row.nature,
    ability: row.ability,
    item: row.item,
    teraType: row.teraType,
    status: row.status,
    boostedStat: row.boostedStat,
    level: row.level,
    evs: asStatsTable(row.evs),
    ivs: asStatsTable(row.ivs),
    boosts: asStatsTable(row.boosts),
    abilityOn: row.abilityOn,
  }),
  isExpanded: false,
  tailwind: false,
});

export const dbPokemonToPokemonState = (row: DbPokemon): PokemonState =>
  createDefaultPokemonState(row.species, row.move, {
    nature: row.nature,
    ability: row.ability,
    item: row.item,
    teraType: row.teraType,
    status: row.status,
    boostedStat: row.boostedStat,
    level: row.level,
    evs: asStatsTable(row.evs),
    ivs: asStatsTable(row.ivs),
    boosts: asStatsTable(row.boosts),
    isCrit: row.isCrit,
    abilityOn: row.abilityOn,
  });

// ---- Client → DB (for mutations) ----

export const calcEntryToDbInput = (
  entry: CalcEntry,
  pokemonId: string,
  mode: 'offensive' | 'defensive',
  sortOrder: number,
) => ({
  pokemonId,
  mode,
  sortOrder,
  name: entry.name,
  notes: entry.notes,
  move: entry.move,
  opponentSpecies: entry.opponent.species,
  opponentNature: entry.opponent.nature,
  opponentAbility: entry.opponent.ability,
  opponentItem: entry.opponent.item,
  opponentMove: entry.opponent.move,
  opponentTeraType: entry.opponent.teraType,
  opponentStatus: entry.opponent.status,
  opponentBoostedStat: entry.opponent.boostedStat,
  opponentLevel: entry.opponent.level,
  opponentEvs: entry.opponent.evs,
  opponentIvs: entry.opponent.ivs,
  opponentBoosts: entry.opponent.boosts,
  opponentIsCrit: entry.opponent.isCrit,
  opponentAbilityOn: entry.opponent.abilityOn,
  fieldConditions: entry.fieldConditions,
  selectedPokemonModifiers: entry.selectedPokemonModifiers,
});

export const speedEntryToDbInput = (
  entry: SpeedEntry,
  pokemonId: string,
  sortOrder: number,
) => ({
  pokemonId,
  sortOrder,
  name: entry.name,
  notes: entry.notes,
  species: entry.pokemon.species,
  nature: entry.pokemon.nature,
  ability: entry.pokemon.ability,
  item: entry.pokemon.item,
  teraType: entry.pokemon.teraType,
  status: entry.pokemon.status,
  boostedStat: entry.pokemon.boostedStat,
  level: entry.pokemon.level,
  evs: entry.pokemon.evs,
  ivs: entry.pokemon.ivs,
  boosts: entry.pokemon.boosts,
  abilityOn: entry.pokemon.abilityOn,
});

export const pokemonStateToDbInput = (state: PokemonState) => ({
  species: state.species,
  nature: state.nature,
  ability: state.ability,
  item: state.item,
  move: state.move,
  teraType: state.teraType,
  status: state.status,
  boostedStat: state.boostedStat,
  level: state.level,
  evs: state.evs,
  ivs: state.ivs,
  boosts: state.boosts,
  isCrit: state.isCrit,
  abilityOn: state.abilityOn,
});
