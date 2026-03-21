import { useCallback, useReducer, useState } from 'react';

import { getSpeciesAbilities } from '~/data/gen';
import type { PokemonState, SpeedConditions, SpeedEntry, StatKey } from '~/types';
import { MAX_EV_PER_STAT, MAX_TOTAL_EVS, STAT_KEYS } from '~/types';

type Action =
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

let nextId = 1;

export const useSpeedCalc = (initialEntries: SpeedEntry[] = []) => {
  const [entries, dispatch] = useReducer(reducer, initialEntries);
  const [conditions, setConditions] = useState<SpeedConditions>({
    yourTailwind: false,
    yourBoost: 0,
  });

  const add = useCallback((entry: Omit<SpeedEntry, 'id'>) => {
    const id = `spd-${nextId++}`;
    dispatch({ type: 'ADD', entry: { ...entry, id } });
  }, []);

  const remove = useCallback((id: string) => {
    dispatch({ type: 'REMOVE', id });
  }, []);

  const toggleExpanded = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_EXPANDED', id });
  }, []);

  const toggleTailwind = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_TAILWIND', id });
  }, []);

  const setSpecies = useCallback((id: string, species: string) => {
    dispatch({ type: 'SET_SPECIES', id, species });
  }, []);

  const updatePokemon = useCallback((id: string, patch: Partial<PokemonState>) => {
    dispatch({ type: 'UPDATE_POKEMON', id, patch });
  }, []);

  const setEv = useCallback((id: string, stat: StatKey, value: number) => {
    dispatch({ type: 'SET_EV', id, stat, value });
  }, []);

  const setIv = useCallback((id: string, stat: StatKey, value: number) => {
    dispatch({ type: 'SET_IV', id, stat, value });
  }, []);

  const setBoost = useCallback((id: string, stat: StatKey, value: number) => {
    dispatch({ type: 'SET_BOOST', id, stat, value });
  }, []);

  const updateName = useCallback((id: string, name: string) => {
    dispatch({ type: 'UPDATE_NAME', id, name });
  }, []);

  const updateNotes = useCallback((id: string, notes: string) => {
    dispatch({ type: 'UPDATE_NOTES', id, notes });
  }, []);

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
