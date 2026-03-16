import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';

import { TeamCalcView } from '~/components/TeamCalcView';
import { useTRPC } from '~/trpc/client';

export const Route = createFileRoute('/_authenticated/u/$userSlug/pokemon/$nameSlug')({
  component: PokemonDetailPage,
});

function PokemonDetailPage() {
  const { userSlug, nameSlug } = Route.useParams();
  const navigate = useNavigate();
  const trpc = useTRPC();

  const { data: poke, isPending } = useQuery(
    trpc.pokemon.getBySlug.queryOptions({ slug: nameSlug }),
  );

  if (isPending) {
    return <div className="text-center text-text-muted">Loading pokémon...</div>;
  }

  if (!poke) {
    return (
      <div className="text-center">
        <p className="text-text-muted mb-4">Pokémon not found.</p>
        <button
          onClick={() => navigate({ to: '/u/$userSlug/pokemon', params: { userSlug } })}
          className="text-primary hover:underline"
        >
          Back to pokémon
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex items-center justify-center gap-3 mb-6">
        <button
          onClick={() => navigate({ to: '/u/$userSlug/pokemon', params: { userSlug } })}
          className="text-text-muted hover:text-text"
        >
          &larr; Pokémon
        </button>
        <h1 className="text-3xl">
          {poke.name || poke.species || 'Unnamed'}
        </h1>
      </div>

      <TeamCalcView pokemonId={poke.id} />
    </div>
  );
}
