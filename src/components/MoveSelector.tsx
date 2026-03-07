import { movesList } from '../data/gen';
import { Typeahead } from './Typeahead';

interface Props {
  value: string;
  onChange: (move: string) => void;
}

export function MoveSelector({ value, onChange }: Props) {
  return (
    <Typeahead
      id="move-select"
      label="Move"
      value={value}
      onChange={onChange}
      options={movesList}
      placeholder="Search moves..."
    />
  );
}
