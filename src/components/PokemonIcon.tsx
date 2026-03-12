import { toID } from '@smogon/calc';
import { useState } from 'react';

const SPRITE_BASE = 'https://play.pokemonshowdown.com/sprites/home';

export const PokemonIcon = ({ species, className }: { species: string; className?: string }) => {
  const [failed, setFailed] = useState(false);
  if (failed) return <>{species}</>;
  const src = `${SPRITE_BASE}/${toID(species)}.png`;
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
