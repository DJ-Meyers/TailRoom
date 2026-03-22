import { TYPE_SPRITE_ID } from '~/constants';

import type1 from 'pokemon-sprites/sprites/types/generation-ix/scarlet-violet/small/Tera/1.png';
import type2 from 'pokemon-sprites/sprites/types/generation-ix/scarlet-violet/small/Tera/2.png';
import type3 from 'pokemon-sprites/sprites/types/generation-ix/scarlet-violet/small/Tera/3.png';
import type4 from 'pokemon-sprites/sprites/types/generation-ix/scarlet-violet/small/Tera/4.png';
import type5 from 'pokemon-sprites/sprites/types/generation-ix/scarlet-violet/small/Tera/5.png';
import type6 from 'pokemon-sprites/sprites/types/generation-ix/scarlet-violet/small/Tera/6.png';
import type7 from 'pokemon-sprites/sprites/types/generation-ix/scarlet-violet/small/Tera/7.png';
import type8 from 'pokemon-sprites/sprites/types/generation-ix/scarlet-violet/small/Tera/8.png';
import type9 from 'pokemon-sprites/sprites/types/generation-ix/scarlet-violet/small/Tera/9.png';
import type10 from 'pokemon-sprites/sprites/types/generation-ix/scarlet-violet/small/Tera/10.png';
import type11 from 'pokemon-sprites/sprites/types/generation-ix/scarlet-violet/small/Tera/11.png';
import type12 from 'pokemon-sprites/sprites/types/generation-ix/scarlet-violet/small/Tera/12.png';
import type13 from 'pokemon-sprites/sprites/types/generation-ix/scarlet-violet/small/Tera/13.png';
import type14 from 'pokemon-sprites/sprites/types/generation-ix/scarlet-violet/small/Tera/14.png';
import type15 from 'pokemon-sprites/sprites/types/generation-ix/scarlet-violet/small/Tera/15.png';
import type16 from 'pokemon-sprites/sprites/types/generation-ix/scarlet-violet/small/Tera/16.png';
import type17 from 'pokemon-sprites/sprites/types/generation-ix/scarlet-violet/small/Tera/17.png';
import type18 from 'pokemon-sprites/sprites/types/generation-ix/scarlet-violet/small/Tera/18.png';

const SPRITE_MAP: Record<number, string> = {
  1: type1, 2: type2, 3: type3, 4: type4, 5: type5,
  6: type6, 7: type7, 8: type8, 9: type9, 10: type10,
  11: type11, 12: type12, 13: type13, 14: type14, 15: type15,
  16: type16, 17: type17, 18: type18,
};

export const TypeIcon = ({ typeName }: { typeName: string }) => {
  const id = TYPE_SPRITE_ID[typeName];
  const src = id ? SPRITE_MAP[id] : null;
  if (!src) return <>{typeName}</>;
  return <img className="inline-block w-[1.1em] h-[1.1em] object-contain align-[-0.15em] mx-[0.1em]" src={src} alt={`Tera ${typeName}`} title={`Tera ${typeName}`} />;
};
