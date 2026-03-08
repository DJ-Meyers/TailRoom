import { useCallback,useState } from 'react';

import type { ParseResult } from '~/types';
import type { ParseContext } from '~/utils/parser';
import { parseInput } from '~/utils/parser';

interface Props {
  onParsed: (result: ParseResult) => void;
  label: string;
  parseContext?: ParseContext;
}

export const ParseInput = ({ onParsed, label, parseContext }: Props) => {
  const [text, setText] = useState('');
  const [unmatched, setUnmatched] = useState<string[]>([]);

  const handleSubmit = useCallback(() => {
    if (!text.trim()) return;
    const result = parseInput(text, parseContext);
    setUnmatched(result.unmatched);
    onParsed(result);
  }, [text, onParsed, parseContext]);

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
};
