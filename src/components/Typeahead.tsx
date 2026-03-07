import { useState, useRef, useEffect, useCallback } from 'react';

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
}

export function Typeahead({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
  allowEmpty = false,
  emptyLabel = '(none)',
  getLabel,
}: Props) {
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
    <div className="selector typeahead" ref={containerRef}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="text"
        value={query}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
      />
      {open && (
        <ul className="typeahead-list" ref={listRef}>
          {allItems.length === 0 && (
            <li className="typeahead-item typeahead-empty">No matches</li>
          )}
          {allItems.map((item, i) => (
            <li
              key={item || '__empty__'}
              className={`typeahead-item${i === highlightIndex ? ' highlighted' : ''}${item === value ? ' selected' : ''}`}
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
}
