import { useFieldConditions } from '~/hooks/Calc/useFieldConditions';
import { FieldConditionCheckbox } from '../FieldConditionCheckbox';

export const RuinAbilitiesSection = () => {
  const { ruinAbilities, toggleRuin } = useFieldConditions();

  return (
    <fieldset className="border border-border-section rounded px-2 pt-1 pb-1.5 flex flex-wrap gap-x-2.5 gap-y-1">
      <legend className="text-[0.7rem] font-semibold text-text-dim px-1">Ruin Abilities</legend>
      <FieldConditionCheckbox label="Beads" checked={ruinAbilities.beads} onChange={() => toggleRuin('beads')} />
      <FieldConditionCheckbox label="Sword" checked={ruinAbilities.sword} onChange={() => toggleRuin('sword')} />
      <FieldConditionCheckbox label="Tablets" checked={ruinAbilities.tablets} onChange={() => toggleRuin('tablets')} />
      <FieldConditionCheckbox label="Vessel" checked={ruinAbilities.vessel} onChange={() => toggleRuin('vessel')} />
    </fieldset>
  );
};
