import { describe, it, expect } from 'bun:test';
import { addClass, removeClass } from '../../updater/classOperations';
import type { CharacterBaseData } from '../../../character/baseData/character';
import type { StandardEntity } from '../../../entities/types/base';
import type { ClassEntity, EntityInstance } from '../../storage/types';
import type { CompendiumContext } from '../../updater/types';
import { buildCharacter } from '../../../../tests';

function createFighterClass(): ClassEntity {
  return {
    id: 'fighter',
    entityType: 'class',
    name: 'Fighter',
    hitDie: 10,
    babProgression: 'full',
    saves: { fortitude: 'good', reflex: 'poor', will: 'poor' },
    skillPointsPerLevel: '2 + @ability.intelligence.modifier',
    classSkillIds: ['climb', 'intimidate', 'jump'],
    classType: 'base',
    levels: {
      '1': {
        providers: [
          {
            granted: { specificIds: ['martial-weapon-proficiency', 'heavy-armor-proficiency'] },
          },
          {
            selector: {
              id: 'fighter-feat-1',
              name: 'Fighter Bonus Feat',
              entityType: 'feat',
              entityIds: ['power-attack', 'cleave', 'weapon-focus'],
              min: 1,
              max: 1,
            },
          },
        ],
      },
      '2': {
        providers: [
          {
            selector: {
              id: 'fighter-feat-2',
              name: 'Fighter Bonus Feat',
              entityType: 'feat',
              entityIds: ['power-attack', 'cleave', 'weapon-focus'],
              min: 1,
              max: 1,
            },
          },
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
    skillPointsPerLevel: '8 + @ability.intelligence.modifier',
    classSkillIds: ['hide', 'move-silently', 'open-lock'],
    classType: 'base',
    levels: {
      '1': {
        providers: [
          {
            granted: { specificIds: ['sneak-attack-1d6', 'trapfinding'] },
          },
        ],
      },
      '2': {
        providers: [
          {
            granted: { specificIds: ['evasion'] },
          },
        ],
      },
    },
  };
}

function createCompendiumContext(
  classes: Record<string, ClassEntity>,
  entities: Record<string, StandardEntity[]>
): CompendiumContext {
  return {
    getClass: (classId: string) => classes[classId],
    getEntity: (entityType: string, entityId: string) => {
      const typeEntities = entities[entityType] || [];
      return typeEntities.find(e => e.id === entityId);
    },
    getAllEntities: (entityType: string) => entities[entityType] || [],
  };
}

// Sample entities for compendium
const sampleEntities: Record<string, StandardEntity[]> = {
  classFeature: [
    { id: 'martial-weapon-proficiency', entityType: 'classFeature', name: 'Martial Weapon Proficiency' },
    { id: 'heavy-armor-proficiency', entityType: 'classFeature', name: 'Heavy Armor Proficiency' },
    { id: 'sneak-attack-1d6', entityType: 'classFeature', name: 'Sneak Attack +1d6' },
    { id: 'trapfinding', entityType: 'classFeature', name: 'Trapfinding' },
    { id: 'evasion', entityType: 'classFeature', name: 'Evasion' },
  ],
  feat: [
    { id: 'power-attack', entityType: 'feat', name: 'Power Attack' },
    { id: 'cleave', entityType: 'feat', name: 'Cleave' },
    { id: 'weapon-focus', entityType: 'feat', name: 'Weapon Focus' },
  ],
};

// =============================================================================
// addClass Tests
// =============================================================================

describe('addClass', () => {
  it('should add class to classEntities', () => {
    const character = buildCharacter().build();
    const fighter = createFighterClass();
    const context = createCompendiumContext({ fighter }, sampleEntities);
    
    const result = addClass(character, 'fighter', context);
    
    expect(result.character.classEntities).toBeDefined();
    expect(result.character.classEntities!.fighter).toBeDefined();
    expect(result.character.classEntities!.fighter.name).toBe('Fighter');
  });

  it('should resolve granted entities from all levels', () => {
    const character = buildCharacter().build();
    const fighter = createFighterClass();
    const context = createCompendiumContext({ fighter }, sampleEntities);
    
    const result = addClass(character, 'fighter', context);
    
    // Fighter has 2 granted entities in level 1
    expect(result.character.entities).toBeDefined();
    expect(result.character.entities!.classFeature).toBeDefined();
    
    const classFeatures = result.character.entities!.classFeature;
    const featureIds = classFeatures.map(e => e.entity.id);
    
    expect(featureIds).toContain('martial-weapon-proficiency');
    expect(featureIds).toContain('heavy-armor-proficiency');
  });

  it('should resolve selector entityIds as pool entries', () => {
    const character = buildCharacter().build();
    const fighter = createFighterClass();
    const context = createCompendiumContext({ fighter }, sampleEntities);
    
    const result = addClass(character, 'fighter', context);
    
    // Fighter has selector with 3 feat options in level 1 and 2
    expect(result.character.entities!.feat).toBeDefined();
    
    const feats = result.character.entities!.feat;
    expect(feats.length).toBeGreaterThanOrEqual(3);
    
    const featIds = feats.map(e => e.entity.id);
    expect(featIds).toContain('power-attack');
    expect(featIds).toContain('cleave');
    expect(featIds).toContain('weapon-focus');
  });

  it('should create entities with applicable: false', () => {
    const character = buildCharacter().build();
    const fighter = createFighterClass();
    const context = createCompendiumContext({ fighter }, sampleEntities);
    
    const result = addClass(character, 'fighter', context);
    
    const allEntities = [
      ...result.character.entities!.classFeature || [],
      ...result.character.entities!.feat || [],
    ];
    
    for (const instance of allEntities) {
      expect(instance.applicable).toBe(false);
    }
  });

  it('should set correct origin for entities', () => {
    const character = buildCharacter().build();
    const rogue = createRogueClass();
    const context = createCompendiumContext({ rogue }, sampleEntities);
    
    const result = addClass(character, 'rogue', context);
    
    const sneakAttack = result.character.entities!.classFeature.find(
      e => e.entity.id === 'sneak-attack-1d6'
    );
    
    expect(sneakAttack).toBeDefined();
    expect(sneakAttack!.origin).toBe('classLevel:rogue-1');
    expect(sneakAttack!.instanceId).toBe('sneak-attack-1d6@rogue-1');
  });

  it('should warn if class not found in compendium', () => {
    const character = buildCharacter().build();
    const context = createCompendiumContext({}, sampleEntities);
    
    const result = addClass(character, 'nonexistent', context);
    
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].type).toBe('class_not_found');
    expect(result.character.classEntities).toBeUndefined();
  });

  it('should warn if class already exists in character', () => {
    const fighter = createFighterClass();
    const character: CharacterBaseData = {
      ...buildCharacter().build(),
      classEntities: { fighter },
    };
    const context = createCompendiumContext({ fighter }, sampleEntities);
    
    const result = addClass(character, 'fighter', context);
    
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].message).toContain('already exists');
  });

  it('should warn if granted entity not found in compendium', () => {
    const character = buildCharacter().build();
    const classWithMissingEntity: ClassEntity = {
      ...createFighterClass(),
      levels: {
        '1': {
          providers: [
            { granted: { specificIds: ['nonexistent-feature'] } },
          ],
        },
      },
    };
    const context = createCompendiumContext(
      { fighter: classWithMissingEntity },
      sampleEntities
    );
    
    const result = addClass(character, 'fighter', context);
    
    expect(result.warnings.some(w => w.type === 'entity_not_found')).toBe(true);
  });
});

// =============================================================================
// removeClass Tests
// =============================================================================

describe('removeClass', () => {
  it('should remove class from classEntities', () => {
    const fighter = createFighterClass();
    const character: CharacterBaseData = {
      ...buildCharacter().build(),
      classEntities: { fighter },
    };
    
    const result = removeClass(character, 'fighter');
    
    expect(result.character.classEntities!.fighter).toBeUndefined();
  });

  it('should remove entities with origin from that class', () => {
    const fighter = createFighterClass();
    const character: CharacterBaseData = {
      ...buildCharacter().build(),
      classEntities: { fighter },
      entities: {
        classFeature: [
          {
            instanceId: 'martial-weapon-proficiency@fighter-1',
            entity: { id: 'martial-weapon-proficiency', entityType: 'classFeature', name: 'Martial Weapon Proficiency' },
            applicable: true,
            origin: 'classLevel:fighter-1',
          },
        ],
        feat: [
          {
            instanceId: 'power-attack@custom',
            entity: { id: 'power-attack', entityType: 'feat', name: 'Power Attack' },
            applicable: true,
            origin: 'custom', // Not from fighter
          },
        ],
      },
    };
    
    const result = removeClass(character, 'fighter');
    
    // Fighter features should be removed
    expect(result.character.entities!.classFeature).toHaveLength(0);
    // Custom feat should remain
    expect(result.character.entities!.feat).toHaveLength(1);
  });

  it('should cascade delete child entities', () => {
    const fighter = createFighterClass();
    const character: CharacterBaseData = {
      ...buildCharacter().build(),
      classEntities: { fighter },
      entities: {
        classFeature: [
          {
            instanceId: 'combat-trick@fighter-1',
            entity: { id: 'combat-trick', entityType: 'classFeature', name: 'Combat Trick' },
            applicable: true,
            origin: 'classLevel:fighter-1',
          },
        ],
        feat: [
          {
            instanceId: 'power-attack@combat-trick@fighter-1-combat-feat',
            entity: { id: 'power-attack', entityType: 'feat', name: 'Power Attack' },
            applicable: true,
            origin: 'entityInstance.classFeature:combat-trick@fighter-1',
          },
        ],
      },
    };
    
    const result = removeClass(character, 'fighter');
    
    expect(result.character.entities!.classFeature).toHaveLength(0);
    expect(result.character.entities!.feat).toHaveLength(0); // Cascaded
  });

  it('should clear classId from levelSlots', () => {
    const fighter = createFighterClass();
    const character: CharacterBaseData = {
      ...buildCharacter().build(),
      classEntities: { fighter },
      levelSlots: [
        { classId: 'fighter', hpRoll: 10 },
        { classId: 'fighter', hpRoll: 8 },
      ],
    };
    
    const result = removeClass(character, 'fighter');
    
    expect(result.character.levelSlots![0].classId).toBeNull();
    expect(result.character.levelSlots![1].classId).toBeNull();
    // HP rolls should be preserved
    expect(result.character.levelSlots![0].hpRoll).toBe(10);
    expect(result.character.levelSlots![1].hpRoll).toBe(8);
  });

  it('should warn if class not found', () => {
    const character = buildCharacter().build();
    
    const result = removeClass(character, 'nonexistent');
    
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].type).toBe('class_not_found');
  });

  it('should preserve other classes', () => {
    const fighter = createFighterClass();
    const rogue = createRogueClass();
    const character: CharacterBaseData = {
      ...buildCharacter().build(),
      classEntities: { fighter, rogue },
      entities: {
        classFeature: [
          {
            instanceId: 'martial-weapon-proficiency@fighter-1',
            entity: { id: 'martial-weapon-proficiency', entityType: 'classFeature', name: 'Martial Weapon Proficiency' },
            applicable: true,
            origin: 'classLevel:fighter-1',
          },
          {
            instanceId: 'sneak-attack-1d6@rogue-1',
            entity: { id: 'sneak-attack-1d6', entityType: 'classFeature', name: 'Sneak Attack +1d6' },
            applicable: true,
            origin: 'classLevel:rogue-1',
          },
        ],
      },
    };
    
    const result = removeClass(character, 'fighter');
    
    expect(result.character.classEntities!.rogue).toBeDefined();
    expect(result.character.entities!.classFeature).toHaveLength(1);
    expect(result.character.entities!.classFeature[0].entity.id).toBe('sneak-attack-1d6');
  });
});

