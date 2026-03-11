import { Typeahead } from '~/components/Typeahead';
import { movesList } from '~/data/gen';

interface Props {
  id?: string;
  value: string;
  onChange: (move: string) => void;
  className?: string;
}

export const MoveSelector = ({ id = 'move-select', value, onChange, className }: Props) => <Typeahead
      id={id}
      label="Move"
      value={value}
      onChange={onChange}
      options={movesList}
      placeholder="Search moves..."
      className={className}
    />;
