import { Typeahead } from '~/components/Typeahead';
import { itemsList } from '~/data/gen';

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
