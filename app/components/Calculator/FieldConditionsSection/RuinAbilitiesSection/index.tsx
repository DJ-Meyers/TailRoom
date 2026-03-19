import { RuinAbilityInput } from './RuinAbilityInput';

export const RuinAbilitiesSection = () => {
  return (
    <fieldset className="border border-border-section rounded px-2 pt-1 pb-1.5 flex flex-wrap gap-x-2.5 gap-y-1">
      <legend className="text-[0.7rem] font-semibold text-text-dim px-1">Ruin Abilities</legend>
      <RuinAbilityInput name="Beads" />
      <RuinAbilityInput name="Sword" />
      <RuinAbilityInput name="Tablets" />
      <RuinAbilityInput name="Vessel" />
    </fieldset>
  );
};
