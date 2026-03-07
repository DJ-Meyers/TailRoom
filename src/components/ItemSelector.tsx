import { itemsList } from '../data/gen';
import { Typeahead } from './Typeahead';

interface Props {
  value: string;
  onChange: (item: string) => void;
}

export function ItemSelector({ value, onChange }: Props) {
  return (
    <Typeahead
      id="item-select"
      label="Item"
      value={value}
      onChange={onChange}
      options={itemsList}
      placeholder="Search items..."
      allowEmpty
      emptyLabel="(none)"
    />
  );
}
