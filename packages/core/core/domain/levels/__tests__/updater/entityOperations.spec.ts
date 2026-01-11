import { describe, it, expect } from 'bun:test';
import {
  editEntity,
  createCustomEntity,
  deleteEntity,
  getEntity,
  getEntitiesByType,
  getApplicableEntitiesByType,
} from '../../updater/entityOperations';
import type { CharacterBaseData } from '../../../character/baseData/character';
import type { StandardEntity } from '../../../entities/types/base';
import type { EntityInstance } from '../../storage/types';
import { buildCharacter } from '../../../../tests';

function createTestEntity(id: string, entityType: string, name: string): StandardEntity {
  return {
    id,
    entityType,
    name,
  };
}

function createTestInstance(
  instanceId: string,
  entity: StandardEntity,
  applicable: boolean,
  origin: string
): EntityInstance {
  return { instanceId, entity, applicable, origin };
}

// =============================================================================
// editEntity Tests
// =============================================================================

describe('editEntity', () => {
  it('should update entity properties', () => {
    const entity = createTestEntity('power-attack', 'feat', 'Power Attack');
    const instance = createTestInstance('power-attack@custom', entity, true, 'custom');
    
    const character: CharacterBaseData = {
      ...buildCharacter().build(),
      entities: { feat: [instance] },
    };
    
    const result = editEntity(character, 'power-attack@custom', { description: 'Hit harder' });
    
    const updated = result.character.entities!.feat[0];
    expect(updated.entity.name).toBe('Power Attack');
    expect(updated.entity.description).toBe('Hit harder');
  });

  it('should warn if entity not found', () => {
    const character: CharacterBaseData = {
      ...buildCharacter().build(),
      entities: { feat: [] },
    };
    
    const result = editEntity(character, 'nonexistent', { name: 'Test' });
    
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].type).toBe('entity_not_found');
  });

  it('should warn if no entities in character', () => {
    const character = buildCharacter().build();
    
    const result = editEntity(character, 'some-id', { name: 'Test' });
    
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].type).toBe('entity_not_found');
  });

  it('should preserve other entity properties', () => {
    const entity: StandardEntity = {
      id: 'sneak-attack',
      entityType: 'classFeature',
      name: 'Sneak Attack',
      description: 'Deal extra damage',
      tags: ['combat'],
    };
    const instance = createTestInstance('sneak-attack@rogue-1', entity, true, 'classLevel:rogue-1');
    
    const character: CharacterBaseData = {
      ...buildCharacter().build(),
      entities: { classFeature: [instance] },
    };
    
    const result = editEntity(character, 'sneak-attack@rogue-1', { name: 'Sneak Attack +1d6' });
    
    const updated = result.character.entities!.classFeature[0];
    expect(updated.entity.name).toBe('Sneak Attack +1d6');
    expect(updated.entity.description).toBe('Deal extra damage');
    expect(updated.entity.tags).toEqual(['combat']);
  });
});

// =============================================================================
// createCustomEntity Tests
// =============================================================================

describe('createCustomEntity', () => {
  it('should create entity with custom origin', () => {
    const character = buildCharacter().build();
    const entity = createTestEntity('homebrew-feat', 'feat', 'Homebrew Feat');
    
    const result = createCustomEntity(character, entity);
    
    expect(result.character.entities).toBeDefined();
    expect(result.character.entities!.feat).toHaveLength(1);
    
    const created = result.character.entities!.feat[0];
    expect(created.instanceId).toBe('homebrew-feat@custom');
    expect(created.origin).toBe('custom');
    expect(created.applicable).toBe(true);
    expect(created.entity.name).toBe('Homebrew Feat');
  });

  it('should add to existing entity type array', () => {
    const existingEntity = createTestEntity('power-attack', 'feat', 'Power Attack');
    const existingInstance = createTestInstance('power-attack@fighter-1', existingEntity, true, 'classLevel:fighter-1');
    
    const character: CharacterBaseData = {
      ...buildCharacter().build(),
      entities: { feat: [existingInstance] },
    };
    
    const newEntity = createTestEntity('custom-feat', 'feat', 'Custom Feat');
    const result = createCustomEntity(character, newEntity);
    
    expect(result.character.entities!.feat).toHaveLength(2);
  });

  it('should warn on duplicate instanceId', () => {
    const existingEntity = createTestEntity('my-feat', 'feat', 'My Feat');
    const existingInstance = createTestInstance('my-feat@custom', existingEntity, true, 'custom');
    
    const character: CharacterBaseData = {
      ...buildCharacter().build(),
      entities: { feat: [existingInstance] },
    };
    
    const newEntity = createTestEntity('my-feat', 'feat', 'My Feat Again');
    const result = createCustomEntity(character, newEntity);
    
    expect(result.warnings).toHaveLength(1);
    // Should not add duplicate
    expect(result.character.entities!.feat).toHaveLength(1);
  });
});

// =============================================================================
// deleteEntity Tests
// =============================================================================

describe('deleteEntity', () => {
  it('should remove entity by instanceId', () => {
    const entity = createTestEntity('power-attack', 'feat', 'Power Attack');
    const instance = createTestInstance('power-attack@custom', entity, true, 'custom');
    
    const character: CharacterBaseData = {
      ...buildCharacter().build(),
      entities: { feat: [instance] },
    };
    
    const result = deleteEntity(character, 'power-attack@custom');
    
    expect(result.character.entities!.feat).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it('should cascade delete child entities', () => {
    const parentEntity = createTestEntity('combat-trick', 'classFeature', 'Combat Trick');
    const parentInstance = createTestInstance(
      'combat-trick@rogue-2-rogue-talent',
      parentEntity,
      true,
      'classLevel:rogue-2'
    );
    
    const childEntity = createTestEntity('power-attack', 'feat', 'Power Attack');
    const childInstance = createTestInstance(
      'power-attack@combat-trick@rogue-2-rogue-talent-combat-feat',
      childEntity,
      true,
      'entityInstance.classFeature:combat-trick@rogue-2-rogue-talent'
    );
    
    const character: CharacterBaseData = {
      ...buildCharacter().build(),
      entities: {
        classFeature: [parentInstance],
        feat: [childInstance],
      },
    };
    
    const result = deleteEntity(character, 'combat-trick@rogue-2-rogue-talent');
    
    expect(result.character.entities!.classFeature).toHaveLength(0);
    expect(result.character.entities!.feat).toHaveLength(0); // Cascaded
  });

  it('should warn if entity not found', () => {
    const character: CharacterBaseData = {
      ...buildCharacter().build(),
      entities: { feat: [] },
    };
    
    const result = deleteEntity(character, 'nonexistent');
    
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].type).toBe('entity_not_found');
  });

  it('should not affect unrelated entities', () => {
    const entity1 = createTestEntity('feat-1', 'feat', 'Feat 1');
    const instance1 = createTestInstance('feat-1@custom', entity1, true, 'custom');
    
    const entity2 = createTestEntity('feat-2', 'feat', 'Feat 2');
    const instance2 = createTestInstance('feat-2@custom', entity2, true, 'custom');
    
    const character: CharacterBaseData = {
      ...buildCharacter().build(),
      entities: { feat: [instance1, instance2] },
    };
    
    const result = deleteEntity(character, 'feat-1@custom');
    
    expect(result.character.entities!.feat).toHaveLength(1);
    expect(result.character.entities!.feat[0].instanceId).toBe('feat-2@custom');
  });
});

// =============================================================================
// getEntity Tests
// =============================================================================

describe('getEntity', () => {
  it('should find entity by instanceId', () => {
    const entity = createTestEntity('power-attack', 'feat', 'Power Attack');
    const instance = createTestInstance('power-attack@custom', entity, true, 'custom');
    
    const character: CharacterBaseData = {
      ...buildCharacter().build(),
      entities: { feat: [instance] },
    };
    
    const found = getEntity(character, 'power-attack@custom');
    
    expect(found).toBeDefined();
    expect(found!.entity.name).toBe('Power Attack');
  });

  it('should return undefined if not found', () => {
    const character = buildCharacter().build();
    
    const found = getEntity(character, 'nonexistent');
    
    expect(found).toBeUndefined();
  });

  it('should search across entity types', () => {
    const feat = createTestEntity('power-attack', 'feat', 'Power Attack');
    const featInstance = createTestInstance('power-attack@custom', feat, true, 'custom');
    
    const feature = createTestEntity('sneak-attack', 'classFeature', 'Sneak Attack');
    const featureInstance = createTestInstance('sneak-attack@rogue-1', feature, true, 'classLevel:rogue-1');
    
    const character: CharacterBaseData = {
      ...buildCharacter().build(),
      entities: {
        feat: [featInstance],
        classFeature: [featureInstance],
      },
    };
    
    expect(getEntity(character, 'power-attack@custom')).toBeDefined();
    expect(getEntity(character, 'sneak-attack@rogue-1')).toBeDefined();
  });
});

// =============================================================================
// getEntitiesByType Tests
// =============================================================================

describe('getEntitiesByType', () => {
  it('should return entities of specified type', () => {
    const feat1 = createTestEntity('feat-1', 'feat', 'Feat 1');
    const feat2 = createTestEntity('feat-2', 'feat', 'Feat 2');
    
    const character: CharacterBaseData = {
      ...buildCharacter().build(),
      entities: {
        feat: [
          createTestInstance('feat-1@custom', feat1, true, 'custom'),
          createTestInstance('feat-2@custom', feat2, true, 'custom'),
        ],
      },
    };
    
    const feats = getEntitiesByType(character, 'feat');
    
    expect(feats).toHaveLength(2);
  });

  it('should return empty array for unknown type', () => {
    const character = buildCharacter().build();
    
    const result = getEntitiesByType(character, 'spell');
    
    expect(result).toEqual([]);
  });
});

// =============================================================================
// getApplicableEntitiesByType Tests
// =============================================================================

describe('getApplicableEntitiesByType', () => {
  it('should return only applicable entities', () => {
    const feat1 = createTestEntity('feat-1', 'feat', 'Feat 1');
    const feat2 = createTestEntity('feat-2', 'feat', 'Feat 2');
    const feat3 = createTestEntity('feat-3', 'feat', 'Feat 3');
    
    const character: CharacterBaseData = {
      ...buildCharacter().build(),
      entities: {
        feat: [
          createTestInstance('feat-1@custom', feat1, true, 'custom'),
          createTestInstance('feat-2@fighter-1', feat2, false, 'classLevel:fighter-1'),
          createTestInstance('feat-3@custom', feat3, true, 'custom'),
        ],
      },
    };
    
    const applicable = getApplicableEntitiesByType(character, 'feat');
    
    expect(applicable).toHaveLength(2);
    expect(applicable.map(e => e.entity.id)).toEqual(['feat-1', 'feat-3']);
  });
});

