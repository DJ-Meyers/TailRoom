interface Props {
  value: string;
  onChange: (ability: string) => void;
  abilities: string[];
}

export function AbilitySelector({ value, onChange, abilities }: Props) {
  return (
    <div className="selector">
      <label htmlFor="ability-select">Ability</label>
      <select
        id="ability-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {abilities.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
    </div>
  );
}
