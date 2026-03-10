export const TYPE_NAMES = [
  'Normal', 'Fighting', 'Flying', 'Poison', 'Ground', 'Rock',
  'Bug', 'Ghost', 'Steel', 'Fire', 'Water', 'Grass',
  'Electric', 'Psychic', 'Ice', 'Dragon', 'Dark', 'Fairy', 'Stellar',
];

export const TYPE_SPRITE_ID: Record<string, number> = Object.fromEntries(
  TYPE_NAMES.map((name, i) => [name, i + 1]),
);

export const STATUS_VALUES = ['brn', 'par', 'psn', 'tox', 'slp', 'frz'];
export const STATUS_LABELS: Record<string, string> = {
  brn: 'Burned',
  par: 'Paralyzed',
  psn: 'Poisoned',
  tox: 'Badly Poisoned',
  slp: 'Asleep',
  frz: 'Frozen',
};
