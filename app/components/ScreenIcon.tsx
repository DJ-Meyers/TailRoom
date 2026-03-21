function darken(hex: string, amount: number): string {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - amount);
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - amount);
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - amount);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

const ScreenIcon = ({ color, className }: { color: string; className?: string }) => {
  const mid = darken(color, 45);
  const dark = darken(color, 90);

  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <defs>
        <filter id={`shadow-${color}`} x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="1" dy="1" stdDeviation="1.5" floodColor="#000" floodOpacity="0.25" />
        </filter>
      </defs>

      <polygon points="24,12 48,8 48,54 24,50" fill={dark} fillOpacity="0.7" stroke={dark} strokeWidth="1" filter={`url(#shadow-${color})`} />
      <polygon points="12,7 38,2 38,60 12,55" fill={mid} fillOpacity="0.7" stroke={mid} strokeWidth="1" filter={`url(#shadow-${color})`} />
      <polygon points="0,5 28,0 28,64 0,59" fill={color} fillOpacity="0.7" stroke={color} strokeWidth="1" filter={`url(#shadow-${color})`} />
    </svg>
  );
};

const screenIconClass = "inline-block w-[1.3em] h-[1.3em] align-[-0.15em] mx-[0.1em]";

export const ReflectIcon = () => (
  <span title="Reflect">
    <ScreenIcon color="#F0D060" className={screenIconClass} />
  </span>
);

export const LightScreenIcon = () => (
  <span title="Light Screen">
    <ScreenIcon color="#C8A2C8" className={screenIconClass} />
  </span>
);

export const AuroraVeilIcon = () => (
  <span title="Aurora Veil">
    <ScreenIcon color="#9BD8F0" className={screenIconClass} />
  </span>
);
