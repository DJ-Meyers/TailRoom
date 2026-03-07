import { naturesList } from '../data/gen';
import type { StatKey } from '../types';
import { STAT_LABELS } from '../types';
import { Typeahead } from './Typeahead';

interface Props {
  value: string;
  onChange: (nature: string) => void;
}

const natureNames = naturesList.map((n) => n.name);

const natureLabelMap = new Map(
  naturesList.map((n) => {
    const label =
      n.plus && n.minus
        ? `${n.name} (+${STAT_LABELS[n.plus as StatKey]}, -${STAT_LABELS[n.minus as StatKey]})`
        : n.name;
    return [n.name, label];
  }),
);

export function NatureSelector({ value, onChange }: Props) {
  return (
    <Typeahead
      id="nature-select"
      label="Nature"
      value={value}
      onChange={onChange}
      options={natureNames}
      placeholder="Search natures..."
      getLabel={(v) => natureLabelMap.get(v) ?? v}
    />
  );
}
