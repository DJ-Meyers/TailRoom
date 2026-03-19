import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { calcEntries, pokemon, speedEntries, teams } from './schema';

// --- Shared Zod schemas for JSON columns ---

export const statsTableSchema = z.object({
  hp: z.number(),
  atk: z.number(),
  def: z.number(),
  spa: z.number(),
  spd: z.number(),
  spe: z.number(),
});

const attackerSideSchema = z.object({
  helpingHand: z.boolean().optional(),
  tailwind: z.boolean().optional(),
});

const defenderSideSchema = z.object({
  reflect: z.boolean().optional(),
  lightScreen: z.boolean().optional(),
  auroraVeil: z.boolean().optional(),
  friendGuard: z.boolean().optional(),
  tailwind: z.boolean().optional(),
});

export const fieldConditionsSchema = z.object({
  weather: z.enum(['Sun', 'Rain', 'Sand', 'Snow', 'Hail']).optional(),
  terrain: z.enum(['Electric', 'Grassy', 'Psychic', 'Misty']).optional(),
  ruinAbilities: z.object({
    beads: z.boolean().optional(),
    sword: z.boolean().optional(),
    tablets: z.boolean().optional(),
    vessel: z.boolean().optional(),
  }).optional(),
  attackerSide: attackerSideSchema.optional(),
  defenderSide: defenderSideSchema.optional(),
});

export const selectedPokemonModifiersSchema = z.object({
  teraType: z.string(),
  boosts: statsTableSchema,
  status: z.string(),
  isCrit: z.boolean(),
  abilityOn: z.boolean(),
  boostedStat: z.string(),
});

// --- Drizzle-generated Zod schemas with JSON column overrides ---

const jsonOverrides = {
  evs: statsTableSchema,
  ivs: statsTableSchema,
  boosts: statsTableSchema,
};

// Teams
export const insertTeamSchema = createInsertSchema(teams);
export const selectTeamSchema = createSelectSchema(teams);

// Pokemon
export const insertPokemonSchema = createInsertSchema(pokemon, jsonOverrides);
export const selectPokemonSchema = createSelectSchema(pokemon, jsonOverrides);

// Calc entries
const calcEntryJsonOverrides = {
  opponentEvs: statsTableSchema,
  opponentIvs: statsTableSchema,
  opponentBoosts: statsTableSchema,
  fieldConditions: fieldConditionsSchema,
  selectedPokemonModifiers: selectedPokemonModifiersSchema,
};

export const insertCalcEntrySchema = createInsertSchema(
  calcEntries,
  calcEntryJsonOverrides,
);
export const selectCalcEntrySchema = createSelectSchema(
  calcEntries,
  calcEntryJsonOverrides,
);

// Speed entries
export const insertSpeedEntrySchema = createInsertSchema(
  speedEntries,
  jsonOverrides,
);
export const selectSpeedEntrySchema = createSelectSchema(
  speedEntries,
  jsonOverrides,
);
