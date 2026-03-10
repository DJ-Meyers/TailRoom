import { Typeahead } from '~/components/Typeahead';
import { movesList } from '~/data/gen';

interface Props {
  id?: string;
  value: string;
  onChange: (move: string) => void;
}

export const MoveSelector = ({ id = 'move-select', value, onChange }: Props) => <Typeahead
      id={id}
      label="Move"
      value={value}
      onChange={onChange}
      options={movesList}
      placeholder="Search moves..."
    />;
