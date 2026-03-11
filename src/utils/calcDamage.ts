import { calculate, Field, Move, Pokemon, toID } from '@smogon/calc';

import { gen } from '~/data/gen';
import type { FieldConditions, PokemonState } from '~/types';

export interface DamageCalcResult {
  desc: string;
  range: [number, number];
  koChance: string;
  defenderMaxHp: number;
}

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
