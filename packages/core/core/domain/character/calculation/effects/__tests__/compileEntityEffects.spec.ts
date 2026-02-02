import { describe, expect, it } from 'bun:test';
import { compileCharacterEffects } from '../compileEffects';
import type { ComputedEntity } from '../../../../entities/types/base';
import type { CharacterBaseData } from '../../../baseData/character';

/**
 * Creates a minimal CharacterBaseData for testing.
 */
function createMinimalCharacterBaseData(): CharacterBaseData {
  return {
    name: 'Test Character',
    baseData: {
      abilities: {
        strength: { score: 10 },
        dexterity: { score: 10 },
        constitution: { score: 10 },
        intelligence: { score: 10 },
        wisdom: { score: 10 },
        charisma: { score: 10 },
      },
    },
  } as CharacterBaseData;
}

describe('compileEntityEffects', () => {
  describe('effects field', () => {
    it('should compile effects from entities', () => {
      const entity: ComputedEntity = {
        id: 'test-buff',
        entityType: 'buff',
        name: 'Test Buff',
        effects: [
          {
            target: 'ac.total',
            formula: '2',
            bonusType: 'ENHANCEMENT',
          },
        ],
        _meta: { suppressed: false },
      };

      const result = compileCharacterEffects(createMinimalCharacterBaseData(), {
        computedEntities: [entity],
      });

      expect(result.all).toHaveLength(1);
      expect(result.all[0].target).toBe('ac.total');
      expect(result.all[0].formula).toBe('2');
      expect(result.all[0].sourceRef).toBe('buff:test-buff');
      expect(result.all[0].sourceName).toBe('Test Buff');
    });

    it('should resolve @entity.X placeholders in effects', () => {
      const entity: ComputedEntity & { enhancement: number } = {
        id: 'magic-armor',
        entityType: 'item',
        name: '+2 Chainmail',
        enhancement: 2,
        effects: [
          {
            target: 'ac.armor',
            formula: '5 + @entity.enhancement',
            bonusType: 'ARMOR',
          },
        ],
        _meta: { suppressed: false },
      };

      const result = compileCharacterEffects(createMinimalCharacterBaseData(), {
        computedEntities: [entity],
      });

      expect(result.all).toHaveLength(1);
      expect(result.all[0].formula).toBe('5 + 2');
    });

    it('should resolve complex @entity.X formulas (e.g., barkskin)', () => {
      // This simulates an entity where effects with @entity.X were copied
      // from the schema's autoEffects by the CMS
      const entity: ComputedEntity & { casterLevel: number } = {
        id: 'barkskin',
        entityType: 'buff',
        name: 'Barkskin',
        casterLevel: 6,
        effects: [
          {
            target: 'ac.naturalArmor',
            formula: 'min(2 + floor(@entity.casterLevel / 3), 5)',
            bonusType: 'ENHANCEMENT',
          },
        ],
        _meta: { suppressed: false },
      };

      const result = compileCharacterEffects(createMinimalCharacterBaseData(), {
        computedEntities: [entity],
      });

      expect(result.all).toHaveLength(1);
      expect(result.all[0].target).toBe('ac.naturalArmor');
      expect(result.all[0].formula).toBe('min(2 + floor(6 / 3), 5)');
      expect(result.all[0].bonusType).toBe('ENHANCEMENT');
      expect(result.all[0].sourceRef).toBe('buff:barkskin');
      expect(result.all[0].sourceName).toBe('Barkskin');
    });

    it('should compile multiple effects with different placeholder sources', () => {
      const entity: ComputedEntity & { bonus: number } = {
        id: 'cloak-resistance',
        entityType: 'item',
        name: 'Cloak of Resistance +2',
        bonus: 2,
        effects: [
          {
            target: 'savingThrow.fort.total',
            formula: '@entity.bonus',
            bonusType: 'RESISTANCE',
          },
          {
            target: 'savingThrow.ref.total',
            formula: '@entity.bonus',
            bonusType: 'RESISTANCE',
          },
          {
            target: 'savingThrow.will.total',
            formula: '@entity.bonus',
            bonusType: 'RESISTANCE',
          },
        ],
        _meta: { suppressed: false },
      };

      const result = compileCharacterEffects(createMinimalCharacterBaseData(), {
        computedEntities: [entity],
      });

      expect(result.all).toHaveLength(3);
      expect(result.all.every((e) => e.formula === '2')).toBe(true);
    });
  });

  describe('suppressed entities', () => {
    it('should not compile effects from suppressed entities', () => {
      const entity: ComputedEntity = {
        id: 'suppressed-buff',
        entityType: 'buff',
        name: 'Suppressed Buff',
        effects: [
          {
            target: 'ac.total',
            formula: '5',
          },
        ],
        _meta: { suppressed: true },
      };

      const result = compileCharacterEffects(createMinimalCharacterBaseData(), {
        computedEntities: [entity],
      });

      expect(result.all).toHaveLength(0);
    });

    it('should not compile effects with @entity.X from suppressed entities', () => {
      const entity: ComputedEntity & { casterLevel: number } = {
        id: 'suppressed-buff',
        entityType: 'buff',
        name: 'Suppressed Buff',
        casterLevel: 10,
        effects: [
          {
            target: 'ac.naturalArmor',
            formula: '@entity.casterLevel',
          },
        ],
        _meta: { suppressed: true },
      };

      const result = compileCharacterEffects(createMinimalCharacterBaseData(), {
        computedEntities: [entity],
      });

      expect(result.all).toHaveLength(0);
    });
  });
});
