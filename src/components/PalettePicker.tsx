import { useState, useEffect } from 'react';

const PALETTES = [
  { id: 'midnight',   label: 'Midnight',   swatch: '#6c63ff' },
  { id: 'ember',      label: 'Ember',      swatch: '#e8713a' },
  { id: 'forest',     label: 'Forest',     swatch: '#4caf68' },
  { id: 'ocean',      label: 'Ocean',      swatch: '#22b8cf' },
  { id: 'sakura',     label: 'Sakura',     swatch: '#e87aa0' },
  { id: 'nasa-punk',  label: 'NASA Punk',  swatch: '#e8652a' },
] as const;

const STORAGE_KEY = 'bordeaux-palette';

export const PalettePicker = () => {
  const [active, setActive] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) ?? 'midnight';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-palette', active);
    localStorage.setItem(STORAGE_KEY, active);
  }, [active]);

  return (
    <div className="flex items-center gap-2 justify-center mb-4">
      <span className="text-xs text-text-muted mr-1">Theme:</span>
      {PALETTES.map((p) => (
        <button
          key={p.id}
          onClick={() => setActive(p.id)}
          title={p.label}
          className="w-6 h-6 rounded-full border-2 cursor-pointer transition-transform hover:scale-110"
          style={{
            backgroundColor: p.swatch,
            borderColor: active === p.id ? 'var(--color-text)' : 'transparent',
            transform: active === p.id ? 'scale(1.15)' : undefined,
          }}
        />
      ))}
    </div>
  );
};
