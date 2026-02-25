import { toID } from '@smogon/calc';
import { gen } from './data/gen';
import type { ParseResult, StatKey } from './types';

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

// --- Alias maps ---

const STAT_ALIASES: Record<string, StatKey> = {
  hp: 'hp',
  atk: 'atk', attack: 'atk',
  def: 'def', defense: 'def',
  spa: 'spa', spatk: 'spa', specialattack: 'spa', spatt: 'spa',
  spd: 'spd', spdef: 'spd', specialdefense: 'spd',
  spe: 'spe', speed: 'spe', spc: 'spa',
};

const ITEM_ALIASES: Record<string, string> = {
  specs: 'Choice Specs',
  band: 'Choice Band',
  scarf: 'Choice Scarf',
  vest: 'Assault Vest',
  av: 'Assault Vest',
  boots: 'Heavy-Duty Boots',
  hdb: 'Heavy-Duty Boots',
  orb: 'Life Orb',
  lo: 'Life Orb',
  lefties: 'Leftovers',
  sash: 'Focus Sash',
  lum: 'Lum Berry',
  sitrus: 'Sitrus Berry',
  eviolite: 'Eviolite',
  plate: 'Life Orb', // generic fallback; specific plates need full name
};

const STATUS_ALIASES: Record<string, string> = {
  burned: 'brn', burn: 'brn', brn: 'brn',
  paralyzed: 'par', para: 'par', par: 'par',
  poisoned: 'psn', poison: 'psn', psn: 'psn',
  toxic: 'tox', tox: 'tox',
  frozen: 'frz', freeze: 'frz', frz: 'frz',
  asleep: 'slp', sleep: 'slp', slp: 'slp',
};

const SPECIES_ALIASES: Record<string, string> = {
  lando: 'Landorus-Therian',
  landot: 'Landorus-Therian',
  landoi: 'Landorus-Incarnate',
  pex: 'Toxapex',
  ferro: 'Ferrothorn',
  corv: 'Corviknight',
  clef: 'Clefable',
  chomp: 'Garchomp',
  flutter: 'Flutter Mane',
  rilla: 'Rillaboom',
  ghold: 'Gholdengo',
  king: 'Kingambit',
  gar: 'Gardevoir',
  torn: 'Tornadus-Therian',
  tornt: 'Tornadus-Therian',
  thundy: 'Thundurus-Therian',
  cress: 'Cresselia',
  bliss: 'Blissey',
  ttar: 'Tyranitar',
  mence: 'Salamence',
  pert: 'Swampert',
  lele: 'Tapu Lele',
  koko: 'Tapu Koko',
  fini: 'Tapu Fini',
  bulu: 'Tapu Bulu',
  zard: 'Charizard',
  pult: 'Dragapult',
  weavile: 'Weavile',
  skarm: 'Skarmory',
  hippo: 'Hippowdon',
  tusk: 'Great Tusk',
  iron: 'Iron Valiant',
  valiant: 'Iron Valiant',
  hands: 'Iron Hands',
  bundle: 'Iron Bundle',
  moth: 'Iron Moth',
  treads: 'Iron Treads',
  roaring: 'Roaring Moon',
  walking: 'Walking Wake',
  gouging: 'Gouging Fire',
  raging: 'Raging Bolt',
  oger: 'Ogerpon',
  ursaluna: 'Ursaluna-Bloodmoon',
  caly: 'Calyrex-Shadow',
  calys: 'Calyrex-Shadow',
  calyi: 'Calyrex-Ice',
  deo: 'Deoxys-Attack',
  deos: 'Deoxys-Speed',
};

const ABILITY_ON_LIST = new Set([
  'Protosynthesis', 'Quark Drive', 'Drought', 'Drizzle',
  'Sand Stream', 'Snow Warning', 'Orichalcum Pulse', 'Hadron Engine',
  'Sword of Ruin', 'Beads of Ruin', 'Tablets of Ruin', 'Vessel of Ruin',
]);

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

/** Map an offensive stat to the most common nature boosting it. */
const OFFENSIVE_NATURE: Partial<Record<StatKey, string>> = {
  atk: 'Adamant',
  spa: 'Modest',
  def: 'Bold',
  spd: 'Calm',
  spe: 'Jolly',
};

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

export function parseInput(input: string): ParseResult {
  const tokens = input.trim().split(/\s+/).filter(Boolean);
  const consumed = new Array<boolean>(tokens.length).fill(false);
  const result: ParseResult = { unmatched: [] };
  let deferredMaxPlus = false; // "252+" or "max+" — resolve after move is known
  let deferredBoost: number | null = null; // standalone "+2" etc. — resolve after move is known

  // --- Pass 1: Structural patterns ---

  for (let i = 0; i < tokens.length; i++) {
    if (consumed[i]) continue;
    const lower = tokens[i].toLowerCase();

    // "252+" or "max+" — max EVs + boosting nature in the move's offensive stat
    if (/^\d+\+$/.test(tokens[i]) || lower === 'max+') {
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

    // EV/IV patterns: "Max <Stat>", "<number> <Stat>", "0 <Stat>"
    if ((lower === 'max' || lower === 'min') && i + 1 < tokens.length && !consumed[i + 1]) {
      const stat = resolveStat(tokens[i + 1]);
      if (stat) {
        if (!result.evs) result.evs = {};
        result.evs[stat] = lower === 'max' ? 252 : 0;
        consumed[i] = consumed[i + 1] = true;
        continue;
      }
    }

    if (/^\d+$/.test(tokens[i]) && i + 1 < tokens.length && !consumed[i + 1]) {
      const stat = resolveStat(tokens[i + 1]);
      if (stat) {
        const value = parseInt(tokens[i], 10);
        // "0 Atk" or "0 SpA" → IVs (competitive convention)
        if (value === 0) {
          if (!result.ivs) result.ivs = {};
          result.ivs[stat] = 0;
        } else {
          if (!result.evs) result.evs = {};
          result.evs[stat] = Math.min(value, 252);
        }
        consumed[i] = consumed[i + 1] = true;
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

    // Ability (greedy multi-word)
    if (!result.ability) {
      const abilityMatch = tryGreedyMatch(tokens, i, consumed, abilityById);
      if (abilityMatch) {
        result.ability = abilityMatch.name;
        for (let j = i; j < i + abilityMatch.count; j++) consumed[j] = true;
        continue;
      }
    }

    // Item (greedy multi-word, full name)
    if (!result.item) {
      const itemMatch = tryGreedyMatch(tokens, i, consumed, itemById);
      if (itemMatch) {
        result.item = itemMatch.name;
        for (let j = i; j < i + itemMatch.count; j++) consumed[j] = true;
        continue;
      }
    }

    // Move (greedy multi-word)
    if (!result.move) {
      const moveMatch = tryGreedyMatch(tokens, i, consumed, moveById);
      if (moveMatch) {
        result.move = moveMatch.name;
        for (let j = i; j < i + moveMatch.count; j++) consumed[j] = true;
        continue;
      }
    }

    // Species (greedy multi-word, then alias, then prefix)
    if (!result.species) {
      const speciesMatch = tryGreedyMatch(tokens, i, consumed, speciesById);
      if (speciesMatch) {
        result.species = speciesMatch.name;
        for (let j = i; j < i + speciesMatch.count; j++) consumed[j] = true;
        continue;
      }

      // Species alias
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

  // Resolve deferred patterns that depend on the move's offensive stat
  if (result.move && (deferredMaxPlus || deferredBoost !== null)) {
    const offStat = getOffensiveStat(result.move);
    if (offStat) {
      // "252+" — max EVs + boosting nature
      if (deferredMaxPlus) {
        if (!result.evs) result.evs = {};
        result.evs[offStat] = 252;
        if (!result.nature) {
          result.nature = OFFENSIVE_NATURE[offStat];
        }
      }
      // Standalone "+2" etc. — boost the offensive stat
      if (deferredBoost !== null) {
        if (!result.boosts) result.boosts = {};
        result.boosts[offStat] = Math.max(-6, Math.min(6, deferredBoost));
      }
    }
  }

  // Infer nature from EV spread if not explicitly set
  if (!result.nature && result.evs) {
    result.nature = inferNature(result.evs);
  }

  // Auto-enable ability for weather/terrain/ruin abilities
  if (result.ability && ABILITY_ON_LIST.has(result.ability)) {
    result.abilityOn = true;
  }

  return result;
}
