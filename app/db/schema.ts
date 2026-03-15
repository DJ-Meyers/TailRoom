import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const teams = pgTable(
  'teams',
  {
    id: uuid().defaultRandom().primaryKey(),
    userId: text().notNull(),
    name: varchar({ length: 24 }).notNull(),
    slug: text().notNull(),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp({ withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index('teams_user_id_idx').on(t.userId),
    unique('teams_user_id_slug_unique').on(t.userId, t.slug),
  ],
);

export const pokemon = pgTable(
  'pokemon',
  {
    id: uuid().defaultRandom().primaryKey(),
    userId: text().notNull(),
    name: text().notNull().default(''),
    notes: text().notNull().default(''),
    species: text().notNull().default(''),
    nature: text().notNull().default('Hardy'),
    ability: text().notNull().default(''),
    item: text().notNull().default(''),
    move: text().notNull().default(''),
    teraType: text().notNull().default(''),
    status: text().notNull().default('Healthy'),
    boostedStat: text().notNull().default(''),
    level: integer().notNull().default(50),
    evs: jsonb()
      .notNull()
      .default({ hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }),
    ivs: jsonb()
      .notNull()
      .default({ hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 }),
    boosts: jsonb()
      .notNull()
      .default({ hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }),
    isCrit: boolean().notNull().default(false),
    abilityOn: boolean().notNull().default(false),
    slug: text().notNull().default(''),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp({ withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [index('pokemon_user_id_idx').on(t.userId)],
);

export const teamPokemon = pgTable(
  'team_pokemon',
  {
    teamId: uuid()
      .notNull()
      .references(() => teams.id, { onDelete: 'cascade' }),
    pokemonId: uuid()
      .notNull()
      .references(() => pokemon.id, { onDelete: 'cascade' }),
    slot: integer().notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.teamId, t.pokemonId] }),
    unique('team_pokemon_team_slot_unique').on(t.teamId, t.slot),
  ],
);

export const calcEntries = pgTable('calc_entries', {
  id: uuid().defaultRandom().primaryKey(),
  pokemonId: uuid()
    .notNull()
    .references(() => pokemon.id, { onDelete: 'cascade' }),
  mode: text().notNull().default('offensive'),
  sortOrder: integer().notNull().default(0),
  name: text().notNull().default(''),
  notes: text().notNull().default(''),
  move: text().notNull().default(''),

  // Opponent fields (flattened PokemonState)
  opponentSpecies: text().notNull().default(''),
  opponentNature: text().notNull().default('Hardy'),
  opponentAbility: text().notNull().default(''),
  opponentItem: text().notNull().default(''),
  opponentMove: text().notNull().default(''),
  opponentTeraType: text().notNull().default(''),
  opponentStatus: text().notNull().default('Healthy'),
  opponentBoostedStat: text().notNull().default(''),
  opponentLevel: integer().notNull().default(50),
  opponentEvs: jsonb()
    .notNull()
    .default({ hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }),
  opponentIvs: jsonb()
    .notNull()
    .default({ hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 }),
  opponentBoosts: jsonb()
    .notNull()
    .default({ hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }),
  opponentIsCrit: boolean().notNull().default(false),
  opponentAbilityOn: boolean().notNull().default(false),

  // JSON columns
  fieldConditions: jsonb().notNull().default({}),
  selectedPokemonModifiers: jsonb().notNull().default({
    teraType: '',
    boosts: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
    status: 'Healthy',
    isCrit: false,
    abilityOn: false,
    boostedStat: '',
  }),

  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const speedEntries = pgTable('speed_entries', {
  id: uuid().defaultRandom().primaryKey(),
  pokemonId: uuid()
    .notNull()
    .references(() => pokemon.id, { onDelete: 'cascade' }),
  sortOrder: integer().notNull().default(0),
  name: text().notNull().default(''),
  notes: text().notNull().default(''),
  species: text().notNull().default(''),
  nature: text().notNull().default('Hardy'),
  ability: text().notNull().default(''),
  item: text().notNull().default(''),
  teraType: text().notNull().default(''),
  status: text().notNull().default('Healthy'),
  boostedStat: text().notNull().default(''),
  level: integer().notNull().default(50),
  evs: jsonb()
    .notNull()
    .default({ hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }),
  ivs: jsonb()
    .notNull()
    .default({ hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 }),
  boosts: jsonb()
    .notNull()
    .default({ hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }),
  abilityOn: boolean().notNull().default(false),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
