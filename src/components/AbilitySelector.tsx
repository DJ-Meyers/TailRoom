import { Typeahead } from '~/components/Typeahead';

interface Props {
  id?: string;
  value: string;
  onChange: (ability: string) => void;
  abilities: string[];
}

export const AbilitySelector = ({ id = 'ability-select', value, onChange, abilities }: Props) => <Typeahead
      id={id}
      label="Ability"
      value={value}
      onChange={onChange}
      options={abilities}
      placeholder="Search abilities..."
    />;
