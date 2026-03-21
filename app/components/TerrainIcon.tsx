import grassyIcon from '~/assets/terrain-grassy.png';
import electricIcon from '~/assets/terrain-electric.png';
import psychicIcon from '~/assets/terrain-psychic.png';
import mistyIcon from '~/assets/terrain-misty.png';

const TERRAIN_DATA: Record<string, { icon: string; bg: string; label: string }> = {
  Grassy: { icon: grassyIcon, bg: '#3FA129', label: 'Grassy Terrain' },
  Electric: { icon: electricIcon, bg: '#FAC000', label: 'Electric Terrain' },
  Psychic: { icon: psychicIcon, bg: '#EF4179', label: 'Psychic Terrain' },
  Misty: { icon: mistyIcon, bg: '#EF70EF', label: 'Misty Terrain' },
};

const TerrainIcon = ({ terrain }: { terrain: string }) => {
  const data = TERRAIN_DATA[terrain];
  if (!data) return null;
  return (
    <span
      className="relative inline-flex items-center justify-center rounded-sm align-[-0.15em] mx-[0.1em] overflow-hidden"
      style={{ backgroundColor: data.bg, width: '1.3em', height: '1.3em' }}
      title={data.label}
    >
      {/* Perspective grid background */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 64 64" fill="none">
        <path d="M 0,54 Q 5,46 10,54 Q 16,44 22,54 Q 28,44 32,54 Q 38,44 44,54 Q 50,44 56,54 Q 60,46 64,54 L 64,64 L 0,64 Z" fill="#fff" fillOpacity="0.8" />
      </svg>
      <img
        className="relative w-[0.7em] h-[0.7em] object-contain -mt-[0.1em]"
        src={data.icon}
        alt={data.label}
      />
    </span>
  );
};

export const GrassyTerrainIcon = () => <TerrainIcon terrain="Grassy" />;
export const ElectricTerrainIcon = () => <TerrainIcon terrain="Electric" />;
export const PsychicTerrainIcon = () => <TerrainIcon terrain="Psychic" />;
export const MistyTerrainIcon = () => <TerrainIcon terrain="Misty" />;
