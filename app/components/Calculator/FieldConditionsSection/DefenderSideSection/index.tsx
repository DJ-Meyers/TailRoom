import { DefenderFieldConditionCheckbox } from './DefenderFieldConditionCheckbox';

export const DefenderSideSection = () => {
  return (
    <fieldset className="border border-border-section rounded px-2 pt-1 pb-1.5 flex flex-wrap gap-x-2.5 gap-y-1">
      <legend className="text-[0.7rem] font-semibold text-text-dim px-1">Defender Side</legend>
      <DefenderFieldConditionCheckbox field="isReflect" label="Reflect" />
      <DefenderFieldConditionCheckbox field="isLightScreen" label="Light Screen" />
      <DefenderFieldConditionCheckbox field="isAuroraVeil" label="Aurora Veil" />
      <DefenderFieldConditionCheckbox field="isFriendGuard" label="Friend Guard" />
      <DefenderFieldConditionCheckbox field="isTailwind" label="Tailwind" />
    </fieldset>
  );
};
