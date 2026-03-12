import { useMemo } from 'react';
import { Typeahead } from '~/components/Typeahead';
import { abilitiesList } from '~/data/gen';

interface Props {
  id?: string;
  value: string;
  onChange: (ability: string) => void;
  speciesAbilities?: string[];
}

export const AbilitySelector = ({ id = 'ability-select', value, onChange, speciesAbilities = [] }: Props) => {
  const options = useMemo(() => {
    const speciesSet = new Set(speciesAbilities);
    const rest = abilitiesList.filter((a) => !speciesSet.has(a));
    return [...speciesAbilities, ...rest];
  }, [speciesAbilities]);

  return (
    <Typeahead
      id={id}
      label="Ability"
      value={value}
      onChange={onChange}
      options={options}
      placeholder="Search abilities..."
    />
  );
};
