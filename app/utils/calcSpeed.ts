import { Pokemon } from '@smogon/calc';

import { gen } from '~/data/gen';
import type { PokemonState, SpeedConditions } from '~/types';
import { shouldActivateAbility } from '~/utils/calcDamage';

const WEATHER_SPEED_ABILITIES: Record<string, string> = {
  Chlorophyll: 'Sun',
  'Swift Swim': 'Rain',
  'Sand Rush': 'Sand',
  'Slush Rush': 'Snow',
};

export const computeEffectiveSpeed = (
  pokemon: PokemonState,
  conditions: SpeedConditions,
  hasTailwind: boolean,
): number => {
  try {
    const poke = new Pokemon(gen, pokemon.species, {
      level: pokemon.level,
      nature: pokemon.nature,
      ability: pokemon.ability,
      item: pokemon.item || undefined,
      evs: pokemon.evs,
      ivs: pokemon.ivs,
    });

    let speed = poke.rawStats.spe;

    // Apply boost stages
    const boost = pokemon.boosts.spe;
    if (boost > 0) {
      speed = Math.floor(speed * (2 + boost) / 2);
    } else if (boost < 0) {
      speed = Math.floor(speed * 2 / (2 - boost));
    }

    // Build field conditions for shouldActivateAbility
    const fieldForAbility = {
      weather: conditions.weather,
      terrain: conditions.terrain,
    };

    // Tailwind: 2x
    if (hasTailwind) {
      speed = Math.floor(speed * 2);
    }

    // Choice Scarf: 1.5x
    if (pokemon.item === 'Choice Scarf') {
      speed = Math.floor(speed * 6144 / 4096);
    }

    // Iron Ball: 0.5x
    if (pokemon.item === 'Iron Ball') {
      speed = Math.floor(speed * 2048 / 4096);
    }

    // Weather speed abilities: 2x
    const weatherMatch = WEATHER_SPEED_ABILITIES[pokemon.ability];
    if (weatherMatch && conditions.weather === weatherMatch) {
      speed = Math.floor(speed * 2);
    }

    // Surge Surfer: 2x in Electric Terrain
    if (pokemon.ability === 'Surge Surfer' && conditions.terrain === 'Electric') {
      speed = Math.floor(speed * 2);
    }

    // Protosynthesis / Quark Drive: 1.5x when speed is boosted stat
    if (
      (pokemon.ability === 'Protosynthesis' || pokemon.ability === 'Quark Drive') &&
      shouldActivateAbility(pokemon, fieldForAbility)
    ) {
      const boostedStat = pokemon.boostedStat || 'auto';
      // If boostedStat is 'auto' or 'spe', apply the speed boost
      // In practice, if the user sets boostedStat to 'spe' or leaves it as auto
      // and speed is the highest stat, it activates
      if (boostedStat === 'spe' || boostedStat === 'auto') {
        speed = Math.floor(speed * 6144 / 4096);
      }
    }

    // Unburden: 2x (when abilityOn is true, meaning item consumed)
    if (pokemon.ability === 'Unburden' && pokemon.abilityOn) {
      speed = Math.floor(speed * 2);
    }

    // Paralysis: 50% (unless Quick Feet)
    if (pokemon.status === 'par' && pokemon.ability !== 'Quick Feet') {
      speed = Math.floor(speed * 50 / 100);
    }

    // Quick Feet: 1.5x when statused
    if (pokemon.ability === 'Quick Feet' && pokemon.status) {
      speed = Math.floor(speed * 6144 / 4096);
    }

    return Math.max(0, Math.min(10000, speed));
  } catch {
    return 0;
  }
};
