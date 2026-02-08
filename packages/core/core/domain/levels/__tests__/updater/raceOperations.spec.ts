import { describe, it, expect } from 'bun:test';
import { addRace, removeRace, changeRace } from '../../updater/raceOperations';
import type { CharacterBaseData } from '../../../character/baseData/character';
import type { StandardEntity } from '../../../entities/types/base';
import type { RaceEntity, EntityInstance } from '../../storage/types';
import type { CompendiumContext } from '../../updater/types';

// =============================================================================
// Test Fixtures
// =============================================================================

function createHumanRace(): RaceEntity {
  return {
    id: 'human',
    entityType: 'race',
    name: 'Human',
    size: 'MEDIUM',
    baseLandSpeed: 30,
    languages: ['Common'],
    bonusLanguages: ['any'],
    levelAdjustment: 0,
    favoredClass: 'any',
    racialType: 'humanoid',
    racialSubtypes: ['human'],
    levels: {
      '1': {
        providers: [
          {
            granted: { specificIds: ['human-bonus-skill-points'] },
          },
          {
            selector: {
              id: 'human-bonus-feat',
              name: 'Human Bonus Feat',
              entityType: 'feat',
              entityIds: ['power-attack', 'toughness', 'improved-initiative'],
              min: 1,
              max: 1,
            },
          },
        ],
      },
    },
    effects: [
      // Humans don't have ability modifiers, but adding one for test purposes
    ],
  };
}

function createElfRace(): RaceEntity {
  return {
    id: 'elf',
    entityType: 'race',
    name: 'Elf',
    size: 'MEDIUM',
    baseLandSpeed: 30,
    languages: ['Common', 'Elven'],
    levelAdjustment: 0,
    favoredClass: 'wizard',
    racialType: 'humanoid',
    racialSubtypes: ['elf'],
    levels: {
      '1': {
        providers: [
          {
            granted: { specificIds: ['elven-weapon-proficiency', 'keen-senses'] },
          },
        ],
      },
    },
    effects: [
      { target: 'ability.dexterity.score', formula: '2', bonusType: 'RACIAL' },
      { target: 'ability.constitution.score', formula: '-2', bonusType: 'RACIAL' },
    ],
  };
}

const sampleEntities: Record<string, StandardEntity[]> = {
  racialTrait: [
    { id: 'human-bonus-skill-points', entityType: 'racialTrait', name: 'Bonus Skill Points' },
    { id: 'elven-weapon-proficiency', entityType: 'racialTrait', name: 'Elven Weapon Proficiency' },
    { id: 'keen-senses', entityType: 'racialTrait', name: 'Keen Senses' },
  ],
  feat: [
    { id: 'power-attack', entityType: 'feat', name: 'Power Attack' },
    { id: 'toughness', entityType: 'feat', name: 'Toughness' },
    { id: 'improved-initiative', entityType: 'feat', name: 'Improved Initiative' },
  ],
};

function createCompendiumContext(
  races: Record<string, RaceEntity>,
  entities: Record<string, StandardEntity[]> = sampleEntities
): CompendiumContext {
  return {
    getClass: () => undefined,
    getSystemLevels: () => undefined,
    getRace: (raceId: string) => races[raceId],
    getEntity: (entityType: string, entityId: string) => {
      const typeEntities = entities[entityType] || [];
      return typeEntities.find(e => e.id === entityId);
    },
    getAllEntities: (entityType: string) => entities[entityType] || [],
  };
}

function createCharacter(overrides: Partial<CharacterBaseData> = {}): CharacterBaseData {
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
    } as CharacterBaseData['baseAbilityData'],
    skills: {} as CharacterBaseData['skills'],
    skillData: {} as CharacterBaseData['skillData'],
    classes: [],
    level: { level: 0, xp: 0, levelsData: [] },
    equipment: { items: [] },
    feats: [],
    buffs: [],
    sharedBuffs: [],
    updatedAt: new Date().toISOString(),
    ...overrides,
  } as CharacterBaseData;
}

// =============================================================================
// addRace Tests
// =============================================================================

describe('addRace', () => {
  it('should add race to raceEntity', () => {
    const character = createCharacter();
    const human = createHumanRace();
    const context = createCompendiumContext({ human });

    const result = addRace(character, 'human', context);

    expect(result.character.raceEntity).toBeDefined();
    expect(result.character.raceEntity!.id).toBe('human');
    expect(result.character.raceEntity!.name).toBe('Human');
  });

  it('should resolve granted entities from race levels', () => {
    const character = createCharacter();
    const human = createHumanRace();
    const context = createCompendiumContext({ human });

    const result = addRace(character, 'human', context);

    expect(result.character.entities).toBeDefined();
    expect(result.character.entities!.racialTrait).toBeDefined();

    const racialTraits = result.character.entities!.racialTrait;
    const traitIds = racialTraits.map(e => e.entity.id);
    expect(traitIds).toContain('human-bonus-skill-points');
  });

  it('should resolve selector entityIds as pool entries', () => {
    const character = createCharacter();
    const human = createHumanRace();
    const context = createCompendiumContext({ human });

    const result = addRace(character, 'human', context);

    expect(result.character.entities!.feat).toBeDefined();

    const feats = result.character.entities!.feat;
    expect(feats.length).toBe(3);

    const featIds = feats.map(e => e.entity.id);
    expect(featIds).toContain('power-attack');
    expect(featIds).toContain('toughness');
    expect(featIds).toContain('improved-initiative');
  });

  it('should create entities with applicable: false', () => {
    const character = createCharacter();
    const human = createHumanRace();
    const context = createCompendiumContext({ human });

    const result = addRace(character, 'human', context);

    const allEntities = [
      ...(result.character.entities!.racialTrait || []),
      ...(result.character.entities!.feat || []),
    ];

    for (const instance of allEntities) {
      expect(instance.applicable).toBe(false);
    }
  });

  it('should set correct origin for entities', () => {
    const character = createCharacter();
    const elf = createElfRace();
    const context = createCompendiumContext({ elf });

    const result = addRace(character, 'elf', context);

    const weaponProf = result.character.entities!.racialTrait.find(
      e => e.entity.id === 'elven-weapon-proficiency'
    );

    expect(weaponProf).toBeDefined();
    expect(weaponProf!.origin).toBe('race:elf-1');
    expect(weaponProf!.instanceId).toBe('elven-weapon-proficiency@elf-1');
  });

  it('should warn if race not found in compendium', () => {
    const character = createCharacter();
    const context = createCompendiumContext({});

    const result = addRace(character, 'nonexistent', context);

    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].type).toBe('race_not_found');
    expect(result.character.raceEntity).toBeUndefined();
  });

  it('should replace existing race when adding new one', () => {
    const elf = createElfRace();
    const human = createHumanRace();
    const character = createCharacter({
      raceEntity: elf,
      entities: {
        racialTrait: [
          {
            instanceId: 'elven-weapon-proficiency@elf-1',
            entity: { id: 'elven-weapon-proficiency', entityType: 'racialTrait', name: 'Elven Weapon Proficiency' },
            applicable: true,
            origin: 'race:elf-1',
          },
        ],
      },
    });
    const context = createCompendiumContext({ human });

    const result = addRace(character, 'human', context);

    expect(result.character.raceEntity!.id).toBe('human');
    // Elf traits should be gone
    const elfTraits = (result.character.entities!.racialTrait || []).filter(
      e => e.origin.startsWith('race:elf')
    );
    expect(elfTraits).toHaveLength(0);
  });

  it('should warn if granted entity not found in compendium', () => {
    const character = createCharacter();
    const raceWithMissingEntity: RaceEntity = {
      ...createHumanRace(),
      levels: {
        '1': {
          providers: [
            { granted: { specificIds: ['nonexistent-trait'] } },
          ],
        },
      },
    };
    const context = createCompendiumContext({ human: raceWithMissingEntity });

    const result = addRace(character, 'human', context);

    expect(result.warnings.some(w => w.type === 'entity_not_found')).toBe(true);
  });

  it('should preserve race effects on the raceEntity', () => {
    const character = createCharacter();
    const elf = createElfRace();
    const context = createCompendiumContext({ elf });

    const result = addRace(character, 'elf', context);

    expect(result.character.raceEntity!.effects).toBeDefined();
    expect(result.character.raceEntity!.effects).toHaveLength(2);
    expect(result.character.raceEntity!.effects![0].target).toBe('ability.dexterity.score');
    expect(result.character.raceEntity!.effects![0].bonusType).toBe('RACIAL');
  });
});

// =============================================================================
// removeRace Tests
// =============================================================================

describe('removeRace', () => {
  it('should remove raceEntity from character', () => {
    const elf = createElfRace();
    const character = createCharacter({ raceEntity: elf });

    const result = removeRace(character);

    expect(result.warnings).toHaveLength(0);
    expect(result.character.raceEntity).toBeUndefined();
  });

  it('should remove entities with race origin', () => {
    const elf = createElfRace();
    const character = createCharacter({
      raceEntity: elf,
      entities: {
        racialTrait: [
          {
            instanceId: 'elven-weapon-proficiency@elf-1',
            entity: { id: 'elven-weapon-proficiency', entityType: 'racialTrait', name: 'Elven Weapon Proficiency' },
            applicable: true,
            origin: 'race:elf-1',
          },
          {
            instanceId: 'keen-senses@elf-1',
            entity: { id: 'keen-senses', entityType: 'racialTrait', name: 'Keen Senses' },
            applicable: true,
            origin: 'race:elf-1',
          },
        ],
        feat: [
          {
            instanceId: 'power-attack@custom',
            entity: { id: 'power-attack', entityType: 'feat', name: 'Power Attack' },
            applicable: true,
            origin: 'custom',
          },
        ],
      },
    });

    const result = removeRace(character);

    // Race entities should be removed
    expect(result.character.entities!.racialTrait).toHaveLength(0);
    // Custom feat should remain
    expect(result.character.entities!.feat).toHaveLength(1);
  });

  it('should cascade delete child entities', () => {
    const human = createHumanRace();
    const character = createCharacter({
      raceEntity: human,
      entities: {
        racialTrait: [
          {
            instanceId: 'some-trait@human-1',
            entity: { id: 'some-trait', entityType: 'racialTrait', name: 'Some Trait' },
            applicable: true,
            origin: 'race:human-1',
          },
        ],
        feat: [
          {
            instanceId: 'power-attack@some-trait@human-1-bonus-feat',
            entity: { id: 'power-attack', entityType: 'feat', name: 'Power Attack' },
            applicable: true,
            origin: 'entityInstance.racialTrait:some-trait@human-1',
          },
        ],
      },
    });

    const result = removeRace(character);

    expect(result.character.entities!.racialTrait).toHaveLength(0);
    expect(result.character.entities!.feat).toHaveLength(0); // Cascaded
  });

  it('should warn if no race to remove', () => {
    const character = createCharacter();

    const result = removeRace(character);

    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].type).toBe('race_not_found');
  });

  it('should preserve class entities', () => {
    const elf = createElfRace();
    const character = createCharacter({
      raceEntity: elf,
      entities: {
        racialTrait: [
          {
            instanceId: 'elven-weapon-proficiency@elf-1',
            entity: { id: 'elven-weapon-proficiency', entityType: 'racialTrait', name: 'Elven Weapon Proficiency' },
            applicable: true,
            origin: 'race:elf-1',
          },
        ],
        classFeature: [
          {
            instanceId: 'sneak-attack-1d6@rogue-1',
            entity: { id: 'sneak-attack-1d6', entityType: 'classFeature', name: 'Sneak Attack +1d6' },
            applicable: true,
            origin: 'classLevel:rogue-1',
          },
        ],
      },
    });

    const result = removeRace(character);

    expect(result.character.entities!.racialTrait).toHaveLength(0);
    expect(result.character.entities!.classFeature).toHaveLength(1);
    expect(result.character.entities!.classFeature[0].entity.id).toBe('sneak-attack-1d6');
  });
});

// =============================================================================
// changeRace Tests
// =============================================================================

describe('changeRace', () => {
  it('should change race from elf to human', () => {
    const elf = createElfRace();
    const human = createHumanRace();
    const character = createCharacter({
      raceEntity: elf,
      entities: {
        racialTrait: [
          {
            instanceId: 'elven-weapon-proficiency@elf-1',
            entity: { id: 'elven-weapon-proficiency', entityType: 'racialTrait', name: 'Elven Weapon Proficiency' },
            applicable: true,
            origin: 'race:elf-1',
          },
        ],
      },
    });
    const context = createCompendiumContext({ human });

    const result = changeRace(character, 'human', context);

    expect(result.character.raceEntity!.id).toBe('human');
    // Elf traits should be gone
    const elfTraits = (result.character.entities!.racialTrait || []).filter(
      e => e.origin.startsWith('race:elf')
    );
    expect(elfTraits).toHaveLength(0);
    // Human traits should be present
    const humanTraits = (result.character.entities!.racialTrait || []).filter(
      e => e.origin.startsWith('race:human')
    );
    expect(humanTraits.length).toBeGreaterThan(0);
  });

  it('should work when no existing race', () => {
    const character = createCharacter();
    const human = createHumanRace();
    const context = createCompendiumContext({ human });

    const result = changeRace(character, 'human', context);

    expect(result.character.raceEntity!.id).toBe('human');
  });
});

// =============================================================================
// Race Provider Resolution Tests
// =============================================================================

describe('race provider resolution', () => {
  it('should resolve race providers during level resolution', () => {
    const { resolveLevelEntities } = require('../../resolution/resolveLevelEntities');

    const elf = createElfRace();
    const character = createCharacter({
      raceEntity: elf,
      entities: {
        racialTrait: [
          {
            instanceId: 'elven-weapon-proficiency@elf-1',
            entity: { id: 'elven-weapon-proficiency', entityType: 'racialTrait', name: 'Elven Weapon Proficiency' },
            applicable: false,
            origin: 'race:elf-1',
          },
          {
            instanceId: 'keen-senses@elf-1',
            entity: { id: 'keen-senses', entityType: 'racialTrait', name: 'Keen Senses' },
            applicable: false,
            origin: 'race:elf-1',
          },
        ],
      },
      levelSlots: [],
      level: { level: 0, xp: 0, levelsData: [] },
    });

    const result = resolveLevelEntities(character);

    // Racial traits should be marked applicable even without level slots
    const racialTraits = result.entities.racialTrait || [];
    const weaponProf = racialTraits.find(
      (e: EntityInstance) => e.entity.id === 'elven-weapon-proficiency'
    );
    const keenSenses = racialTraits.find(
      (e: EntityInstance) => e.entity.id === 'keen-senses'
    );

    expect(weaponProf?.applicable).toBe(true);
    expect(keenSenses?.applicable).toBe(true);
  });

  it('should resolve race selector with selectedInstanceIds', () => {
    const { resolveLevelEntities } = require('../../resolution/resolveLevelEntities');

    const human = createHumanRace();
    // Simulate user selecting power-attack via the selector
    human.levels['1'].providers![1].selectedInstanceIds = ['power-attack@human-1-human-bonus-feat'];

    const character = createCharacter({
      raceEntity: human,
      entities: {
        racialTrait: [
          {
            instanceId: 'human-bonus-skill-points@human-1',
            entity: { id: 'human-bonus-skill-points', entityType: 'racialTrait', name: 'Bonus Skill Points' },
            applicable: false,
            origin: 'race:human-1',
          },
        ],
        feat: [
          {
            instanceId: 'power-attack@human-1-human-bonus-feat',
            entity: { id: 'power-attack', entityType: 'feat', name: 'Power Attack' },
            applicable: false,
            origin: 'race:human-1',
          },
          {
            instanceId: 'toughness@human-1-human-bonus-feat',
            entity: { id: 'toughness', entityType: 'feat', name: 'Toughness' },
            applicable: false,
            origin: 'race:human-1',
          },
        ],
      },
      levelSlots: [],
      level: { level: 0, xp: 0, levelsData: [] },
    });

    const result = resolveLevelEntities(character);

    // The selected feat should be applicable
    const feats = result.entities.feat || [];
    const powerAttack = feats.find(
      (e: EntityInstance) => e.instanceId === 'power-attack@human-1-human-bonus-feat'
    );
    const toughness = feats.find(
      (e: EntityInstance) => e.instanceId === 'toughness@human-1-human-bonus-feat'
    );

    expect(powerAttack?.applicable).toBe(true);
    expect(toughness?.applicable).toBe(false);
  });
});

// =============================================================================
// Racial Effects Compilation Tests
// =============================================================================

describe('racial effects compilation', () => {
  it('should compile race entity effects', () => {
    const { compileCharacterEffects } = require('../../../character/calculation/effects/compileEffects');

    const elf = createElfRace();
    const character = createCharacter({
      raceEntity: elf,
    });

    const compiled = compileCharacterEffects(character);

    expect(compiled.all.length).toBeGreaterThanOrEqual(2);

    const dexEffect = compiled.all.find(
      (e: any) => e.target === 'ability.dexterity.score'
    );
    const conEffect = compiled.all.find(
      (e: any) => e.target === 'ability.constitution.score'
    );

    expect(dexEffect).toBeDefined();
    expect(dexEffect.formula).toBe('2');
    expect(dexEffect.bonusType).toBe('RACIAL');
    expect(dexEffect.sourceRef).toBe('race:elf');
    expect(dexEffect.sourceName).toBe('Elf');

    expect(conEffect).toBeDefined();
    expect(conEffect.formula).toBe('-2');
    expect(conEffect.bonusType).toBe('RACIAL');
  });

  it('should not compile effects when no race entity', () => {
    const { compileCharacterEffects } = require('../../../character/calculation/effects/compileEffects');

    const character = createCharacter();

    const compiled = compileCharacterEffects(character);

    // No race effects
    const raceEffects = compiled.all.filter(
      (e: any) => e.sourceRef?.startsWith('race:')
    );
    expect(raceEffects).toHaveLength(0);
  });

  it('should not compile effects when race has no effects field', () => {
    const { compileCharacterEffects } = require('../../../character/calculation/effects/compileEffects');

    const human = createHumanRace(); // humans have empty effects
    const character = createCharacter({
      raceEntity: human,
    });

    const compiled = compileCharacterEffects(character);

    const raceEffects = compiled.all.filter(
      (e: any) => e.sourceRef?.startsWith('race:')
    );
    expect(raceEffects).toHaveLength(0);
  });
});
