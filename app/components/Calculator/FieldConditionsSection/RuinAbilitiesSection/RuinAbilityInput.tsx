import { useFieldConditions } from '~/hooks/Calc/useFieldConditions';
import { FieldConditionCheckbox } from '../FieldConditionCheckbox';

type RuinAbility = 'Beads' | 'Sword' | 'Vessel' | 'Tablets';

const RUIN_FIELD_KEY: Record<RuinAbility, 'isBeadsOfRuin' | 'isSwordOfRuin' | 'isVesselOfRuin' | 'isTabletsOfRuin'> = {
  Beads: 'isBeadsOfRuin',
  Sword: 'isSwordOfRuin',
  Vessel: 'isVesselOfRuin',
  Tablets: 'isTabletsOfRuin',
};

interface Props {
  name: RuinAbility;
}

export const RuinAbilityInput: React.FC<Props> = ({ name }) => {
  const { toggleRuin, ...fieldConditions } = useFieldConditions();
  const key = RUIN_FIELD_KEY[name];

  return (
    <FieldConditionCheckbox
      label={name}
      checked={fieldConditions[key]}
      onChange={() => toggleRuin(key)}
    />
  );
};
