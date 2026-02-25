import { useState, useCallback } from 'react';
import { parseInput } from '../parser';
import type { ParseResult } from '../types';

interface Props {
  onParsed: (result: ParseResult) => void;
  label: string;
}

export function ParseInput({ onParsed, label }: Props) {
  const [text, setText] = useState('');
  const [unmatched, setUnmatched] = useState<string[]>([]);

  const handleSubmit = useCallback(() => {
    if (!text.trim()) return;
    const result = parseInput(text);
    setUnmatched(result.unmatched);
    onParsed(result);
  }, [text, onParsed]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  return (
    <div className="parse-input">
      <input
        id={`${label}-parse`}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder='e.g. "Max SpA Specs Modest Flutter Moonblast"'
      />
      <button onClick={handleSubmit}>Apply</button>
      {unmatched.length > 0 && (
        <p className="parse-warnings">
          Unrecognized: {unmatched.join(', ')}
        </p>
      )}
    </div>
  );
}
