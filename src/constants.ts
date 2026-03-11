export const TYPE_NAMES = [
  'Bug', 'Dark', 'Dragon', 'Electric', 'Fairy', 'Fighting',
  'Fire', 'Flying', 'Ghost', 'Grass', 'Ground', 'Ice',
  'Normal', 'Poison', 'Psychic', 'Rock', 'Steel', 'Stellar', 'Water',
];

export const TYPE_SPRITE_ID: Record<string, number> = {
  Normal: 1, Fighting: 2, Flying: 3, Poison: 4, Ground: 5, Rock: 6,
  Bug: 7, Ghost: 8, Steel: 9, Fire: 10, Water: 11, Grass: 12,
  Electric: 13, Psychic: 14, Ice: 15, Dragon: 16, Dark: 17, Fairy: 18,
};

export const STATUS_VALUES = ['brn', 'par', 'psn', 'tox', 'slp', 'frz'];
export const STATUS_LABELS: Record<string, string> = {
  brn: 'Burned',
  par: 'Paralyzed',
  psn: 'Poisoned',
  tox: 'Badly Poisoned',
  slp: 'Asleep',
  frz: 'Frozen',
};
