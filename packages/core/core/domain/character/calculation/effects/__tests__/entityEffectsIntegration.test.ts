import { describe, it, expect } from 'bun:test';
import { calculateCharacterSheet } from '../../calculateCharacterSheet';
import type { CharacterBaseData } from '../../../baseData/character';
import type { StandardEntity } from '../../../../entities/types/base';
import type { CalculationContext, Compendium, CompendiumRegistry } from '../../../../compendiums/types';
import { resolveCompendiumContext } from '../../../../compendiums/resolve';

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
      strength: { baseScore: 10 },
      dexterity: { baseScore: 14 },
      constitution: { baseScore: 12 },
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
// Integration Tests: Entity Effects in Character Sheet Calculation
// =============================================================================

describe('Entity Effects Integration - calculateCharacterSheet', () => {
  it('should apply entity effects to ability scores', () => {
    const entity: StandardEntity = {
      id: 'stat-boost',
      entityType: 'feat',
      name: 'Stat Boost',
      effects: [
        {
          target: 'ability.strength.score',
          formula: '2',
          bonusType: 'UNTYPED',
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

    // Base STR is 10, with +2 from entity effect = 12
    expect(sheet.abilityScores.strength.totalScore).toBe(12);
  });

  it('should apply entity effects to initiative', () => {
    const entity: StandardEntity = {
      id: 'improved-initiative',
      entityType: 'feat',
      name: 'Improved Initiative',
      effects: [
        {
          target: 'initiative.total',
          formula: '4',
          bonusType: 'UNTYPED',
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

    // Base DEX is 14 (+2 mod) + 4 from feat = +6 initiative
    expect(sheet.initiative.totalValue).toBe(6);
    expect(sheet.initiative.sourceValues.some(
      sv => sv.sourceName === 'Improved Initiative' && sv.value === 4
    )).toBe(true);
  });

  it('should apply entity effects to BAB', () => {
    const entity: StandardEntity = {
      id: 'divine-favor',
      entityType: 'spell',
      name: 'Divine Favor',
      effects: [
        {
          target: 'bab.total',
          formula: '2',
          bonusType: 'UNTYPED',
        },
      ],
    };

    const baseData = createMinimalCharacterBaseData({
      customEntities: {
        spell: [entity],
      },
    });
    const context = createCalculationContext();

    const sheet = calculateCharacterSheet(baseData, context);

    // Base BAB is 0, +2 from spell = 2
    expect(sheet.baseAttackBonus.totalValue).toBe(2);
    expect(sheet.baseAttackBonus.sourceValues.some(
      sv => sv.sourceName === 'Divine Favor'
    )).toBe(true);
  });

  it('should apply entity effects to saving throws', () => {
    const entity: StandardEntity = {
      id: 'great-fortitude',
      entityType: 'feat',
      name: 'Great Fortitude',
      effects: [
        {
          target: 'savingThrow.fortitude.total',
          formula: '2',
          bonusType: 'UNTYPED',
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

    // Base Fort save with CON +1 + feat +2 = +3
    expect(sheet.savingThrows.fortitude.totalValue).toBe(3);
    expect(sheet.savingThrows.fortitude.sourceValues.some(
      sv => sv.sourceName === 'Great Fortitude'
    )).toBe(true);
  });

  it('should apply multiple entity effects from different entities', () => {
    const initEntity: StandardEntity = {
      id: 'improved-initiative',
      entityType: 'feat',
      name: 'Improved Initiative',
      effects: [
        {
          target: 'initiative.total',
          formula: '4',
          bonusType: 'UNTYPED',
        },
      ],
    };

    const strEntity: StandardEntity = {
      id: 'bulls-strength',
      entityType: 'spell',
      name: "Bull's Strength",
      effects: [
        {
          target: 'ability.strength.score',
          formula: '4',
          bonusType: 'ENHANCEMENT',
        },
      ],
    };

    const baseData = createMinimalCharacterBaseData({
      customEntities: {
        feat: [initEntity],
        spell: [strEntity],
      },
    });
    const context = createCalculationContext();

    const sheet = calculateCharacterSheet(baseData, context);

    // Check initiative: DEX mod (+2) + feat (+4) = +6
    expect(sheet.initiative.totalValue).toBe(6);

    // Check strength: Base 10 + spell (+4) = 14
    expect(sheet.abilityScores.strength.totalScore).toBe(14);
  });

  it('should apply multiple effects from a single entity', () => {
    const entity: StandardEntity = {
      id: 'enlarge-person',
      entityType: 'spell',
      name: 'Enlarge Person',
      effects: [
        {
          target: 'ability.strength.score',
          formula: '2',
          bonusType: 'UNTYPED',
        },
        {
          target: 'ability.dexterity.score',
          formula: '-2',
          bonusType: 'UNTYPED',
        },
      ],
    };

    const baseData = createMinimalCharacterBaseData({
      customEntities: {
        spell: [entity],
      },
    });
    const context = createCalculationContext();

    const sheet = calculateCharacterSheet(baseData, context);

    // Strength: 10 + 2 = 12
    expect(sheet.abilityScores.strength.totalScore).toBe(12);

    // Dexterity: 14 - 2 = 12
    expect(sheet.abilityScores.dexterity.totalScore).toBe(12);
  });

  it('should respect bonus type stacking rules with entity effects', () => {
    const strongEntity: StandardEntity = {
      id: 'bulls-strength',
      entityType: 'spell',
      name: "Bull's Strength",
      effects: [
        {
          target: 'ability.strength.score',
          formula: '4',
          bonusType: 'ENHANCEMENT',
        },
      ],
    };

    const weakEntity: StandardEntity = {
      id: 'bulls-strength-weaker',
      entityType: 'spell',
      name: "Bull's Strength (Weaker)",
      effects: [
        {
          target: 'ability.strength.score',
          formula: '2',
          bonusType: 'ENHANCEMENT',
        },
      ],
    };

    const baseData = createMinimalCharacterBaseData({
      customEntities: {
        spell: [strongEntity, weakEntity],
      },
    });
    const context = createCalculationContext();

    const sheet = calculateCharacterSheet(baseData, context);

    // Only the higher ENHANCEMENT bonus should apply: 10 + 4 = 14
    expect(sheet.abilityScores.strength.totalScore).toBe(14);
  });

  it('should track entity in computedEntities', () => {
    const entity: StandardEntity = {
      id: 'power-attack',
      entityType: 'feat',
      name: 'Power Attack',
      effects: [
        {
          target: 'bab.total',
          formula: '2',
          bonusType: 'UNTYPED',
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

    expect(sheet.computedEntities).toBeDefined();
    expect(sheet.computedEntities.length).toBe(1);
    expect(sheet.computedEntities[0].id).toBe('power-attack');
    expect(sheet.computedEntities[0].effects).toBeDefined();
    expect(sheet.computedEntities[0].effects?.length).toBe(1);
  });

  it('should not apply effects from suppressed entities', () => {
    const entity: StandardEntity = {
      id: 'suppressed-feat',
      entityType: 'feat',
      name: 'Suppressed Feat',
      effects: [
        {
          target: 'bab.total',
          formula: '2',
          bonusType: 'UNTYPED',
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

    // Entity should be in computedEntities
    expect(sheet.computedEntities.length).toBe(1);
    expect(sheet.computedEntities[0]._meta.suppressed).toBe(false);
    // BAB should be affected since not suppressed
    expect(sheet.baseAttackBonus.totalValue).toBe(2);
  });

  it('should apply entity effects to max HP', () => {
    const entity: StandardEntity = {
      id: 'toughness',
      entityType: 'feat',
      name: 'Toughness',
      effects: [
        {
          target: 'hp.max',
          formula: '3',
          bonusType: 'UNTYPED',
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

    // Base HP calculation: rolledHitDice + (hitDice * CON mod)
    // With minimal character: 0 rolled + (1 * 1) = 1 base HP
    // With Toughness: 1 + 3 = 4 max HP
    expect(sheet.hitPoints.maxHp).toBe(4);
  });
});
