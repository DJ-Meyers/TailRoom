import { useCallback, useEffect, useReducer, useRef, useState } from 'react';

import { getSpeciesAbilities } from '~/data/gen';
import { useTRPC } from '~/trpc/client';
import type { PokemonState, SpeedConditions, SpeedEntry, StatKey } from '~/types';
import { MAX_EV_PER_STAT, MAX_TOTAL_EVS, STAT_KEYS } from '~/types';
import { dbSpeedEntryToSpeedEntry, speedEntryToDbInput } from '~/utils/marshalling';
import { useQueryClient } from '@tanstack/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';

type Action =
  | { type: 'INIT'; entries: SpeedEntry[] }
  | { type: 'ADD'; entry: SpeedEntry }
  | { type: 'REMOVE'; id: string }
  | { type: 'TOGGLE_EXPANDED'; id: string }
  | { type: 'TOGGLE_TAILWIND'; id: string }
  | { type: 'SET_SPECIES'; id: string; species: string }
  | { type: 'UPDATE_POKEMON'; id: string; patch: Partial<PokemonState> }
  | { type: 'SET_EV'; id: string; stat: StatKey; value: number }
  | { type: 'SET_IV'; id: string; stat: StatKey; value: number }
  | { type: 'SET_BOOST'; id: string; stat: StatKey; value: number }
  | { type: 'UPDATE_NAME'; id: string; name: string }
  | { type: 'UPDATE_NOTES'; id: string; notes: string };

const reducer = (state: SpeedEntry[], action: Action): SpeedEntry[] => {
  switch (action.type) {
    case 'INIT':
      return action.entries;

    case 'ADD':
      return [...state, action.entry];

    case 'REMOVE':
      return state.filter((e) => e.id !== action.id);

    case 'TOGGLE_EXPANDED':
      return state.map((e) =>
        e.id === action.id ? { ...e, isExpanded: !e.isExpanded } : e,
      );

    case 'TOGGLE_TAILWIND':
      return state.map((e) =>
        e.id === action.id ? { ...e, tailwind: !e.tailwind } : e,
      );

    case 'SET_SPECIES': {
      const abilities = getSpeciesAbilities(action.species);
      return state.map((e) =>
        e.id === action.id
          ? {
              ...e,
              pokemon: {
                ...e.pokemon,
                species: action.species,
                ability: abilities[0] ?? e.pokemon.ability,
              },
            }
          : e,
      );
    }

    case 'UPDATE_POKEMON':
      return state.map((e) =>
        e.id === action.id ? { ...e, pokemon: { ...e.pokemon, ...action.patch } } : e,
      );

    case 'SET_EV':
      return state.map((e) => {
        if (e.id !== action.id) return e;
        const clamped = Math.min(action.value, MAX_EV_PER_STAT);
        const totalOther = STAT_KEYS.reduce(
          (sum, k) => sum + (k === action.stat ? 0 : e.pokemon.evs[k]),
          0,
        );
        const maxAllowed = Math.min(clamped, MAX_TOTAL_EVS - totalOther);
        return {
          ...e,
          pokemon: {
            ...e.pokemon,
            evs: { ...e.pokemon.evs, [action.stat]: Math.max(0, maxAllowed) },
          },
        };
      });

    case 'SET_IV':
      return state.map((e) =>
        e.id === action.id
          ? {
              ...e,
              pokemon: {
                ...e.pokemon,
                ivs: { ...e.pokemon.ivs, [action.stat]: Math.max(0, Math.min(31, action.value)) },
              },
            }
          : e,
      );

    case 'SET_BOOST':
      return state.map((e) =>
        e.id === action.id
          ? {
              ...e,
              pokemon: {
                ...e.pokemon,
                boosts: {
                  ...e.pokemon.boosts,
                  [action.stat]: Math.max(-6, Math.min(6, action.value)),
                },
              },
            }
          : e,
      );

    case 'UPDATE_NAME':
      return state.map((e) =>
        e.id === action.id ? { ...e, name: action.name } : e,
      );

    case 'UPDATE_NOTES':
      return state.map((e) =>
        e.id === action.id ? { ...e, notes: action.notes } : e,
      );

    default:
      return state;
  }
};

export const usePersistedSpeedCalc = (pokemonId: string) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [entries, dispatch] = useReducer(reducer, []);
  const [conditions, setConditions] = useState<SpeedConditions>({
    yourTailwind: false,
    yourBoost: 0,
  });
  const initialized = useRef(false);
  const pendingUpdates = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const { data: dbEntries } = useQuery(
    trpc.speedEntry.listByPokemon.queryOptions({ pokemonId }),
  );

  useEffect(() => {
    if (dbEntries && !initialized.current) {
      initialized.current = true;
      dispatch({
        type: 'INIT',
        entries: dbEntries.map(dbSpeedEntryToSpeedEntry),
      });
    }
  }, [dbEntries]);

  const createMutation = useMutation(
    trpc.speedEntry.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.speedEntry.listByPokemon.queryKey({ pokemonId }),
        });
      },
    }),
  );

  const updateMutation = useMutation(
    trpc.speedEntry.update.mutationOptions(),
  );

  const deleteMutation = useMutation(
    trpc.speedEntry.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.speedEntry.listByPokemon.queryKey({ pokemonId }),
        });
      },
    }),
  );

  useEffect(() => {
    return () => {
      pendingUpdates.current.forEach((timer) => clearTimeout(timer));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pokemonId]);

  const entriesRef = useRef(entries);
  entriesRef.current = entries;

  const scheduleEntryUpdate = useCallback(
    (id: string, getEntry: () => SpeedEntry | undefined) => {
      const existing = pendingUpdates.current.get(id);
      if (existing) clearTimeout(existing);

      const timer = setTimeout(() => {
        pendingUpdates.current.delete(id);
        const entry = getEntry();
        if (entry) {
          const dbInput = speedEntryToDbInput(entry, pokemonId, 0);
          updateMutation.mutate({ id, ...dbInput });
        }
      }, 500);
      pendingUpdates.current.set(id, timer);
    },
    [pokemonId, updateMutation],
  );

  const add = useCallback(
    (entry: Omit<SpeedEntry, 'id'>) => {
      const dbInput = speedEntryToDbInput(
        { ...entry, id: '' },
        pokemonId,
        entriesRef.current.length,
      );
      createMutation.mutate(dbInput, {
        onSuccess: (created) => {
          dispatch({
            type: 'ADD',
            entry: { ...entry, id: created.id },
          });
        },
      });
    },
    [pokemonId, createMutation],
  );

  const remove = useCallback(
    (id: string) => {
      dispatch({ type: 'REMOVE', id });
      const pending = pendingUpdates.current.get(id);
      if (pending) {
        clearTimeout(pending);
        pendingUpdates.current.delete(id);
      }
      deleteMutation.mutate({ id });
    },
    [deleteMutation],
  );

  const toggleExpanded = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_EXPANDED', id });
  }, []);

  const toggleTailwind = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_TAILWIND', id });
  }, []);

  const setSpecies = useCallback(
    (id: string, species: string) => {
      dispatch({ type: 'SET_SPECIES', id, species });
      scheduleEntryUpdate(id, () => entriesRef.current.find((e) => e.id === id));
    },
    [scheduleEntryUpdate],
  );

  const updatePokemon = useCallback(
    (id: string, patch: Partial<PokemonState>) => {
      dispatch({ type: 'UPDATE_POKEMON', id, patch });
      scheduleEntryUpdate(id, () => entriesRef.current.find((e) => e.id === id));
    },
    [scheduleEntryUpdate],
  );

  const setEv = useCallback(
    (id: string, stat: StatKey, value: number) => {
      dispatch({ type: 'SET_EV', id, stat, value });
      scheduleEntryUpdate(id, () => entriesRef.current.find((e) => e.id === id));
    },
    [scheduleEntryUpdate],
  );

  const setIv = useCallback(
    (id: string, stat: StatKey, value: number) => {
      dispatch({ type: 'SET_IV', id, stat, value });
      scheduleEntryUpdate(id, () => entriesRef.current.find((e) => e.id === id));
    },
    [scheduleEntryUpdate],
  );

  const setBoost = useCallback(
    (id: string, stat: StatKey, value: number) => {
      dispatch({ type: 'SET_BOOST', id, stat, value });
      scheduleEntryUpdate(id, () => entriesRef.current.find((e) => e.id === id));
    },
    [scheduleEntryUpdate],
  );

  const updateName = useCallback(
    (id: string, name: string) => {
      dispatch({ type: 'UPDATE_NAME', id, name });
      scheduleEntryUpdate(id, () => entriesRef.current.find((e) => e.id === id));
    },
    [scheduleEntryUpdate],
  );

  const updateNotes = useCallback(
    (id: string, notes: string) => {
      dispatch({ type: 'UPDATE_NOTES', id, notes });
      scheduleEntryUpdate(id, () => entriesRef.current.find((e) => e.id === id));
    },
    [scheduleEntryUpdate],
  );

  return {
    entries,
    conditions,
    setConditions,
    add,
    remove,
    toggleExpanded,
    toggleTailwind,
    setSpecies,
    updatePokemon,
    setEv,
    setIv,
    setBoost,
    updateName,
    updateNotes,
  };
};
