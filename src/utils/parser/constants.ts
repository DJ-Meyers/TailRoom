import type { FieldConditions, StatKey } from '~/types';

// --- Alias maps ---

export const STAT_ALIASES: Record<string, StatKey> = {
  hp: 'hp',
  atk: 'atk', attack: 'atk',
  def: 'def', defense: 'def',
  spa: 'spa', spatk: 'spa', specialattack: 'spa', spatt: 'spa',
  spd: 'spd', spdef: 'spd', specialdefense: 'spd',
  spe: 'spe', speed: 'spe', spc: 'spa',
};

export const ITEM_ALIASES: Record<string, string> = {
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

export const STATUS_ALIASES: Record<string, string> = {
  burned: 'brn', burn: 'brn', brn: 'brn',
  paralyzed: 'par', para: 'par', par: 'par',
  poisoned: 'psn', poison: 'psn', psn: 'psn',
  toxic: 'tox', tox: 'tox',
  frozen: 'frz', freeze: 'frz', frz: 'frz',
  asleep: 'slp', sleep: 'slp', slp: 'slp',
};

export const SPECIES_ALIASES: Record<string, string> = {
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

export const ABILITY_ON_LIST = new Set([
  'Protosynthesis', 'Quark Drive', 'Drought', 'Drizzle',
  'Sand Stream', 'Snow Warning', 'Orichalcum Pulse', 'Hadron Engine',
  'Sword of Ruin', 'Beads of Ruin', 'Tablets of Ruin', 'Vessel of Ruin',
]);

// --- Field condition keywords ---

export const RUIN_PHRASES: Record<string, keyof FieldConditions> = {
  'beads of ruin': 'isBeadsOfRuin',
  'sword of ruin': 'isSwordOfRuin',
  'tablets of ruin': 'isTabletsOfRuin',
  'vessel of ruin': 'isVesselOfRuin',
};

export const TERRAIN_PHRASES: Record<string, FieldConditions['terrain']> = {
  'psychic terrain': 'Psychic',
  'electric terrain': 'Electric',
  'grassy terrain': 'Grassy',
  'misty terrain': 'Misty',
};

export const SIDE_CONDITION_PHRASES: Record<string, { field: 'attackerSide' | 'defenderSide'; key: string }> = {
  'helping hand': { field: 'attackerSide', key: 'isHelpingHand' },
  'light screen': { field: 'defenderSide', key: 'isLightScreen' },
  'aurora veil': { field: 'defenderSide', key: 'isAuroraVeil' },
  'friend guard': { field: 'defenderSide', key: 'isFriendGuard' },
};

export const WEATHER_KEYWORDS: Record<string, FieldConditions['weather']> = {
  sun: 'Sun', sunny: 'Sun',
  rain: 'Rain', rainy: 'Rain',
  sand: 'Sand', sandstorm: 'Sand',
  snow: 'Snow',
  hail: 'Hail',
};

export const SINGLE_SIDE_CONDITIONS: Record<string, { field: 'attackerSide' | 'defenderSide'; key: string }> = {
  reflect: { field: 'defenderSide', key: 'isReflect' },
  tailwind: { field: 'attackerSide', key: 'isTailwind' },
};

export const ABILITY_FIELD_MAP: Record<string, (fc: FieldConditions) => void> = {
  'Drought': (fc) => { if (!fc.weather) fc.weather = 'Sun'; },
  'Orichalcum Pulse': (fc) => { if (!fc.weather) fc.weather = 'Sun'; },
  'Drizzle': (fc) => { if (!fc.weather) fc.weather = 'Rain'; },
  'Sand Stream': (fc) => { if (!fc.weather) fc.weather = 'Sand'; },
  'Snow Warning': (fc) => { if (!fc.weather) fc.weather = 'Snow'; },
  'Hadron Engine': (fc) => { if (!fc.terrain) fc.terrain = 'Electric'; },
  'Beads of Ruin': (fc) => { fc.isBeadsOfRuin = true; },
  'Sword of Ruin': (fc) => { fc.isSwordOfRuin = true; },
  'Tablets of Ruin': (fc) => { fc.isTabletsOfRuin = true; },
  'Vessel of Ruin': (fc) => { fc.isVesselOfRuin = true; },
};

// --- Nature tables ---

/** Map an offensive stat to the most common nature boosting it. */
export const OFFENSIVE_NATURE: Partial<Record<StatKey, string>> = {
  atk: 'Adamant',
  spa: 'Modest',
  def: 'Bold',
  spd: 'Calm',
  spe: 'Jolly',
};

/** Map (boosted stat, lowered stat) → nature name */
export const NATURE_TABLE: Record<string, string> = {
  'atk,def': 'Lonely', 'atk,spa': 'Adamant', 'atk,spd': 'Naughty', 'atk,spe': 'Brave',
  'def,atk': 'Bold', 'def,spa': 'Impish', 'def,spd': 'Lax', 'def,spe': 'Relaxed',
  'spa,atk': 'Modest', 'spa,def': 'Mild', 'spa,spd': 'Rash', 'spa,spe': 'Quiet',
  'spd,atk': 'Calm', 'spd,def': 'Gentle', 'spd,spa': 'Careful', 'spd,spe': 'Sassy',
  'spe,atk': 'Timid', 'spe,def': 'Hasty', 'spe,spa': 'Jolly', 'spe,spd': 'Naive',
};

/** Default stat to boost when only given a stat to lower (no EV context). */
export const DEFAULT_BOOST_FOR_LOWER: Partial<Record<StatKey, StatKey>> = {
  atk: 'spa',  // Min Atk → Modest (+SpA -Atk)
  spa: 'atk',  // Min SpA → Adamant (+Atk -SpA)
  spe: 'atk',  // Min Spe → Brave (+Atk -Spe)
  def: 'spe',  // Min Def → Hasty (+Spe -Def)
  spd: 'spe',  // Min SpD → Naive (+Spe -SpD)
};
