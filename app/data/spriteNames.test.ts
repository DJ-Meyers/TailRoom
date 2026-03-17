import { describe, expect, it } from 'vitest';

import { toSpriteId } from '~/data/spriteNames';

describe('toSpriteId', () => {
  it('strips hyphen from base name: Chien-Pao → chienpao', () => {
    expect(toSpriteId('Chien-Pao')).toBe('chienpao');
  });

  it('keeps form separator hyphen: Urshifu-Rapid-Strike → urshifu-rapidstrike', () => {
    expect(toSpriteId('Urshifu-Rapid-Strike')).toBe('urshifu-rapidstrike');
  });

  it('keeps form separator hyphen: Landorus-Therian → landorus-therian', () => {
    expect(toSpriteId('Landorus-Therian')).toBe('landorus-therian');
  });

  it('handles simple species: Charizard → charizard', () => {
    expect(toSpriteId('Charizard')).toBe('charizard');
  });
});
