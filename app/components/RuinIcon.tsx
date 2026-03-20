const RUIN_BG = '#3A3A3C';

const RUIN_EMOJI: Record<string, string> = {
  sword: '🗡️',
  beads: '🐟',
  tablets: '🐌',
  vessel: '🐄',
};

const RUIN_LABEL: Record<string, string> = {
  sword: 'Sword of Ruin',
  beads: 'Beads of Ruin',
  tablets: 'Tablets of Ruin',
  vessel: 'Vessel of Ruin',
};

export const RuinIcon = ({ ruin }: { ruin: 'sword' | 'beads' | 'tablets' | 'vessel' }) => (
  <span
    className="inline-flex items-center justify-center rounded-sm align-[-0.15em] mx-[0.1em]"
    style={{ backgroundColor: RUIN_BG, width: '1.3em', height: '1.3em' }}
    title={RUIN_LABEL[ruin]}
  >
    <span style={{ fontSize: '0.7em', lineHeight: 1 }}>{RUIN_EMOJI[ruin]}</span>
  </span>
);
