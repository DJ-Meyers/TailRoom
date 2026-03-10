import { calculate, Field, Move, Pokemon, toID } from '@smogon/calc';

import { gen } from '~/data/gen';
import type { FieldConditions, PokemonState } from '~/types';

export interface DamageCalcResult {
  desc: string;
  range: [number, number];
  koChance: string;
  defenderMaxHp: number;
}

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
      abilityOn: attacker.abilityOn || undefined,
      boostedStat: (attacker.boostedStat || undefined) as any,
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
      abilityOn: defender.abilityOn || undefined,
      boostedStat: (defender.boostedStat || undefined) as any,
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
