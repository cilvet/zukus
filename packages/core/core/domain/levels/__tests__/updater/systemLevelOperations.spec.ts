import { describe, it, expect } from 'bun:test';
import { setSystemLevels, removeSystemLevels } from '../../updater/systemLevelOperations';
import { updateProviderSelection, getProvider } from '../../updater/selectionOperations';
import type { CharacterBaseData } from '../../../character/baseData/character';
import type { CompendiumContext, ProviderLocation } from '../../updater/types';
import type { SystemLevelsEntity } from '../../storage/types';
import type { StandardEntity } from '../../../entities/types/base';

// =============================================================================
// Test Fixtures
// =============================================================================

const createCharacter = (overrides: Partial<CharacterBaseData> = {}): CharacterBaseData => ({
  name: 'Test Character',
  temporaryHp: 0,
  baseAbilityData: {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
  },
  ...overrides,
});

const createSystemLevelsEntity = (overrides: Partial<SystemLevelsEntity> = {}): SystemLevelsEntity => ({
  id: 'dnd35-system-levels',
  entityType: 'system_levels',
  name: 'D&D 3.5 System Levels',
  description: 'System level progression',
  levels: {
    '1': {
      providers: [
        {
          selector: {
            id: 'character-feat-1',
            name: 'Character Feat',
            entityType: 'feat',
            min: 1,
            max: 1,
          },
        },
      ],
    },
    '3': {
      providers: [
        {
          selector: {
            id: 'character-feat-3',
            name: 'Character Feat',
            entityType: 'feat',
            min: 1,
            max: 1,
          },
        },
      ],
    },
    '4': {
      providers: [
        {
          granted: {
            specificIds: ['strength-increase'],
          },
        },
      ],
    },
  },
  ...overrides,
});

const strengthIncrease: StandardEntity = {
  id: 'strength-increase',
  entityType: 'character_ability_increase',
  name: 'Strength Increase',
  description: '+1 to Strength',
} as StandardEntity;

const powerAttackFeat: StandardEntity = {
  id: 'power-attack',
  entityType: 'feat',
  name: 'Power Attack',
  description: 'Exchange attack for damage',
} as StandardEntity;

const createCompendiumContext = (
  systemLevels?: SystemLevelsEntity,
  entities: StandardEntity[] = []
): CompendiumContext => ({
  getClass: () => undefined,
  getSystemLevels: (id: string) => {
    if (systemLevels && systemLevels.id === id) {
      return systemLevels;
    }
    return undefined;
  },
  getEntity: (type: string, entityId: string) => {
    return entities.find(e => e.entityType === type && e.id === entityId);
  },
  getAllEntities: (type: string) => {
    return entities.filter(e => e.entityType === type);
  },
});

// =============================================================================
// setSystemLevels Tests
// =============================================================================

describe('setSystemLevels', () => {
  it('should set systemLevelsEntity on character', () => {
    const character = createCharacter();
    const systemLevels = createSystemLevelsEntity();
    const context = createCompendiumContext(systemLevels, [strengthIncrease]);

    const result = setSystemLevels(character, 'dnd35-system-levels', context);

    expect(result.warnings).toHaveLength(0);
    expect(result.character.systemLevelsEntity).toBeDefined();
    expect(result.character.systemLevelsEntity?.id).toBe('dnd35-system-levels');
  });

  it('should resolve granted entities to pool', () => {
    const character = createCharacter();
    const systemLevels = createSystemLevelsEntity();
    const context = createCompendiumContext(systemLevels, [strengthIncrease]);

    const result = setSystemLevels(character, 'dnd35-system-levels', context);

    const abilityIncreases = result.character.entities?.['character_ability_increase'] || [];
    expect(abilityIncreases.length).toBeGreaterThan(0);
    
    const instance = abilityIncreases.find(e => e.entity.id === 'strength-increase');
    expect(instance).toBeDefined();
    expect(instance?.applicable).toBe(false);
    expect(instance?.origin).toBe('characterLevel:4');
  });

  it('should warn if system levels not found in compendium', () => {
    const character = createCharacter();
    const context = createCompendiumContext(undefined);

    const result = setSystemLevels(character, 'nonexistent', context);

    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].type).toBe('system_levels_not_found');
    expect(result.character.systemLevelsEntity).toBeUndefined();
  });

  it('should replace existing system levels', () => {
    const oldSystemLevels = createSystemLevelsEntity({ id: 'old-system-levels' });
    const newSystemLevels = createSystemLevelsEntity({ id: 'new-system-levels' });
    
    const character = createCharacter({
      systemLevelsEntity: oldSystemLevels,
      entities: {
        character_ability_increase: [
          {
            instanceId: 'strength-increase@characterLevel-4',
            entity: strengthIncrease,
            applicable: true,
            origin: 'characterLevel:4',
          },
        ],
      },
    });
    
    const context = createCompendiumContext(newSystemLevels, [strengthIncrease]);

    const result = setSystemLevels(character, 'new-system-levels', context);

    expect(result.character.systemLevelsEntity?.id).toBe('new-system-levels');
  });

  it('should warn if granted entity not found in compendium', () => {
    const character = createCharacter();
    const systemLevels = createSystemLevelsEntity();
    // No entities provided - strength-increase won't be found
    const context = createCompendiumContext(systemLevels, []);

    const result = setSystemLevels(character, 'dnd35-system-levels', context);

    expect(result.warnings.some(w => w.type === 'entity_not_found')).toBe(true);
  });
});

// =============================================================================
// removeSystemLevels Tests
// =============================================================================

describe('removeSystemLevels', () => {
  it('should remove systemLevelsEntity from character', () => {
    const systemLevels = createSystemLevelsEntity();
    const character = createCharacter({
      systemLevelsEntity: systemLevels,
    });

    const result = removeSystemLevels(character);

    expect(result.warnings).toHaveLength(0);
    expect(result.character.systemLevelsEntity).toBeUndefined();
  });

  it('should remove entities with characterLevel origin', () => {
    const systemLevels = createSystemLevelsEntity();
    const character = createCharacter({
      systemLevelsEntity: systemLevels,
      entities: {
        character_ability_increase: [
          {
            instanceId: 'strength-increase@characterLevel-4',
            entity: strengthIncrease,
            applicable: true,
            origin: 'characterLevel:4',
          },
        ],
        feat: [
          {
            instanceId: 'power-attack@rogue-1',
            entity: powerAttackFeat,
            applicable: true,
            origin: 'classLevel:rogue-1',
          },
        ],
      },
    });

    const result = removeSystemLevels(character);

    // Should remove characterLevel entities
    expect(result.character.entities?.['character_ability_increase']).toHaveLength(0);
    // Should preserve classLevel entities
    expect(result.character.entities?.['feat']).toHaveLength(1);
  });

  it('should warn if no system levels to remove', () => {
    const character = createCharacter();

    const result = removeSystemLevels(character);

    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].type).toBe('system_levels_not_found');
  });
});

// =============================================================================
// updateProviderSelection - systemLevel location
// =============================================================================

describe('updateProviderSelection - systemLevel location', () => {
  it('should update selectedInstanceIds in system level provider', () => {
    const systemLevels = createSystemLevelsEntity();
    const character = createCharacter({
      systemLevelsEntity: systemLevels,
    });
    
    const location: ProviderLocation = {
      type: 'systemLevel',
      characterLevel: 1,
      providerIndex: 0,
    };

    const result = updateProviderSelection(character, location, ['power-attack@characterLevel-1']);

    expect(result.warnings).toHaveLength(0);
    const provider = result.character.systemLevelsEntity?.levels['1']?.providers?.[0];
    expect(provider?.selectedInstanceIds).toEqual(['power-attack@characterLevel-1']);
  });

  it('should warn if no system levels entity', () => {
    const character = createCharacter();
    
    const location: ProviderLocation = {
      type: 'systemLevel',
      characterLevel: 1,
      providerIndex: 0,
    };

    const result = updateProviderSelection(character, location, ['power-attack@characterLevel-1']);

    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].type).toBe('system_levels_not_found');
  });

  it('should warn if character level not found', () => {
    const systemLevels = createSystemLevelsEntity();
    const character = createCharacter({
      systemLevelsEntity: systemLevels,
    });
    
    const location: ProviderLocation = {
      type: 'systemLevel',
      characterLevel: 99,
      providerIndex: 0,
    };

    const result = updateProviderSelection(character, location, ['some-id']);

    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].type).toBe('provider_not_found');
  });

  it('should warn if provider index out of bounds', () => {
    const systemLevels = createSystemLevelsEntity();
    const character = createCharacter({
      systemLevelsEntity: systemLevels,
    });
    
    const location: ProviderLocation = {
      type: 'systemLevel',
      characterLevel: 1,
      providerIndex: 99,
    };

    const result = updateProviderSelection(character, location, ['some-id']);

    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].type).toBe('provider_not_found');
  });

  it('should preserve other providers in same level', () => {
    const systemLevelsWithMultipleProviders = createSystemLevelsEntity({
      levels: {
        '1': {
          providers: [
            {
              selector: {
                id: 'feat-selector-1',
                name: 'Feat 1',
                entityType: 'feat',
                min: 1,
                max: 1,
              },
            },
            {
              selector: {
                id: 'feat-selector-2',
                name: 'Feat 2',
                entityType: 'feat',
                min: 1,
                max: 1,
                selectedInstanceIds: ['existing-selection'],
              },
            },
          ],
        },
      },
    });
    
    const character = createCharacter({
      systemLevelsEntity: systemLevelsWithMultipleProviders,
    });
    
    const location: ProviderLocation = {
      type: 'systemLevel',
      characterLevel: 1,
      providerIndex: 0,
    };

    const result = updateProviderSelection(character, location, ['new-selection']);

    const providers = result.character.systemLevelsEntity?.levels['1']?.providers;
    expect(providers?.[0]?.selectedInstanceIds).toEqual(['new-selection']);
    expect(providers?.[1]?.selector?.selectedInstanceIds).toEqual(['existing-selection']);
  });
});

// =============================================================================
// getProvider - systemLevel location
// =============================================================================

describe('getProvider - systemLevel location', () => {
  it('should return provider from system level', () => {
    const systemLevels = createSystemLevelsEntity();
    const character = createCharacter({
      systemLevelsEntity: systemLevels,
    });
    
    const location: ProviderLocation = {
      type: 'systemLevel',
      characterLevel: 1,
      providerIndex: 0,
    };

    const provider = getProvider(character, location);

    expect(provider).toBeDefined();
    expect(provider?.selector?.id).toBe('character-feat-1');
  });

  it('should return undefined if no system levels entity', () => {
    const character = createCharacter();
    
    const location: ProviderLocation = {
      type: 'systemLevel',
      characterLevel: 1,
      providerIndex: 0,
    };

    const provider = getProvider(character, location);

    expect(provider).toBeUndefined();
  });

  it('should return undefined if character level not found', () => {
    const systemLevels = createSystemLevelsEntity();
    const character = createCharacter({
      systemLevelsEntity: systemLevels,
    });
    
    const location: ProviderLocation = {
      type: 'systemLevel',
      characterLevel: 99,
      providerIndex: 0,
    };

    const provider = getProvider(character, location);

    expect(provider).toBeUndefined();
  });

  it('should return undefined if provider index out of bounds', () => {
    const systemLevels = createSystemLevelsEntity();
    const character = createCharacter({
      systemLevelsEntity: systemLevels,
    });
    
    const location: ProviderLocation = {
      type: 'systemLevel',
      characterLevel: 1,
      providerIndex: 99,
    };

    const provider = getProvider(character, location);

    expect(provider).toBeUndefined();
  });
});

