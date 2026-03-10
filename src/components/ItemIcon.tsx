import { useState } from 'react';

const toKebabCase = (name: string) =>
  name.toLowerCase().replace(/'/g, '').replace(/ /g, '-');

export const ItemIcon = ({ item }: { item: string }) => {
  const [failed, setFailed] = useState(false);
  if (!item || failed) return null;
  const src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${toKebabCase(item)}.png`;
  return (
    <img
      className="inline-block w-[1.3em] h-[1.3em] object-contain align-[-0.25em] mx-[0.1em]"
      src={src}
      alt={item}
      title={item}
      onError={() => setFailed(true)}
    />
  );
};
