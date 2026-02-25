import { speciesList } from '../data/gen';

interface Props {
  value: string;
  onChange: (species: string) => void;
  id: string;
}

export function PokemonSelector({ value, onChange, id }: Props) {
  return (
    <div className="selector">
      <label htmlFor={id}>Pokemon</label>
      <input
        id={id}
        list={`${id}-list`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search Pokemon..."
      />
      <datalist id={`${id}-list`}>
        {speciesList.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
    </div>
  );
}
