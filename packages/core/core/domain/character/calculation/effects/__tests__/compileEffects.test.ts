import { describe, it, expect } from 'bun:test';
import { compileCharacterEffects, getEffectsByTarget, getEffectsByPrefix } from '../compileEffects';
import type { CharacterBaseData } from '../../../baseData/character';
import type { ComputedEntity, StandardEntity } from '../../../../entities/types/base';
import type { Effect } from '../../../baseData/effects';
import type { Buff } from '../../../baseData/buffs';

// =============================================================================
// Test Helpers
// =============================================================================

function createMockCharacterBaseData(
  buffs: Buff[] = [],
  sharedBuffs: Buff[] = []
): CharacterBaseData {
  return {
    name: 'Test Character',
    temporaryHp: 0,
    currentDamage: 0,
    currentTemporalHp: 0,
    baseAbilityData: {
      strength: { baseScore: 10 },
      dexterity: { baseScore: 10 },
      constitution: { baseScore: 10 },
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
    buffs,
    sharedBuffs,
    updatedAt: new Date().toISOString(),
  };
}

function createMockComputedEntity(
  id: string,
  entityType: string,
  effects: Effect[] = [],
  overrides: Partial<ComputedEntity> = {}
): ComputedEntity {
  const entity: ComputedEntity = {
    id,
    entityType,
    name: `Entity ${id}`,
    effects,
    _meta: {
      source: {
        originType: entityType as any,
        originId: id,
        name: `Entity ${id}`,
      },
      suppressed: false,
    },
    ...overrides,
  };
  return entity;
}

function createMockBuff(
  uniqueId: string,
  name: string,
  effects: Effect[] = [],
  active: boolean = true
): Buff {
  return {
    uniqueId,
    name,
    description: `Description for ${name}`,
    originType: 'spell',
    originName: name,
    originUniqueId: `spell-${uniqueId}`,
    active,
    effects,
  };
}

// =============================================================================
// Tests: Compile Effects from Buffs Only
// =============================================================================

describe('compileCharacterEffects - Buffs', () => {
  it('should compile effects from active buffs', () => {
    const buffs = [
      createMockBuff('buff-1', 'Bull\'s Strength', [
        {
          target: 'ability.strength.score',
          formula: '4',
          bonusType: 'ENHANCEMENT',
        },
      ]),
    ];

    const baseData = createMockCharacterBaseData(buffs);
    const compiled = compileCharacterEffects(baseData);

    expect(compiled.all.length).toBe(1);
    expect(compiled.all[0].target).toBe('ability.strength.score');
    expect(compiled.all[0].sourceRef).toBe('spell:buff-1');
    expect(compiled.all[0].sourceName).toBe('Bull\'s Strength');
  });

  it('should not compile effects from inactive buffs', () => {
    const buffs = [
      createMockBuff('buff-1', 'Inactive Buff', [
        {
          target: 'ability.strength.score',
          formula: '4',
          bonusType: 'ENHANCEMENT',
        },
      ], false), // inactive
    ];

    const baseData = createMockCharacterBaseData(buffs);
    const compiled = compileCharacterEffects(baseData);

    expect(compiled.all.length).toBe(0);
  });

  it('should compile effects from multiple buffs', () => {
    const buffs = [
      createMockBuff('buff-1', 'Bull\'s Strength', [
        { target: 'ability.strength.score', formula: '4', bonusType: 'ENHANCEMENT' },
      ]),
      createMockBuff('buff-2', 'Cat\'s Grace', [
        { target: 'ability.dexterity.score', formula: '4', bonusType: 'ENHANCEMENT' },
      ]),
    ];

    const baseData = createMockCharacterBaseData(buffs);
    const compiled = compileCharacterEffects(baseData);

    expect(compiled.all.length).toBe(2);
    expect(compiled.all[0].target).toBe('ability.strength.score');
    expect(compiled.all[1].target).toBe('ability.dexterity.score');
  });

  it('should compile effects from shared buffs', () => {
    const sharedBuffs = [
      createMockBuff('shared-1', 'Bless', [
        { target: 'bab.total', formula: '1', bonusType: 'MORALE' },
      ]),
    ];

    const baseData = createMockCharacterBaseData([], sharedBuffs);
    const compiled = compileCharacterEffects(baseData);

    expect(compiled.all.length).toBe(1);
    expect(compiled.all[0].target).toBe('bab.total');
  });
});

// =============================================================================
// Tests: Compile Effects from Entities
// =============================================================================

describe('compileCharacterEffects - Entities', () => {
  it('should compile effects from computed entities', () => {
    const entities: ComputedEntity[] = [
      createMockComputedEntity('power-attack', 'feat', [
        { target: 'bab.total', formula: '2', bonusType: 'UNTYPED' },
      ]),
    ];

    const baseData = createMockCharacterBaseData();
    const compiled = compileCharacterEffects(baseData, entities);

    expect(compiled.all.length).toBe(1);
    expect(compiled.all[0].target).toBe('bab.total');
    expect(compiled.all[0].sourceRef).toBe('feat:power-attack');
    expect(compiled.all[0].sourceName).toBe('Entity power-attack');
  });

  it('should compile effects from multiple entities', () => {
    const entities: ComputedEntity[] = [
      createMockComputedEntity('improved-initiative', 'feat', [
        { target: 'initiative.total', formula: '4', bonusType: 'UNTYPED' },
      ]),
      createMockComputedEntity('toughness', 'feat', [
        { target: 'hp.max', formula: '3', bonusType: 'UNTYPED' },
      ]),
    ];

    const baseData = createMockCharacterBaseData();
    const compiled = compileCharacterEffects(baseData, entities);

    expect(compiled.all.length).toBe(2);
    expect(compiled.all[0].sourceRef).toBe('feat:improved-initiative');
    expect(compiled.all[1].sourceRef).toBe('feat:toughness');
  });

  it('should use entityType directly in sourceRef', () => {
    const entities: ComputedEntity[] = [
      createMockComputedEntity('fireball', 'spell', [
        { target: 'customVariable.damage', formula: '8d6', bonusType: 'UNTYPED' },
      ]),
    ];

    const baseData = createMockCharacterBaseData();
    const compiled = compileCharacterEffects(baseData, entities);

    expect(compiled.all[0].sourceRef).toBe('spell:fireball');
  });

  it('should skip suppressed entities', () => {
    const entities: ComputedEntity[] = [
      createMockComputedEntity('entity-1', 'feat', [
        { target: 'bab.total', formula: '2', bonusType: 'UNTYPED' },
      ], { _meta: { source: { originType: 'feat', originId: 'entity-1', name: 'Entity 1' }, suppressed: true } }),
    ];

    const baseData = createMockCharacterBaseData();
    const compiled = compileCharacterEffects(baseData, entities);

    expect(compiled.all.length).toBe(0);
  });

  it('should handle entities without effects', () => {
    const entities: ComputedEntity[] = [
      createMockComputedEntity('entity-1', 'feat', []),
    ];

    const baseData = createMockCharacterBaseData();
    const compiled = compileCharacterEffects(baseData, entities);

    expect(compiled.all.length).toBe(0);
  });

  it('should handle entities with multiple effects', () => {
    const entities: ComputedEntity[] = [
      createMockComputedEntity('enlarge-person', 'spell', [
        { target: 'size.total', formula: '1', bonusType: 'UNTYPED' },
        { target: 'ability.strength.score', formula: '2', bonusType: 'UNTYPED' },
        { target: 'ability.dexterity.score', formula: '-2', bonusType: 'UNTYPED' },
      ]),
    ];

    const baseData = createMockCharacterBaseData();
    const compiled = compileCharacterEffects(baseData, entities);

    expect(compiled.all.length).toBe(3);
    expect(compiled.all.every(e => e.sourceRef === 'spell:enlarge-person')).toBe(true);
  });

  it('should use entity name for sourceName', () => {
    const entities: ComputedEntity[] = [
      createMockComputedEntity('power-attack', 'feat', [
        { target: 'bab.total', formula: '2', bonusType: 'UNTYPED' },
      ], { name: 'Power Attack' }),
    ];

    const baseData = createMockCharacterBaseData();
    const compiled = compileCharacterEffects(baseData, entities);

    expect(compiled.all[0].sourceName).toBe('Power Attack');
  });

  it('should fallback to entity id if name is missing', () => {
    const entities: ComputedEntity[] = [
      createMockComputedEntity('entity-1', 'feat', [
        { target: 'bab.total', formula: '2', bonusType: 'UNTYPED' },
      ], { name: undefined }),
    ];

    const baseData = createMockCharacterBaseData();
    const compiled = compileCharacterEffects(baseData, entities);

    expect(compiled.all[0].sourceName).toBe('entity-1');
  });
});

// =============================================================================
// Tests: Compile Effects from Both Buffs and Entities
// =============================================================================

describe('compileCharacterEffects - Mixed Sources', () => {
  it('should compile effects from both buffs and entities', () => {
    const buffs = [
      createMockBuff('buff-1', 'Bull\'s Strength', [
        { target: 'ability.strength.score', formula: '4', bonusType: 'ENHANCEMENT' },
      ]),
    ];

    const entities: ComputedEntity[] = [
      createMockComputedEntity('power-attack', 'feat', [
        { target: 'bab.total', formula: '2', bonusType: 'UNTYPED' },
      ]),
    ];

    const baseData = createMockCharacterBaseData(buffs);
    const compiled = compileCharacterEffects(baseData, entities);

    expect(compiled.all.length).toBe(2);
    expect(compiled.all[0].sourceRef).toBe('spell:buff-1');
    expect(compiled.all[1].sourceRef).toBe('feat:power-attack');
  });

  it('should handle empty entities array', () => {
    const buffs = [
      createMockBuff('buff-1', 'Bull\'s Strength', [
        { target: 'ability.strength.score', formula: '4', bonusType: 'ENHANCEMENT' },
      ]),
    ];

    const baseData = createMockCharacterBaseData(buffs);
    const compiled = compileCharacterEffects(baseData, []);

    expect(compiled.all.length).toBe(1);
  });

  it('should handle undefined entities', () => {
    const buffs = [
      createMockBuff('buff-1', 'Bull\'s Strength', [
        { target: 'ability.strength.score', formula: '4', bonusType: 'ENHANCEMENT' },
      ]),
    ];

    const baseData = createMockCharacterBaseData(buffs);
    const compiled = compileCharacterEffects(baseData);

    expect(compiled.all.length).toBe(1);
  });
});

// =============================================================================
// Tests: Query Functions - getEffectsByTarget
// =============================================================================

describe('getEffectsByTarget', () => {
  it('should return effects matching exact target', () => {
    const entities: ComputedEntity[] = [
      createMockComputedEntity('entity-1', 'feat', [
        { target: 'ability.strength.score', formula: '2', bonusType: 'UNTYPED' },
        { target: 'ability.dexterity.score', formula: '2', bonusType: 'UNTYPED' },
      ]),
    ];

    const baseData = createMockCharacterBaseData();
    const compiled = compileCharacterEffects(baseData, entities);

    const strengthEffects = getEffectsByTarget(compiled, 'ability.strength.score');
    expect(strengthEffects.length).toBe(1);
    expect(strengthEffects[0].target).toBe('ability.strength.score');
  });

  it('should return empty array for non-matching target', () => {
    const entities: ComputedEntity[] = [
      createMockComputedEntity('entity-1', 'feat', [
        { target: 'ability.strength.score', formula: '2', bonusType: 'UNTYPED' },
      ]),
    ];

    const baseData = createMockCharacterBaseData();
    const compiled = compileCharacterEffects(baseData, entities);

    const results = getEffectsByTarget(compiled, 'ability.dexterity.score');
    expect(results.length).toBe(0);
  });

  it('should return multiple effects with same target', () => {
    const entities: ComputedEntity[] = [
      createMockComputedEntity('entity-1', 'feat', [
        { target: 'bab.total', formula: '2', bonusType: 'UNTYPED' },
      ]),
      createMockComputedEntity('entity-2', 'feat', [
        { target: 'bab.total', formula: '1', bonusType: 'MORALE' },
      ]),
    ];

    const baseData = createMockCharacterBaseData();
    const compiled = compileCharacterEffects(baseData, entities);

    const results = getEffectsByTarget(compiled, 'bab.total');
    expect(results.length).toBe(2);
  });
});

// =============================================================================
// Tests: Query Functions - getEffectsByPrefix
// =============================================================================

describe('getEffectsByPrefix', () => {
  it('should return all effects matching prefix', () => {
    const entities: ComputedEntity[] = [
      createMockComputedEntity('entity-1', 'feat', [
        { target: 'ability.strength.score', formula: '2', bonusType: 'UNTYPED' },
        { target: 'ability.dexterity.score', formula: '2', bonusType: 'UNTYPED' },
        { target: 'bab.total', formula: '1', bonusType: 'UNTYPED' },
      ]),
    ];

    const baseData = createMockCharacterBaseData();
    const compiled = compileCharacterEffects(baseData, entities);

    const abilityEffects = getEffectsByPrefix(compiled, 'ability');
    expect(abilityEffects.length).toBe(2);
  });

  it('should return empty array for non-matching prefix', () => {
    const entities: ComputedEntity[] = [
      createMockComputedEntity('entity-1', 'feat', [
        { target: 'ability.strength.score', formula: '2', bonusType: 'UNTYPED' },
      ]),
    ];

    const baseData = createMockCharacterBaseData();
    const compiled = compileCharacterEffects(baseData, entities);

    const results = getEffectsByPrefix(compiled, 'skills');
    expect(results.length).toBe(0);
  });
});

// =============================================================================
// Tests: Edge Cases
// =============================================================================

describe('compileCharacterEffects - Edge Cases', () => {
  it('should handle character with no buffs or entities', () => {
    const baseData = createMockCharacterBaseData();
    const compiled = compileCharacterEffects(baseData);

    expect(compiled.all.length).toBe(0);
    expect(compiled.byPrefix.size).toBe(0);
  });

  it('should organize effects by prefix correctly', () => {
    const entities: ComputedEntity[] = [
      createMockComputedEntity('entity-1', 'feat', [
        { target: 'ability.strength.score', formula: '2', bonusType: 'UNTYPED' },
        { target: 'ability.dexterity.score', formula: '2', bonusType: 'UNTYPED' },
        { target: 'bab.total', formula: '1', bonusType: 'UNTYPED' },
        { target: 'skills.acrobatics.total', formula: '3', bonusType: 'UNTYPED' },
      ]),
    ];

    const baseData = createMockCharacterBaseData();
    const compiled = compileCharacterEffects(baseData, entities);

    expect(compiled.byPrefix.size).toBe(3); // ability, bab, skills
    expect(compiled.byPrefix.get('ability')?.length).toBe(2);
    expect(compiled.byPrefix.get('bab')?.length).toBe(1);
    expect(compiled.byPrefix.get('skills')?.length).toBe(1);
  });

  it('should handle effects without bonusType', () => {
    const entities: ComputedEntity[] = [
      createMockComputedEntity('entity-1', 'feat', [
        { target: 'bab.total', formula: '2' }, // No bonusType
      ]),
    ];

    const baseData = createMockCharacterBaseData();
    const compiled = compileCharacterEffects(baseData, entities);

    expect(compiled.all.length).toBe(1);
    expect(compiled.all[0].bonusType).toBeUndefined();
  });
});

