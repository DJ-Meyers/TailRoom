import { useCallback } from 'react';

import { CalcColumn } from '~/components/CalcColumn';
import { PokemonPanel } from '~/components/PokemonPanel';
import { SpeedColumn } from '~/components/SpeedColumn';
import { usePersistedMultiCalc } from '~/hooks/usePersistedMultiCalc';
import { usePersistedPokemon } from '~/hooks/usePersistedPokemon';
import { usePersistedSpeedCalc } from '~/hooks/usePersistedSpeedCalc';
import type { ParseResult } from '~/types';

export const TeamCalcView = ({ pokemonId }: { pokemonId: string }) => {
  const selectedPokemon = usePersistedPokemon(pokemonId);
  const offensive = usePersistedMultiCalc(pokemonId, 'offensive');
  const defensive = usePersistedMultiCalc(pokemonId, 'defensive');
  const speed = usePersistedSpeedCalc(pokemonId);

  const handleSelectedPokemonParsed = useCallback(
    (parsed: ParseResult) => {
      selectedPokemon.applyParsed(parsed);
    },
    [selectedPokemon],
  );

  if (!selectedPokemon.state) {
    return <div className="text-center text-text-muted">Loading pokemon...</div>;
  }

  return (
    <div>
      <div className="flex gap-6 items-start mb-6 max-md:flex-col">
        <div className="flex-1 min-w-0">
          <PokemonPanel
            label="Your Pokemon"
            state={selectedPokemon.state}
            abilities={selectedPokemon.abilities}
            showMove={false}
            hideModifiers
            name={selectedPokemon.name}
            notes={selectedPokemon.notes}
            onNameChange={selectedPokemon.setName}
            onNotesChange={selectedPokemon.setNotes}
            onSpeciesChange={selectedPokemon.setSpecies}
            onNatureChange={selectedPokemon.setNature}
            onAbilityChange={selectedPokemon.setAbility}
            onItemChange={selectedPokemon.setItem}
            onMoveChange={selectedPokemon.setMove}
            onEvChange={selectedPokemon.setEv}
            onIvChange={selectedPokemon.setIv}
            onTeraTypeChange={selectedPokemon.setTeraType}
            onBoostChange={selectedPokemon.setBoost}
            onStatusChange={selectedPokemon.setStatus}
            onIsCritChange={selectedPokemon.setIsCrit}
            onParsed={handleSelectedPokemonParsed}
          />
        </div>
        <div className="flex-1 min-w-0">
          <SpeedColumn
            entries={speed.entries}
            selectedPokemon={selectedPokemon.state}
            conditions={speed.conditions}
            onConditionsChange={speed.setConditions}
            onAdd={speed.add}
            onRemove={speed.remove}
            onToggleExpanded={speed.toggleExpanded}
            onSpeciesChange={speed.setSpecies}
            onPokemonUpdate={speed.updatePokemon}
            onEvChange={speed.setEv}
            onIvChange={speed.setIv}
            onBoostChange={speed.setBoost}
            onNameChange={speed.updateName}
            onNotesChange={speed.updateNotes}
          />
        </div>
      </div>
      <div className="flex gap-6 items-start max-md:flex-col">
        <CalcColumn
          title="Offensive Calcs"
          mode="offensive"
          entries={offensive.entries}
          selectedPokemon={selectedPokemon.state}
          onAdd={offensive.add}
          onRemove={offensive.remove}
          onToggleExpanded={offensive.toggleExpanded}
          onSpeciesChange={offensive.setOpponentSpecies}
          onOpponentUpdate={offensive.updateOpponent}
          onEvChange={offensive.setEv}
          onIvChange={offensive.setIv}
          onBoostChange={offensive.setBoost}
          onMoveChange={offensive.updateMove}
          onFieldChange={offensive.updateField}
          onSelectedPokemonModifiersUpdate={offensive.updateSelectedPokemonModifiers}
          onSelectedPokemonBoostChange={offensive.setSelectedPokemonBoost}
          onNameChange={offensive.updateName}
          onNotesChange={offensive.updateNotes}
        />
        <CalcColumn
          title="Defensive Calcs"
          mode="defensive"
          entries={defensive.entries}
          selectedPokemon={selectedPokemon.state}
          onAdd={defensive.add}
          onRemove={defensive.remove}
          onToggleExpanded={defensive.toggleExpanded}
          onSpeciesChange={defensive.setOpponentSpecies}
          onOpponentUpdate={defensive.updateOpponent}
          onEvChange={defensive.setEv}
          onIvChange={defensive.setIv}
          onBoostChange={defensive.setBoost}
          onMoveChange={defensive.updateMove}
          onFieldChange={defensive.updateField}
          onSelectedPokemonModifiersUpdate={defensive.updateSelectedPokemonModifiers}
          onSelectedPokemonBoostChange={defensive.setSelectedPokemonBoost}
          onNameChange={defensive.updateName}
          onNotesChange={defensive.updateNotes}
        />
      </div>
    </div>
  );
};
