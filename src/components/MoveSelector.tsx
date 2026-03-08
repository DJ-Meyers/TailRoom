import { Typeahead } from '~/components/Typeahead';
import { movesList } from '~/data/gen';

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
