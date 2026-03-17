/**
 * Convert a species name (from @smogon/calc) to the Showdown sprite filename.
 *
 * Showdown sprite filenames use: toID(baseName) + "-" + toID(formeName)
 * e.g. "Landorus-Therian" → "landorus-therian"
 *      "Chien-Pao"        → "chienpao"  (hyphen is part of base name)
 *      "Flutter Mane"     → "fluttermane"
 *
 * We use @smogon/calc's species data to distinguish base-name hyphens
 * (stripped) from form-separator hyphens (kept).
 *
 * Generated/validated by scripts/check-sprites.ts
 */

import { Generations, toID } from '@smogon/calc';

const gen = Generations.get(9);

const SPRITE_OVERRIDES: Record<string, string> = {
  'Aegislash-Blade': 'aegislash-blade',
  'Aegislash-Both': 'aegislash',
  'Aegislash-Shield': 'aegislash',
  'Toxtricity-Low-Key-Gmax': 'toxtricity-lowkey-gmax',
  'Urshifu-Rapid-Strike-Gmax': 'urshifu-rapidstrike-gmax',
};

export function toSpriteId(species: string): string {
  if (SPRITE_OVERRIDES[species]) {
    return SPRITE_OVERRIDES[species];
  }
  const s = gen.species.get(toID(species));
  if (!s) return toID(species);
  if (s.baseSpecies) {
    const forme = s.name.slice(s.baseSpecies.length + 1);
    return toID(s.baseSpecies) + '-' + toID(forme);
  }
  return toID(s.name);
}
