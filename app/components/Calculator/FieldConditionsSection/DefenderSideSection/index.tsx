import { useFieldConditions } from '~/hooks/Calc/useFieldConditions';
import { FieldConditionCheckbox } from '../FieldConditionCheckbox';

export const DefenderSideSection = () => {
  const { defenderSide, toggleDefenderSide } = useFieldConditions();

  return (
    <fieldset className="border border-border-section rounded px-2 pt-1 pb-1.5 flex flex-wrap gap-x-2.5 gap-y-1">
      <legend className="text-[0.7rem] font-semibold text-text-dim px-1">Defender Side</legend>
      <FieldConditionCheckbox label="Reflect" checked={!!defenderSide.isReflect} onChange={() => toggleDefenderSide('isReflect')} />
      <FieldConditionCheckbox label="Light Screen" checked={!!defenderSide.isLightScreen} onChange={() => toggleDefenderSide('isLightScreen')} />
      <FieldConditionCheckbox label="Aurora Veil" checked={!!defenderSide.isAuroraVeil} onChange={() => toggleDefenderSide('isAuroraVeil')} />
      <FieldConditionCheckbox label="Friend Guard" checked={!!defenderSide.isFriendGuard} onChange={() => toggleDefenderSide('isFriendGuard')} />
      <FieldConditionCheckbox label="Tailwind" checked={!!defenderSide.isTailwind} onChange={() => toggleDefenderSide('isTailwind')} />
    </fieldset>
  );
};
