import { describe, expect,it } from 'vitest';

import { parseInput, parseVsInput } from '~/utils/parser/parser';

describe('parseInput', () => {
  // --- VGC full-string examples (the user's reported cases) ---

  describe('full VGC strings', () => {
    it('parses "252+ SpA Choice Specs Flutter Mane Dazzling Gleam"', () => {
      const r = parseInput('252+ SpA Choice Specs Flutter Mane Dazzling Gleam');
      expect(r.species).toBe('Flutter Mane');
      expect(r.move).toBe('Dazzling Gleam');
      expect(r.item).toBe('Choice Specs');
      expect(r.nature).toBe('Modest');
      expect(r.evs).toEqual({ spa: 252 });
      expect(r.unmatched).toEqual([]);
    });

    it('parses "252+ Atk Choice Band Garchomp Earthquake"', () => {
      const r = parseInput('252+ Atk Choice Band Garchomp Earthquake');
      expect(r.species).toBe('Garchomp');
      expect(r.move).toBe('Earthquake');
      expect(r.item).toBe('Choice Band');
      expect(r.nature).toBe('Adamant');
      expect(r.evs).toEqual({ atk: 252 });
      expect(r.unmatched).toEqual([]);
    });

    it('parses "4HP chi-yu" with concatenated EV and hyphenated species', () => {
      const r = parseInput('4HP chi-yu');
      expect(r.species).toBe('Chi-Yu');
      expect(r.evs).toEqual({ hp: 4 });
      expect(r.unmatched).toEqual([]);
    });
  });

  // --- 252+ / max+ with explicit stat ---

  describe('252+ <Stat> pattern', () => {
    it('252+ SpA sets 252 SpA EVs and Modest nature', () => {
      const r = parseInput('252+ SpA Gardevoir Moonblast');
      expect(r.evs?.spa).toBe(252);
      expect(r.nature).toBe('Modest');
    });

    it('252+ Atk sets 252 Atk EVs and Adamant nature', () => {
      const r = parseInput('252+ Atk Garchomp Earthquake');
      expect(r.evs?.atk).toBe(252);
      expect(r.nature).toBe('Adamant');
    });

    it('252+ Def sets 252 Def EVs and Bold nature', () => {
      const r = parseInput('252+ Def Corviknight');
      expect(r.evs?.def).toBe(252);
      expect(r.nature).toBe('Bold');
    });

    it('252+ SpD sets 252 SpD EVs and Calm nature', () => {
      const r = parseInput('252+ SpD Blissey');
      expect(r.evs?.spd).toBe(252);
      expect(r.nature).toBe('Calm');
    });

    it('max+ SpA works like 252+ SpA', () => {
      const r = parseInput('max+ SpA Flutter Mane Moonblast');
      expect(r.evs?.spa).toBe(252);
      expect(r.nature).toBe('Modest');
    });

    it('does not override an explicit nature', () => {
      const r = parseInput('Timid 252+ SpA Gardevoir Moonblast');
      expect(r.evs?.spa).toBe(252);
      expect(r.nature).toBe('Timid');
    });
  });

  // --- 252+ deferred (no explicit stat) ---

  describe('252+ deferred to move', () => {
    it('defers to physical move offensive stat', () => {
      const r = parseInput('252+ Garchomp Earthquake');
      expect(r.evs?.atk).toBe(252);
      expect(r.nature).toBe('Adamant');
    });

    it('defers to special move offensive stat', () => {
      const r = parseInput('252+ Flutter Mane Dazzling Gleam');
      expect(r.evs?.spa).toBe(252);
      expect(r.nature).toBe('Modest');
    });
  });

  // --- Defender context ---

  describe('defender parse context', () => {
    it('deferred 252+ resolves to Def for physical opposing move', () => {
      const r = parseInput('252+ Corviknight', {
        role: 'defender',
        opposingMove: 'Earthquake',
      });
      expect(r.evs?.def).toBe(252);
      expect(r.nature).toBe('Bold');
    });

    it('deferred 252+ resolves to SpD for special opposing move', () => {
      const r = parseInput('252+ Blissey', {
        role: 'defender',
        opposingMove: 'Dazzling Gleam',
      });
      expect(r.evs?.spd).toBe(252);
      expect(r.nature).toBe('Calm');
    });

    it('deferred +2 boost resolves to defensive stat', () => {
      const r = parseInput('+2 Corviknight', {
        role: 'defender',
        opposingMove: 'Earthquake',
      });
      expect(r.boosts?.def).toBe(2);
    });

    it('explicit stat on defender is not affected by context', () => {
      const r = parseInput('252+ SpD Corviknight', {
        role: 'defender',
        opposingMove: 'Earthquake',
      });
      // explicit "SpD" takes precedence, not Def from Earthquake
      expect(r.evs?.spd).toBe(252);
      expect(r.nature).toBe('Calm');
    });
  });

  // --- Concatenated EV/IV patterns ---

  describe('concatenated EV/IV tokens', () => {
    it('parses "4HP" as 4 HP EVs', () => {
      const r = parseInput('4HP Garchomp');
      expect(r.evs?.hp).toBe(4);
      expect(r.species).toBe('Garchomp');
    });

    it('parses "252SpA" as 252 SpA EVs', () => {
      const r = parseInput('252SpA Gardevoir');
      expect(r.evs?.spa).toBe(252);
    });

    it('parses "0Atk" as 0 Atk EVs (IVs default to 31)', () => {
      const r = parseInput('0Atk Gardevoir');
      expect(r.evs?.atk).toBe(0);
      expect(r.ivs).toBeUndefined();
    });

    it('parses "252Spe" as 252 Spe EVs', () => {
      const r = parseInput('252Spe Garchomp');
      expect(r.evs?.spe).toBe(252);
    });
  });

  // --- Two-token EV/IV patterns ---

  describe('two-token EV/IV patterns', () => {
    it('"252 SpA" sets 252 SpA EVs', () => {
      const r = parseInput('252 SpA Gardevoir');
      expect(r.evs?.spa).toBe(252);
    });

    it('"0 Atk" sets 0 Atk EVs (IVs default to 31)', () => {
      const r = parseInput('0 Atk Gardevoir');
      expect(r.evs?.atk).toBe(0);
      expect(r.ivs).toBeUndefined();
    });

    it('"Max SpA" sets 252 SpA EVs', () => {
      const r = parseInput('Max SpA Gardevoir');
      expect(r.evs?.spa).toBe(252);
    });

    it('"Min Atk" sets 0 Atk EVs, 0 Atk IVs, and a -Atk nature', () => {
      const r = parseInput('Min Atk Gardevoir');
      expect(r.evs?.atk).toBe(0);
      expect(r.ivs?.atk).toBe(0);
      expect(r.nature).toBe('Modest'); // -Atk +SpA default
    });

    it('"Min Atk" with SpD EVs picks Calm (-Atk +SpD)', () => {
      const r = parseInput('252 SpD Min Atk Blissey');
      expect(r.evs?.atk).toBe(0);
      expect(r.ivs?.atk).toBe(0);
      expect(r.nature).toBe('Calm');
    });

    it('"Min Spe" sets 0 Spe EVs, 0 Spe IVs, and a -Spe nature', () => {
      const r = parseInput('Min Spe Torkoal');
      expect(r.evs?.spe).toBe(0);
      expect(r.ivs?.spe).toBe(0);
      expect(r.nature).toBe('Brave'); // -Spe +Atk default
    });

    it('"Min Spe" with SpA EVs picks Quiet (-Spe +SpA)', () => {
      const r = parseInput('252 SpA Min Spe Torkoal');
      expect(r.evs?.spe).toBe(0);
      expect(r.ivs?.spe).toBe(0);
      expect(r.nature).toBe('Quiet');
    });

    it('explicit nature overrides "Min" nature inference', () => {
      const r = parseInput('Timid Min Atk Gardevoir');
      expect(r.ivs?.atk).toBe(0);
      expect(r.nature).toBe('Timid');
    });

    it('EV spread with slashes: "252 HP / 252 Def / 4 SpD"', () => {
      const r = parseInput('252 HP / 252 Def / 4 SpD Corviknight');
      expect(r.evs?.hp).toBe(252);
      expect(r.evs?.def).toBe(252);
      expect(r.evs?.spd).toBe(4);
    });

    it('"252 HP 0 Def Clefable" sets 252 HP EVs and 0 Def EVs (IVs stay 31)', () => {
      const r = parseInput('252 HP 0 Def Clefable');
      expect(r.evs?.hp).toBe(252);
      expect(r.evs?.def).toBe(0);
      expect(r.ivs).toBeUndefined();
      expect(r.species).toBe('Clefable');
    });
  });

  // --- Longest-match entity resolution ---

  describe('longest match wins across entity types', () => {
    it('"Dazzling Gleam" matches as move, not "Dazzling" ability', () => {
      const r = parseInput('Flutter Mane Dazzling Gleam');
      expect(r.move).toBe('Dazzling Gleam');
      expect(r.species).toBe('Flutter Mane');
      expect(r.ability).toBeUndefined();
      expect(r.unmatched).toEqual([]);
    });

    it('"Iron Head" matches as move, not "Iron" species alias', () => {
      const r = parseInput('Garchomp Iron Head');
      expect(r.move).toBe('Iron Head');
      expect(r.species).toBe('Garchomp');
    });
  });

  // --- Species matching ---

  describe('species matching', () => {
    it('matches full species name', () => {
      expect(parseInput('Garchomp').species).toBe('Garchomp');
    });

    it('matches multi-word species', () => {
      expect(parseInput('Flutter Mane').species).toBe('Flutter Mane');
    });

    it('matches species alias', () => {
      expect(parseInput('chomp').species).toBe('Garchomp');
      expect(parseInput('flutter').species).toBe('Flutter Mane');
      expect(parseInput('lando').species).toBe('Landorus-Therian');
      expect(parseInput('pult').species).toBe('Dragapult');
    });

    it('matches hyphenated species via toID', () => {
      expect(parseInput('chi-yu').species).toBe('Chi-Yu');
    });
  });

  // --- Item matching ---

  describe('item matching', () => {
    it('matches item alias "specs"', () => {
      expect(parseInput('specs Gardevoir').item).toBe('Choice Specs');
    });

    it('matches item alias "band"', () => {
      expect(parseInput('band Garchomp').item).toBe('Choice Band');
    });

    it('matches item alias "av"', () => {
      expect(parseInput('av Corviknight').item).toBe('Assault Vest');
    });

    it('matches full item name "Choice Specs"', () => {
      expect(parseInput('Choice Specs Gardevoir').item).toBe('Choice Specs');
    });

    it('matches full item name "Life Orb"', () => {
      expect(parseInput('Life Orb Garchomp').item).toBe('Life Orb');
    });
  });

  // --- Nature ---

  describe('nature', () => {
    it('matches explicit nature', () => {
      expect(parseInput('Modest Gardevoir').nature).toBe('Modest');
      expect(parseInput('Adamant Garchomp').nature).toBe('Adamant');
      expect(parseInput('Timid Flutter Mane').nature).toBe('Timid');
    });

    it('infers nature from EV spread: 252 Atk / 252 Spe', () => {
      const r = parseInput('252 Atk / 252 Spe Garchomp');
      expect(r.nature).toBe('Jolly');
    });

    it('infers nature from EV spread: 252 SpA / 252 Spe', () => {
      const r = parseInput('252 SpA / 252 Spe Gardevoir');
      expect(r.nature).toBe('Timid');
    });

    it('infers Adamant from 252 Atk alone', () => {
      const r = parseInput('252 Atk Garchomp');
      expect(r.nature).toBe('Adamant');
    });

    it('infers Modest from 252 SpA alone', () => {
      const r = parseInput('252 SpA Gardevoir');
      expect(r.nature).toBe('Modest');
    });
  });

  // --- Boost patterns ---

  describe('boost patterns', () => {
    it('"+2 SpA" sets +2 SpA boost', () => {
      const r = parseInput('+2 SpA Gardevoir');
      expect(r.boosts?.spa).toBe(2);
    });

    it('"-1 Atk" sets -1 Atk boost', () => {
      const r = parseInput('-1 Atk Garchomp Earthquake');
      expect(r.boosts?.atk).toBe(-1);
    });

    it('standalone "+2" defers to move offensive stat', () => {
      const r = parseInput('+2 Garchomp Earthquake');
      expect(r.boosts?.atk).toBe(2);
    });

    it('standalone "+2" defers to special move', () => {
      const r = parseInput('+2 Gardevoir Moonblast');
      expect(r.boosts?.spa).toBe(2);
    });
  });

  // --- Level patterns ---

  describe('level patterns', () => {
    it('"Lvl 50" sets level 50', () => {
      expect(parseInput('Lvl 50 Garchomp').level).toBe(50);
    });

    it('"Level 50" sets level 50', () => {
      expect(parseInput('Level 50 Garchomp').level).toBe(50);
    });

    it('"L50" sets level 50', () => {
      expect(parseInput('L50 Garchomp').level).toBe(50);
    });

    it('clamps level to [1, 100]', () => {
      expect(parseInput('L0 Garchomp').level).toBe(1);
      expect(parseInput('L200 Garchomp').level).toBe(100);
    });
  });

  // --- Tera type ---

  describe('tera type', () => {
    it('"Tera Fairy" sets tera type', () => {
      expect(parseInput('Tera Fairy Gardevoir').teraType).toBe('Fairy');
    });

    it('"Tera Ground" sets tera type', () => {
      expect(parseInput('Tera Ground Garchomp').teraType).toBe('Ground');
    });
  });

  // --- Status ---

  describe('status', () => {
    it('recognizes "burned"', () => {
      expect(parseInput('burned Garchomp').status).toBe('brn');
    });

    it('recognizes "brn"', () => {
      expect(parseInput('brn Garchomp').status).toBe('brn');
    });

    it('recognizes "paralyzed"', () => {
      expect(parseInput('paralyzed Garchomp').status).toBe('par');
    });

    it('recognizes "toxic"', () => {
      expect(parseInput('toxic Garchomp').status).toBe('tox');
    });
  });

  // --- Crit ---

  describe('crit', () => {
    it('"crit" sets isCrit', () => {
      const r = parseInput('crit Garchomp Earthquake');
      expect(r.isCrit).toBe(true);
    });
  });

  // --- Ability auto-enable ---

  describe('ability auto-enable', () => {
    it('auto-enables Protosynthesis and derives Sun + boostedStat', () => {
      const r = parseInput('Protosynthesis Flutter Mane');
      expect(r.ability).toBe('Protosynthesis');
      expect(r.abilityOn).toBe(true);
      expect(r.boostedStat).toBe('auto');
      expect(r.fieldConditions?.weather).toBe('Sun');
    });

    it('auto-enables Drought', () => {
      const r = parseInput('Drought Torkoal');
      expect(r.ability).toBe('Drought');
      expect(r.abilityOn).toBe(true);
    });

    it('Beads of Ruin is consumed as field condition, not ability', () => {
      const r = parseInput('Beads of Ruin chi-yu');
      // Ruin phrases are consumed in Pass 1 as field conditions
      expect(r.ability).toBeUndefined();
      expect(r.fieldConditions?.isBeadsOfRuin).toBe(true);
    });

    it('does not auto-enable regular abilities', () => {
      const r = parseInput('Intimidate Landorus-Therian');
      expect(r.ability).toBe('Intimidate');
      expect(r.abilityOn).toBeUndefined();
    });
  });

  // --- Unmatched tokens ---

  describe('unmatched tokens', () => {
    it('collects tokens that match nothing', () => {
      const r = parseInput('xyzzy Garchomp');
      expect(r.unmatched).toContain('xyzzy');
    });

    it('no unmatched for a clean input', () => {
      const r = parseInput('Garchomp Earthquake');
      expect(r.unmatched).toEqual([]);
    });
  });

  // --- Field conditions ---

  describe('field conditions', () => {
    describe('weather keywords', () => {
      it('"sun" sets weather to Sun', () => {
        const r = parseInput('sun Garchomp Earthquake');
        expect(r.fieldConditions?.weather).toBe('Sun');
      });

      it('"rain" sets weather to Rain', () => {
        const r = parseInput('rain Garchomp');
        expect(r.fieldConditions?.weather).toBe('Rain');
      });

      it('"sand" sets weather to Sand', () => {
        const r = parseInput('sand Garchomp');
        expect(r.fieldConditions?.weather).toBe('Sand');
      });

      it('"sandstorm" sets weather to Sand', () => {
        const r = parseInput('sandstorm Garchomp');
        expect(r.fieldConditions?.weather).toBe('Sand');
      });

      it('"snow" sets weather to Snow', () => {
        const r = parseInput('snow Garchomp');
        expect(r.fieldConditions?.weather).toBe('Snow');
      });

      it('"hail" sets weather to Hail', () => {
        const r = parseInput('hail Garchomp');
        expect(r.fieldConditions?.weather).toBe('Hail');
      });

      it('"in rain" sets weather to Rain', () => {
        const r = parseInput('Garchomp Earthquake in rain');
        expect(r.fieldConditions?.weather).toBe('Rain');
      });

      it('"in the snow" sets weather to Snow', () => {
        const r = parseInput('Garchomp in the snow');
        expect(r.fieldConditions?.weather).toBe('Snow');
      });

      it('"(in rain)" sets weather to Rain', () => {
        const r = parseInput('Garchomp Earthquake (in rain)');
        expect(r.fieldConditions?.weather).toBe('Rain');
      });

      it('"in sun" sets weather to Sun', () => {
        const r = parseInput('Flutter Mane Dazzling Gleam in sun');
        expect(r.fieldConditions?.weather).toBe('Sun');
      });
    });

    describe('terrain keywords', () => {
      it('"psychic terrain" sets terrain to Psychic', () => {
        const r = parseInput('psychic terrain Gardevoir Expanding Force');
        expect(r.fieldConditions?.terrain).toBe('Psychic');
      });

      it('"electric terrain" sets terrain to Electric', () => {
        const r = parseInput('electric terrain Garchomp');
        expect(r.fieldConditions?.terrain).toBe('Electric');
      });

      it('"grassy terrain" sets terrain to Grassy', () => {
        const r = parseInput('grassy terrain Rillaboom');
        expect(r.fieldConditions?.terrain).toBe('Grassy');
      });

      it('"misty terrain" sets terrain to Misty', () => {
        const r = parseInput('misty terrain Garchomp');
        expect(r.fieldConditions?.terrain).toBe('Misty');
      });

      it('"psychic" alone does NOT set terrain', () => {
        const r = parseInput('psychic Gardevoir');
        expect(r.fieldConditions?.terrain).toBeUndefined();
      });
    });

    describe('ruin phrases', () => {
      it('"beads of ruin" sets isBeadsOfRuin', () => {
        const r = parseInput('beads of ruin Gardevoir');
        expect(r.fieldConditions?.isBeadsOfRuin).toBe(true);
      });

      it('"sword of ruin" sets isSwordOfRuin', () => {
        const r = parseInput('sword of ruin Garchomp');
        expect(r.fieldConditions?.isSwordOfRuin).toBe(true);
      });

      it('"tablets of ruin" sets isTabletsOfRuin', () => {
        const r = parseInput('tablets of ruin Garchomp');
        expect(r.fieldConditions?.isTabletsOfRuin).toBe(true);
      });

      it('"vessel of ruin" sets isVesselOfRuin', () => {
        const r = parseInput('vessel of ruin Garchomp');
        expect(r.fieldConditions?.isVesselOfRuin).toBe(true);
      });

      it('ruin phrase does not consume the ability slot', () => {
        const r = parseInput('Protosynthesis beads of ruin Flutter Mane');
        expect(r.ability).toBe('Protosynthesis');
        expect(r.fieldConditions?.isBeadsOfRuin).toBe(true);
      });
    });

    describe('side conditions', () => {
      it('"helping hand" sets attackerSide.isHelpingHand', () => {
        const r = parseInput('helping hand Garchomp Earthquake');
        expect(r.fieldConditions?.attackerSide?.isHelpingHand).toBe(true);
      });

      it('"light screen" sets defenderSide.isLightScreen', () => {
        const r = parseInput('light screen Blissey');
        expect(r.fieldConditions?.defenderSide?.isLightScreen).toBe(true);
      });

      it('"aurora veil" sets defenderSide.isAuroraVeil', () => {
        const r = parseInput('aurora veil Blissey');
        expect(r.fieldConditions?.defenderSide?.isAuroraVeil).toBe(true);
      });

      it('"reflect" sets defenderSide.isReflect', () => {
        const r = parseInput('reflect Corviknight');
        expect(r.fieldConditions?.defenderSide?.isReflect).toBe(true);
      });

      it('"tailwind" sets attackerSide.isTailwind', () => {
        const r = parseInput('tailwind Garchomp');
        expect(r.fieldConditions?.attackerSide?.isTailwind).toBe(true);
      });

      it('"friend guard" sets defenderSide.isFriendGuard', () => {
        const r = parseInput('friend guard Blissey');
        expect(r.fieldConditions?.defenderSide?.isFriendGuard).toBe(true);
      });
    });

    describe('"boosted" keyword', () => {
      it('"boosted" sets abilityOn and boostedStat', () => {
        const r = parseInput('Protosynthesis boosted Flutter Mane');
        expect(r.abilityOn).toBe(true);
        expect(r.boostedStat).toBe('auto');
      });
    });

    describe('ability → field derivation', () => {
      it('Drought derives Sun weather', () => {
        const r = parseInput('Drought Torkoal');
        expect(r.fieldConditions?.weather).toBe('Sun');
      });

      it('Drizzle derives Rain weather', () => {
        const r = parseInput('Drizzle Pelipper');
        expect(r.fieldConditions?.weather).toBe('Rain');
      });

      it('Sand Stream derives Sand weather', () => {
        const r = parseInput('Sand Stream Tyranitar');
        expect(r.fieldConditions?.weather).toBe('Sand');
      });

      it('Snow Warning derives Snow weather', () => {
        const r = parseInput('Snow Warning Abomasnow');
        expect(r.fieldConditions?.weather).toBe('Snow');
      });

      it('Hadron Engine derives Electric terrain', () => {
        const r = parseInput('Hadron Engine Miraidon');
        expect(r.fieldConditions?.terrain).toBe('Electric');
      });

      it('Beads of Ruin ability derives isBeadsOfRuin', () => {
        const r = parseInput('Beads of Ruin Chi-Yu');
        expect(r.fieldConditions?.isBeadsOfRuin).toBe(true);
      });

      it('explicit weather overrides ability derivation', () => {
        const r = parseInput('rain Drought Torkoal');
        expect(r.fieldConditions?.weather).toBe('Rain');
      });

      it('Protosynthesis auto-derives Sun and boostedStat', () => {
        const r = parseInput('Protosynthesis Flutter Mane Dazzling Gleam');
        expect(r.boostedStat).toBe('auto');
        expect(r.fieldConditions?.weather).toBe('Sun');
      });

      it('Quark Drive auto-derives Electric terrain and boostedStat', () => {
        const r = parseInput('Quark Drive Iron Crown');
        expect(r.boostedStat).toBe('auto');
        expect(r.fieldConditions?.terrain).toBe('Electric');
      });

      it('explicit terrain is not overridden by Quark Drive', () => {
        const r = parseInput('psychic terrain Quark Drive Iron Crown');
        expect(r.fieldConditions?.terrain).toBe('Psychic');
      });

      it('Booster Energy + Protosynthesis does not derive Sun', () => {
        const r = parseInput('Protosynthesis Booster Energy Flutter Mane Dazzling Gleam');
        expect(r.ability).toBe('Protosynthesis');
        expect(r.item).toBe('Booster Energy');
        expect(r.boostedStat).toBe('auto');
        expect(r.fieldConditions?.weather).toBeUndefined();
      });

      it('Booster Energy + Quark Drive does not derive Electric terrain', () => {
        const r = parseInput('Quark Drive Booster Energy Iron Crown');
        expect(r.ability).toBe('Quark Drive');
        expect(r.item).toBe('Booster Energy');
        expect(r.boostedStat).toBe('auto');
        expect(r.fieldConditions?.terrain).toBeUndefined();
      });
    });
  });
});

describe('parseVsInput', () => {
  it('splits on "vs" and parses both sides', () => {
    const r = parseVsInput('252+ SpA Flutter Mane Dazzling Gleam vs 4 HP Garchomp');
    expect(r.attacker.species).toBe('Flutter Mane');
    expect(r.attacker.move).toBe('Dazzling Gleam');
    expect(r.defender.species).toBe('Garchomp');
    expect(r.defender.evs?.hp).toBe(4);
  });

  it('merges field conditions from both sides', () => {
    const r = parseVsInput('sun Garchomp Earthquake vs reflect Corviknight');
    expect(r.fieldConditions.weather).toBe('Sun');
    expect(r.fieldConditions.defenderSide?.isReflect).toBe(true);
  });

  it('parses the full example string', () => {
    const r = parseVsInput(
      'Max SpA Protosynthesis boosted beads of ruin Iron Crown psychic terrain Expanding Force vs 4 SpD Urshifu Rapid Strike',
    );
    expect(r.attacker.species).toBe('Iron Crown');
    expect(r.attacker.move).toBe('Expanding Force');
    expect(r.attacker.ability).toBe('Protosynthesis');
    expect(r.attacker.abilityOn).toBe(true);
    expect(r.attacker.evs?.spa).toBe(252);
    expect(r.fieldConditions.isBeadsOfRuin).toBe(true);
    expect(r.fieldConditions.terrain).toBe('Psychic');
    expect(r.defender.species).toBe('Urshifu-Rapid-Strike');
    expect(r.defender.evs?.spd).toBe(4);
  });

  it('handles attacker-only input (no vs)', () => {
    const r = parseVsInput('Garchomp Earthquake');
    expect(r.attacker.species).toBe('Garchomp');
    expect(r.attacker.move).toBe('Earthquake');
    expect(r.defender.species).toBeUndefined();
  });

  describe('Sandstorm Sand Force Excadrill Sand Tomb vs 252 HP 168 Def Impish Sandile', () => {
    const input = 'Sandstorm Sand Force Excadrill Sand Tomb vs 252 HP 168 Def Impish Sandile';

    it('parses the full vs string with correct attacker fields', () => {
      const r = parseVsInput(input);
      expect(r.attacker.species).toBe('Excadrill');
      expect(r.attacker.ability).toBe('Sand Force');
      expect(r.attacker.move).toBe('Sand Tomb');
      expect(r.attacker.unmatched).toEqual([]);
    });

    it('parses the full vs string with correct defender fields', () => {
      const r = parseVsInput(input);
      expect(r.defender.species).toBe('Sandile');
      expect(r.defender.evs?.hp).toBe(252);
      expect(r.defender.evs?.def).toBe(168);
      expect(r.defender.nature).toBe('Impish');
      expect(r.defender.unmatched).toEqual([]);
    });

    it('sets Sand weather from the explicit Sandstorm keyword', () => {
      const r = parseVsInput(input);
      expect(r.fieldConditions.weather).toBe('Sand');
    });

    it('does not confuse "Sandile" with the "sand" weather keyword', () => {
      const r = parseInput('252 HP 168 Def Impish Sandile');
      expect(r.species).toBe('Sandile');
      expect(r.evs?.hp).toBe(252);
      expect(r.evs?.def).toBe(168);
      expect(r.nature).toBe('Impish');
      expect(r.fieldConditions?.weather).toBeUndefined();
      expect(r.unmatched).toEqual([]);
    });

    it('"Sandstorm" is consumed as weather, not as part of an entity', () => {
      const r = parseInput('Sandstorm Excadrill Sand Tomb');
      expect(r.fieldConditions?.weather).toBe('Sand');
      expect(r.species).toBe('Excadrill');
      expect(r.move).toBe('Sand Tomb');
    });

    it('Sand Force is recognized as an ability alongside Sandstorm weather', () => {
      const r = parseInput('Sandstorm Sand Force Excadrill');
      expect(r.ability).toBe('Sand Force');
      expect(r.fieldConditions?.weather).toBe('Sand');
      expect(r.species).toBe('Excadrill');
      expect(r.unmatched).toEqual([]);
    });

    it('Sand Tomb is recognized as a move alongside Sandstorm weather', () => {
      const r = parseInput('Sandstorm Excadrill Sand Tomb');
      expect(r.move).toBe('Sand Tomb');
      expect(r.fieldConditions?.weather).toBe('Sand');
      expect(r.unmatched).toEqual([]);
    });
  });
});
