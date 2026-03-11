import { calculate, Field, Move, Pokemon, toID } from '@smogon/calc';

import { gen } from '~/data/gen';
import type { FieldConditions, PokemonState } from '~/types';

export interface DamageCalcResult {
  desc: string;
  range: [number, number];
  koChance: string;
  defenderMaxHp: number;
}

/** 0 = Guaranteed OHKO … 5 = No KO result */
export type KoTier = 0 | 1 | 2 | 3 | 4 | 5;

export const classifyKoTier = (result: DamageCalcResult | null): KoTier => {
  if (!result || !result.koChance) return 5;
  const kc = result.koChance;
  if (kc.includes('guaranteed OHKO')) return 0;
  if (kc.includes('OHKO')) return 1;
  if (kc.includes('guaranteed 2HKO')) return 2;
  if (kc.includes('2HKO')) return 3;
  return 4; // 3HKO+
};

export const KO_TIER_LABELS_OFFENSIVE: Record<KoTier, string> = {
  0: 'Guaranteed OHKO',
  1: 'Chance OHKO',
  2: 'Guaranteed 2HKO',
  3: 'Chance 2HKO',
  4: '3HKO+',
  5: 'No result',
};

export const KO_TIER_LABELS_DEFENSIVE: Record<KoTier, string> = {
  0: 'Guaranteed KO\'d',
  1: 'Chance KO\'d',
  2: 'Guaranteed 2HKO\'d',
  3: 'Chance 2HKO\'d',
  4: 'Survives (3HKO+)',
  5: 'No result',
};

const shouldActivateAbility = (pokemon: PokemonState, field: FieldConditions): boolean => {
  if (pokemon.abilityOn) return true;
  if (pokemon.ability === 'Protosynthesis' && (field.weather === 'Sun' || pokemon.item === 'Booster Energy')) return true;
  if (pokemon.ability === 'Quark Drive' && (field.terrain === 'Electric' || pokemon.item === 'Booster Energy')) return true;
  return false;
};

export const computeDamage = (
  attacker: PokemonState,
  defender: PokemonState,
  moveName: string,
  field: FieldConditions,
): DamageCalcResult | null => {
  try {
    if (!gen.species.get(toID(attacker.species))) return null;
    if (!gen.species.get(toID(defender.species))) return null;
    if (!gen.moves.get(toID(moveName))) return null;

    const atkAbilityOn = shouldActivateAbility(attacker, field);
    const defAbilityOn = shouldActivateAbility(defender, field);

    const atkPoke = new Pokemon(gen, attacker.species, {
      level: attacker.level,
      nature: attacker.nature,
      ability: attacker.ability,
      item: attacker.item || undefined,
      evs: attacker.evs,
      ivs: attacker.ivs,
      teraType: (attacker.teraType || undefined) as any,
      boosts: attacker.boosts,
      status: (attacker.status || undefined) as any,
      abilityOn: atkAbilityOn || undefined,
      boostedStat: (atkAbilityOn ? attacker.boostedStat || 'auto' : undefined) as any,
    });

    const defPoke = new Pokemon(gen, defender.species, {
      level: defender.level,
      nature: defender.nature,
      ability: defender.ability,
      item: defender.item || undefined,
      evs: defender.evs,
      ivs: defender.ivs,
      teraType: (defender.teraType || undefined) as any,
      boosts: defender.boosts,
      status: (defender.status || undefined) as any,
      abilityOn: defAbilityOn || undefined,
      boostedStat: (defAbilityOn ? defender.boostedStat || 'auto' : undefined) as any,
    });

    const move = new Move(gen, moveName, {
      isCrit: attacker.isCrit || undefined,
    });
    const calcField = new Field({
      gameType: 'Doubles',
      weather: field.weather,
      terrain: field.terrain,
      isBeadsOfRuin: field.isBeadsOfRuin,
      isSwordOfRuin: field.isSwordOfRuin,
      isTabletsOfRuin: field.isTabletsOfRuin,
      isVesselOfRuin: field.isVesselOfRuin,
      attackerSide: field.attackerSide,
      defenderSide: field.defenderSide,
    });
    const result = calculate(gen, atkPoke, defPoke, move, calcField);

    const range = result.range();
    const koChance = result.kochance();

    return {
      desc: result.desc(),
      range: range as [number, number],
      koChance: koChance?.text ?? '',
      defenderMaxHp: defPoke.maxHP(),
    };
  } catch {
    return null;
  }
};
