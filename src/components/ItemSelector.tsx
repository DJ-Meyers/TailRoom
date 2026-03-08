import { Typeahead } from '~/components/Typeahead';
import { itemsList } from '~/data/gen';

interface Props {
  value: string;
  onChange: (item: string) => void;
}

export const ItemSelector = ({ value, onChange }: Props) => <Typeahead
      id="item-select"
      label="Item"
      value={value}
      onChange={onChange}
      options={itemsList}
      placeholder="Search items..."
      allowEmpty
      emptyLabel="(none)"
    />;
