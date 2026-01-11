import { describe, it, expect } from 'bun:test';
import { calculateCharacterSheet } from '../../calculateCharacterSheet';
import type { CharacterBaseData } from '../../../baseData/character';
import type { StandardEntity } from '../../../../entities/types/base';
import type { CalculationContext } from '../../../../compendiums/types';
import { resolveCompendiumContext } from '../../../../compendiums/resolve';
import type { Compendium, CompendiumRegistry } from '../../../../compendiums/types';
import { ChangeTypes } from '../../../baseData/changes';

// =============================================================================
// Test Helpers
// =============================================================================

function createMinimalCharacterBaseData(
  overrides: Partial<CharacterBaseData> = {}
): CharacterBaseData {
  return {
    name: 'Test Character',
    temporaryHp: 0,
    currentDamage: 0,
    currentTemporalHp: 0,
    baseAbilityData: {
      strength: { baseScore: 14 },
      dexterity: { baseScore: 12 },
      constitution: { baseScore: 14 },
      intelligence: { baseScore: 10 },
      wisdom: { baseScore: 10 },
      charisma: { baseScore: 10 },
    },
    skills: {},
    skillData: {},
    classes: [],
    level: { level: 1, xp: 0, levelsData: [] },
    equipment: { items: [], weapons: [] },
    feats: [],
    buffs: [],
    sharedBuffs: [],
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function createMockCompendium(id: string, overrides: Partial<Compendium> = {}): Compendium {
  return {
    id,
    name: `${id} Compendium`,
    version: '1.0.0',
    dependencies: [],
    schemas: [],
    entities: {},
    ...overrides,
  };
}

function createCalculationContext(
  availableTypes: string[] = ['feat', 'spell', 'item']
): CalculationContext {
  const coreCompendium = createMockCompendium('core', {
    schemas: availableTypes.map(typeName => ({
      typeName,
      version: '1.0.0',
      fields: [],
    })),
  });

  const registry: CompendiumRegistry = {
    available: [{ id: 'core', name: 'Core' }],
    active: ['core'],
  };

  const compendiumContext = resolveCompendiumContext(registry, (id) => {
    if (id === 'core') return coreCompendium;
    return undefined;
  });

  return { compendiumContext };
}

// =============================================================================
// Integration Tests
// =============================================================================

describe('calculateCharacterSheet integration with custom entities', () => {
  describe('basic integration', () => {
    it('should calculate sheet without custom entities', () => {
      const baseData = createMinimalCharacterBaseData();
      
      const sheet = calculateCharacterSheet(baseData);
      
      expect(sheet.name).toBe('Test Character');
      expect(sheet.computedEntities).toHaveLength(0);
      expect(sheet.warnings).toHaveLength(0);
    });

    it('should calculate sheet with custom entities and context', () => {
      const entity: StandardEntity = {
        id: 'custom-feat',
        entityType: 'feat',
        name: 'Custom Feat',
      };
      
      const baseData = createMinimalCharacterBaseData({
        customEntities: {
          feat: [entity],
        },
      });
      
      const context = createCalculationContext();
      const sheet = calculateCharacterSheet(baseData, context);
      
      expect(sheet.computedEntities).toHaveLength(1);
      expect(sheet.computedEntities[0].id).toBe('custom-feat');
      expect(sheet.computedEntities[0]._meta.source.originType).toBe('feat');
      expect(sheet.warnings).toHaveLength(0);
    });
  });

  describe('custom entities with changes', () => {
    it('should apply initiative bonus from custom entity', () => {
      const entity: StandardEntity = {
        id: 'improved-initiative-custom',
        entityType: 'feat',
        name: 'Improved Initiative (Custom)',
        legacy_changes: [
          {
            type: ChangeTypes.INITIATIVE,
            formula: { expression: '4' },
            bonusTypeId: 'UNTYPED',
          },
        ],
      };
      
      const baseData = createMinimalCharacterBaseData({
        customEntities: {
          feat: [entity],
        },
      });
      
      const context = createCalculationContext();
      const sheet = calculateCharacterSheet(baseData, context);
      
      // Initiative should include +4 from the custom feat
      // Base initiative = DEX modifier (12 -> +1) + 4 from feat = 5
      expect(sheet.initiative.totalValue).toBe(5);
      expect(sheet.computedEntities).toHaveLength(1);
    });

    it('should apply ability score bonus from custom entity', () => {
      const entity: StandardEntity = {
        id: 'strength-boost',
        entityType: 'item',
        name: 'Belt of Strength',
        legacy_changes: [
          {
            type: ChangeTypes.ABILITY_SCORE,
            abilityUniqueId: 'strength',
            formula: { expression: '4' },
            bonusTypeId: 'ENHANCEMENT',
          },
        ],
      };
      
      const baseData = createMinimalCharacterBaseData({
        customEntities: {
          item: [entity],
        },
      });
      
      const context = createCalculationContext();
      const sheet = calculateCharacterSheet(baseData, context);
      
      // Strength should be 14 base + 4 enhancement = 18
      expect(sheet.abilityScores.strength.totalScore).toBe(18);
      expect(sheet.abilityScores.strength.totalModifier).toBe(4);
    });

    it('should apply multiple changes from multiple entities', () => {
      const initFeat: StandardEntity = {
        id: 'init-feat',
        entityType: 'feat',
        name: 'Initiative Feat',
        legacy_changes: [
          {
            type: ChangeTypes.INITIATIVE,
            formula: { expression: '2' },
            bonusTypeId: 'UNTYPED',
          },
        ],
      };
      
      const strItem: StandardEntity = {
        id: 'str-item',
        entityType: 'item',
        name: 'Strength Item',
        legacy_changes: [
          {
            type: ChangeTypes.ABILITY_SCORE,
            abilityUniqueId: 'strength',
            formula: { expression: '2' },
            bonusTypeId: 'ENHANCEMENT',
          },
        ],
      };
      
      const baseData = createMinimalCharacterBaseData({
        customEntities: {
          feat: [initFeat],
          item: [strItem],
        },
      });
      
      const context = createCalculationContext();
      const sheet = calculateCharacterSheet(baseData, context);
      
      expect(sheet.initiative.totalValue).toBe(3); // +1 DEX + 2 from feat
      expect(sheet.abilityScores.strength.totalScore).toBe(16); // 14 + 2
      expect(sheet.computedEntities).toHaveLength(2);
    });
  });

  describe('warnings and validation', () => {
    it('should generate warning for unknown entity type with context', () => {
      const entity: StandardEntity = {
        id: 'unknown-entity',
        entityType: 'unknown-type',
        name: 'Unknown Entity',
      };
      
      const baseData = createMinimalCharacterBaseData({
        customEntities: {
          'unknown-type': [entity],
        },
      });
      
      const context = createCalculationContext(['feat', 'spell']); // unknown-type not included
      const sheet = calculateCharacterSheet(baseData, context);
      
      expect(sheet.computedEntities).toHaveLength(0);
      expect(sheet.warnings.some(w => w.type === 'unknown_entity_type')).toBe(true);
    });

    it('should skip invalid entities from unknown types', () => {
      const validEntity: StandardEntity = {
        id: 'valid-feat',
        entityType: 'feat',
        name: 'Valid Feat',
        legacy_changes: [
          {
            type: ChangeTypes.INITIATIVE,
            formula: { expression: '1' },
            bonusTypeId: 'UNTYPED',
          },
        ],
      };
      
      const invalidEntity: StandardEntity = {
        id: 'invalid-entity',
        entityType: 'invalid-type',
        name: 'Invalid Entity',
        legacy_changes: [
          {
            type: ChangeTypes.INITIATIVE,
            formula: { expression: '100' }, // This should NOT be applied
            bonusTypeId: 'UNTYPED',
          },
        ],
      };
      
      const baseData = createMinimalCharacterBaseData({
        customEntities: {
          feat: [validEntity],
          'invalid-type': [invalidEntity],
        },
      });
      
      const context = createCalculationContext(['feat']); // Only feat is valid
      const sheet = calculateCharacterSheet(baseData, context);
      
      // Only +1 DEX + 1 from valid feat, not +100 from invalid
      expect(sheet.initiative.totalValue).toBe(2);
      expect(sheet.computedEntities).toHaveLength(1);
      // Two warnings: one from validateCustomEntities and one from compileCharacterEntities
      expect(sheet.warnings.length).toBeGreaterThanOrEqual(1);
      expect(sheet.warnings.some(w => w.type === 'unknown_entity_type')).toBe(true);
    });
  });

  describe('backwards compatibility with changes field', () => {
    it('should work with old changes field instead of legacy_changes', () => {
      const entity: StandardEntity = {
        id: 'old-style-feat',
        entityType: 'feat',
        name: 'Old Style Feat',
        changes: [ // Using old field name
          {
            type: ChangeTypes.INITIATIVE,
            formula: { expression: '3' },
            bonusTypeId: 'UNTYPED',
          },
        ],
      };
      
      const baseData = createMinimalCharacterBaseData({
        customEntities: {
          feat: [entity],
        },
      });
      
      const context = createCalculationContext();
      const sheet = calculateCharacterSheet(baseData, context);
      
      expect(sheet.initiative.totalValue).toBe(4); // +1 DEX + 3 from feat
    });
  });

  describe('without context (permissive mode)', () => {
    it('should process entities without context', () => {
      const entity: StandardEntity = {
        id: 'no-context-feat',
        entityType: 'feat',
        name: 'No Context Feat',
        legacy_changes: [
          {
            type: ChangeTypes.INITIATIVE,
            formula: { expression: '2' },
            bonusTypeId: 'UNTYPED',
          },
        ],
      };
      
      const baseData = createMinimalCharacterBaseData({
        customEntities: {
          feat: [entity],
        },
      });
      
      // No context provided
      const sheet = calculateCharacterSheet(baseData);
      
      // Should still process entities
      expect(sheet.computedEntities).toHaveLength(1);
      expect(sheet.initiative.totalValue).toBe(3); // +1 DEX + 2 from feat
    });
  });

  describe('coexistence with legacy systems', () => {
    it('should combine custom entity changes with legacy feat changes', () => {
      const customEntity: StandardEntity = {
        id: 'custom-init',
        entityType: 'feat',
        name: 'Custom Initiative',
        legacy_changes: [
          {
            type: ChangeTypes.INITIATIVE,
            formula: { expression: '2' },
            bonusTypeId: 'UNTYPED',
          },
        ],
      };
      
      const baseData = createMinimalCharacterBaseData({
        customEntities: {
          feat: [customEntity],
        },
        // Legacy feats still work
        feats: [
          {
            uniqueId: 'improved-initiative',
            name: 'Improved Initiative',
            description: 'You get +4 to initiative',
            changes: [
              {
                type: ChangeTypes.INITIATIVE,
                formula: { expression: '4' },
                bonusTypeId: 'UNTYPED',
              },
            ],
          },
        ],
      });
      
      const context = createCalculationContext();
      const sheet = calculateCharacterSheet(baseData, context);
      
      // Should combine: +1 DEX + 2 from custom entity + 4 from legacy feat = 7
      expect(sheet.initiative.totalValue).toBe(7);
      expect(sheet.computedEntities).toHaveLength(1); // Only custom entity in computedEntities
    });
  });
});

