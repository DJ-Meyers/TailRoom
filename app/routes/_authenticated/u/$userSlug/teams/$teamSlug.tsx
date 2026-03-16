import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { PokemonSelector } from '~/components/PokemonSelector';
import { TeamCalcView } from '~/components/TeamCalcView';
import { useTRPC } from '~/trpc/client';

export const Route = createFileRoute('/_authenticated/u/$userSlug/teams/$teamSlug')({
  component: TeamDetailPage,
});

function TeamDetailPage() {
  const { userSlug, teamSlug } = Route.useParams();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: team, isPending: teamPending } = useQuery(
    trpc.team.getBySlug.queryOptions({ slug: teamSlug }),
  );

  const teamId = team?.id;

  const { data: pokemonList, isPending: pokemonPending } = useQuery({
    ...trpc.pokemon.listByTeam.queryOptions({ teamId: teamId! }),
    enabled: !!teamId,
  });

  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [addingSlot, setAddingSlot] = useState<number | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');

  const updateTeamMutation = useMutation(
    trpc.team.update.mutationOptions({
      onSuccess: (updated) => {
        queryClient.invalidateQueries({ queryKey: trpc.team.getBySlug.queryKey({ slug: teamSlug }) });
        setEditingName(false);
        if (updated && updated.slug !== teamSlug) {
          navigate({
            to: '/u/$userSlug/teams/$teamSlug',
            params: { userSlug, teamSlug: updated.slug },
            replace: true,
          });
        }
      },
    }),
  );

  const createPokemonMutation = useMutation(
    trpc.pokemon.create.mutationOptions({
      onSuccess: (_created, variables) => {
        queryClient.invalidateQueries({
          queryKey: trpc.pokemon.listByTeam.queryKey({ teamId: teamId! }),
        });
        setSelectedSlot(variables.slot ?? null);
        setAddingSlot(null);
      },
    }),
  );

  if (teamPending || pokemonPending) {
    return <div className="text-center text-text-muted">Loading team...</div>;
  }

  if (!team) {
    return (
      <div className="text-center">
        <p className="text-text-muted mb-4">Team not found.</p>
        <button
          onClick={() => navigate({ to: '/u/$userSlug/teams', params: { userSlug } })}
          className="text-primary hover:underline"
        >
          Back to teams
        </button>
      </div>
    );
  }

  const pokemonBySlot = new Map(
    (pokemonList ?? []).map((entry) => [entry.slot, entry.pokemon]),
  );

  const selectedPokemon = selectedSlot !== null ? pokemonBySlot.get(selectedSlot) : null;

  const handleStartEditName = () => {
    setNameInput(team.name);
    setEditingName(true);
  };

  const handleSaveName = () => {
    const trimmed = nameInput.trim();
    if (trimmed && trimmed !== team.name) {
      updateTeamMutation.mutate({ id: team.id, name: trimmed });
    } else {
      setEditingName(false);
    }
  };

  const handleAddPokemon = (slot: number, species: string) => {
    createPokemonMutation.mutate({ teamId: team.id, slot, species });
  };

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Team header */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <button
          onClick={() => navigate({ to: '/u/$userSlug/teams', params: { userSlug } })}
          className="text-text-muted hover:text-text"
        >
          &larr; Teams
        </button>
        {editingName ? (
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onBlur={handleSaveName}
            maxLength={24}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveName();
              if (e.key === 'Escape') setEditingName(false);
            }}
            autoFocus
            className="text-3xl bg-transparent border-b-2 border-primary text-text text-center outline-none"
          />
        ) : (
          <h1
            className="text-3xl cursor-pointer hover:text-primary"
            onClick={handleStartEditName}
            title="Click to rename"
          >
            {team.name}
          </h1>
        )}
      </div>

      {/* Pokemon slot selector */}
      <div className="flex justify-center gap-2 mb-6">
        {Array.from({ length: 6 }, (_, slot) => {
          const poke = pokemonBySlot.get(slot);
          const isSelected = selectedSlot === slot;

          return (
            <button
              key={slot}
              onClick={() => {
                if (poke) {
                  setSelectedSlot(slot);
                  setAddingSlot(null);
                } else {
                  setAddingSlot(slot);
                  setSelectedSlot(null);
                }
              }}
              className={`px-4 py-2 rounded border transition-colors ${
                isSelected || addingSlot === slot
                  ? 'border-primary bg-primary/20 text-primary'
                  : 'border-border bg-surface text-text hover:border-primary-hover'
              }`}
            >
              {poke ? (poke.species || `Slot ${slot + 1}`) : '+'}
            </button>
          );
        })}
      </div>

      {/* Species picker for new pokemon */}
      {addingSlot !== null && (
        <div className="max-w-xs mx-auto mb-6">
          <p className="text-sm text-text-muted mb-2 text-center">Choose a species for slot {addingSlot + 1}</p>
          <PokemonSelector
            id={`add-slot-${addingSlot}`}
            value=""
            onChange={(species) => handleAddPokemon(addingSlot, species)}
          />
          <button
            onClick={() => setAddingSlot(null)}
            className="mt-2 w-full text-sm text-text-muted hover:text-text"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Team calc view for selected pokemon */}
      {selectedPokemon ? (
        <TeamCalcView pokemonId={selectedPokemon.id} />
      ) : (
        <p className="text-center text-text-muted">
          {pokemonBySlot.size === 0
            ? 'Add a pokemon to get started!'
            : 'Select a pokemon slot above to view calcs.'}
        </p>
      )}
    </div>
  );
}
