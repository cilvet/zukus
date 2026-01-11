import { describe, it, expect } from 'bun:test';
import { resolveLevelEntities } from '../../resolution/resolveLevelEntities';
import type { CharacterBaseData } from '../../../character/baseData/character';
import type { ClassEntity, EntityInstance } from '../../storage/types';
import type { StandardEntity } from '../../../entities/types/base';
import type { EntityProvider } from '../../providers/types';
import { buildCharacter } from '../../../../tests';

function createInstance(
  instanceId: string,
  entityId: string,
  entityType: string,
  name: string,
  origin: string,
  applicable = false,
  providers?: EntityProvider[]
): EntityInstance {
  const entity: StandardEntity & { providers?: EntityProvider[] } = {
    id: entityId,
    entityType,
    name,
  };
  
  if (providers) {
    entity.providers = providers;
  }
  
  return { instanceId, entity, applicable, origin };
}

function createFighterClass(): ClassEntity {
  return {
    id: 'fighter',
    entityType: 'class',
    name: 'Fighter',
    hitDie: 10,
    babProgression: 'full',
    saves: { fortitude: 'good', reflex: 'poor', will: 'poor' },
    skillPointsPerLevel: '2',
    classSkillIds: ['climb'],
    classType: 'base',
    levels: {
      '1': {
        providers: [
          { granted: { specificIds: ['martial-weapon-proficiency'] } },
        ],
      },
      '2': {
        providers: [
          { granted: { specificIds: ['bonus-feat-selection'] } },
        ],
      },
    },
  };
}

function createRogueClass(): ClassEntity {
  return {
    id: 'rogue',
    entityType: 'class',
    name: 'Rogue',
    hitDie: 6,
    babProgression: 'medium',
    saves: { fortitude: 'poor', reflex: 'good', will: 'poor' },
    skillPointsPerLevel: '8',
    classSkillIds: ['hide'],
    classType: 'base',
    levels: {
      '1': {
        providers: [
          { granted: { specificIds: ['sneak-attack-1d6'] } },
        ],
      },
      '2': {
        providers: [
          {
            selector: {
              id: 'rogue-talent',
              name: 'Rogue Talent',
              entityType: 'classFeature',
              min: 1,
              max: 1,
            },
            selectedInstanceIds: ['combat-trick@rogue-2-rogue-talent'],
          },
        ],
      },
    },
  };
}

// =============================================================================
// Basic Resolution Tests
// =============================================================================

describe('resolveLevelEntities', () => {
  describe('basic resolution', () => {
    it('should return empty entities if character has none', () => {
      const character = buildCharacter().build();
      
      const result = resolveLevelEntities(character);
      
      expect(result.entities).toEqual({});
      expect(result.warnings).toHaveLength(0);
    });

    it('should keep custom entities always applicable', () => {
      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        entities: {
          feat: [
            createInstance('power-attack@custom', 'power-attack', 'feat', 'Power Attack', 'custom', false),
          ],
        },
      };
      
      const result = resolveLevelEntities(character);
      
      expect(result.entities.feat[0].applicable).toBe(true);
    });

    it('should reset non-custom entities to applicable: false', () => {
      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        entities: {
          classFeature: [
            createInstance(
              'sneak-attack@rogue-1',
              'sneak-attack-1d6',
              'classFeature',
              'Sneak Attack',
              'classLevel:rogue-1',
              true // Start as applicable
            ),
          ],
        },
      };
      
      const result = resolveLevelEntities(character);
      
      // Without levelSlots, no class levels are resolved
      expect(result.entities.classFeature[0].applicable).toBe(false);
    });
  });

  describe('granted entities', () => {
    it('should mark granted entities as applicable at correct level', () => {
      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        classEntities: {
          fighter: createFighterClass(),
        },
        levelSlots: [
          { classId: 'fighter', hpRoll: 10 },
        ],
        entities: {
          classFeature: [
            createInstance(
              'martial-weapon-proficiency@fighter-1',
              'martial-weapon-proficiency',
              'classFeature',
              'Martial Weapon Proficiency',
              'classLevel:fighter-1'
            ),
          ],
        },
      };
      
      const result = resolveLevelEntities(character);
      
      expect(result.entities.classFeature[0].applicable).toBe(true);
    });

    it('should not mark entities from higher levels as applicable', () => {
      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        classEntities: {
          fighter: createFighterClass(),
        },
        levelSlots: [
          { classId: 'fighter', hpRoll: 10 }, // Only level 1
        ],
        entities: {
          classFeature: [
            createInstance(
              'martial-weapon-proficiency@fighter-1',
              'martial-weapon-proficiency',
              'classFeature',
              'Martial Weapon Proficiency',
              'classLevel:fighter-1'
            ),
            createInstance(
              'bonus-feat-selection@fighter-2',
              'bonus-feat-selection',
              'classFeature',
              'Bonus Feat Selection',
              'classLevel:fighter-2'
            ),
          ],
        },
      };
      
      const result = resolveLevelEntities(character);
      
      expect(result.entities.classFeature[0].applicable).toBe(true); // Level 1
      expect(result.entities.classFeature[1].applicable).toBe(false); // Level 2 not reached
    });

    it('should respect level.level when levelSlots has more elements', () => {
      // Bug case: levelSlots has 5 elements but level.level is 2
      // Only entities from levels 1-2 should be applicable
      const fighterWithMoreLevels: ClassEntity = {
        ...createFighterClass(),
        levels: {
          '1': {
            providers: [
              { granted: { specificIds: ['level-1-feat'] } },
            ],
          },
          '2': {
            providers: [
              { granted: { specificIds: ['level-2-feat'] } },
            ],
          },
          '3': {
            providers: [
              { granted: { specificIds: ['level-3-feat'] } },
            ],
          },
          '4': {
            providers: [
              { granted: { specificIds: ['level-4-feat'] } },
            ],
          },
          '5': {
            providers: [
              { granted: { specificIds: ['level-5-feat'] } },
            ],
          },
        },
      };

      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        level: {
          level: 2, // Character is level 2
          levelsData: [],
        },
        classEntities: {
          fighter: fighterWithMoreLevels,
        },
        // But levelSlots has 5 elements (maybe from a previous higher level)
        levelSlots: [
          { classId: 'fighter', hpRoll: 10 },
          { classId: 'fighter', hpRoll: 8 },
          { classId: 'fighter', hpRoll: 6 },
          { classId: 'fighter', hpRoll: 4 },
          { classId: 'fighter', hpRoll: 2 },
        ],
        entities: {
          classFeature: [
            createInstance(
              'level-1-feat@fighter-1',
              'level-1-feat',
              'classFeature',
              'Level 1 Feat',
              'classLevel:fighter-1'
            ),
            createInstance(
              'level-2-feat@fighter-2',
              'level-2-feat',
              'classFeature',
              'Level 2 Feat',
              'classLevel:fighter-2'
            ),
            createInstance(
              'level-3-feat@fighter-3',
              'level-3-feat',
              'classFeature',
              'Level 3 Feat',
              'classLevel:fighter-3'
            ),
            createInstance(
              'level-4-feat@fighter-4',
              'level-4-feat',
              'classFeature',
              'Level 4 Feat',
              'classLevel:fighter-4'
            ),
            createInstance(
              'level-5-feat@fighter-5',
              'level-5-feat',
              'classFeature',
              'Level 5 Feat',
              'classLevel:fighter-5'
            ),
          ],
        },
      };

      const result = resolveLevelEntities(character);

      // Only levels 1 and 2 should be applicable
      expect(result.entities.classFeature[0].applicable).toBe(true);  // Level 1
      expect(result.entities.classFeature[1].applicable).toBe(true);  // Level 2
      expect(result.entities.classFeature[2].applicable).toBe(false); // Level 3 - NOT reached
      expect(result.entities.classFeature[3].applicable).toBe(false); // Level 4 - NOT reached
      expect(result.entities.classFeature[4].applicable).toBe(false); // Level 5 - NOT reached
    });

    it('should handle multiple classes', () => {
      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        classEntities: {
          fighter: createFighterClass(),
          rogue: createRogueClass(),
        },
        levelSlots: [
          { classId: 'fighter', hpRoll: 10 },
          { classId: 'rogue', hpRoll: 6 },
        ],
        entities: {
          classFeature: [
            createInstance(
              'martial-weapon-proficiency@fighter-1',
              'martial-weapon-proficiency',
              'classFeature',
              'Martial Weapon Proficiency',
              'classLevel:fighter-1'
            ),
            createInstance(
              'sneak-attack-1d6@rogue-1',
              'sneak-attack-1d6',
              'classFeature',
              'Sneak Attack',
              'classLevel:rogue-1'
            ),
          ],
        },
      };
      
      const result = resolveLevelEntities(character);
      
      expect(result.entities.classFeature[0].applicable).toBe(true); // Fighter 1
      expect(result.entities.classFeature[1].applicable).toBe(true); // Rogue 1
    });
  });

  describe('selector entities', () => {
    it('should mark selected entities as applicable', () => {
      const rogueWithSelection = createRogueClass();
      
      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        classEntities: {
          rogue: rogueWithSelection,
        },
        levelSlots: [
          { classId: 'rogue', hpRoll: 6 },
          { classId: 'rogue', hpRoll: 4 }, // Level 2 needed for talent
        ],
        entities: {
          classFeature: [
            createInstance(
              'sneak-attack-1d6@rogue-1',
              'sneak-attack-1d6',
              'classFeature',
              'Sneak Attack',
              'classLevel:rogue-1'
            ),
            createInstance(
              'combat-trick@rogue-2-rogue-talent',
              'combat-trick',
              'classFeature',
              'Combat Trick',
              'classLevel:rogue-2'
            ),
          ],
        },
      };
      
      const result = resolveLevelEntities(character);
      
      expect(result.entities.classFeature[0].applicable).toBe(true); // Granted
      expect(result.entities.classFeature[1].applicable).toBe(true); // Selected
    });

    it('should not mark unselected selector options as applicable', () => {
      const rogueWithSelection = createRogueClass();
      
      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        classEntities: {
          rogue: rogueWithSelection,
        },
        levelSlots: [
          { classId: 'rogue', hpRoll: 6 },
          { classId: 'rogue', hpRoll: 4 },
        ],
        entities: {
          classFeature: [
            createInstance(
              'combat-trick@rogue-2-rogue-talent',
              'combat-trick',
              'classFeature',
              'Combat Trick',
              'classLevel:rogue-2'
            ),
            createInstance(
              'weapon-training@rogue-2-rogue-talent',
              'weapon-training',
              'classFeature',
              'Weapon Training',
              'classLevel:rogue-2'
            ),
          ],
        },
      };
      
      const result = resolveLevelEntities(character);
      
      expect(result.entities.classFeature[0].applicable).toBe(true); // Selected
      expect(result.entities.classFeature[1].applicable).toBe(false); // Not selected
    });
  });

  describe('nested providers', () => {
    it('should resolve entities from nested providers', () => {
      const rogueWithSelection = createRogueClass();
      
      // Combat Trick has a nested provider for a feat
      const combatTrickWithProvider = createInstance(
        'combat-trick@rogue-2-rogue-talent',
        'combat-trick',
        'classFeature',
        'Combat Trick',
        'classLevel:rogue-2',
        false,
        [
          {
            selector: {
              id: 'combat-feat',
              name: 'Combat Feat',
              entityType: 'feat',
              min: 1,
              max: 1,
            },
            selectedInstanceIds: ['power-attack@combat-trick@rogue-2-rogue-talent-combat-feat'],
          },
        ]
      );
      
      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        classEntities: {
          rogue: rogueWithSelection,
        },
        levelSlots: [
          { classId: 'rogue', hpRoll: 6 },
          { classId: 'rogue', hpRoll: 4 },
        ],
        entities: {
          classFeature: [combatTrickWithProvider],
          feat: [
            createInstance(
              'power-attack@combat-trick@rogue-2-rogue-talent-combat-feat',
              'power-attack',
              'feat',
              'Power Attack',
              'entityInstance.classFeature:combat-trick@rogue-2-rogue-talent'
            ),
          ],
        },
      };
      
      const result = resolveLevelEntities(character);
      
      expect(result.entities.classFeature[0].applicable).toBe(true); // Combat Trick
      expect(result.entities.feat[0].applicable).toBe(true); // Power Attack (nested)
    });
  });

  describe('warnings', () => {
    it('should warn if class not found in classEntities', () => {
      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        levelSlots: [
          { classId: 'nonexistent', hpRoll: 10 },
        ],
        entities: {}, // Need entities to trigger resolution
      };
      
      const result = resolveLevelEntities(character);
      
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].type).toBe('class_not_found');
    });

    it('should warn if selected instance not found in pool', () => {
      const rogueWithInvalidSelection: ClassEntity = {
        ...createRogueClass(),
        levels: {
          '1': { providers: [] },
          '2': {
            providers: [
              {
                selector: {
                  id: 'rogue-talent',
                  name: 'Rogue Talent',
                  entityType: 'classFeature',
                  min: 1,
                  max: 1,
                },
                selectedInstanceIds: ['nonexistent@rogue-2-rogue-talent'],
              },
            ],
          },
        },
      };
      
      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        classEntities: {
          rogue: rogueWithInvalidSelection,
        },
        levelSlots: [
          { classId: 'rogue', hpRoll: 6 },
          { classId: 'rogue', hpRoll: 4 },
        ],
        entities: {
          classFeature: [],
        },
      };
      
      const result = resolveLevelEntities(character);
      
      expect(result.warnings.some(w => w.type === 'invalid_selection')).toBe(true);
    });
  });

  describe('multiclass level counting', () => {
    it('should correctly count levels per class', () => {
      const character: CharacterBaseData = {
        ...buildCharacter().build(),
        classEntities: {
          fighter: createFighterClass(),
          rogue: createRogueClass(),
        },
        levelSlots: [
          { classId: 'fighter', hpRoll: 10 }, // Fighter 1
          { classId: 'rogue', hpRoll: 6 },    // Rogue 1
          { classId: 'fighter', hpRoll: 8 },  // Fighter 2
        ],
        entities: {
          classFeature: [
            createInstance(
              'martial-weapon-proficiency@fighter-1',
              'martial-weapon-proficiency',
              'classFeature',
              'Martial Weapon Proficiency',
              'classLevel:fighter-1'
            ),
            createInstance(
              'bonus-feat-selection@fighter-2',
              'bonus-feat-selection',
              'classFeature',
              'Bonus Feat Selection',
              'classLevel:fighter-2'
            ),
            createInstance(
              'sneak-attack-1d6@rogue-1',
              'sneak-attack-1d6',
              'classFeature',
              'Sneak Attack',
              'classLevel:rogue-1'
            ),
          ],
        },
      };
      
      const result = resolveLevelEntities(character);
      
      // All should be applicable: Fighter 1, Fighter 2, Rogue 1
      expect(result.entities.classFeature[0].applicable).toBe(true);
      expect(result.entities.classFeature[1].applicable).toBe(true);
      expect(result.entities.classFeature[2].applicable).toBe(true);
    });
  });
});

