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
    <div className="flex flex-wrap gap-1.5 mb-4">
      <input
        id={`${label}-parse`}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder='e.g. "Max SpA Specs Flutter"'
        className="flex-1 px-2 py-1.5 border border-border rounded text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      <button onClick={handleSubmit} className="px-3 py-1.5 border-none rounded bg-primary text-bg text-sm font-semibold cursor-pointer hover:bg-primary-hover">Apply</button>
      {unmatched.length > 0 && (
        <p className="text-xs text-accent mt-1 basis-full">
          Unrecognized: {unmatched.join(', ')}
        </p>
      )}
    </div>
  );
};
