import { useCallback, useState } from 'react';

import { getSpeciesAbilities } from '~/data/gen';
import type { ParseResult, PokemonState, StatKey } from '~/types';
import { MAX_EV_PER_STAT, MAX_TOTAL_EVS, STAT_KEYS } from '~/types';
import { applyParsedToState, createDefaultPokemonState } from '~/utils/pokemonState';

export const usePokemon = (initialSpecies: string, initialMove: string, overrides?: Partial<PokemonState>) => {
  const [state, setState] = useState<PokemonState>(() =>
    createDefaultPokemonState(initialSpecies, initialMove, overrides),
  );

  const setSpecies = useCallback((species: string) => {
    const abilities = getSpeciesAbilities(species);
    setState((prev) => ({
      ...prev,
      species,
      ability: abilities[0] ?? prev.ability,
    }));
  }, []);

  const setNature = useCallback((nature: string) => {
    setState((prev) => ({ ...prev, nature }));
  }, []);

  const setAbility = useCallback((ability: string) => {
    setState((prev) => ({ ...prev, ability }));
  }, []);

  const setItem = useCallback((item: string) => {
    setState((prev) => ({ ...prev, item }));
  }, []);

  const setMove = useCallback((move: string) => {
    setState((prev) => ({ ...prev, move }));
  }, []);

  const setEv = useCallback((stat: StatKey, value: number) => {
    setState((prev) => {
      const clamped = Math.min(value, MAX_EV_PER_STAT);
      const totalOther = STAT_KEYS.reduce(
        (sum, k) => sum + (k === stat ? 0 : prev.evs[k]),
        0
      );
      const maxAllowed = Math.min(clamped, MAX_TOTAL_EVS - totalOther);
      return { ...prev, evs: { ...prev.evs, [stat]: Math.max(0, maxAllowed) } };
    });
  }, []);

  const setIv = useCallback((stat: StatKey, value: number) => {
    const clamped = Math.max(0, Math.min(31, value));
    setState((prev) => ({ ...prev, ivs: { ...prev.ivs, [stat]: clamped } }));
  }, []);

  const setTeraType = useCallback((teraType: string) => {
    setState((prev) => ({ ...prev, teraType }));
  }, []);

  const setBoost = useCallback((stat: StatKey, value: number) => {
    setState((prev) => ({
      ...prev,
      boosts: { ...prev.boosts, [stat]: Math.max(-6, Math.min(6, value)) },
    }));
  }, []);

  const setStatus = useCallback((status: string) => {
    setState((prev) => ({ ...prev, status }));
  }, []);

  const setIsCrit = useCallback((isCrit: boolean) => {
    setState((prev) => ({ ...prev, isCrit }));
  }, []);

  const applyParsed = useCallback((parsed: ParseResult) => {
    setState((prev) => applyParsedToState(prev, parsed));
  }, []);

  return {
    state,
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
    abilities: getSpeciesAbilities(state.species),
  };
};
