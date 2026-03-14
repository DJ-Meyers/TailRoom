import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';

import { useTRPC } from '~/trpc/client';

export const Route = createFileRoute('/_authenticated/pokemon/')({
  component: PokemonListPage,
});

function PokemonListPage() {
  const trpc = useTRPC();
  const { data: allPokemon, isPending } = useQuery(
    trpc.pokemon.listAll.queryOptions(),
  );

  return (
    <div className="max-w-[800px] mx-auto">
      <h1 className="text-center mb-6 text-3xl">My Pokémon</h1>

      {isPending ? (
        <p className="text-center text-text-muted">Loading pokémon...</p>
      ) : !allPokemon?.length ? (
        <p className="text-center text-text-muted">
          No pokémon yet. Create a team and add some pokémon to get started!
        </p>
      ) : (
        <div className="grid gap-3">
          {allPokemon.map(({ pokemon: poke, teams: pokeTeams }) => (
            <div
              key={poke.id}
              className="flex items-center justify-between p-4 rounded bg-surface border border-border"
            >
              <div className="flex items-center gap-3">
                <Link
                  to="/pokemon/$nameSlug"
                  params={{ nameSlug: poke.slug }}
                  className="text-lg text-primary hover:underline"
                >
                  {poke.name || poke.species || 'Unnamed'}
                </Link>
                {poke.species && poke.name && poke.name !== poke.species && (
                  <span className="text-sm text-text-muted">
                    ({poke.species})
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {pokeTeams.map((t) => (
                  <Link
                    key={t.teamSlug}
                    to="/teams/$teamSlug"
                    params={{ teamSlug: t.teamSlug }}
                    className="text-sm text-text-muted hover:text-text"
                  >
                    {t.teamName}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
