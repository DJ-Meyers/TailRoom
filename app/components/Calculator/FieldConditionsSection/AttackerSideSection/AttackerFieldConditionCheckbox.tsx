import { useFieldConditions } from '~/hooks/Calc/useFieldConditions';
import type { FieldConditions } from '~/types';
import { FieldConditionCheckbox } from '../FieldConditionCheckbox';

type AttackerSideKey = keyof NonNullable<FieldConditions['attackerSide']>;

interface Props {
  field: AttackerSideKey;
  label: string;
}

export const AttackerFieldConditionCheckbox: React.FC<Props> = ({ field: sideKey, label }) => {
  const { attackerSide, toggleAttackerSide } = useFieldConditions();

  return (
    <FieldConditionCheckbox
      label={label}
      checked={!!attackerSide[sideKey]}
      onChange={() => toggleAttackerSide(sideKey)}
    />
  );
};
