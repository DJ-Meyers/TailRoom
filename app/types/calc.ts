import type { PokemonState, SelectedPokemonModifiers } from './pokemon';
import type { FieldConditions } from './field-conditions';

export interface CalcEntry {
  id: string;
  name: string;
  notes: string;
  opponent: PokemonState;
  move: string;
  fieldConditions: FieldConditions;
  selectedPokemonModifiers: SelectedPokemonModifiers;
  isExpanded: boolean;
}
