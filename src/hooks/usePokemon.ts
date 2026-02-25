import { useState, useCallback } from 'react';
import type { PokemonState, StatsTable, StatKey, ParseResult } from '../types';
import { MAX_EV_PER_STAT, MAX_TOTAL_EVS, STAT_KEYS } from '../types';
import { getSpeciesAbilities } from '../data/gen';

const defaultEvs = (): StatsTable => ({ hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 });
const defaultIvs = (): StatsTable => ({ hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 });
const defaultBoosts = (): StatsTable => ({ hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 });

export function usePokemon(initialSpecies: string, initialMove: string) {
  const [state, setState] = useState<PokemonState>(() => {
    const abilities = getSpeciesAbilities(initialSpecies);
    return {
      species: initialSpecies,
      level: 100,
      nature: 'Hardy',
      ability: abilities[0] ?? '',
      item: '',
      evs: defaultEvs(),
      ivs: defaultIvs(),
      move: initialMove,
      teraType: '',
      boosts: defaultBoosts(),
      status: '',
      isCrit: false,
      abilityOn: false,
    };
  });

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
    setState((prev) => {
      const next = { ...prev };

      if (parsed.species) {
        next.species = parsed.species;
        const abilities = getSpeciesAbilities(parsed.species);
        if (parsed.ability && abilities.includes(parsed.ability)) {
          next.ability = parsed.ability;
        } else if (parsed.ability) {
          next.ability = parsed.ability;
        } else {
          next.ability = abilities[0] ?? prev.ability;
        }
      } else if (parsed.ability) {
        next.ability = parsed.ability;
      }

      if (parsed.move) next.move = parsed.move;
      if (parsed.nature) next.nature = parsed.nature;
      if (parsed.item !== undefined) next.item = parsed.item;
      if (parsed.level !== undefined) next.level = parsed.level;
      if (parsed.teraType !== undefined) next.teraType = parsed.teraType;
      if (parsed.status !== undefined) next.status = parsed.status;
      if (parsed.isCrit !== undefined) next.isCrit = parsed.isCrit;
      if (parsed.abilityOn !== undefined) next.abilityOn = parsed.abilityOn;

      if (parsed.evs) {
        const newEvs = defaultEvs();
        for (const [k, v] of Object.entries(parsed.evs)) {
          if (v !== undefined) newEvs[k as StatKey] = v;
        }
        next.evs = newEvs;
      }

      if (parsed.ivs) {
        const newIvs = defaultIvs();
        for (const [k, v] of Object.entries(parsed.ivs)) {
          if (v !== undefined) newIvs[k as StatKey] = v;
        }
        next.ivs = newIvs;
      }

      if (parsed.boosts) {
        const newBoosts = defaultBoosts();
        for (const [k, v] of Object.entries(parsed.boosts)) {
          if (v !== undefined) newBoosts[k as StatKey] = v;
        }
        next.boosts = newBoosts;
      }

      return next;
    });
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
}
