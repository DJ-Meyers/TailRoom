import { and, asc, eq } from 'drizzle-orm';
import { z } from 'zod';

import { calcEntries, pokemon, teams } from '~/db/schema';
import {
  fieldConditionsSchema,
  selectedPokemonModifiersSchema,
  statsTableSchema,
} from '~/db/zod';
import { protectedProcedure, router } from '~/trpc/init';

const verifyPokemonOwnership = async (
  db: typeof import('~/db').db,
  pokemonId: string,
  userId: string,
) => {
  const [row] = await db
    .select({ id: pokemon.id })
    .from(pokemon)
    .innerJoin(teams, eq(pokemon.teamId, teams.id))
    .where(and(eq(pokemon.id, pokemonId), eq(teams.userId, userId)));
  return !!row;
};

const calcEntryInput = z.object({
  pokemonId: z.string().uuid(),
  mode: z.enum(['offensive', 'defensive']).optional(),
  sortOrder: z.number().int().optional(),
  name: z.string().optional(),
  notes: z.string().optional(),
  move: z.string().optional(),
  opponentSpecies: z.string().optional(),
  opponentNature: z.string().optional(),
  opponentAbility: z.string().optional(),
  opponentItem: z.string().optional(),
  opponentMove: z.string().optional(),
  opponentTeraType: z.string().optional(),
  opponentStatus: z.string().optional(),
  opponentBoostedStat: z.string().optional(),
  opponentLevel: z.number().int().min(1).max(100).optional(),
  opponentEvs: statsTableSchema.optional(),
  opponentIvs: statsTableSchema.optional(),
  opponentBoosts: statsTableSchema.optional(),
  opponentIsCrit: z.boolean().optional(),
  opponentAbilityOn: z.boolean().optional(),
  fieldConditions: fieldConditionsSchema.optional(),
  selectedPokemonModifiers: selectedPokemonModifiersSchema.optional(),
});

export const calcEntryRouter = router({
  listByPokemon: protectedProcedure
    .input(z.object({ pokemonId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const owns = await verifyPokemonOwnership(
        ctx.db,
        input.pokemonId,
        ctx.userId,
      );
      if (!owns) return [];

      return ctx.db
        .select()
        .from(calcEntries)
        .where(eq(calcEntries.pokemonId, input.pokemonId))
        .orderBy(asc(calcEntries.sortOrder));
    }),

  create: protectedProcedure
    .input(calcEntryInput)
    .mutation(async ({ ctx, input }) => {
      const owns = await verifyPokemonOwnership(
        ctx.db,
        input.pokemonId,
        ctx.userId,
      );
      if (!owns) throw new Error('Pokemon not found');

      const [entry] = await ctx.db
        .insert(calcEntries)
        .values(input)
        .returning();
      return entry!;
    }),

  update: protectedProcedure
    .input(z.object({ id: z.string().uuid() }).merge(calcEntryInput.partial()))
    .mutation(async ({ ctx, input }) => {
      // Verify via join
      const [existing] = await ctx.db
        .select({ id: calcEntries.id })
        .from(calcEntries)
        .innerJoin(pokemon, eq(calcEntries.pokemonId, pokemon.id))
        .innerJoin(teams, eq(pokemon.teamId, teams.id))
        .where(
          and(eq(calcEntries.id, input.id), eq(teams.userId, ctx.userId)),
        );
      if (!existing) throw new Error('Calc entry not found');

      const { id, ...data } = input;
      const [entry] = await ctx.db
        .update(calcEntries)
        .set(data)
        .where(eq(calcEntries.id, id))
        .returning();
      return entry!;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select({ id: calcEntries.id })
        .from(calcEntries)
        .innerJoin(pokemon, eq(calcEntries.pokemonId, pokemon.id))
        .innerJoin(teams, eq(pokemon.teamId, teams.id))
        .where(
          and(eq(calcEntries.id, input.id), eq(teams.userId, ctx.userId)),
        );
      if (!existing) throw new Error('Calc entry not found');

      await ctx.db.delete(calcEntries).where(eq(calcEntries.id, input.id));
      return { success: true };
    }),

  batchCreate: protectedProcedure
    .input(z.object({ entries: z.array(calcEntryInput) }))
    .mutation(async ({ ctx, input }) => {
      if (input.entries.length === 0) return [];

      // Verify ownership of all referenced pokemon
      const pokemonIds = [...new Set(input.entries.map((e) => e.pokemonId))];
      for (const pid of pokemonIds) {
        const owns = await verifyPokemonOwnership(ctx.db, pid, ctx.userId);
        if (!owns) throw new Error('Pokemon not found');
      }

      return ctx.db.insert(calcEntries).values(input.entries).returning();
    }),
});
