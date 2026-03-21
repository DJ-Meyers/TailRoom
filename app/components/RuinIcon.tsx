import type { ComponentType, SVGProps } from 'react';

import FishIcon from '~/assets/fish.svg?react';
import SwordIcon from '~/assets/sword.svg?react';
import TabletsIcon from '~/assets/tablets.svg?react';
import VesselIcon from '~/assets/vessel.svg?react';

const RUIN_BG = '#3A3A3C';

const RUIN_LABEL: Record<string, string> = {
  sword: 'Sword of Ruin',
  beads: 'Beads of Ruin',
  tablets: 'Tablets of Ruin',
  vessel: 'Vessel of Ruin',
};

const RUIN_COLOR: Record<string, string> = {
  sword: '#3DCEF3',
  beads: '#E62829',
  tablets: '#3FA129',
  vessel: 'rgb(145, 81, 33)',
};

const RUIN_ICON: Record<string, ComponentType<SVGProps<SVGSVGElement>> | undefined> = {
  sword: SwordIcon,
  beads: FishIcon,
  tablets: TabletsIcon,
  vessel: VesselIcon,
};

export const RuinIcon = ({ ruin }: { ruin: 'sword' | 'beads' | 'tablets' | 'vessel' }) => {
  const Icon = RUIN_ICON[ruin];
  return (
    <span
      className="inline-flex items-center justify-center rounded-sm align-[-0.15em] mx-[0.1em]"
      style={{ backgroundColor: RUIN_BG, width: '1.4em', height: '1.4em', color: RUIN_COLOR[ruin] }}
      title={RUIN_LABEL[ruin]}
    >
      {Icon && <Icon className="w-[1em] h-[1em]" />}
    </span>
  );
};
