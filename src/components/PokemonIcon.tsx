import { toID } from '@smogon/calc';
import { useState } from 'react';

export const PokemonIcon = ({ species }: { species: string }) => {
  const [failed, setFailed] = useState(false);
  if (failed) return <>{species}</>;
  const src = `https://play.pokemonshowdown.com/sprites/dex/${toID(species)}.png`;
  return (
    <img
      className="inline-block w-[1.8em] h-[1.8em] object-contain align-[-0.5em]"
      src={src}
      alt={species}
      title={species}
      onError={() => setFailed(true)}
    />
  );
};
