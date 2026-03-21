import { useFieldConditions } from '~/hooks/Calc/useFieldConditions';
import { FieldConditionCheckbox } from '../FieldConditionCheckbox';

export const RuinAbilitiesSection = () => {
  const { isBeadsOfRuin, isSwordOfRuin, isTabletsOfRuin, isVesselOfRuin, toggleRuin } = useFieldConditions();

  return (
    <fieldset className="border border-border-section rounded px-2 pt-1 pb-1.5 flex flex-wrap gap-x-2.5 gap-y-1">
      <legend className="text-[0.7rem] font-semibold text-text-dim px-1">Ruin Abilities</legend>
      <FieldConditionCheckbox label="Beads" checked={isBeadsOfRuin} onChange={() => toggleRuin('isBeadsOfRuin')} />
      <FieldConditionCheckbox label="Sword" checked={isSwordOfRuin} onChange={() => toggleRuin('isSwordOfRuin')} />
      <FieldConditionCheckbox label="Tablets" checked={isTabletsOfRuin} onChange={() => toggleRuin('isTabletsOfRuin')} />
      <FieldConditionCheckbox label="Vessel" checked={isVesselOfRuin} onChange={() => toggleRuin('isVesselOfRuin')} />
    </fieldset>
  );
};
