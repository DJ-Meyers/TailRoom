import { and, asc, eq, inArray } from 'drizzle-orm';
import { z } from 'zod';

import { pokemon, teamPokemon, teams } from '~/db/schema';
import { statsTableSchema } from '~/db/zod';
import { protectedProcedure, router } from '~/trpc/init';

// Fields that can be updated on a pokemon (exclude id, userId, timestamps)
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

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function randomAlphanumeric(length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function generatePokemonSlug(name: string, species: string): string {
  if (name) return slugify(name);
  const prefix = slugify(species).slice(0, 4) || 'pkmn';
  return `${prefix}-${randomAlphanumeric(4)}`;
}

async function uniquePokemonSlug(
  db: typeof import('~/db').db,
  userId: string,
  name: string,
  species: string,
  excludeId?: string,
): Promise<string> {
  let candidate = generatePokemonSlug(name, species);
  let attempts = 0;

  while (true) {
    const [existing] = await db
      .select({ id: pokemon.id })
      .from(pokemon)
      .where(and(eq(pokemon.userId, userId), eq(pokemon.slug, candidate)));

    if (!existing || (excludeId && existing.id === excludeId)) {
      return candidate;
    }

    // On collision: if name-based, append incrementing suffix; if generated, regenerate
    if (name) {
      attempts++;
      candidate = `${slugify(name)}-${attempts + 1}`;
    } else {
      const prefix = slugify(species).slice(0, 4) || 'pkmn';
      candidate = `${prefix}-${randomAlphanumeric(4)}`;
    }
  }
}

// Helper: verify pokemon belongs to user
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

export const pokemonRouter = router({
  get: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .select()
        .from(pokemon)
        .where(and(eq(pokemon.id, input.id), eq(pokemon.userId, ctx.userId)));
      return row ?? null;
    }),

  getBySlug: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .select()
        .from(pokemon)
        .where(
          and(eq(pokemon.slug, input.slug), eq(pokemon.userId, ctx.userId)),
        );
      return row ?? null;
    }),

  listAll: protectedProcedure.query(async ({ ctx }) => {
    // Get all pokemon for this user
    const allPokemon = await ctx.db
      .select()
      .from(pokemon)
      .where(eq(pokemon.userId, ctx.userId))
      .orderBy(asc(pokemon.createdAt));

    // Get team associations for these pokemon
    const pokemonIds = allPokemon.map((p) => p.id);
    const associations =
      pokemonIds.length > 0
        ? await ctx.db
            .select({
              pokemonId: teamPokemon.pokemonId,
              teamName: teams.name,
              teamSlug: teams.slug,
            })
            .from(teamPokemon)
            .innerJoin(teams, eq(teamPokemon.teamId, teams.id))
            .where(inArray(teamPokemon.pokemonId, pokemonIds))
        : [];

    // Group teams by pokemon
    const teamsByPokemon = new Map<
      string,
      Array<{ teamName: string; teamSlug: string }>
    >();
    for (const assoc of associations) {
      if (!teamsByPokemon.has(assoc.pokemonId)) {
        teamsByPokemon.set(assoc.pokemonId, []);
      }
      teamsByPokemon.get(assoc.pokemonId)!.push({
        teamName: assoc.teamName,
        teamSlug: assoc.teamSlug,
      });
    }

    return allPokemon.map((p) => ({
      pokemon: p,
      teams: teamsByPokemon.get(p.id) ?? [],
    }));
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
        .select({
          pokemon,
          slot: teamPokemon.slot,
        })
        .from(teamPokemon)
        .innerJoin(pokemon, eq(teamPokemon.pokemonId, pokemon.id))
        .where(eq(teamPokemon.teamId, input.teamId))
        .orderBy(asc(teamPokemon.slot));
    }),

  create: protectedProcedure
    .input(
      z.object({
        teamId: z.string().uuid().optional(),
        slot: z.number().int().min(0).max(5).optional(),
        species: z.string().min(1, 'Species is required'),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // If teamId provided, verify team ownership
      if (input.teamId) {
        const [team] = await ctx.db
          .select({ id: teams.id })
          .from(teams)
          .where(
            and(eq(teams.id, input.teamId), eq(teams.userId, ctx.userId)),
          );
        if (!team) throw new Error('Team not found');
      }

      const slug = await uniquePokemonSlug(ctx.db, ctx.userId, '', input.species);

      const [row] = await ctx.db
        .insert(pokemon)
        .values({
          userId: ctx.userId,
          species: input.species,
          slug,
        })
        .returning();

      // If teamId and slot provided, create the team association
      if (input.teamId && input.slot !== undefined) {
        await ctx.db.insert(teamPokemon).values({
          teamId: input.teamId,
          pokemonId: row!.id,
          slot: input.slot,
        });
      }

      return row!;
    }),

  update: protectedProcedure
    .input(updatePokemonInput)
    .mutation(async ({ ctx, input }) => {
      const owns = await verifyPokemonOwnership(ctx.db, input.id, ctx.userId);
      if (!owns) throw new Error('Pokemon not found');

      const { id, ...data } = input;

      // Regenerate slug if name or species changed
      if (data.name !== undefined || data.species !== undefined) {
        const [current] = await ctx.db
          .select({ name: pokemon.name, species: pokemon.species })
          .from(pokemon)
          .where(eq(pokemon.id, id));
        const newName = data.name ?? current?.name ?? '';
        const newSpecies = data.species ?? current?.species ?? '';
        const slug = await uniquePokemonSlug(ctx.db, ctx.userId, newName, newSpecies, id);
        Object.assign(data, { slug });
      }

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
      const owns = await verifyPokemonOwnership(ctx.db, input.id, ctx.userId);
      if (!owns) throw new Error('Pokemon not found');

      await ctx.db.delete(pokemon).where(eq(pokemon.id, input.id));
      return { success: true };
    }),

  addToTeam: protectedProcedure
    .input(
      z.object({
        pokemonId: z.string().uuid(),
        teamId: z.string().uuid(),
        slot: z.number().int().min(0).max(5),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const owns = await verifyPokemonOwnership(ctx.db, input.pokemonId, ctx.userId);
      if (!owns) throw new Error('Pokemon not found');

      const [team] = await ctx.db
        .select({ id: teams.id })
        .from(teams)
        .where(and(eq(teams.id, input.teamId), eq(teams.userId, ctx.userId)));
      if (!team) throw new Error('Team not found');

      await ctx.db.insert(teamPokemon).values({
        teamId: input.teamId,
        pokemonId: input.pokemonId,
        slot: input.slot,
      });
      return { success: true };
    }),

  removeFromTeam: protectedProcedure
    .input(
      z.object({
        pokemonId: z.string().uuid(),
        teamId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const owns = await verifyPokemonOwnership(ctx.db, input.pokemonId, ctx.userId);
      if (!owns) throw new Error('Pokemon not found');

      await ctx.db
        .delete(teamPokemon)
        .where(
          and(
            eq(teamPokemon.teamId, input.teamId),
            eq(teamPokemon.pokemonId, input.pokemonId),
          ),
        );
      return { success: true };
    }),

  reorder: protectedProcedure
    .input(
      z.object({
        teamId: z.string().uuid(),
        moves: z.array(z.object({ pokemonId: z.string().uuid(), slot: z.number().int().min(0).max(5) })),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify team ownership
      const [team] = await ctx.db
        .select({ id: teams.id })
        .from(teams)
        .where(and(eq(teams.id, input.teamId), eq(teams.userId, ctx.userId)));
      if (!team) throw new Error('Team not found');

      for (const move of input.moves) {
        await ctx.db
          .update(teamPokemon)
          .set({ slot: move.slot })
          .where(
            and(
              eq(teamPokemon.teamId, input.teamId),
              eq(teamPokemon.pokemonId, move.pokemonId),
            ),
          );
      }
      return { success: true };
    }),
});
