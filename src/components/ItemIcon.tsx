import { ITEM_SPRITE_NUM } from '~/data/itemSpriteNums';

const SHEET_URL =
  'https://play.pokemonshowdown.com/sprites/itemicons-sheet.png';
const COLS = 16;
/** Display size of each icon in em, matching the previous <img> sizing. */
const ICON_EM = 1.3;

export const ItemIcon = ({ item }: { item: string }) => {
  if (!item) return null;
  const num = ITEM_SPRITE_NUM[item];
  if (num == null) return null;

  const col = num % COLS;
  const row = Math.floor(num / COLS);

  return (
    <span
      className="inline-block align-[-0.25em] mx-[0.1em]"
      role="img"
      aria-label={item}
      title={item}
      style={{
        width: `${ICON_EM}em`,
        height: `${ICON_EM}em`,
        background: `transparent url(${SHEET_URL}) no-repeat`,
        backgroundPosition: `-${col * ICON_EM}em -${row * ICON_EM}em`,
        backgroundSize: `${COLS * ICON_EM}em auto`,
        imageRendering: 'auto',
      }}
    />
  );
};
