import { useFieldConditions } from '~/hooks/Calc/useFieldConditions';
import { FieldConditionCheckbox } from '../FieldConditionCheckbox';

export const AttackerSideSection = () => {
  const { attackerSide, toggleAttackerSide } = useFieldConditions();

  return (
    <fieldset className="border border-border-section rounded px-2 pt-1 pb-1.5 flex flex-wrap gap-x-2.5 gap-y-1">
      <legend className="text-[0.7rem] font-semibold text-text-dim px-1">Attacker Side</legend>
      <FieldConditionCheckbox label="Helping Hand" checked={!!attackerSide.isHelpingHand} onChange={() => toggleAttackerSide('isHelpingHand')} />
      <FieldConditionCheckbox label="Tailwind" checked={!!attackerSide.isTailwind} onChange={() => toggleAttackerSide('isTailwind')} />
    </fieldset>
  );
};
