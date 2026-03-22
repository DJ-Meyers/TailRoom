import { useState } from 'react';
import { toSpriteId } from '~/data/spriteNames';

const SPRITE_BASE = 'https://play.pokemonshowdown.com/sprites/home-centered';
const FALLBACK_SRC = `${SPRITE_BASE}/ditto.png`;

export const PokemonIcon = ({ species, className }: { species: string; className?: string }) => {
  const [failed, setFailed] = useState(false);
  const src = failed ? FALLBACK_SRC : `${SPRITE_BASE}/${toSpriteId(species)}.png`;
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
