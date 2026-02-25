import { naturesList } from '../data/gen';
import type { StatKey } from '../types';
import { STAT_LABELS } from '../types';

interface Props {
  value: string;
  onChange: (nature: string) => void;
}

function formatNature(n: { name: string; plus?: string; minus?: string }) {
  if (!n.plus || !n.minus) return n.name;
  return `${n.name} (+${STAT_LABELS[n.plus as StatKey]}, -${STAT_LABELS[n.minus as StatKey]})`;
}

export function NatureSelector({ value, onChange }: Props) {
  return (
    <div className="selector">
      <label htmlFor="nature-select">Nature</label>
      <select
        id="nature-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {naturesList.map((n) => (
          <option key={n.name} value={n.name}>
            {formatNature(n)}
          </option>
        ))}
      </select>
    </div>
  );
}
