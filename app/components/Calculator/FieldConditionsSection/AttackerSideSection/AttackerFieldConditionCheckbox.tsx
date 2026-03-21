import { useFieldConditions } from '~/hooks/Calc/useFieldConditions';
import type { FieldConditions } from '~/types';

type AttackerSideKey = keyof NonNullable<FieldConditions['attackerSide']>;

interface Props {
  field: AttackerSideKey;
  label: string;
}

export const AttackerFieldConditionCheckbox: React.FC<Props> = ({ field: sideKey, label }) => {
  const { attackerSide, toggleAttackerSide } = useFieldConditions();
  const isChecked = !!attackerSide[sideKey];
  const onChange = () => toggleAttackerSide(sideKey);

  return (
    <label className="text-xs cursor-pointer flex items-center gap-1 whitespace-nowrap">
      <input type="checkbox" checked={isChecked} onChange={onChange} className="w-auto" /> {label}
    </label>
  );
};
