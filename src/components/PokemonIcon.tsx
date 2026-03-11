import { useState } from 'react';

const REGION_SUFFIXES: [RegExp, string][] = [
  [/-alola(-|$)/, '-alolan$1'],
  [/-galar(-|$)/, '-galarian$1'],
  [/-hisui(-|$)/, '-hisuian$1'],
  [/-paldea(-|$)/, '-paldean$1'],
];

const toSpriteId = (species: string): string => {
  let id = species
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  for (const [pattern, replacement] of REGION_SUFFIXES) {
    id = id.replace(pattern, replacement);
  }
  return id;
};

export const PokemonIcon = ({ species, className }: { species: string; className?: string }) => {
  const [failed, setFailed] = useState(false);
  if (failed) return <>{species}</>;
  const src = `https://img.pokemondb.net/sprites/scarlet-violet/icon/${toSpriteId(species)}.png`;
  return (
    <span className={className ?? "relative inline-block w-[1.8em] h-[1.4em] overflow-hidden align-middle"}>
      <img
        className="absolute bottom-0 left-0 w-full"
        src={src}
        alt={species}
        title={species}
        onError={() => setFailed(true)}
      />
    </span>
  );
};
