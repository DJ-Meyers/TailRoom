import { Generations, toID } from '@smogon/calc';

export const gen = Generations.get(9);

export const speciesList: string[] = [];
for (const s of gen.species) {
  speciesList.push(s.name);
}
speciesList.sort();

export const movesList: string[] = [];
for (const m of gen.moves) {
  movesList.push(m.name);
}
movesList.sort();

export const naturesList: { name: string; plus?: string; minus?: string }[] = [];
for (const n of gen.natures) {
  naturesList.push({ name: n.name, plus: n.plus, minus: n.minus });
}
naturesList.sort((a, b) => a.name.localeCompare(b.name));

export const abilitiesList: string[] = [];
for (const a of gen.abilities) {
  abilitiesList.push(a.name);
}
abilitiesList.sort();

export const itemsList: string[] = [];
for (const i of gen.items) {
  itemsList.push(i.name);
}
itemsList.sort();

export function getSpeciesAbilities(species: string): string[] {
  const s = gen.species.get(toID(species));
  if (!s) return [];
  const abilities: string[] = [];
  const ab = s.abilities as Record<string, string | undefined>;
  for (const key of Object.keys(ab)) {
    if (ab[key]) abilities.push(ab[key]!);
  }
  return abilities;
}
