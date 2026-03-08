import { Typeahead } from '~/components/Typeahead';
import { speciesList } from '~/data/gen';

interface Props {
  value: string;
  onChange: (species: string) => void;
  id: string;
}

export function PokemonSelector({ value, onChange, id }: Props) {
  return (
    <Typeahead
      id={id}
      label="Pokemon"
      value={value}
      onChange={onChange}
      options={speciesList}
      placeholder="Search Pokemon..."
    />
  );
}
