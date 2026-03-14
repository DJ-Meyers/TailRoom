import { and, asc, eq } from 'drizzle-orm';
import { z } from 'zod';

import { pokemon, speedEntries } from '~/db/schema';
import { statsTableSchema } from '~/db/zod';
import { protectedProcedure, router } from '~/trpc/init';

const verifyPokemonOwnership = async (
  db: typeof import('~/db').db,
  pokemonId: string,
  userId: string,
) => {
  const [row] = await db
    .select({ id: pokemon.id })
    .from(pokemon)
    .where(and(eq(pokemon.id, pokemonId), eq(pokemon.userId, userId)));
  return !!row;
};

const speedEntryInput = z.object({
  pokemonId: z.string().uuid(),
  sortOrder: z.number().int().optional(),
  name: z.string().optional(),
  notes: z.string().optional(),
  species: z.string().optional(),
  nature: z.string().optional(),
  ability: z.string().optional(),
  item: z.string().optional(),
  teraType: z.string().optional(),
  status: z.string().optional(),
  boostedStat: z.string().optional(),
  level: z.number().int().min(1).max(100).optional(),
  evs: statsTableSchema.optional(),
  ivs: statsTableSchema.optional(),
  boosts: statsTableSchema.optional(),
  abilityOn: z.boolean().optional(),
});

export const speedEntryRouter = router({
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
        .from(speedEntries)
        .where(eq(speedEntries.pokemonId, input.pokemonId))
        .orderBy(asc(speedEntries.sortOrder));
    }),

  create: protectedProcedure
    .input(speedEntryInput)
    .mutation(async ({ ctx, input }) => {
      const owns = await verifyPokemonOwnership(
        ctx.db,
        input.pokemonId,
        ctx.userId,
      );
      if (!owns) throw new Error('Pokemon not found');

      const [entry] = await ctx.db
        .insert(speedEntries)
        .values(input)
        .returning();
      return entry!;
    }),

  update: protectedProcedure
    .input(
      z.object({ id: z.string().uuid() }).merge(speedEntryInput.partial()),
    )
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select({ id: speedEntries.id })
        .from(speedEntries)
        .innerJoin(pokemon, eq(speedEntries.pokemonId, pokemon.id))
        .where(
          and(eq(speedEntries.id, input.id), eq(pokemon.userId, ctx.userId)),
        );
      if (!existing) throw new Error('Speed entry not found');

      const { id, ...data } = input;
      const [entry] = await ctx.db
        .update(speedEntries)
        .set(data)
        .where(eq(speedEntries.id, id))
        .returning();
      return entry!;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select({ id: speedEntries.id })
        .from(speedEntries)
        .innerJoin(pokemon, eq(speedEntries.pokemonId, pokemon.id))
        .where(
          and(eq(speedEntries.id, input.id), eq(pokemon.userId, ctx.userId)),
        );
      if (!existing) throw new Error('Speed entry not found');

      await ctx.db
        .delete(speedEntries)
        .where(eq(speedEntries.id, input.id));
      return { success: true };
    }),

  batchCreate: protectedProcedure
    .input(z.object({ entries: z.array(speedEntryInput) }))
    .mutation(async ({ ctx, input }) => {
      if (input.entries.length === 0) return [];

      const pokemonIds = [...new Set(input.entries.map((e) => e.pokemonId))];
      for (const pid of pokemonIds) {
        const owns = await verifyPokemonOwnership(ctx.db, pid, ctx.userId);
        if (!owns) throw new Error('Pokemon not found');
      }

      return ctx.db.insert(speedEntries).values(input.entries).returning();
    }),
});
