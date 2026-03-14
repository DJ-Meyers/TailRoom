import { useCallback, useEffect, useRef, useState } from 'react';

import { getSpeciesAbilities } from '~/data/gen';
import { useTRPC } from '~/trpc/client';
import type { ParseResult, PokemonState, StatKey } from '~/types';
import { MAX_EV_PER_STAT, MAX_TOTAL_EVS, STAT_KEYS } from '~/types';
import { applyParsedToState } from '~/utils/pokemonState';
import { dbPokemonToPokemonState, pokemonStateToDbInput } from '~/utils/marshalling';
import { useQueryClient } from '@tanstack/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';

export const usePersistedPokemon = (pokemonId: string) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const pendingUpdate = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestState = useRef<PokemonState | null>(null);
  const pendingMetaUpdate = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestMeta = useRef<{ name?: string; notes?: string } | null>(null);

  const { data: dbPokemon } = useQuery(
    trpc.pokemon.get.queryOptions({ id: pokemonId }),
  );

  const [state, setState] = useState<PokemonState | null>(null);
  const [name, setNameLocal] = useState('');
  const [notes, setNotesLocal] = useState('');

  // Initialize state from query data
  useEffect(() => {
    if (dbPokemon && !state) {
      setState(dbPokemonToPokemonState(dbPokemon));
      setNameLocal(dbPokemon.name);
      setNotesLocal(dbPokemon.notes);
    }
  }, [dbPokemon, state]);

  const updateMutation = useMutation(
    trpc.pokemon.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.pokemon.get.queryKey({ id: pokemonId }) });
        queryClient.invalidateQueries({ queryKey: trpc.pokemon.listAll.queryKey() });
        queryClient.invalidateQueries({ queryKey: trpc.pokemon.listByTeam.queryKey() });
      },
    }),
  );

  // Flush on unmount
  useEffect(() => {
    return () => {
      if (pendingUpdate.current) {
        clearTimeout(pendingUpdate.current);
      }
      if (pendingMetaUpdate.current) {
        clearTimeout(pendingMetaUpdate.current);
      }
      const flushData: Record<string, unknown> = {};
      if (latestState.current) {
        Object.assign(flushData, pokemonStateToDbInput(latestState.current));
        latestState.current = null;
      }
      if (latestMeta.current) {
        Object.assign(flushData, latestMeta.current);
        latestMeta.current = null;
      }
      if (Object.keys(flushData).length > 0) {
        updateMutation.mutate({ id: pokemonId, ...flushData });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pokemonId]);

  const scheduleUpdate = useCallback(
    (newState: PokemonState) => {
      latestState.current = newState;
      if (pendingUpdate.current) clearTimeout(pendingUpdate.current);
      pendingUpdate.current = setTimeout(() => {
        pendingUpdate.current = null;
        if (latestState.current) {
          updateMutation.mutate({
            id: pokemonId,
            ...pokemonStateToDbInput(latestState.current),
          });
          latestState.current = null;
        }
      }, 500);
    },
    [pokemonId, updateMutation],
  );

  const update = useCallback(
    (updater: (prev: PokemonState) => PokemonState) => {
      setState((prev) => {
        if (!prev) return prev;
        const next = updater(prev);
        scheduleUpdate(next);
        return next;
      });
    },
    [scheduleUpdate],
  );

  const setSpecies = useCallback(
    (species: string) => {
      const abilities = getSpeciesAbilities(species);
      update((prev) => ({
        ...prev,
        species,
        ability: abilities[0] ?? prev.ability,
      }));
    },
    [update],
  );

  const setNature = useCallback(
    (nature: string) => update((prev) => ({ ...prev, nature })),
    [update],
  );

  const setAbility = useCallback(
    (ability: string) => update((prev) => ({ ...prev, ability })),
    [update],
  );

  const setItem = useCallback(
    (item: string) => update((prev) => ({ ...prev, item })),
    [update],
  );

  const setMove = useCallback(
    (move: string) => update((prev) => ({ ...prev, move })),
    [update],
  );

  const setEv = useCallback(
    (stat: StatKey, value: number) => {
      update((prev) => {
        const clamped = Math.min(value, MAX_EV_PER_STAT);
        const totalOther = STAT_KEYS.reduce(
          (sum, k) => sum + (k === stat ? 0 : prev.evs[k]),
          0,
        );
        const maxAllowed = Math.min(clamped, MAX_TOTAL_EVS - totalOther);
        return { ...prev, evs: { ...prev.evs, [stat]: Math.max(0, maxAllowed) } };
      });
    },
    [update],
  );

  const setIv = useCallback(
    (stat: StatKey, value: number) => {
      const clamped = Math.max(0, Math.min(31, value));
      update((prev) => ({ ...prev, ivs: { ...prev.ivs, [stat]: clamped } }));
    },
    [update],
  );

  const setTeraType = useCallback(
    (teraType: string) => update((prev) => ({ ...prev, teraType })),
    [update],
  );

  const setBoost = useCallback(
    (stat: StatKey, value: number) => {
      update((prev) => ({
        ...prev,
        boosts: { ...prev.boosts, [stat]: Math.max(-6, Math.min(6, value)) },
      }));
    },
    [update],
  );

  const setStatus = useCallback(
    (status: string) => update((prev) => ({ ...prev, status })),
    [update],
  );

  const setIsCrit = useCallback(
    (isCrit: boolean) => update((prev) => ({ ...prev, isCrit })),
    [update],
  );

  const applyParsed = useCallback(
    (parsed: ParseResult) => {
      update((prev) => applyParsedToState(prev, parsed));
    },
    [update],
  );

  const scheduleMetaUpdate = useCallback(
    (meta: { name?: string; notes?: string }) => {
      latestMeta.current = { ...latestMeta.current, ...meta };
      if (pendingMetaUpdate.current) clearTimeout(pendingMetaUpdate.current);
      pendingMetaUpdate.current = setTimeout(() => {
        pendingMetaUpdate.current = null;
        if (latestMeta.current) {
          updateMutation.mutate({ id: pokemonId, ...latestMeta.current });
          latestMeta.current = null;
        }
      }, 500);
    },
    [pokemonId, updateMutation],
  );

  const setName = useCallback(
    (newName: string) => {
      setNameLocal(newName);
      scheduleMetaUpdate({ name: newName });
    },
    [scheduleMetaUpdate],
  );

  const setNotes = useCallback(
    (newNotes: string) => {
      setNotesLocal(newNotes);
      scheduleMetaUpdate({ notes: newNotes });
    },
    [scheduleMetaUpdate],
  );

  return {
    state,
    name,
    notes,
    setName,
    setNotes,
    setSpecies,
    setNature,
    setAbility,
    setItem,
    setMove,
    setEv,
    setIv,
    setTeraType,
    setBoost,
    setStatus,
    setIsCrit,
    applyParsed,
    abilities: state ? getSpeciesAbilities(state.species) : [],
  };
};
