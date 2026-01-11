import { describe, it, expect } from 'bun:test';
import {
  selectEntityInProvider,
  deselectEntityFromProvider,
  getSelectedEntityInstances,
  generateInstanceId,
  generateOrigin,
} from '../../updater/entitySelectionApi';
import type { CharacterBaseData } from '../../../character/baseData/character';
import type { ClassEntity, EntityInstance } from '../../storage/types';
import type { StandardEntity } from '../../../entities/types/base';
import type { ProviderLocation } from '../../updater/types';
import { buildCharacter } from '../../../../tests';

// =============================================================================
// Test Helpers
// =============================================================================

function createFighterClass(): ClassEntity {
  return {
    id: 'fighter',
    entityType: 'class',
    name: 'Fighter',
    description: 'A warrior class',
    hitDie: 10,
    babProgression: 'full',
    saves: {
      fortitude: 'good',
      reflex: 'poor',
      will: 'poor',
    },
    skillPointsPerLevel: '2',
    classSkillIds: ['climb', 'jump'],
    classType: 'base',
    levels: {
      '1': {
        providers: [
          {
            selector: {
              id: 'bonus-feat',
              name: 'Bonus Feat',
              entityType: 'feat',
              min: 1,
              max: 1,
            },
            selectedInstanceIds: [],
          },
        ],
      },
      '2': {
        providers: [
          {
            selector: {
              id: 'bonus-feat-2',
              name: 'Bonus Feat 2',
              entityType: 'feat',
              min: 1,
              max: 2,
            },
            selectedInstanceIds: [],
          },
        ],
      },
    },
  };
}

function createPowerAttackFeat(): StandardEntity {
  return {
    id: 'power-attack',
    entityType: 'feat',
    name: 'Power Attack',
    description: 'Trade accuracy for damage',
    tags: ['combat'],
  };
}

function createCleaveHeat(): StandardEntity {
  return {
    id: 'cleave',
    entityType: 'feat',
    name: 'Cleave',
    description: 'Extra attack after dropping foe',
    tags: ['combat'],
  };
}

function createCombatTrickFeature(): EntityInstance {
  return {
    instanceId: 'combat-trick@rogue-2-rogue-talent',
    entity: {
      id: 'combat-trick',
      entityType: 'classFeature',
      name: 'Combat Trick',
      description: 'Gain a bonus combat feat',
      providers: [
        {
          selector: {
            id: 'combat-feat',
            name: 'Combat Feat',
            entityType: 'feat',
            min: 1,
            max: 1,
          },
          selectedInstanceIds: [],
        },
      ],
    },
    applicable: true,
    origin: 'classLevel:rogue-2',
  };
}

// =============================================================================
// generateInstanceId Tests
// =============================================================================

describe('generateInstanceId', () => {
  it('should generate instanceId for classLevel location', () => {
    const location: ProviderLocation = {
      type: 'classLevel',
      classId: 'fighter',
      classLevel: 1,
      providerIndex: 0,
    };

    const result = generateInstanceId('power-attack', location, 'bonus-feat');

    expect(result).toBe('power-attack@fighter-1-bonus-feat');
  });

  it('should generate instanceId for systemLevel location', () => {
    const location: ProviderLocation = {
      type: 'systemLevel',
      characterLevel: 4,
      providerIndex: 0,
    };

    const result = generateInstanceId('toughness', location, 'feat-selector');

    expect(result).toBe('toughness@level-4-feat-selector');
  });

  it('should generate instanceId for entity location (chaining parent instanceId)', () => {
    const location: ProviderLocation = {
      type: 'entity',
      parentInstanceId: 'combat-trick@rogue-2-rogue-talent',
      providerIndex: 0,
    };

    const result = generateInstanceId('power-attack', location, 'combat-feat');

    expect(result).toBe('power-attack@combat-trick@rogue-2-rogue-talent-combat-feat');
  });
});

// =============================================================================
// generateOrigin Tests
// =============================================================================

describe('generateOrigin', () => {
  it('should generate origin for classLevel location', () => {
    const location: ProviderLocation = {
      type: 'classLevel',
      classId: 'fighter',
      classLevel: 2,
      providerIndex: 0,
    };

    const result = generateOrigin(location, 'feat');

    expect(result).toBe('classLevel:fighter-2');
  });

  it('should generate origin for systemLevel location', () => {
    const location: ProviderLocation = {
      type: 'systemLevel',
      characterLevel: 4,
      providerIndex: 0,
    };

    const result = generateOrigin(location, 'feat');

    expect(result).toBe('characterLevel:4');
  });

  it('should generate origin for entity location', () => {
    const location: ProviderLocation = {
      type: 'entity',
      parentInstanceId: 'combat-trick@rogue-2-rogue-talent',
      providerIndex: 0,
    };

    const result = generateOrigin(location, 'classFeature');

    expect(result).toBe('entityInstance.classFeature:combat-trick@rogue-2-rogue-talent');
  });
});

// =============================================================================
// selectEntityInProvider Tests
// =============================================================================

describe('selectEntityInProvider', () => {
  describe('classLevel selection', () => {
    it('should add entity to character pool and update provider selection', () => {
      const fighter = createFighterClass();
      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        classEntities: { fighter },
      };
      const powerAttack = createPowerAttackFeat();

      const result = selectEntityInProvider(
        character,
        {
          type: 'classLevel',
          classId: 'fighter',
          classLevel: 1,
          providerIndex: 0,
        },
        powerAttack,
        'bonus-feat'
      );

      expect(result.errors).toHaveLength(0);
      expect(result.instanceId).toBe('power-attack@fighter-1-bonus-feat');

      // Check entity was added to pool
      const featInstances = result.character.entities?.feat || [];
      expect(featInstances).toHaveLength(1);
      expect(featInstances[0].instanceId).toBe('power-attack@fighter-1-bonus-feat');
      expect(featInstances[0].entity.id).toBe('power-attack');
      expect(featInstances[0].applicable).toBe(false);
      expect(featInstances[0].origin).toBe('classLevel:fighter-1');

      // Check provider was updated
      const provider = result.character.classEntities?.fighter.levels['1'].providers?.[0];
      expect(provider?.selectedInstanceIds).toContain('power-attack@fighter-1-bonus-feat');
    });

    it('should append to existing selections when max allows multiple', () => {
      const fighter = createFighterClass();
      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        classEntities: { fighter },
      };
      const powerAttack = createPowerAttackFeat();
      const cleave = createCleaveHeat();

      // First selection
      const result1 = selectEntityInProvider(
        character,
        {
          type: 'classLevel',
          classId: 'fighter',
          classLevel: 2,
          providerIndex: 0,
        },
        powerAttack,
        'bonus-feat-2'
      );

      // Second selection
      const result2 = selectEntityInProvider(
        result1.character,
        {
          type: 'classLevel',
          classId: 'fighter',
          classLevel: 2,
          providerIndex: 0,
        },
        cleave,
        'bonus-feat-2'
      );

      expect(result2.errors).toHaveLength(0);
      const featInstances = result2.character.entities?.feat || [];
      expect(featInstances).toHaveLength(2);

      const provider = result2.character.classEntities?.fighter.levels['2'].providers?.[0];
      expect(provider?.selectedInstanceIds).toHaveLength(2);
    });

    it('should return error when max selections reached', () => {
      const fighter = createFighterClass();
      fighter.levels['1'].providers![0].selectedInstanceIds = ['existing-feat@fighter-1-bonus-feat'];
      
      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        classEntities: { fighter },
      };
      const powerAttack = createPowerAttackFeat();

      const result = selectEntityInProvider(
        character,
        {
          type: 'classLevel',
          classId: 'fighter',
          classLevel: 1,
          providerIndex: 0,
        },
        powerAttack,
        'bonus-feat'
      );

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Maximum selections reached');
    });

    it('should return warning when entity already selected', () => {
      const fighter = createFighterClass();
      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        classEntities: { fighter },
      };
      const powerAttack = createPowerAttackFeat();

      // First selection
      const result1 = selectEntityInProvider(
        character,
        {
          type: 'classLevel',
          classId: 'fighter',
          classLevel: 2,
          providerIndex: 0,
        },
        powerAttack,
        'bonus-feat-2'
      );

      // Try to select same entity again
      const result2 = selectEntityInProvider(
        result1.character,
        {
          type: 'classLevel',
          classId: 'fighter',
          classLevel: 2,
          providerIndex: 0,
        },
        powerAttack,
        'bonus-feat-2'
      );

      expect(result2.warnings).toHaveLength(1);
      expect(result2.warnings[0]).toContain('already selected');
    });

    it('should return error when provider not found', () => {
      const character = buildCharacter().build();
      const powerAttack = createPowerAttackFeat();

      const result = selectEntityInProvider(
        character,
        {
          type: 'classLevel',
          classId: 'nonexistent',
          classLevel: 1,
          providerIndex: 0,
        },
        powerAttack,
        'bonus-feat'
      );

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Provider not found');
    });

    it('should return error when provider has no selector', () => {
      const fighter = createFighterClass();
      fighter.levels['1'].providers = [
        {
          granted: { specificIds: ['weapon-proficiency'] },
        },
      ];
      
      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        classEntities: { fighter },
      };
      const powerAttack = createPowerAttackFeat();

      const result = selectEntityInProvider(
        character,
        {
          type: 'classLevel',
          classId: 'fighter',
          classLevel: 1,
          providerIndex: 0,
        },
        powerAttack,
        'bonus-feat'
      );

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('no selector');
    });
  });

  describe('entity provider selection', () => {
    it('should add entity to pool and update entity provider selection', () => {
      const combatTrick = createCombatTrickFeature();
      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        entities: {
          classFeature: [combatTrick],
        },
      };
      const powerAttack = createPowerAttackFeat();

      const result = selectEntityInProvider(
        character,
        {
          type: 'entity',
          parentInstanceId: 'combat-trick@rogue-2-rogue-talent',
          providerIndex: 0,
        },
        powerAttack,
        'combat-feat'
      );

      expect(result.errors).toHaveLength(0);
      expect(result.instanceId).toBe('power-attack@combat-trick@rogue-2-rogue-talent-combat-feat');

      // Check entity was added to pool
      const featInstances = result.character.entities?.feat || [];
      expect(featInstances).toHaveLength(1);
      expect(featInstances[0].origin).toBe('entityInstance.classFeature:combat-trick@rogue-2-rogue-talent');
    });
  });
});

// =============================================================================
// deselectEntityFromProvider Tests
// =============================================================================

describe('deselectEntityFromProvider', () => {
  describe('classLevel deselection', () => {
    it('should remove entity from pool and update provider selection', () => {
      const fighter = createFighterClass();
      fighter.levels['1'].providers![0].selectedInstanceIds = ['power-attack@fighter-1-bonus-feat'];
      
      const powerAttackInstance: EntityInstance = {
        instanceId: 'power-attack@fighter-1-bonus-feat',
        entity: createPowerAttackFeat(),
        applicable: true,
        origin: 'classLevel:fighter-1',
      };

      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        classEntities: { fighter },
        entities: {
          feat: [powerAttackInstance],
        },
      };

      const result = deselectEntityFromProvider(
        character,
        {
          type: 'classLevel',
          classId: 'fighter',
          classLevel: 1,
          providerIndex: 0,
        },
        'power-attack@fighter-1-bonus-feat'
      );

      expect(result.errors).toHaveLength(0);

      // Check entity was removed from pool
      const featInstances = result.character.entities?.feat || [];
      expect(featInstances).toHaveLength(0);

      // Check provider was updated
      const provider = result.character.classEntities?.fighter.levels['1'].providers?.[0];
      expect(provider?.selectedInstanceIds).not.toContain('power-attack@fighter-1-bonus-feat');
    });

    it('should cascade delete child entities', () => {
      const combatTrick = createCombatTrickFeature();
      (combatTrick.entity as any).providers[0].selectedInstanceIds = [
        'power-attack@combat-trick@rogue-2-rogue-talent-combat-feat',
      ];

      const powerAttackInstance: EntityInstance = {
        instanceId: 'power-attack@combat-trick@rogue-2-rogue-talent-combat-feat',
        entity: createPowerAttackFeat(),
        applicable: true,
        origin: 'entityInstance.classFeature:combat-trick@rogue-2-rogue-talent',
      };

      const fighter = createFighterClass();
      fighter.levels['1'].providers![0].selectedInstanceIds = ['combat-trick@rogue-2-rogue-talent'];

      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        classEntities: { fighter },
        entities: {
          classFeature: [combatTrick],
          feat: [powerAttackInstance],
        },
      };

      // Simulate removing the combat trick (which should cascade to power attack)
      const result = deselectEntityFromProvider(
        character,
        {
          type: 'classLevel',
          classId: 'fighter',
          classLevel: 1,
          providerIndex: 0,
        },
        'combat-trick@rogue-2-rogue-talent'
      );

      expect(result.errors).toHaveLength(0);
      
      // Both entities should be removed (cascade)
      const classFeatureInstances = result.character.entities?.classFeature || [];
      const featInstances = result.character.entities?.feat || [];
      expect(classFeatureInstances).toHaveLength(0);
      expect(featInstances).toHaveLength(0);
    });

    it('should return warning when instance not in provider selections', () => {
      const fighter = createFighterClass();
      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        classEntities: { fighter },
      };

      const result = deselectEntityFromProvider(
        character,
        {
          type: 'classLevel',
          classId: 'fighter',
          classLevel: 1,
          providerIndex: 0,
        },
        'nonexistent@fighter-1-bonus-feat'
      );

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.includes('not found in selections'))).toBe(true);
    });
  });
});

// =============================================================================
// getSelectedEntityInstances Tests
// =============================================================================

describe('getSelectedEntityInstances', () => {
  it('should return empty array when provider not found', () => {
    const character = buildCharacter().build();

    const result = getSelectedEntityInstances(character, {
      type: 'classLevel',
      classId: 'nonexistent',
      classLevel: 1,
      providerIndex: 0,
    });

    expect(result).toEqual([]);
  });

  it('should return empty array when no selections', () => {
    const fighter = createFighterClass();
    const character: CharacterBaseData = {
      ...buildCharacter().build(),
      classEntities: { fighter },
    };

    const result = getSelectedEntityInstances(character, {
      type: 'classLevel',
      classId: 'fighter',
      classLevel: 1,
      providerIndex: 0,
    });

    expect(result).toEqual([]);
  });

  it('should return selected entity instances', () => {
    const fighter = createFighterClass();
    fighter.levels['1'].providers![0].selectedInstanceIds = ['power-attack@fighter-1-bonus-feat'];
    
    const powerAttackInstance: EntityInstance = {
      instanceId: 'power-attack@fighter-1-bonus-feat',
      entity: createPowerAttackFeat(),
      applicable: true,
      origin: 'classLevel:fighter-1',
    };

    const character: CharacterBaseData = {
      ...buildCharacter().build(),
      classEntities: { fighter },
      entities: {
        feat: [powerAttackInstance],
      },
    };

    const result = getSelectedEntityInstances(character, {
      type: 'classLevel',
      classId: 'fighter',
      classLevel: 1,
      providerIndex: 0,
    });

    expect(result).toHaveLength(1);
    expect(result[0].instanceId).toBe('power-attack@fighter-1-bonus-feat');
    expect(result[0].entity.id).toBe('power-attack');
  });

  it('should search across entity types', () => {
    const fighter = createFighterClass();
    fighter.levels['2'].providers![0].selectedInstanceIds = [
      'power-attack@fighter-2-bonus-feat-2',
      'cleave@fighter-2-bonus-feat-2',
    ];
    
    const powerAttackInstance: EntityInstance = {
      instanceId: 'power-attack@fighter-2-bonus-feat-2',
      entity: createPowerAttackFeat(),
      applicable: true,
      origin: 'classLevel:fighter-2',
    };

    const cleaveInstance: EntityInstance = {
      instanceId: 'cleave@fighter-2-bonus-feat-2',
      entity: createCleaveHeat(),
      applicable: true,
      origin: 'classLevel:fighter-2',
    };

    const character: CharacterBaseData = {
      ...buildCharacter().build(),
      classEntities: { fighter },
      entities: {
        feat: [powerAttackInstance, cleaveInstance],
        classFeature: [],
      },
    };

    const result = getSelectedEntityInstances(character, {
      type: 'classLevel',
      classId: 'fighter',
      classLevel: 2,
      providerIndex: 0,
    });

    expect(result).toHaveLength(2);
    expect(result.map(r => r.entity.id).sort()).toEqual(['cleave', 'power-attack']);
  });

  it('should work with entity provider locations', () => {
    const combatTrick = createCombatTrickFeature();
    (combatTrick.entity as any).providers[0].selectedInstanceIds = [
      'power-attack@combat-trick@rogue-2-rogue-talent-combat-feat',
    ];

    const powerAttackInstance: EntityInstance = {
      instanceId: 'power-attack@combat-trick@rogue-2-rogue-talent-combat-feat',
      entity: createPowerAttackFeat(),
      applicable: true,
      origin: 'entityInstance.classFeature:combat-trick@rogue-2-rogue-talent',
    };

    const character: CharacterBaseData = {
      ...buildCharacter().build(),
      entities: {
        classFeature: [combatTrick],
        feat: [powerAttackInstance],
      },
    };

    const result = getSelectedEntityInstances(character, {
      type: 'entity',
      parentInstanceId: 'combat-trick@rogue-2-rogue-talent',
      providerIndex: 0,
    });

    expect(result).toHaveLength(1);
    expect(result[0].instanceId).toBe('power-attack@combat-trick@rogue-2-rogue-talent-combat-feat');
  });
});


