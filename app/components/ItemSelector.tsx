import { Typeahead } from '~/components/Typeahead';
import { itemsList } from '~/data/gen';

interface Props {
  id?: string;
  value: string;
  onChange: (item: string) => void;
}

export const ItemSelector = ({ id = 'item-select', value, onChange }: Props) => <Typeahead
      id={id}
      label="Item"
      value={value}
      onChange={onChange}
      options={itemsList}
      placeholder="Search items..."
      allowEmpty
      emptyLabel="(none)"
    />;
