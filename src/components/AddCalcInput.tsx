import { useCallback, useState } from 'react';

import type { CalcEntry, SelectedPokemonModifiers } from '~/types';
import type { StatKey } from '~/types';
import { mergeFieldConditions, parseInput, parseModifiers } from '~/utils/parser';
import { applyParsedToState, createDefaultPokemonState, defaultSelectedPokemonModifiers } from '~/utils/pokemonState';

interface Props {
  mode: 'offensive' | 'defensive';
  onAdd: (entry: Omit<CalcEntry, 'id'>) => void;
}

const extractSelectedPokemonModifiers = (parsed: {
  teraType?: string;
  boosts?: Partial<Record<StatKey, number>>;
  status?: string;
  isCrit?: boolean;
  abilityOn?: boolean;
  boostedStat?: string;
}): SelectedPokemonModifiers => {
  const mods = defaultSelectedPokemonModifiers();
  if (parsed.teraType !== undefined) mods.teraType = parsed.teraType;
  if (parsed.status !== undefined) mods.status = parsed.status;
  if (parsed.isCrit !== undefined) mods.isCrit = parsed.isCrit;
  if (parsed.abilityOn !== undefined) mods.abilityOn = parsed.abilityOn;
  if (parsed.boostedStat !== undefined) mods.boostedStat = parsed.boostedStat;
  if (parsed.boosts) {
    for (const [k, v] of Object.entries(parsed.boosts)) {
      if (v !== undefined) mods.boosts[k as StatKey] = v;
    }
  }
  return mods;
};

export const AddCalcInput = ({ mode, onAdd }: Props) => {
  const [text, setText] = useState('');

  const handleSubmit = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (mode === 'offensive') {
      const parts = trimmed.split(/\s+vs\s+/i);
      const leftParsed = parseModifiers(parts[0] ?? trimmed);
      const move = leftParsed.move ?? '';
      const defenderParsed = parts[1]
        ? parseInput(parts[1], { role: 'defender', opposingMove: move })
        : { unmatched: [] as string[] };
      const defenderState = applyParsedToState(
        createDefaultPokemonState(defenderParsed.species ?? 'Garchomp', ''),
        defenderParsed,
      );
      const selectedPokemonModifiers = extractSelectedPokemonModifiers(leftParsed);
      const fieldConditions = mergeFieldConditions(
        leftParsed.fieldConditions ?? {},
        defenderParsed.fieldConditions ?? {},
      );
      onAdd({
        opponent: defenderState,
        move,
        fieldConditions,
        selectedPokemonModifiers,
        isExpanded: false,
      });
    } else {
      const result = parseInput(trimmed, { role: 'attacker' });
      const move = result.move ?? '';
      const attackerState = applyParsedToState(
        createDefaultPokemonState(result.species ?? 'Garchomp', move),
        result,
      );
      onAdd({
        opponent: attackerState,
        move,
        fieldConditions: result.fieldConditions ?? {},
        selectedPokemonModifiers: defaultSelectedPokemonModifiers(),
        isExpanded: false,
      });
    }

    setText('');
  }, [text, mode, onAdd]);

  const placeholder = mode === 'offensive'
    ? 'e.g. Tera Fairy Protosynthesis boosted Dazzling Gleam vs 188/44 AV Rilla'
    : 'e.g. Adamant Max Attack Chien-Pao Sucker Punch';

  return (
    <div className="flex gap-1.5 mt-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        placeholder={placeholder}
        className="flex-1 px-2 py-1.5 border border-border-light rounded text-sm bg-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      <button onClick={handleSubmit} className="px-3 py-1.5 border border-primary rounded bg-surface text-primary text-sm font-semibold cursor-pointer whitespace-nowrap hover:bg-primary hover:text-bg">+ Add</button>
    </div>
  );
};
