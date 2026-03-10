import { useCallback, useReducer } from 'react';

import { getSpeciesAbilities } from '~/data/gen';
import type { CalcEntry, FieldConditions, PokemonState, SelectedPokemonModifiers, StatKey } from '~/types';
import { MAX_EV_PER_STAT, MAX_TOTAL_EVS, STAT_KEYS } from '~/types';

type Action =
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
  | { type: 'SET_SELECTED_POKEMON_BOOST'; id: string; stat: StatKey; value: number };

const reducer = (state: CalcEntry[], action: Action): CalcEntry[] => {
  switch (action.type) {
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

    default:
      return state;
  }
};

let nextId = 1;

export const useMultiCalc = (initialEntries: CalcEntry[] = []) => {
  const [entries, dispatch] = useReducer(reducer, initialEntries);

  const add = useCallback((entry: Omit<CalcEntry, 'id'>) => {
    const id = String(nextId++);
    dispatch({ type: 'ADD', entry: { ...entry, id } });
  }, []);

  const remove = useCallback((id: string) => {
    dispatch({ type: 'REMOVE', id });
  }, []);

  const toggleExpanded = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_EXPANDED', id });
  }, []);

  const updateOpponent = useCallback((id: string, patch: Partial<PokemonState>) => {
    dispatch({ type: 'UPDATE_OPPONENT', id, patch });
  }, []);

  const setOpponentSpecies = useCallback((id: string, species: string) => {
    dispatch({ type: 'SET_OPPONENT_SPECIES', id, species });
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

  const updateMove = useCallback((id: string, move: string) => {
    dispatch({ type: 'UPDATE_MOVE', id, move });
  }, []);

  const updateField = useCallback((id: string, field: FieldConditions) => {
    dispatch({ type: 'UPDATE_FIELD', id, field });
  }, []);

  const updateSelectedPokemonModifiers = useCallback((id: string, patch: Partial<SelectedPokemonModifiers>) => {
    dispatch({ type: 'UPDATE_SELECTED_POKEMON_MODIFIERS', id, patch });
  }, []);

  const setSelectedPokemonBoost = useCallback((id: string, stat: StatKey, value: number) => {
    dispatch({ type: 'SET_SELECTED_POKEMON_BOOST', id, stat, value });
  }, []);

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
  };
};
