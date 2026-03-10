import { getSpeciesAbilities } from '~/data/gen';
import type { ParseResult, PokemonState, SelectedPokemonModifiers, StatKey, StatsTable } from '~/types';

export const defaultEvs = (): StatsTable => ({ hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 });
export const defaultIvs = (): StatsTable => ({ hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 });
export const defaultBoosts = (): StatsTable => ({ hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 });

export const defaultSelectedPokemonModifiers = (): SelectedPokemonModifiers => ({
  teraType: '',
  boosts: defaultBoosts(),
  status: '',
  isCrit: false,
  abilityOn: false,
  boostedStat: '',
});

export const createDefaultPokemonState = (
  species: string,
  move: string,
  overrides?: Partial<PokemonState>,
): PokemonState => {
  const abilities = getSpeciesAbilities(species);
  return {
    species,
    level: 50,
    nature: 'Hardy',
    ability: abilities[0] ?? '',
    item: '',
    evs: defaultEvs(),
    ivs: defaultIvs(),
    move,
    teraType: '',
    boosts: defaultBoosts(),
    status: '',
    isCrit: false,
    abilityOn: false,
    boostedStat: '',
    ...overrides,
  };
};

export const applyParsedToState = (prev: PokemonState, parsed: ParseResult): PokemonState => {
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
  if (parsed.boostedStat !== undefined) next.boostedStat = parsed.boostedStat;

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
};
