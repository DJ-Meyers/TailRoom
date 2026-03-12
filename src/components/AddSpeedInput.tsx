import { useCallback, useState } from 'react';

import type { SpeedEntry } from '~/types';
import { parseInput } from '~/utils/parser';
import { applyParsedToState, createDefaultPokemonState } from '~/utils/pokemonState';

interface Props {
  onAdd: (entry: Omit<SpeedEntry, 'id'>) => void;
}

export const AddSpeedInput = ({ onAdd }: Props) => {
  const [text, setText] = useState('');

  const handleSubmit = useCallback(() => {
    const trimmed = text.trim();

    if (!trimmed) {
      onAdd({
        name: '',
        notes: '',
        pokemon: applyParsedToState(
          createDefaultPokemonState('Incineroar', ''),
          { unmatched: [] },
        ),
        isExpanded: false,
      });
      return;
    }

    const result = parseInput(trimmed, { role: 'speed' });
    const pokemonState = applyParsedToState(
      createDefaultPokemonState(result.species ?? 'Garchomp', ''),
      result,
    );

    onAdd({
      name: '',
      notes: '',
      pokemon: pokemonState,
      isExpanded: false,
    });

    setText('');
  }, [text, onAdd]);

  return (
    <div className="flex gap-1.5 mb-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        placeholder='e.g. "252 Spe Jolly Tornadus"'
        className="flex-1 px-2 py-1.5 border border-border-light rounded text-sm bg-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      <button
        onClick={handleSubmit}
        className="px-3 py-1.5 border border-primary rounded bg-surface text-primary text-sm font-semibold cursor-pointer whitespace-nowrap hover:bg-primary hover:text-bg"
      >
        + Add
      </button>
    </div>
  );
};
