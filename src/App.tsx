import { useCallback, useMemo, useState } from 'react';
import { Pokemon, Move, Field, calculate, toID } from '@smogon/calc';
import { gen } from './data/gen';
import { usePokemon } from './hooks/usePokemon';
import { PokemonPanel } from './components/PokemonPanel';
import { DamageResult } from './components/DamageResult';
import { parseVsInput } from './parser';
import type { FieldConditions } from './types';

function App() {
  const attacker = usePokemon('Garchomp', 'Earthquake');
  const defender = usePokemon('Corviknight', '');
  const [vsInput, setVsInput] = useState('');
  const [fieldConditions, setFieldConditions] = useState<FieldConditions>({});

  const defenderParseContext = useMemo(
    () => ({ role: 'defender' as const, opposingMove: attacker.state.move }),
    [attacker.state.move],
  );

  const handleVsSubmit = useCallback(() => {
    if (!vsInput.trim()) return;
    const result = parseVsInput(vsInput);
    attacker.applyParsed(result.attacker);
    defender.applyParsed(result.defender);
    setFieldConditions(result.fieldConditions);
  }, [vsInput, attacker, defender]);

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
        boostedStat: (attacker.state.boostedStat || undefined) as any,
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
        boostedStat: (defender.state.boostedStat || undefined) as any,
      });

      const move = new Move(gen, attacker.state.move, {
        isCrit: attacker.state.isCrit || undefined,
      });
      const field = new Field({
        gameType: 'Doubles',
        weather: fieldConditions.weather,
        terrain: fieldConditions.terrain,
        isBeadsOfRuin: fieldConditions.isBeadsOfRuin,
        isSwordOfRuin: fieldConditions.isSwordOfRuin,
        isTabletsOfRuin: fieldConditions.isTabletsOfRuin,
        isVesselOfRuin: fieldConditions.isVesselOfRuin,
        attackerSide: fieldConditions.attackerSide,
        defenderSide: fieldConditions.defenderSide,
      });
      const result = calculate(gen, atkPoke, defPoke, move, field);

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
  }, [attacker.state, defender.state, fieldConditions]);

  const handleAttackerParsed = useCallback((parsed: import('./types').ParseResult) => {
    attacker.applyParsed(parsed);
    if (parsed.fieldConditions) {
      setFieldConditions(prev => ({ ...prev, ...parsed.fieldConditions }));
    }
  }, [attacker]);

  const handleDefenderParsed = useCallback((parsed: import('./types').ParseResult) => {
    defender.applyParsed(parsed);
    if (parsed.fieldConditions) {
      setFieldConditions(prev => ({ ...prev, ...parsed.fieldConditions }));
    }
  }, [defender]);

  return (
    <div className="app">
      <h1>Pokemon Damage Calculator</h1>
      <div className="vs-input">
        <input
          type="text"
          value={vsInput}
          onChange={(e) => setVsInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleVsSubmit()}
          placeholder="e.g. 252+ SpA Protosynthesis boosted Flutter Mane Dazzling Gleam vs 4 HP / 0 SpD Garchomp"
        />
        <button onClick={handleVsSubmit}>Calc</button>
      </div>
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
          onParsed={handleAttackerParsed}
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
          onParsed={handleDefenderParsed}
          parseContext={defenderParseContext}
        />
      </div>
    </div>
  );
}

export default App;
