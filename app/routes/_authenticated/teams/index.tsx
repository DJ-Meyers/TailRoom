import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { useTRPC } from '~/trpc/client';

export const Route = createFileRoute('/_authenticated/teams/')({
  component: TeamsPage,
});

function TeamsPage() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [newTeamName, setNewTeamName] = useState('');

  const { data: teams, isPending } = useQuery(trpc.team.list.queryOptions());

  const createMutation = useMutation(
    trpc.team.create.mutationOptions({
      onSuccess: (team) => {
        queryClient.invalidateQueries({ queryKey: trpc.team.list.queryKey() });
        setNewTeamName('');
        navigate({ to: '/teams/$teamSlug', params: { teamSlug: team.slug } });
      },
    }),
  );

  const deleteMutation = useMutation(
    trpc.team.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.team.list.queryKey() });
      },
    }),
  );

  const handleCreate = () => {
    const name = newTeamName.trim() || 'New Team';
    createMutation.mutate({ name });
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete team "${name}"? This will also delete all pokemon and calc entries.`)) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <div className="max-w-[800px] mx-auto">
      <h1 className="text-center mb-6 text-3xl">My Teams</h1>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={newTeamName}
          onChange={(e) => setNewTeamName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          placeholder="Team name..."
          className="flex-1 px-3 py-2 rounded bg-surface text-text border border-border"
        />
        <button
          onClick={handleCreate}
          disabled={createMutation.isPending}
          className="px-4 py-2 rounded bg-primary text-white hover:bg-primary-hover disabled:opacity-50"
        >
          New Team
        </button>
      </div>

      {isPending ? (
        <p className="text-center text-text-muted">Loading teams...</p>
      ) : !teams?.length ? (
        <p className="text-center text-text-muted">
          No teams yet. Create one to get started!
        </p>
      ) : (
        <div className="grid gap-3">
          {teams.map((team) => (
            <div
              key={team.id}
              className="flex items-center justify-between p-4 rounded bg-surface border border-border"
            >
              <Link
                to="/teams/$teamSlug"
                params={{ teamSlug: team.slug }}
                className="text-lg text-primary hover:underline"
              >
                {team.name}
              </Link>
              <div className="flex items-center gap-3">
                <span className="text-sm text-text-muted">
                  {new Date(team.createdAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => handleDelete(team.id, team.name)}
                  disabled={deleteMutation.isPending}
                  className="px-2 py-1 text-sm rounded text-red-400 hover:bg-red-400/10"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
