import { DefenderSideInput } from './DefenderSideInput';

export const DefenderSideSection = () => {
  return (
    <fieldset className="border border-border-section rounded px-2 pt-1 pb-1.5 flex flex-wrap gap-x-2.5 gap-y-1">
      <legend className="text-[0.7rem] font-semibold text-text-dim px-1">Defender Side</legend>
      <DefenderSideInput field="isReflect" label="Reflect" />
      <DefenderSideInput field="isLightScreen" label="Light Screen" />
      <DefenderSideInput field="isAuroraVeil" label="Aurora Veil" />
      <DefenderSideInput field="isFriendGuard" label="Friend Guard" />
      <DefenderSideInput field="isTailwind" label="Tailwind" />
    </fieldset>
  );
};
