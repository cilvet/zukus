import { describe, expect, it } from 'bun:test';
import {
  resolveEntityPlaceholders,
  resolveEffectEntityPlaceholders,
} from '../resolveEntityPlaceholders';
import type { Effect } from '../../../character/baseData/effects';
import type { StandardEntity } from '../../types/base';

describe('resolveEntityPlaceholders', () => {
  describe('basic resolution', () => {
    it('should resolve a simple @entity.X placeholder', () => {
      const entity = { id: 'test', entityType: 'buff', casterLevel: 6 } as StandardEntity;

      const result = resolveEntityPlaceholders('@entity.casterLevel', entity);

      expect(result).toBe('6');
    });

    it('should resolve multiple placeholders in a string', () => {
      const entity = {
        id: 'test',
        entityType: 'buff',
        casterLevel: 6,
        bonus: 2,
      } as StandardEntity;

      const result = resolveEntityPlaceholders(
        '@entity.casterLevel + @entity.bonus',
        entity
      );

      expect(result).toBe('6 + 2');
    });

    it('should preserve non-placeholder parts of the string', () => {
      const entity = { id: 'test', entityType: 'buff', casterLevel: 6 } as StandardEntity;

      const result = resolveEntityPlaceholders(
        'min(2 + floor(@entity.casterLevel / 3), 5)',
        entity
      );

      expect(result).toBe('min(2 + floor(6 / 3), 5)');
    });

    it('should return 0 for undefined entity properties', () => {
      const entity = { id: 'test', entityType: 'buff' } as StandardEntity;

      const result = resolveEntityPlaceholders('@entity.nonExistent', entity);

      expect(result).toBe('0');
    });
  });

  describe('nested paths', () => {
    it('should resolve nested paths with dot notation', () => {
      const entity = {
        id: 'test',
        entityType: 'buff',
        damage: { dice: 2, bonus: 4 },
      } as StandardEntity;

      const result = resolveEntityPlaceholders('@entity.damage.dice', entity);

      expect(result).toBe('2');
    });

    it('should return 0 for partially valid nested paths', () => {
      const entity = {
        id: 'test',
        entityType: 'buff',
        damage: { dice: 2 },
      } as StandardEntity;

      const result = resolveEntityPlaceholders('@entity.damage.bonus', entity);

      expect(result).toBe('0');
    });
  });

  describe('type handling', () => {
    it('should convert boolean true to 1', () => {
      const entity = {
        id: 'test',
        entityType: 'buff',
        isActive: true,
      } as StandardEntity;

      const result = resolveEntityPlaceholders('@entity.isActive', entity);

      expect(result).toBe('1');
    });

    it('should convert boolean false to 0', () => {
      const entity = {
        id: 'test',
        entityType: 'buff',
        isActive: false,
      } as StandardEntity;

      const result = resolveEntityPlaceholders('@entity.isActive', entity);

      expect(result).toBe('0');
    });

    it('should handle string values', () => {
      const entity = {
        id: 'test',
        entityType: 'buff',
        name: 'Barkskin',
      } as StandardEntity;

      const result = resolveEntityPlaceholders('@entity.name', entity);

      expect(result).toBe('Barkskin');
    });
  });
});

describe('resolveEffectEntityPlaceholders', () => {
  describe('formula resolution', () => {
    it('should resolve placeholders in string formula', () => {
      const entity = { id: 'test', entityType: 'buff', casterLevel: 6 } as StandardEntity;
      const effect: Effect = {
        target: 'ac.naturalArmor',
        formula: 'min(2 + floor(@entity.casterLevel / 3), 5)',
        bonusType: 'ENHANCEMENT',
      };

      const result = resolveEffectEntityPlaceholders(effect, entity);

      expect(result.formula).toBe('min(2 + floor(6 / 3), 5)');
      expect(result.target).toBe('ac.naturalArmor');
      expect(result.bonusType).toBe('ENHANCEMENT');
    });

    it('should resolve placeholders in Formula object', () => {
      const entity = { id: 'test', entityType: 'buff', enhancement: 4 } as StandardEntity;
      const effect: Effect = {
        target: 'ability.strength.score',
        formula: { expression: '@entity.enhancement' },
        bonusType: 'ENHANCEMENT',
      };

      const result = resolveEffectEntityPlaceholders(effect, entity);

      expect(result.formula).toEqual({ expression: '4' });
    });

    it('should resolve placeholders in SwitchFormula', () => {
      const entity = {
        id: 'test',
        entityType: 'buff',
        casterLevel: 6,
        baseBonus: 2,
        maxBonus: 5,
      } as StandardEntity;
      const effect: Effect = {
        target: 'ac.naturalArmor',
        formula: {
          type: 'switch',
          switchExpression: '@entity.casterLevel',
          cases: [
            { caseValue: '@entity.maxBonus', operator: '>=', resultExpression: '@entity.maxBonus' },
            { caseValue: '@entity.baseBonus', operator: '>=', resultExpression: '@entity.baseBonus' },
          ],
          defaultValue: '1',
        },
        bonusType: 'ENHANCEMENT',
      };

      const result = resolveEffectEntityPlaceholders(effect, entity);

      expect(result.formula).toEqual({
        type: 'switch',
        switchExpression: '6',
        cases: [
          { caseValue: '5', operator: '>=', resultExpression: '5' },
          { caseValue: '2', operator: '>=', resultExpression: '2' },
        ],
        defaultValue: '1',
      });
    });
  });

  describe('condition resolution', () => {
    it('should resolve placeholders in simple conditions', () => {
      const entity = {
        id: 'test',
        entityType: 'buff',
        minLevel: 5,
      } as StandardEntity;
      const effect: Effect = {
        target: 'ac.total',
        formula: '2',
        conditions: [
          {
            type: 'simple',
            firstFormula: '@class.fighter.level',
            operator: 'gte',
            secondFormula: '@entity.minLevel',
          },
        ],
      };

      const result = resolveEffectEntityPlaceholders(effect, entity);

      expect(result.conditions).toHaveLength(1);
      expect(result.conditions![0]).toEqual({
        type: 'simple',
        firstFormula: '@class.fighter.level',
        operator: 'gte',
        secondFormula: '5',
      });
    });

    it('should resolve placeholders in both condition formulas', () => {
      const entity = {
        id: 'test',
        entityType: 'buff',
        threshold: 10,
        bonus: 2,
      } as StandardEntity;
      const effect: Effect = {
        target: 'ac.total',
        formula: '2',
        conditions: [
          {
            type: 'simple',
            firstFormula: '@entity.bonus',
            operator: 'gte',
            secondFormula: '@entity.threshold',
          },
        ],
      };

      const result = resolveEffectEntityPlaceholders(effect, entity);

      expect(result.conditions![0]).toEqual({
        type: 'simple',
        firstFormula: '2',
        operator: 'gte',
        secondFormula: '10',
      });
    });

    it('should preserve effects without conditions', () => {
      const entity = { id: 'test', entityType: 'buff', bonus: 2 } as StandardEntity;
      const effect: Effect = {
        target: 'ac.total',
        formula: '@entity.bonus',
      };

      const result = resolveEffectEntityPlaceholders(effect, entity);

      expect(result.conditions).toBeUndefined();
    });

    it('should skip non-simple conditions', () => {
      const entity = { id: 'test', entityType: 'buff' } as StandardEntity;
      const effect: Effect = {
        target: 'ac.total',
        formula: '2',
        conditions: [
          {
            type: 'and',
            conditions: [],
          },
        ],
      };

      const result = resolveEffectEntityPlaceholders(effect, entity);

      // Non-simple conditions are passed through unchanged
      expect(result.conditions![0]).toEqual({
        type: 'and',
        conditions: [],
      });
    });
  });
});
