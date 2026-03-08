import { Typeahead } from '~/components/Typeahead';

interface Props {
  value: string;
  onChange: (ability: string) => void;
  abilities: string[];
}

export function AbilitySelector({ value, onChange, abilities }: Props) {
  return (
    <Typeahead
      id="ability-select"
      label="Ability"
      value={value}
      onChange={onChange}
      options={abilities}
      placeholder="Search abilities..."
    />
  );
}
