import { itemsList } from '../data/gen';

interface Props {
  value: string;
  onChange: (item: string) => void;
}

export function ItemSelector({ value, onChange }: Props) {
  return (
    <div className="selector">
      <label htmlFor="item-select">Item</label>
      <select
        id="item-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">(none)</option>
        {itemsList.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
    </div>
  );
}
