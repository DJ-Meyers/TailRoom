import { AttackerSideInput } from './AttackerSideInput';

export const AttackerSideSection = () => {
  return (
    <fieldset className="border border-border-section rounded px-2 pt-1 pb-1.5 flex flex-wrap gap-x-2.5 gap-y-1">
      <legend className="text-[0.7rem] font-semibold text-text-dim px-1">Attacker Side</legend>
      <AttackerSideInput field="isHelpingHand" label="Helping Hand" />
      <AttackerSideInput field="isTailwind" label="Tailwind" />
    </fieldset>
  );
};
