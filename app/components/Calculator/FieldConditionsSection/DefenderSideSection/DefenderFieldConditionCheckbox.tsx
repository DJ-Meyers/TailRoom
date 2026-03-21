import { useFieldConditions } from '~/hooks/Calc/useFieldConditions';
import type { FieldConditions } from '~/types';
import { FieldConditionCheckbox } from '../FieldConditionCheckbox';

type DefenderSideKey = keyof NonNullable<FieldConditions['defenderSide']>;

interface Props {
  field: DefenderSideKey;
  label: string;
}

export const DefenderFieldConditionCheckbox: React.FC<Props> = ({ field: sideKey, label }) => {
  const { defenderSide, toggleDefenderSide } = useFieldConditions();

  return (
    <FieldConditionCheckbox
      label={label}
      checked={!!defenderSide[sideKey]}
      onChange={() => toggleDefenderSide(sideKey)}
    />
  );
};
