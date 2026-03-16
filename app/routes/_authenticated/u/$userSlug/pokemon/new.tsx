import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

import { PokemonSelector } from '~/components/PokemonSelector';
import { useTRPC } from '~/trpc/client';

export const Route = createFileRoute('/_authenticated/u/$userSlug/pokemon/new')({
  component: NewPokemonPage,
});

function NewPokemonPage() {
  const { userSlug } = Route.useParams();
  const navigate = useNavigate();
  const trpc = useTRPC();
  const [species, setSpecies] = useState('');

  const createMutation = useMutation(
    trpc.pokemon.create.mutationOptions({
      onSuccess: (created) => {
        navigate({
          to: '/u/$userSlug/pokemon/$nameSlug',
          params: { userSlug, nameSlug: created.slug },
        });
      },
    }),
  );

  const handleCreate = () => {
    if (!species) return;
    createMutation.mutate({ species });
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="flex items-center justify-center gap-3 mb-6">
        <button
          onClick={() => navigate({ to: '/u/$userSlug/pokemon', params: { userSlug } })}
          className="text-text-muted hover:text-text"
        >
          &larr; Pokémon
        </button>
        <h1 className="text-3xl">New Pokémon</h1>
      </div>

      <div className="mb-4">
        <PokemonSelector
          id="new-pokemon-species"
          value={species}
          onChange={setSpecies}
        />
      </div>

      <button
        onClick={handleCreate}
        disabled={!species || createMutation.isPending}
        className="w-full px-4 py-2 rounded bg-primary text-white hover:bg-primary-hover disabled:opacity-50"
      >
        Create
      </button>
    </div>
  );
}
