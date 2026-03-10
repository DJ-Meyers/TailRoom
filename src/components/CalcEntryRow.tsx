import { toID } from '@smogon/calc';
import type { ReactNode } from 'react';
import { useMemo } from 'react';

import { FieldConditionInputs } from '~/components/FieldConditionInputs';
import { ItemIcon } from '~/components/ItemIcon';
import { PokemonIcon } from '~/components/PokemonIcon';
import { PokemonPanel } from '~/components/PokemonPanel';
import { SelectedPokemonModifierInputs } from '~/components/SelectedPokemonModifierInputs';
import { TargetModifierInputs } from '~/components/TargetModifierInputs';
import { TypeIcon } from '~/components/TypeIcon';
import { gen, getSpeciesAbilities } from '~/data/gen';
import type { CalcEntry, FieldConditions, PokemonState, SelectedPokemonModifiers, StatKey } from '~/types';
import { computeDamage, type DamageCalcResult } from '~/utils/calcDamage';

interface Props {
  entry: CalcEntry;
  selectedPokemon: PokemonState;
  mode: 'offensive' | 'defensive';
  onToggleExpanded: () => void;
  onRemove: () => void;
  onSpeciesChange: (species: string) => void;
  onOpponentUpdate: (patch: Partial<PokemonState>) => void;
  onEvChange: (stat: StatKey, value: number) => void;
  onIvChange: (stat: StatKey, value: number) => void;
  onBoostChange: (stat: StatKey, value: number) => void;
  onMoveChange: (move: string) => void;
  onFieldChange: (field: FieldConditions) => void;
  onSelectedPokemonModifiersUpdate: (patch: Partial<SelectedPokemonModifiers>) => void;
  onSelectedPokemonBoostChange: (stat: StatKey, value: number) => void;
}

const STATUS_SUMMARY: Record<string, string> = {
  brn: 'Burn',
  par: 'Para',
  psn: 'Poison',
  tox: 'Toxic',
  slp: 'Sleep',
  frz: 'Freeze',
};

const DEF_STAT_LABEL: Record<string, string> = {
  def: 'Def',
  spd: 'SpD',
};

const formatSummary = (
  moveName: string,
  attacker: PokemonState,
  defender: PokemonState,
  mode: 'offensive' | 'defensive',
  result: DamageCalcResult | null,
  defenderMaxHp: number,
): ReactNode => {
  if (!result) {
    if (mode === 'offensive') return <>{moveName} · <PokemonIcon species={defender.species} /><ItemIcon item={defender.item} /></>;
    return <><PokemonIcon species={attacker.species} /><ItemIcon item={attacker.item} /> {moveName}</>;
  }

  const pct = (val: number) => ((val / defenderMaxHp) * 100).toFixed(1);
  const range = `${pct(result.range[0])}%-${pct(result.range[1])}%`;
  const koMatch = result.koChance.match(/^([\d.]+)% chance to (\dHKO)$/);
  const ko = koMatch ? ` ${koMatch[1]}% ${koMatch[2]}` : '';

  const moveData = gen.moves.get(toID(moveName));
  const isSpecial = moveData?.category === 'Special';
  const atkStat: StatKey = isSpecial ? 'spa' : 'atk';
  const defStat: StatKey = isSpecial ? 'spd' : 'def';

  // Attacker modifiers: tera type, stat boost, status, crit
  const atkMods: ReactNode[] = [];
  if (attacker.teraType) {
    atkMods.push(<TypeIcon key="atk-tera" typeName={attacker.teraType} />);
  }
  const atkBoost = attacker.boosts[atkStat];
  if (atkBoost !== 0) {
    atkMods.push(`${atkBoost > 0 ? '+' : ''}${atkBoost}`);
  }
  if (attacker.status) {
    atkMods.push(STATUS_SUMMARY[attacker.status] ?? attacker.status);
  }
  if (attacker.isCrit) {
    atkMods.push('Crit');
  }
  const atkPrefix = atkMods.length > 0
    ? <>{atkMods.map((mod, i) => <span key={i}>{i > 0 ? ' ' : ''}{mod}</span>)}{' '}</>
    : null;

  // Defender defensive spread: EVs + nature indicator + boost
  const nature = gen.natures.get(toID(defender.nature));
  const natureSign = nature?.plus === defStat ? '+' : nature?.minus === defStat ? '-' : '';
  const hpEVs = defender.evs.hp;
  const defEVs = defender.evs[defStat];
  const defBoost = defender.boosts[defStat];
  const defBoostStr = defBoost !== 0 ? `${defBoost > 0 ? '+' : ''}${defBoost} ` : '';
  const defTera = defender.teraType ? <><TypeIcon typeName={defender.teraType} />{' '}</> : null;
  const defDesc = `${defBoostStr}${hpEVs}/${defEVs}${natureSign} ${DEF_STAT_LABEL[defStat]}`;

  if (mode === 'offensive') {
    return <>
      <div>{atkPrefix}{moveName} · {defDesc} {defTera}<PokemonIcon species={defender.species} /><ItemIcon item={defender.item} /></div>
      <div className="text-xs text-text-faint">{range}{ko}</div>
    </>;
  }
  return <>
    <div><PokemonIcon species={attacker.species} /><ItemIcon item={attacker.item} /> {atkPrefix}{moveName} · {defDesc} {defTera}</div>
    <div className="text-xs text-text-faint">{range}{ko}</div>
  </>;
};

export const CalcEntryRow = ({
  entry,
  selectedPokemon,
  mode,
  onToggleExpanded,
  onRemove,
  onSpeciesChange,
  onOpponentUpdate,
  onEvChange,
  onIvChange,
  onBoostChange,
  onMoveChange,
  onFieldChange,
  onSelectedPokemonModifiersUpdate,
  onSelectedPokemonBoostChange,
}: Props) => {
  const selectedPokemonWithMods = useMemo(
    () => ({ ...selectedPokemon, ...entry.selectedPokemonModifiers }),
    [selectedPokemon, entry.selectedPokemonModifiers],
  );

  const attacker = mode === 'offensive' ? selectedPokemonWithMods : entry.opponent;
  const defender = mode === 'offensive' ? entry.opponent : selectedPokemonWithMods;

  const result = useMemo(
    () => computeDamage(attacker, defender, entry.move, entry.fieldConditions),
    [attacker, defender, entry.move, entry.fieldConditions],
  );

  const defenderMaxHp = result?.defenderMaxHp ?? 1;
  const summary = formatSummary(entry.move, attacker, defender, mode, result, defenderMaxHp);
  const abilities = getSpeciesAbilities(entry.opponent.species);
  const prefix = `entry-${entry.id}`;

  return (
    <div className="bg-surface rounded-md mb-2 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2.5 cursor-pointer select-none hover:bg-hover-bg" onClick={onToggleExpanded}>
        <span className="shrink-0 text-sm text-text-dim w-4">{entry.isExpanded ? '\u25BE' : '\u25B8'}</span>
        <span className={`flex-1 text-sm min-w-0 ${result ? '' : 'text-text-dim italic'}`}>
          {summary}
        </span>
        <button
          className="shrink-0 bg-none border-none text-lg text-text-faint cursor-pointer px-1 leading-none hover:text-error"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          &times;
        </button>
      </div>
      {entry.isExpanded && (
        <div className="p-3 border-t border-border-lighter bg-detail-bg">
          <SelectedPokemonModifierInputs
            modifiers={entry.selectedPokemonModifiers}
            idPrefix={prefix}
            showCrit={mode === 'offensive'}
            move={entry.move}
            onMoveChange={onMoveChange}
            onUpdate={onSelectedPokemonModifiersUpdate}
            onBoostChange={onSelectedPokemonBoostChange}
          />
          <FieldConditionInputs
            field={entry.fieldConditions}
            idPrefix={prefix}
            onChange={onFieldChange}
          />
          <PokemonPanel
            label={prefix}
            state={entry.opponent}
            abilities={abilities}
            showMove={mode === 'defensive'}
            hideModifiers
            compact
            onSpeciesChange={onSpeciesChange}
            onNatureChange={(nature) => onOpponentUpdate({ nature })}
            onAbilityChange={(ability) => onOpponentUpdate({ ability })}
            onItemChange={(item) => onOpponentUpdate({ item })}
            onMoveChange={(move) => {
              onMoveChange(move);
              if (mode === 'defensive') onOpponentUpdate({ move });
            }}
            onEvChange={onEvChange}
            onIvChange={onIvChange}
            onTeraTypeChange={(teraType) => onOpponentUpdate({ teraType })}
            onBoostChange={onBoostChange}
            onStatusChange={(status) => onOpponentUpdate({ status })}
            onIsCritChange={(isCrit) => onOpponentUpdate({ isCrit })}
            onParsed={(parsed) => {
              if (parsed.move && mode === 'offensive') onMoveChange(parsed.move);
              if (parsed.move && mode === 'defensive') onOpponentUpdate({ move: parsed.move });
              if (parsed.fieldConditions) onFieldChange({ ...entry.fieldConditions, ...parsed.fieldConditions });
              const patch: Partial<PokemonState> = {};
              if (parsed.species) patch.species = parsed.species;
              if (parsed.nature) patch.nature = parsed.nature;
              if (parsed.ability) patch.ability = parsed.ability;
              if (parsed.item !== undefined) patch.item = parsed.item;
              if (parsed.level !== undefined) patch.level = parsed.level;
              if (parsed.teraType !== undefined) patch.teraType = parsed.teraType;
              if (parsed.status !== undefined) patch.status = parsed.status;
              if (parsed.isCrit !== undefined) patch.isCrit = parsed.isCrit;
              if (parsed.abilityOn !== undefined) patch.abilityOn = parsed.abilityOn;
              if (parsed.boostedStat !== undefined) patch.boostedStat = parsed.boostedStat;
              if (Object.keys(patch).length > 0) onOpponentUpdate(patch);
            }}
          />
          <TargetModifierInputs
            state={entry.opponent}
            idPrefix={prefix}
            showCrit={mode === 'defensive'}
            onUpdate={onOpponentUpdate}
            onBoostChange={onBoostChange}
          />
        </div>
      )}
    </div>
  );
};
