import { and, asc, eq } from 'drizzle-orm';
import { z } from 'zod';

import { pokemon, teams } from '~/db/schema';
import { statsTableSchema } from '~/db/zod';
import { protectedProcedure, router } from '~/trpc/init';

// Fields that can be updated on a pokemon (exclude id, teamId, slot, timestamps)
const updatePokemonInput = z.object({
  id: z.string().uuid(),
  name: z.string().optional(),
  notes: z.string().optional(),
  species: z.string().optional(),
  nature: z.string().optional(),
  ability: z.string().optional(),
  item: z.string().optional(),
  move: z.string().optional(),
  teraType: z.string().optional(),
  status: z.string().optional(),
  boostedStat: z.string().optional(),
  level: z.number().int().min(1).max(100).optional(),
  evs: statsTableSchema.optional(),
  ivs: statsTableSchema.optional(),
  boosts: statsTableSchema.optional(),
  isCrit: z.boolean().optional(),
  abilityOn: z.boolean().optional(),
});

// Helper: verify pokemon belongs to user via team ownership
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

export const pokemonRouter = router({
  get: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .select()
        .from(pokemon)
        .innerJoin(teams, eq(pokemon.teamId, teams.id))
        .where(and(eq(pokemon.id, input.id), eq(teams.userId, ctx.userId)));
      return row?.pokemon ?? null;
    }),

  listByTeam: protectedProcedure
    .input(z.object({ teamId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // Verify team ownership
      const [team] = await ctx.db
        .select({ id: teams.id })
        .from(teams)
        .where(
          and(eq(teams.id, input.teamId), eq(teams.userId, ctx.userId)),
        );
      if (!team) return [];

      return ctx.db
        .select()
        .from(pokemon)
        .where(eq(pokemon.teamId, input.teamId))
        .orderBy(asc(pokemon.slot));
    }),

  create: protectedProcedure
    .input(
      z.object({
        teamId: z.string().uuid(),
        slot: z.number().int().min(0).max(5),
        species: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify team ownership
      const [team] = await ctx.db
        .select({ id: teams.id })
        .from(teams)
        .where(
          and(eq(teams.id, input.teamId), eq(teams.userId, ctx.userId)),
        );
      if (!team) throw new Error('Team not found');

      const [row] = await ctx.db
        .insert(pokemon)
        .values({
          teamId: input.teamId,
          slot: input.slot,
          species: input.species ?? '',
        })
        .returning();
      return row!;
    }),

  update: protectedProcedure
    .input(updatePokemonInput)
    .mutation(async ({ ctx, input }) => {
      const owns = await verifyPokemonOwnership(ctx.db, input.id, ctx.userId);
      if (!owns) throw new Error('Pokemon not found');

      const { id, ...data } = input;
      const [row] = await ctx.db
        .update(pokemon)
        .set(data)
        .where(eq(pokemon.id, id))
        .returning();
      return row!;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const owns = await verifyPokemonOwnership(
        ctx.db,
        input.id,
        ctx.userId,
      );
      if (!owns) throw new Error('Pokemon not found');

      await ctx.db.delete(pokemon).where(eq(pokemon.id, input.id));
      return { success: true };
    }),

  reorder: protectedProcedure
    .input(
      z.object({
        moves: z.array(z.object({ id: z.string().uuid(), slot: z.number().int().min(0).max(5) })),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify all pokemon belong to user
      for (const move of input.moves) {
        const owns = await verifyPokemonOwnership(
          ctx.db,
          move.id,
          ctx.userId,
        );
        if (!owns) throw new Error('Pokemon not found');
      }

      for (const move of input.moves) {
        await ctx.db
          .update(pokemon)
          .set({ slot: move.slot })
          .where(eq(pokemon.id, move.id));
      }
      return { success: true };
    }),
});
