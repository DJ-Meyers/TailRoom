import { useMemo } from 'react';
import { Pokemon, Move, calculate, toID } from '@smogon/calc';
import { gen } from './data/gen';
import { usePokemon } from './hooks/usePokemon';
import { PokemonPanel } from './components/PokemonPanel';
import { DamageResult } from './components/DamageResult';

function App() {
  const attacker = usePokemon('Garchomp', 'Earthquake');
  const defender = usePokemon('Corviknight', '');

  const damageResult = useMemo(() => {
    try {
      if (!gen.species.get(toID(attacker.state.species))) return null;
      if (!gen.species.get(toID(defender.state.species))) return null;
      if (!gen.moves.get(toID(attacker.state.move))) return null;

      const atkPoke = new Pokemon(gen, attacker.state.species, {
        level: attacker.state.level,
        nature: attacker.state.nature,
        ability: attacker.state.ability,
        item: attacker.state.item || undefined,
        evs: attacker.state.evs,
        ivs: attacker.state.ivs,
        teraType: (attacker.state.teraType || undefined) as any,
        boosts: attacker.state.boosts,
        status: (attacker.state.status || undefined) as any,
        abilityOn: attacker.state.abilityOn || undefined,
      });

      const defPoke = new Pokemon(gen, defender.state.species, {
        level: defender.state.level,
        nature: defender.state.nature,
        ability: defender.state.ability,
        item: defender.state.item || undefined,
        evs: defender.state.evs,
        ivs: defender.state.ivs,
        teraType: (defender.state.teraType || undefined) as any,
        boosts: defender.state.boosts,
        status: (defender.state.status || undefined) as any,
        abilityOn: defender.state.abilityOn || undefined,
      });

      const move = new Move(gen, attacker.state.move, {
        isCrit: attacker.state.isCrit || undefined,
      });
      const result = calculate(gen, atkPoke, defPoke, move);

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
  }, [attacker.state, defender.state]);

  return (
    <div className="app">
      <h1>Pokemon Damage Calculator</h1>
      <div className="layout">
        <PokemonPanel
          label="Attacker"
          state={attacker.state}
          abilities={attacker.abilities}
          showMove={true}
          onSpeciesChange={attacker.setSpecies}
          onNatureChange={attacker.setNature}
          onAbilityChange={attacker.setAbility}
          onItemChange={attacker.setItem}
          onMoveChange={attacker.setMove}
          onEvChange={attacker.setEv}
          onIvChange={attacker.setIv}
          onTeraTypeChange={attacker.setTeraType}
          onBoostChange={attacker.setBoost}
          onStatusChange={attacker.setStatus}
          onIsCritChange={attacker.setIsCrit}
          onParsed={attacker.applyParsed}
        />
        <DamageResult result={damageResult} />
        <PokemonPanel
          label="Defender"
          state={defender.state}
          abilities={defender.abilities}
          showMove={false}
          onSpeciesChange={defender.setSpecies}
          onNatureChange={defender.setNature}
          onAbilityChange={defender.setAbility}
          onItemChange={defender.setItem}
          onMoveChange={defender.setMove}
          onEvChange={defender.setEv}
          onIvChange={defender.setIv}
          onTeraTypeChange={defender.setTeraType}
          onBoostChange={defender.setBoost}
          onStatusChange={defender.setStatus}
          onIsCritChange={defender.setIsCrit}
          onParsed={defender.applyParsed}
        />
      </div>
    </div>
  );
}

export default App;
