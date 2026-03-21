import { AttackerFieldConditionCheckbox } from './AttackerFieldConditionCheckbox';

export const AttackerSideSection = () => {
  return (
    <fieldset className="border border-border-section rounded px-2 pt-1 pb-1.5 flex flex-wrap gap-x-2.5 gap-y-1">
      <legend className="text-[0.7rem] font-semibold text-text-dim px-1">Attacker Side</legend>
      <AttackerFieldConditionCheckbox field="isHelpingHand" label="Helping Hand" />
      <AttackerFieldConditionCheckbox field="isTailwind" label="Tailwind" />
    </fieldset>
  );
};
