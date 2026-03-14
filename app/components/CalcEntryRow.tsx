import { toID } from '@smogon/calc';
import type { ReactNode } from 'react';
import { useCallback, useMemo } from 'react';

import { FieldConditionInputs } from '~/components/FieldConditionInputs';
import { ItemIcon } from '~/components/ItemIcon';
import { Modal } from '~/components/Modal';
import { PokemonIcon } from '~/components/PokemonIcon';
import { PokemonPanel } from '~/components/PokemonPanel';
import { SelectedPokemonModifierInputs } from '~/components/SelectedPokemonModifierInputs';
import { TargetModifierInputs } from '~/components/TargetModifierInputs';
import { TypeIcon } from '~/components/TypeIcon';
import { WeatherIcon } from '~/components/WeatherIcon';
import { gen, getSpeciesAbilities } from '~/data/gen';
import type { CalcEntry, FieldConditions, PokemonState, SelectedPokemonModifiers, StatKey } from '~/types';
import { computeDamage, type DamageCalcResult } from '~/utils/calcDamage';

interface Props {
  entry: CalcEntry;
  selectedPokemon: PokemonState;
  mode: 'offensive' | 'defensive';
  precomputedResult?: DamageCalcResult | null;
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
  onNameChange: (name: string) => void;
  onNotesChange: (notes: string) => void;
}

const STATUS_SUMMARY: Record<string, string> = {
  brn: 'Burn',
  par: 'Para',
  psn: 'Poison',
  tox: 'Toxic',
  slp: 'Sleep',
  frz: 'Freeze',
};

const ATK_STAT_LABEL: Record<string, string> = {
  atk: 'Atk',
  spa: 'SpA',
};

const DEF_STAT_LABEL: Record<string, string> = {
  def: 'Def',
  spd: 'SpD',
};

const getKoTierColor = (koChance: string, mode: 'offensive' | 'defensive'): string => {
  const invert = mode === 'defensive';
  if (koChance.includes('guaranteed OHKO')) return invert ? 'text-ko-no-2hko' : 'text-ko-guaranteed-ohko';
  if (koChance.includes('OHKO')) return invert ? 'text-ko-chance-2hko' : 'text-ko-chance-ohko';
  if (koChance.includes('guaranteed 2HKO')) return 'text-ko-guaranteed-2hko';
  if (koChance.includes('2HKO')) return invert ? 'text-ko-chance-ohko' : 'text-ko-chance-2hko';
  return invert ? 'text-ko-guaranteed-ohko' : 'text-ko-no-2hko';
};

const formatSummary = (
  moveName: string,
  attacker: PokemonState,
  defender: PokemonState,
  mode: 'offensive' | 'defensive',
  result: DamageCalcResult | null,
  defenderMaxHp: number,
  fieldConditions: FieldConditions,
): ReactNode => {
  if (!result) {
    if (mode === 'offensive') return <><WeatherIcon weather={fieldConditions.weather} />{moveName} {defender.teraType && <TypeIcon typeName={defender.teraType} />}<ItemIcon item={defender.item} /><PokemonIcon species={defender.species} /></>;
    return <><WeatherIcon weather={fieldConditions.weather} />{attacker.teraType && <TypeIcon typeName={attacker.teraType} />}<ItemIcon item={attacker.item} /><PokemonIcon species={attacker.species} /> {moveName}</>;
  }

  const pct = (val: number) => ((val / defenderMaxHp) * 100).toFixed(1);
  const range = `${pct(result.range[0])}%-${pct(result.range[1])}%`;
  const koMatch = result.koChance.match(/^([\d.]+)% chance to (\dHKO)$/);
  const ko = koMatch ? ` ${koMatch[1]}% ${koMatch[2]}` : '';
  const koColor = result.koChance ? getKoTierColor(result.koChance, mode) : 'text-text-faint';

  const moveData = gen.moves.get(toID(moveName));
  const isSpecial = moveData?.category === 'Special';
  const atkStat: StatKey = isSpecial ? 'spa' : 'atk';
  const defStat: StatKey = isSpecial ? 'spd' : 'def';

  // Attacker modifiers: tera type, stat boost, status, crit
  const atkTeraIcon = attacker.teraType ? <TypeIcon key="atk-tera" typeName={attacker.teraType} /> : null;
  const atkMods: ReactNode[] = [];
  if (atkTeraIcon && mode === 'offensive') {
    atkMods.push(atkTeraIcon);
  }
  const atkBoost = attacker.boosts[atkStat];
  if (atkBoost !== 0) {
    atkMods.push(`${atkBoost > 0 ? '+' : ''}${atkBoost}`);
  }
  if (attacker.status) {
    atkMods.push(STATUS_SUMMARY[attacker.status] ?? attacker.status);
  }
  if (attacker.isCrit && !moveData?.willCrit) {
    atkMods.push('Crit');
  }
  const atkPrefix = atkMods.length > 0
    ? <>{atkMods.map((mod, i) => <span key={i}>{i > 0 ? ' ' : ''}{mod}</span>)}{' '}</>
    : null;

  // Attacker offensive spread: EVs + nature indicator (e.g. "252+")
  const atkNature = gen.natures.get(toID(attacker.nature));
  const atkNatureSign = atkNature?.plus === atkStat ? '+' : atkNature?.minus === atkStat ? '-' : '';
  const atkEvs = attacker.evs[atkStat];
  const atkSpread = `${atkEvs}${atkNatureSign} ${ATK_STAT_LABEL[atkStat]}`;

  // Defender defensive spread: EVs + nature indicator + boost
  const nature = gen.natures.get(toID(defender.nature));
  const natureSign = nature?.plus === defStat ? '+' : nature?.minus === defStat ? '-' : '';
  const hpEVs = defender.evs.hp;
  const defEVs = defender.evs[defStat];
  const defBoost = defender.boosts[defStat];
  const defBoostStr = defBoost !== 0 ? `${defBoost > 0 ? '+' : ''}${defBoost} ` : '';
  const defTera = defender.teraType ? <TypeIcon typeName={defender.teraType} /> : null;
  const defDesc = `${defBoostStr}${hpEVs}/${defEVs}${natureSign} ${DEF_STAT_LABEL[defStat]}`;

  const iconClass = "shrink-0 relative inline-block w-[2.4em] h-[2em] overflow-hidden align-middle";

  const weatherIcon = <WeatherIcon weather={fieldConditions.weather} />;

  if (mode === 'offensive') {
    return <span className="flex items-center gap-1 min-w-0">
      {weatherIcon}
      <span className="shrink-0">{atkPrefix}{moveName}</span>
      <span className="shrink-0 text-text-faint">vs</span>
      {defTera}<ItemIcon item={defender.item} />
      <PokemonIcon species={defender.species} className={iconClass} />
      <span className="min-w-0">
        <div className="truncate">{defDesc}</div>
        <div className={`text-xs truncate ${koColor}`}>{range}{ko}</div>
      </span>
    </span>;
  }
  return <span className="flex items-center gap-1 min-w-0">
    {weatherIcon}
    {atkTeraIcon}<ItemIcon item={attacker.item} />
    <PokemonIcon species={attacker.species} className={iconClass} />
    <span className="min-w-0">
      <div className="truncate">{atkPrefix}{atkSpread} {moveName}</div>
      <div className={`text-xs truncate ${koColor}`}>{range}{ko}</div>
    </span>
  </span>;
};

export const CalcEntryRow = ({
  entry,
  selectedPokemon,
  mode,
  precomputedResult,
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
  onNameChange,
  onNotesChange,
}: Props) => {
  const selectedPokemonWithMods = useMemo(
    () => ({ ...selectedPokemon, ...entry.selectedPokemonModifiers }),
    [selectedPokemon, entry.selectedPokemonModifiers],
  );

  const attacker = mode === 'offensive' ? selectedPokemonWithMods : entry.opponent;
  const defender = mode === 'offensive' ? entry.opponent : selectedPokemonWithMods;

  // In defensive mode, crit belongs to the opponent (attacker), not the selected Pokémon.
  // Route the isCrit value and update handler accordingly.
  const critModifiers = useMemo(
    () => mode === 'defensive'
      ? { ...entry.selectedPokemonModifiers, isCrit: entry.opponent.isCrit }
      : entry.selectedPokemonModifiers,
    [mode, entry.selectedPokemonModifiers, entry.opponent.isCrit],
  );

  const handleSelectedModsUpdate = useCallback(
    (patch: Partial<SelectedPokemonModifiers>) => {
      if (mode === 'defensive' && patch.isCrit !== undefined) {
        const { isCrit, ...rest } = patch;
        onOpponentUpdate({ isCrit });
        if (Object.keys(rest).length > 0) onSelectedPokemonModifiersUpdate(rest);
      } else {
        onSelectedPokemonModifiersUpdate(patch);
      }
    },
    [mode, onOpponentUpdate, onSelectedPokemonModifiersUpdate],
  );

  const computed = useMemo(
    () => precomputedResult === undefined
      ? computeDamage(attacker, defender, entry.move, entry.fieldConditions)
      : precomputedResult,
    [precomputedResult, attacker, defender, entry.move, entry.fieldConditions],
  );
  const result = computed;

  const defenderMaxHp = result?.defenderMaxHp ?? 1;
  const summary = formatSummary(entry.move, attacker, defender, mode, result, defenderMaxHp, entry.fieldConditions);
  const abilities = getSpeciesAbilities(entry.opponent.species);
  const prefix = `entry-${entry.id}`;

  return (
    <div className="bg-surface rounded-md mb-2 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2.5 cursor-pointer select-none hover:bg-hover-bg" onClick={onToggleExpanded}>
        {entry.name && <span className="shrink-0 text-sm font-semibold text-text-heading">{entry.name}</span>}
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
      <Modal
        open={entry.isExpanded}
        onClose={onToggleExpanded}
        title={summary}
      >
        {mode === 'defensive' ? (
          <>
            <div className="flex items-end gap-1 mb-1 leading-none">
              <PokemonIcon species={entry.opponent.species} className="relative inline-block w-[2.4em] h-[2em] overflow-hidden align-middle" />
              <span className="text-sm font-semibold text-text-dim">{entry.opponent.species} Modifiers</span>
            </div>
            <TargetModifierInputs
            state={entry.opponent}
            idPrefix={prefix}
            showCrit={false}
            move={entry.move}
            onMoveChange={onMoveChange}
            onUpdate={onOpponentUpdate}
            onBoostChange={onBoostChange}
          />
          </>
        ) : (
          <>
            <div className="flex items-end gap-1 mb-1 leading-none">
              <PokemonIcon species={selectedPokemon.species} className="relative inline-block w-[2.4em] h-[2em] overflow-hidden align-middle" />
              <span className="text-sm font-semibold text-text-dim">{selectedPokemon.species} Modifiers</span>
            </div>
            <SelectedPokemonModifierInputs
            modifiers={critModifiers}
            idPrefix={prefix}
            showCrit
            move={entry.move}
            onMoveChange={onMoveChange}
            onUpdate={handleSelectedModsUpdate}
            onBoostChange={onSelectedPokemonBoostChange}
          />
          </>
        )}
        <FieldConditionInputs
          field={entry.fieldConditions}
          idPrefix={prefix}
          onChange={onFieldChange}
        />
        <PokemonPanel
          label={prefix}
          state={entry.opponent}
          speciesAbilities={abilities}
          showMove={mode === 'defensive'}
          hideModifiers
          compact
          name={entry.name}
          notes={entry.notes}
          onNameChange={onNameChange}
          onNotesChange={onNotesChange}
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
        {mode === 'offensive' ? (
          <>
            <div className="flex items-end gap-1 mb-1 leading-none">
              <PokemonIcon species={entry.opponent.species} className="relative inline-block w-[2.4em] h-[2em] overflow-hidden align-middle" />
              <span className="text-sm font-semibold text-text-dim">{entry.opponent.species} Modifiers</span>
            </div>
            <TargetModifierInputs
              state={entry.opponent}
              idPrefix={prefix}
              showCrit={false}
              onUpdate={onOpponentUpdate}
              onBoostChange={onBoostChange}
            />
          </>
        ) : (
          <>
            <div className="flex items-end gap-1 mb-1 leading-none">
              <PokemonIcon species={selectedPokemon.species} className="relative inline-block w-[2.4em] h-[2em] overflow-hidden align-middle" />
              <span className="text-sm font-semibold text-text-dim">{selectedPokemon.species} Modifiers</span>
            </div>
            <SelectedPokemonModifierInputs
              modifiers={critModifiers}
              idPrefix={prefix}
              showCrit
              onUpdate={handleSelectedModsUpdate}
              onBoostChange={onSelectedPokemonBoostChange}
            />
          </>
        )}
      </Modal>
    </div>
  );
};
