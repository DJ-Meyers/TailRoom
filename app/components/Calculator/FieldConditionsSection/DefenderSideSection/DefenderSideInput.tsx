import { useFieldConditions } from '~/hooks/Calc/useFieldConditions';
import type { FieldConditions } from '~/types';

type DefenderSideKey = keyof NonNullable<FieldConditions['defenderSide']>;

interface Props {
  field: DefenderSideKey;
  label: string;
}

export const DefenderSideInput: React.FC<Props> = ({ field: sideKey, label }) => {
  const { defenderSide, toggleDefenderSide } = useFieldConditions();
  const isChecked = !!defenderSide[sideKey];
  const onChange = () => toggleDefenderSide(sideKey);

  return (
    <label className="text-xs cursor-pointer flex items-center gap-1 whitespace-nowrap">
      <input type="checkbox" checked={isChecked} onChange={onChange} className="w-auto" /> {label}
    </label>
  );
};
