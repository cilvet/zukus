import { describe, it, expect } from 'bun:test';
import { buildCharacter } from '../../../../tests/character/buildCharacter';
import { modifyHp } from '../operations/hpOperations';

describe('modifyHp', () => {
  describe('with currentDamage system', () => {
    it('should heal HP (reduce damage)', () => {
      const character = buildCharacter().build();
      character.currentDamage = 10;

      const result = modifyHp(character, 5, 50);

      expect(result.warnings).toHaveLength(0);
      expect(result.character.currentDamage).toBe(5);
    });

    it('should deal damage (increase damage)', () => {
      const character = buildCharacter().build();
      character.currentDamage = 5;

      const result = modifyHp(character, -10, 50);

      expect(result.warnings).toHaveLength(0);
      expect(result.character.currentDamage).toBe(15);
    });

    it('should not heal beyond 0 damage', () => {
      const character = buildCharacter().build();
      character.currentDamage = 5;

      const result = modifyHp(character, 10, 50);

      expect(result.warnings).toHaveLength(0);
      expect(result.character.currentDamage).toBe(0);
    });

    it('should not exceed max damage', () => {
      const character = buildCharacter().build();
      character.currentDamage = 40;

      const result = modifyHp(character, -20, 50);

      expect(result.warnings).toHaveLength(0);
      expect(result.character.currentDamage).toBe(50);
    });
  });

  describe('with customCurrentHp system', () => {
    it('should heal HP (increase current)', () => {
      const character = buildCharacter().build();
      character.customCurrentHp = 30;

      const result = modifyHp(character, 10, 50);

      expect(result.warnings).toHaveLength(0);
      expect(result.character.customCurrentHp).toBe(40);
    });

    it('should deal damage (decrease current)', () => {
      const character = buildCharacter().build();
      character.customCurrentHp = 40;

      const result = modifyHp(character, -15, 50);

      expect(result.warnings).toHaveLength(0);
      expect(result.character.customCurrentHp).toBe(25);
    });

    it('should not heal beyond maxHp', () => {
      const character = buildCharacter().build();
      character.customCurrentHp = 45;

      const result = modifyHp(character, 10, 50);

      expect(result.warnings).toHaveLength(0);
      expect(result.character.customCurrentHp).toBe(50);
    });

    it('should not go below 0 HP', () => {
      const character = buildCharacter().build();
      character.customCurrentHp = 10;

      const result = modifyHp(character, -20, 50);

      expect(result.warnings).toHaveLength(0);
      expect(result.character.customCurrentHp).toBe(0);
    });
  });
});

