import { useFieldConditions } from '~/hooks/Calc/useFieldConditions';

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
  const isChecked = fieldConditions[key];
  const onChange = () => toggleRuin(key);

  return (
    <label className="text-xs cursor-pointer flex items-center gap-1 whitespace-nowrap">
      <input type="checkbox" checked={isChecked} onChange={onChange} className="w-auto" /> {name}
    </label>
  );
};
