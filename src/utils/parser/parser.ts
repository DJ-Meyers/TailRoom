import { toID } from '@smogon/calc';

import { gen } from '~/data/gen';
import type { FieldConditions, ParseResult, StatKey } from '~/types';
import {
  ABILITY_FIELD_MAP,
  ABILITY_ON_LIST,
  DEFAULT_BOOST_FOR_LOWER,
  ITEM_ALIASES,
  NATURE_TABLE,
  OFFENSIVE_NATURE,
  RUIN_PHRASES,
  SIDE_CONDITION_PHRASES,
  SINGLE_SIDE_CONDITIONS,
  SPECIES_ALIASES,
  STAT_ALIASES,
  STATUS_ALIASES,
  TERRAIN_PHRASES,
  WEATHER_KEYWORDS,
} from '~/utils/parser/constants';

// --- Lookup maps (built once from gen data) ---

const speciesById = new Map<string, string>();
for (const s of gen.species) speciesById.set(toID(s.name), s.name);

const moveById = new Map<string, string>();
for (const m of gen.moves) moveById.set(toID(m.name), m.name);

const abilityById = new Map<string, string>();
for (const a of gen.abilities) abilityById.set(toID(a.name), a.name);

const itemById = new Map<string, string>();
for (const i of gen.items) itemById.set(toID(i.name), i.name);

const natureById = new Map<string, string>();
for (const n of gen.natures) natureById.set(toID(n.name), n.name);

const typeById = new Map<string, string>();
for (const t of gen.types) typeById.set(toID(t.name), t.name);

// --- Helpers ---

/** Given a move name, return the stat it uses for offense. */
function getOffensiveStat(moveName: string): StatKey | undefined {
  const move = gen.moves.get(toID(moveName));
  if (!move) return undefined;
  // Body Press etc. override the offensive stat
  const override = (move as any).overrideOffensiveStat;
  if (override) return override as StatKey;
  if (move.category === 'Physical') return 'atk';
  if (move.category === 'Special') return 'spa';
  return undefined;
}

/** Given a move name, return the stat the defender needs to tank it. */
function getDefensiveStat(moveName: string): StatKey | undefined {
  const move = gen.moves.get(toID(moveName));
  if (!move) return undefined;
  const override = (move as any).overrideDefensiveStat;
  if (override) return override as StatKey;
  if (move.category === 'Physical') return 'def';
  if (move.category === 'Special') return 'spd';
  return undefined;
}

export interface ParseContext {
  role?: 'attacker' | 'defender';
  /** The attacker's move (used by defender to resolve deferred stat patterns). */
  opposingMove?: string;
}

/** Given a stat to lower and an EV spread, pick the best nature. */
function findNatureForMinStat(
  lowerStat: StatKey,
  evs?: Partial<Record<StatKey, number>>,
): string | undefined {
  if (lowerStat === 'hp') return undefined; // natures don't affect HP

  // Find the best stat to boost from EVs (highest EV, excluding HP and the lowered stat)
  let boostStat: StatKey | undefined;
  if (evs) {
    let maxEv = 0;
    for (const [stat, val] of Object.entries(evs) as [StatKey, number][]) {
      if (stat === 'hp' || stat === lowerStat) continue;
      if (val > maxEv) { maxEv = val; boostStat = stat; }
    }
  }

  // Fall back to a sensible default
  if (!boostStat) boostStat = DEFAULT_BOOST_FOR_LOWER[lowerStat];
  if (!boostStat) return undefined;

  return NATURE_TABLE[`${boostStat},${lowerStat}`];
}

function resolveStat(token: string): StatKey | undefined {
  return STAT_ALIASES[toID(token)];
}

function tryGreedyMatch(
  tokens: string[],
  startIdx: number,
  consumed: boolean[],
  lookupMap: Map<string, string>,
  maxWords = 4,
): { name: string; count: number } | null {
  for (let len = Math.min(maxWords, tokens.length - startIdx); len >= 1; len--) {
    let allFree = true;
    for (let j = startIdx; j < startIdx + len; j++) {
      if (consumed[j]) { allFree = false; break; }
    }
    if (!allFree) continue;

    const candidate = tokens.slice(startIdx, startIdx + len).join('');
    const match = lookupMap.get(toID(candidate));
    if (match) return { name: match, count: len };
  }
  return null;
}

function isEntityStart(tokens: string[], i: number, consumed: boolean[]): boolean {
  if (i + 1 >= tokens.length || consumed[i + 1]) return false;
  const twoWordId = toID(tokens[i] + tokens[i + 1]);
  return abilityById.has(twoWordId) || moveById.has(twoWordId) ||
         speciesById.has(twoWordId) || itemById.has(twoWordId);
}

function prefixMatchSpecies(token: string): string | undefined {
  const id = toID(token);
  if (id.length < 3) return undefined; // too short for prefix match
  const matches: string[] = [];
  for (const [specId, name] of speciesById) {
    if (specId.startsWith(id)) matches.push(name);
  }
  if (matches.length === 1) return matches[0];
  // If multiple, pick the shortest name (most likely the base form)
  if (matches.length > 1) {
    matches.sort((a, b) => a.length - b.length);
    return matches[0];
  }
  return undefined;
}

function inferNature(evs: Partial<Record<StatKey, number>>): string | undefined {
  const maxedStats = Object.entries(evs).filter(([, v]) => v === 252);
  if (maxedStats.length === 0) return undefined;

  const hasMaxAtk = evs.atk === 252;
  const hasMaxSpA = evs.spa === 252;
  const hasMaxSpe = evs.spe === 252;
  const hasMaxDef = evs.def === 252;
  const hasMaxSpD = evs.spd === 252;

  // If speed is maxed, pick nature based on offensive stat
  if (hasMaxSpe) {
    if (hasMaxAtk) return 'Jolly';   // +Spe -SpA
    if (hasMaxSpA) return 'Timid';   // +Spe -Atk
    return undefined; // speed alone is ambiguous
  }
  if (hasMaxAtk) return 'Adamant';   // +Atk -SpA
  if (hasMaxSpA) return 'Modest';    // +SpA -Atk
  if (hasMaxDef) return 'Bold';      // +Def -Atk
  if (hasMaxSpD) return 'Calm';      // +SpD -Atk
  return undefined;
}

// --- Main parser ---

export function parseInput(input: string, context?: ParseContext): ParseResult {
  const tokens = input.trim().split(/\s+/).filter(Boolean);
  const consumed = new Array<boolean>(tokens.length).fill(false);
  const result: ParseResult = { unmatched: [] };
  let deferredMaxPlus = false; // "252+" or "max+" — resolve after move is known
  let deferredBoost: number | null = null; // standalone "+2" etc. — resolve after move is known
  let deferredNature: string | undefined; // nature implied by "252+ <Stat>" — defer so explicit natures win
  let deferredMinStat: StatKey | undefined; // "Min <Stat>" — resolve nature after EVs are known

  // --- Pass 1: Structural patterns ---

  for (let i = 0; i < tokens.length; i++) {
    if (consumed[i]) continue;
    const lower = tokens[i].toLowerCase();

    // "252+" or "max+" — max EVs + boosting nature
    // If followed by a stat name (e.g. "252+ SpA"), resolve immediately; otherwise defer to move
    if (/^\d+\+$/.test(tokens[i]) || lower === 'max+') {
      const evValue = lower === 'max+' ? 252 : Math.min(parseInt(tokens[i], 10), 252);
      if (i + 1 < tokens.length && !consumed[i + 1]) {
        const stat = resolveStat(tokens[i + 1]);
        if (stat && stat !== 'hp') {
          if (!result.evs) result.evs = {};
          result.evs[stat] = evValue;
          deferredNature = OFFENSIVE_NATURE[stat];
          consumed[i] = consumed[i + 1] = true;
          continue;
        }
      }
      deferredMaxPlus = true;
      consumed[i] = true;
      continue;
    }

    // "Tera <Type>"
    if (lower === 'tera' && i + 1 < tokens.length && !consumed[i + 1]) {
      const typeMatch = typeById.get(toID(tokens[i + 1]));
      if (typeMatch) {
        result.teraType = typeMatch;
        consumed[i] = consumed[i + 1] = true;
        continue;
      }
    }

    // EV/IV patterns: "Max <Stat>", "Min <Stat>", "<number> <Stat>"
    // "Min <Stat>" → 0 EVs AND 0 IVs (competitive convention for minimizing a stat)
    if ((lower === 'max' || lower === 'min') && i + 1 < tokens.length && !consumed[i + 1]) {
      const stat = resolveStat(tokens[i + 1]);
      if (stat) {
        if (!result.evs) result.evs = {};
        result.evs[stat] = lower === 'max' ? 252 : 0;
        if (lower === 'min') {
          if (!result.ivs) result.ivs = {};
          result.ivs[stat] = 0;
          deferredMinStat = stat;
        }
        consumed[i] = consumed[i + 1] = true;
        continue;
      }
    }

    // "<number> <Stat>" → always EVs; IVs default to 31 unless explicitly specified
    if (/^\d+$/.test(tokens[i]) && i + 1 < tokens.length && !consumed[i + 1]) {
      const stat = resolveStat(tokens[i + 1]);
      if (stat) {
        const value = parseInt(tokens[i], 10);
        if (!result.evs) result.evs = {};
        result.evs[stat] = Math.min(value, 252);
        consumed[i] = consumed[i + 1] = true;
        continue;
      }
    }

    // Concatenated EV: "4HP", "252SpA", "0Atk"
    const evConcat = tokens[i].match(/^(\d+)([a-zA-Z]+)$/);
    if (evConcat) {
      const stat = resolveStat(evConcat[2]);
      if (stat) {
        const value = parseInt(evConcat[1], 10);
        if (!result.evs) result.evs = {};
        result.evs[stat] = Math.min(value, 252);
        consumed[i] = true;
        continue;
      }
    }

    // Boost patterns: "+2 SpA" (with stat) or standalone "+2" (deferred to move's stat)
    if (/^[+-]\d$/.test(tokens[i])) {
      const nextStat = (i + 1 < tokens.length && !consumed[i + 1])
        ? resolveStat(tokens[i + 1])
        : undefined;
      if (nextStat && nextStat !== 'hp') {
        const boost = parseInt(tokens[i], 10);
        if (!result.boosts) result.boosts = {};
        result.boosts[nextStat] = Math.max(-6, Math.min(6, boost));
        consumed[i] = consumed[i + 1] = true;
        continue;
      }
      // Standalone "+2" — defer to move's offensive stat
      deferredBoost = parseInt(tokens[i], 10);
      consumed[i] = true;
      continue;
    }

    // Level patterns: "Lvl 50", "Level 50", "L50"
    if ((lower === 'lvl' || lower === 'level') && i + 1 < tokens.length && /^\d+$/.test(tokens[i + 1])) {
      result.level = Math.max(1, Math.min(100, parseInt(tokens[i + 1], 10)));
      consumed[i] = consumed[i + 1] = true;
      continue;
    }
    if (/^l\d+$/i.test(tokens[i])) {
      result.level = Math.max(1, Math.min(100, parseInt(tokens[i].slice(1), 10)));
      consumed[i] = true;
      continue;
    }

    // Crit keyword
    if (lower === 'crit') {
      result.isCrit = true;
      consumed[i] = true;
      continue;
    }

    // "boosted" keyword → sets boostedStat for Protosynthesis/Quark Drive
    if (lower === 'boosted') {
      result.abilityOn = true;
      result.boostedStat = 'auto';
      consumed[i] = true;
      continue;
    }

    // Ruin phrases (3-word) — before 2-word checks
    if (i + 2 < tokens.length && !consumed[i + 1] && !consumed[i + 2]) {
      const threeWord = [tokens[i], tokens[i + 1], tokens[i + 2]].join(' ').toLowerCase();
      const ruinKey = RUIN_PHRASES[threeWord];
      if (ruinKey) {
        if (!result.fieldConditions) result.fieldConditions = {};
        (result.fieldConditions as any)[ruinKey] = true;
        consumed[i] = consumed[i + 1] = consumed[i + 2] = true;
        continue;
      }
    }

    // Terrain (2-word)
    if (i + 1 < tokens.length && !consumed[i + 1]) {
      const twoWord = [tokens[i], tokens[i + 1]].join(' ').toLowerCase();
      const terrainVal = TERRAIN_PHRASES[twoWord];
      if (terrainVal) {
        if (!result.fieldConditions) result.fieldConditions = {};
        result.fieldConditions.terrain = terrainVal;
        consumed[i] = consumed[i + 1] = true;
        continue;
      }
      // Side conditions (2-word)
      const sideCondition = SIDE_CONDITION_PHRASES[twoWord];
      if (sideCondition) {
        if (!result.fieldConditions) result.fieldConditions = {};
        if (!result.fieldConditions[sideCondition.field]) {
          result.fieldConditions[sideCondition.field] = {} as any;
        }
        (result.fieldConditions[sideCondition.field] as any)[sideCondition.key] = true;
        consumed[i] = consumed[i + 1] = true;
        continue;
      }
    }

    // Weather: "in <weather>" / "in the <weather>" / "(in <weather>)" syntax
    const strippedLower = lower.replace(/^\(/, '');
    if (strippedLower === 'in' && i + 1 < tokens.length && !consumed[i + 1]) {
      let weatherIdx = i + 1;
      if (tokens[i + 1].toLowerCase() === 'the' && i + 2 < tokens.length && !consumed[i + 2]) {
        weatherIdx = i + 2;
      }
      if (!consumed[weatherIdx]) {
        const weatherToken = tokens[weatherIdx].toLowerCase().replace(/\)$/, '');
        const inWeatherVal = WEATHER_KEYWORDS[weatherToken];
        if (inWeatherVal) {
          if (!result.fieldConditions) result.fieldConditions = {};
          result.fieldConditions.weather = inWeatherVal;
          for (let j = i; j <= weatherIdx; j++) consumed[j] = true;
          continue;
        }
      }
    }

    // Weather (1-word) — guarded against stealing multi-word entity tokens
    const weatherVal = WEATHER_KEYWORDS[lower];
    if (weatherVal && !isEntityStart(tokens, i, consumed)) {
      if (!result.fieldConditions) result.fieldConditions = {};
      result.fieldConditions.weather = weatherVal;
      consumed[i] = true;
      continue;
    }

    // Single-word side conditions (reflect, tailwind)
    const singleSide = SINGLE_SIDE_CONDITIONS[lower];
    if (singleSide) {
      if (!result.fieldConditions) result.fieldConditions = {};
      if (!result.fieldConditions[singleSide.field]) {
        result.fieldConditions[singleSide.field] = {} as any;
      }
      (result.fieldConditions[singleSide.field] as any)[singleSide.key] = true;
      consumed[i] = true;
      continue;
    }

    // Status keywords
    const statusMatch = STATUS_ALIASES[lower];
    if (statusMatch) {
      result.status = statusMatch;
      consumed[i] = true;
      continue;
    }

    // Slash separator (used in EV strings like "252 HP / 252 Def")
    if (tokens[i] === '/') {
      consumed[i] = true;
      continue;
    }
  }

  // --- Pass 2: Entity matching ---
  // Try all entity types at each position and pick the longest match to avoid
  // single-word abilities/items stealing tokens from multi-word moves/species.

  for (let i = 0; i < tokens.length; i++) {
    if (consumed[i]) continue;

    // Nature (exact match, single word)
    const natureMatch = natureById.get(toID(tokens[i]));
    if (natureMatch && !result.nature) {
      result.nature = natureMatch;
      consumed[i] = true;
      continue;
    }

    // Item alias (shorthand)
    const itemAlias = ITEM_ALIASES[tokens[i].toLowerCase()];
    if (itemAlias && !result.item) {
      result.item = itemAlias;
      consumed[i] = true;
      continue;
    }

    // Try all greedy multi-word entity types and pick the longest match
    const candidates: { type: 'ability' | 'item' | 'move' | 'species'; name: string; count: number }[] = [];
    if (!result.ability) {
      const m = tryGreedyMatch(tokens, i, consumed, abilityById);
      if (m) candidates.push({ type: 'ability', ...m });
    }
    if (!result.item) {
      const m = tryGreedyMatch(tokens, i, consumed, itemById);
      if (m) candidates.push({ type: 'item', ...m });
    }
    if (!result.move) {
      const m = tryGreedyMatch(tokens, i, consumed, moveById);
      if (m) candidates.push({ type: 'move', ...m });
    }
    if (!result.species) {
      const m = tryGreedyMatch(tokens, i, consumed, speciesById);
      if (m) candidates.push({ type: 'species', ...m });
    }

    if (candidates.length > 0) {
      // Prefer the longest match (most tokens consumed)
      candidates.sort((a, b) => b.count - a.count);
      const best = candidates[0];
      switch (best.type) {
        case 'ability': result.ability = best.name; break;
        case 'item': result.item = best.name; break;
        case 'move': result.move = best.name; break;
        case 'species': result.species = best.name; break;
      }
      for (let j = i; j < i + best.count; j++) consumed[j] = true;
      continue;
    }

    // Species alias
    if (!result.species) {
      const aliasMatch = SPECIES_ALIASES[tokens[i].toLowerCase()];
      if (aliasMatch) {
        result.species = aliasMatch;
        consumed[i] = true;
        continue;
      }

      // Species prefix match
      const prefixMatch = prefixMatchSpecies(tokens[i]);
      if (prefixMatch) {
        result.species = prefixMatch;
        consumed[i] = true;
        continue;
      }
    }
  }

  // --- Collect unmatched tokens ---
  for (let i = 0; i < tokens.length; i++) {
    if (!consumed[i]) result.unmatched.push(tokens[i]);
  }

  // --- Post-processing ---

  // Resolve deferred patterns that depend on the relevant stat
  if (deferredMaxPlus || deferredBoost !== null) {
    let targetStat: StatKey | undefined;
    if (context?.role === 'defender' && context.opposingMove) {
      // Defender: resolve to the defensive stat that tanks the incoming move
      targetStat = getDefensiveStat(context.opposingMove);
    } else if (result.move) {
      // Attacker: resolve to the move's offensive stat
      targetStat = getOffensiveStat(result.move);
    }
    if (targetStat) {
      if (deferredMaxPlus) {
        if (!result.evs) result.evs = {};
        result.evs[targetStat] = 252;
        if (!result.nature) {
          result.nature = OFFENSIVE_NATURE[targetStat];
        }
      }
      if (deferredBoost !== null) {
        if (!result.boosts) result.boosts = {};
        result.boosts[targetStat] = Math.max(-6, Math.min(6, deferredBoost));
      }
    }
  }

  // Apply deferred nature from "252+ <Stat>" if no explicit nature was found
  if (!result.nature && deferredNature) {
    result.nature = deferredNature;
  }

  // "Min <Stat>" → pick a nature that lowers that stat (using EVs to decide what to boost)
  if (!result.nature && deferredMinStat) {
    result.nature = findNatureForMinStat(deferredMinStat, result.evs);
  }

  // Infer nature from EV spread if not explicitly set
  if (!result.nature && result.evs) {
    result.nature = inferNature(result.evs);
  }

  // Auto-enable ability for weather/terrain/ruin abilities
  if (result.ability && ABILITY_ON_LIST.has(result.ability)) {
    result.abilityOn = true;
  }

  // Protosynthesis/Quark Drive: set boostedStat and derive weather/terrain
  if (result.ability === 'Protosynthesis' || result.ability === 'Quark Drive') {
    if (!result.boostedStat) {
      result.boostedStat = 'auto';
    }
    // Only derive weather/terrain if not holding Booster Energy
    // (Booster Energy activates Proto/QD on its own without field conditions)
    if (result.item !== 'Booster Energy') {
      if (!result.fieldConditions) result.fieldConditions = {};
      if (result.ability === 'Protosynthesis' && !result.fieldConditions.weather) {
        result.fieldConditions.weather = 'Sun';
      }
      if (result.ability === 'Quark Drive' && !result.fieldConditions.terrain) {
        result.fieldConditions.terrain = 'Electric';
      }
    }
  }

  // Ability → field condition derivation
  if (result.ability) {
    const deriveField = ABILITY_FIELD_MAP[result.ability];
    if (deriveField) {
      if (!result.fieldConditions) result.fieldConditions = {};
      deriveField(result.fieldConditions);
    }
  }

  return result;
}

/** Merge two FieldConditions, with `b` taking precedence for weather/terrain. */
function mergeFieldConditions(a: FieldConditions, b: FieldConditions): FieldConditions {
  return {
    weather: b.weather ?? a.weather,
    terrain: b.terrain ?? a.terrain,
    isBeadsOfRuin: a.isBeadsOfRuin || b.isBeadsOfRuin || undefined,
    isSwordOfRuin: a.isSwordOfRuin || b.isSwordOfRuin || undefined,
    isTabletsOfRuin: a.isTabletsOfRuin || b.isTabletsOfRuin || undefined,
    isVesselOfRuin: a.isVesselOfRuin || b.isVesselOfRuin || undefined,
    attackerSide: a.attackerSide || b.attackerSide
      ? { ...a.attackerSide, ...b.attackerSide }
      : undefined,
    defenderSide: a.defenderSide || b.defenderSide
      ? { ...a.defenderSide, ...b.defenderSide }
      : undefined,
  };
}

export interface VsResult {
  attacker: ParseResult;
  defender: ParseResult;
  fieldConditions: FieldConditions;
}

export function parseVsInput(input: string): VsResult {
  const parts = input.split(/\s+vs\s+/i);
  const attackerInput = parts[0] ?? '';
  const defenderInput = parts[1] ?? '';

  const attacker = parseInput(attackerInput, { role: 'attacker' });
  const defender = parseInput(defenderInput, {
    role: 'defender',
    opposingMove: attacker.move,
  });

  const fieldConditions = mergeFieldConditions(
    attacker.fieldConditions ?? {},
    defender.fieldConditions ?? {},
  );

  return { attacker, defender, fieldConditions };
}
