import { movesList } from '../data/gen';

interface Props {
  value: string;
  onChange: (move: string) => void;
}

export function MoveSelector({ value, onChange }: Props) {
  return (
    <div className="selector">
      <label htmlFor="move-select">Move</label>
      <input
        id="move-select"
        list="move-list"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search moves..."
      />
      <datalist id="move-list">
        {movesList.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
    </div>
  );
}
