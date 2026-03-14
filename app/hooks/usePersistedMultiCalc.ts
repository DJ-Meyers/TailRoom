import { useCallback, useEffect, useReducer, useRef } from 'react';

import { getSpeciesAbilities } from '~/data/gen';
import { useTRPC } from '~/trpc/client';
import type { CalcEntry, FieldConditions, PokemonState, SelectedPokemonModifiers, StatKey } from '~/types';
import { MAX_EV_PER_STAT, MAX_TOTAL_EVS, STAT_KEYS } from '~/types';
import { calcEntryToDbInput, dbCalcEntryToCalcEntry } from '~/utils/marshalling';
import { useQueryClient } from '@tanstack/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';

// Same reducer as useMultiCalc
type Action =
  | { type: 'INIT'; entries: CalcEntry[] }
  | { type: 'ADD'; entry: CalcEntry }
  | { type: 'REMOVE'; id: string }
  | { type: 'TOGGLE_EXPANDED'; id: string }
  | { type: 'UPDATE_OPPONENT'; id: string; patch: Partial<PokemonState> }
  | { type: 'SET_OPPONENT_SPECIES'; id: string; species: string }
  | { type: 'SET_EV'; id: string; stat: StatKey; value: number }
  | { type: 'SET_IV'; id: string; stat: StatKey; value: number }
  | { type: 'SET_BOOST'; id: string; stat: StatKey; value: number }
  | { type: 'UPDATE_MOVE'; id: string; move: string }
  | { type: 'UPDATE_FIELD'; id: string; field: FieldConditions }
  | { type: 'UPDATE_SELECTED_POKEMON_MODIFIERS'; id: string; patch: Partial<SelectedPokemonModifiers> }
  | { type: 'SET_SELECTED_POKEMON_BOOST'; id: string; stat: StatKey; value: number }
  | { type: 'UPDATE_NAME'; id: string; name: string }
  | { type: 'UPDATE_NOTES'; id: string; notes: string };

const reducer = (state: CalcEntry[], action: Action): CalcEntry[] => {
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

    case 'UPDATE_OPPONENT':
      return state.map((e) =>
        e.id === action.id ? { ...e, opponent: { ...e.opponent, ...action.patch } } : e,
      );

    case 'SET_OPPONENT_SPECIES': {
      const abilities = getSpeciesAbilities(action.species);
      return state.map((e) =>
        e.id === action.id
          ? {
              ...e,
              opponent: {
                ...e.opponent,
                species: action.species,
                ability: abilities[0] ?? e.opponent.ability,
              },
            }
          : e,
      );
    }

    case 'SET_EV':
      return state.map((e) => {
        if (e.id !== action.id) return e;
        const clamped = Math.min(action.value, MAX_EV_PER_STAT);
        const totalOther = STAT_KEYS.reduce(
          (sum, k) => sum + (k === action.stat ? 0 : e.opponent.evs[k]),
          0,
        );
        const maxAllowed = Math.min(clamped, MAX_TOTAL_EVS - totalOther);
        return {
          ...e,
          opponent: {
            ...e.opponent,
            evs: { ...e.opponent.evs, [action.stat]: Math.max(0, maxAllowed) },
          },
        };
      });

    case 'SET_IV':
      return state.map((e) =>
        e.id === action.id
          ? {
              ...e,
              opponent: {
                ...e.opponent,
                ivs: { ...e.opponent.ivs, [action.stat]: Math.max(0, Math.min(31, action.value)) },
              },
            }
          : e,
      );

    case 'SET_BOOST':
      return state.map((e) =>
        e.id === action.id
          ? {
              ...e,
              opponent: {
                ...e.opponent,
                boosts: {
                  ...e.opponent.boosts,
                  [action.stat]: Math.max(-6, Math.min(6, action.value)),
                },
              },
            }
          : e,
      );

    case 'UPDATE_MOVE':
      return state.map((e) =>
        e.id === action.id ? { ...e, move: action.move } : e,
      );

    case 'UPDATE_FIELD':
      return state.map((e) =>
        e.id === action.id ? { ...e, fieldConditions: action.field } : e,
      );

    case 'UPDATE_SELECTED_POKEMON_MODIFIERS':
      return state.map((e) =>
        e.id === action.id
          ? { ...e, selectedPokemonModifiers: { ...e.selectedPokemonModifiers, ...action.patch } }
          : e,
      );

    case 'SET_SELECTED_POKEMON_BOOST':
      return state.map((e) =>
        e.id === action.id
          ? {
              ...e,
              selectedPokemonModifiers: {
                ...e.selectedPokemonModifiers,
                boosts: {
                  ...e.selectedPokemonModifiers.boosts,
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

export const usePersistedMultiCalc = (
  pokemonId: string,
  mode: 'offensive' | 'defensive',
) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [entries, dispatch] = useReducer(reducer, []);
  const initialized = useRef(false);
  const pendingUpdates = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const { data: dbEntries } = useQuery(
    trpc.calcEntry.listByPokemon.queryOptions({ pokemonId }),
  );

  // Initialize from query data, filtering by mode
  useEffect(() => {
    if (dbEntries && !initialized.current) {
      initialized.current = true;
      const filtered = dbEntries
        .filter((e) => e.mode === mode)
        .map(dbCalcEntryToCalcEntry);
      dispatch({ type: 'INIT', entries: filtered });
    }
  }, [dbEntries, mode]);

  const createMutation = useMutation(
    trpc.calcEntry.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.calcEntry.listByPokemon.queryKey({ pokemonId }),
        });
      },
    }),
  );

  const updateMutation = useMutation(
    trpc.calcEntry.update.mutationOptions(),
  );

  const deleteMutation = useMutation(
    trpc.calcEntry.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.calcEntry.listByPokemon.queryKey({ pokemonId }),
        });
      },
    }),
  );

  // Flush pending updates on unmount
  useEffect(() => {
    return () => {
      pendingUpdates.current.forEach((timer) => clearTimeout(timer));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pokemonId]);

  const scheduleEntryUpdate = useCallback(
    (id: string, getEntry: () => CalcEntry | undefined) => {
      const existing = pendingUpdates.current.get(id);
      if (existing) clearTimeout(existing);

      const timer = setTimeout(() => {
        pendingUpdates.current.delete(id);
        const entry = getEntry();
        if (entry) {
          const dbInput = calcEntryToDbInput(entry, pokemonId, mode, 0);
          updateMutation.mutate({ id, ...dbInput });
        }
      }, 500);
      pendingUpdates.current.set(id, timer);
    },
    [pokemonId, mode, updateMutation],
  );

  // We need a ref to entries for debounced callbacks
  const entriesRef = useRef(entries);
  entriesRef.current = entries;

  const add = useCallback(
    (entry: Omit<CalcEntry, 'id'>) => {
      const dbInput = calcEntryToDbInput(
        { ...entry, id: '' },
        pokemonId,
        mode,
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
    [pokemonId, mode, createMutation],
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

  const updateOpponent = useCallback(
    (id: string, patch: Partial<PokemonState>) => {
      dispatch({ type: 'UPDATE_OPPONENT', id, patch });
      scheduleEntryUpdate(id, () => entriesRef.current.find((e) => e.id === id));
    },
    [scheduleEntryUpdate],
  );

  const setOpponentSpecies = useCallback(
    (id: string, species: string) => {
      dispatch({ type: 'SET_OPPONENT_SPECIES', id, species });
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

  const updateMove = useCallback(
    (id: string, move: string) => {
      dispatch({ type: 'UPDATE_MOVE', id, move });
      scheduleEntryUpdate(id, () => entriesRef.current.find((e) => e.id === id));
    },
    [scheduleEntryUpdate],
  );

  const updateField = useCallback(
    (id: string, field: FieldConditions) => {
      dispatch({ type: 'UPDATE_FIELD', id, field });
      scheduleEntryUpdate(id, () => entriesRef.current.find((e) => e.id === id));
    },
    [scheduleEntryUpdate],
  );

  const updateSelectedPokemonModifiers = useCallback(
    (id: string, patch: Partial<SelectedPokemonModifiers>) => {
      dispatch({ type: 'UPDATE_SELECTED_POKEMON_MODIFIERS', id, patch });
      scheduleEntryUpdate(id, () => entriesRef.current.find((e) => e.id === id));
    },
    [scheduleEntryUpdate],
  );

  const setSelectedPokemonBoost = useCallback(
    (id: string, stat: StatKey, value: number) => {
      dispatch({ type: 'SET_SELECTED_POKEMON_BOOST', id, stat, value });
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
    add,
    remove,
    toggleExpanded,
    updateOpponent,
    setOpponentSpecies,
    setEv,
    setIv,
    setBoost,
    updateMove,
    updateField,
    updateSelectedPokemonModifiers,
    setSelectedPokemonBoost,
    updateName,
    updateNotes,
  };
};
