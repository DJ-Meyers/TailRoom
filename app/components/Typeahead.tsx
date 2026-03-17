import { useCallback,useEffect, useRef, useState } from 'react';

interface Props {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  allowEmpty?: boolean;
  emptyLabel?: string;
  getLabel?: (value: string) => string;
  className?: string;
}

export const Typeahead = ({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
  allowEmpty = false,
  emptyLabel = '(none)',
  getLabel,
  className,
}: Props) => {
  const displayValue = (v: string) => (getLabel ? getLabel(v) : v);
  const [query, setQuery] = useState(displayValue(value));
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Sync query when value changes externally
  useEffect(() => {
    setQuery(displayValue(value));
  }, [value]);

  const filtered = query
    ? options.filter((o) => displayValue(o).toLowerCase().includes(query.toLowerCase()))
    : options;

  const allItems = allowEmpty ? ['', ...filtered] : filtered;

  const handleSelect = useCallback(
    (item: string) => {
      onChange(item);
      setQuery(displayValue(item));
      setOpen(false);
      setHighlightIndex(-1);
    },
    [onChange],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setOpen(true);
    setHighlightIndex(-1);
  };

  const handleFocus = () => {
    setOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightIndex((i) => Math.min(i + 1, allItems.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightIndex((i) => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightIndex >= 0 && highlightIndex < allItems.length) {
          handleSelect(allItems[highlightIndex]);
        }
        break;
      case 'Escape':
        setOpen(false);
        setHighlightIndex(-1);
        break;
    }
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightIndex >= 0 && listRef.current) {
      const item = listRef.current.children[highlightIndex] as HTMLElement;
      item?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightIndex]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setHighlightIndex(-1);
        // Reset query to current value if user didn't select
        setQuery(displayValue(value));
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [value]);

  return (
    <div className={`relative mb-3 ${className ?? ''}`} ref={containerRef}>
      <label htmlFor={id} className="block text-xs font-semibold text-text-muted mb-0.5">{label}</label>
      <input
        id={id}
        type="text"
        value={query}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full px-2 py-1.5 border border-border rounded text-sm bg-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      {open && (
        <ul className="absolute z-20 left-0 right-0 max-h-[200px] overflow-y-auto list-none bg-surface border border-border border-t-0 rounded-b shadow-md" ref={listRef}>
          {allItems.length === 0 && (
            <li className="px-2 py-1 text-sm text-text-dim italic cursor-default">No matches</li>
          )}
          {allItems.map((item, i) => (
            <li
              key={item || '__empty__'}
              className={`px-2 py-1 text-sm cursor-pointer ${i === highlightIndex ? 'bg-highlight' : ''} ${item === value ? 'font-semibold' : ''}`}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(item);
              }}
              onMouseEnter={() => setHighlightIndex(i)}
            >
              {item ? displayValue(item) : emptyLabel}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
