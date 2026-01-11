import { describe, it, expect } from 'bun:test';
import {
  setLevelSlotClass,
  setLevelSlotHp,
  addLevelSlot,
  removeLastLevelSlot,
  getCharacterLevel,
  getClassLevel,
} from '../../updater/levelSlots';
import type { CharacterBaseData } from '../../../character/baseData/character';
import { buildCharacter } from '../../../../tests';

// =============================================================================
// setLevelSlotClass Tests
// =============================================================================

describe('setLevelSlotClass', () => {
  it('should create levelSlots array if it does not exist', () => {
    const character = buildCharacter().build();
    
    const result = setLevelSlotClass(character, 0, 'fighter');
    
    expect(result.character.levelSlots).toBeDefined();
    expect(result.character.levelSlots).toHaveLength(1);
    expect(result.character.levelSlots![0].classId).toBe('fighter');
  });

  it('should expand levelSlots array to accommodate higher indices', () => {
    const character = buildCharacter().build();
    
    const result = setLevelSlotClass(character, 2, 'rogue');
    
    expect(result.character.levelSlots).toHaveLength(3);
    expect(result.character.levelSlots![0].classId).toBeNull();
    expect(result.character.levelSlots![1].classId).toBeNull();
    expect(result.character.levelSlots![2].classId).toBe('rogue');
  });

  it('should update existing slot without affecting others', () => {
    const character: CharacterBaseData = {
      ...buildCharacter().build(),
      levelSlots: [
        { classId: 'fighter', hpRoll: 10 },
        { classId: 'fighter', hpRoll: 6 },
      ],
    };
    
    const result = setLevelSlotClass(character, 1, 'rogue');
    
    expect(result.character.levelSlots![0].classId).toBe('fighter');
    expect(result.character.levelSlots![0].hpRoll).toBe(10);
    expect(result.character.levelSlots![1].classId).toBe('rogue');
    expect(result.character.levelSlots![1].hpRoll).toBe(6); // Preserved
  });

  it('should allow setting classId to null', () => {
    const character: CharacterBaseData = {
      ...buildCharacter().build(),
      levelSlots: [{ classId: 'fighter', hpRoll: 10 }],
    };
    
    const result = setLevelSlotClass(character, 0, null);
    
    expect(result.character.levelSlots![0].classId).toBeNull();
    expect(result.character.levelSlots![0].hpRoll).toBe(10); // Preserved
  });

  it('should warn if classId does not exist in classEntities', () => {
    const character = buildCharacter().build();
    
    const result = setLevelSlotClass(character, 0, 'nonexistent');
    
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].type).toBe('class_not_found');
    // Still sets the value (warning is non-blocking)
    expect(result.character.levelSlots![0].classId).toBe('nonexistent');
  });

  it('should not warn if class exists in classEntities', () => {
    const character: CharacterBaseData = {
      ...buildCharacter().build(),
      classEntities: {
        fighter: {
          id: 'fighter',
          entityType: 'class',
          name: 'Fighter',
          hitDie: 10,
          babProgression: 'full',
          saves: { fortitude: 'good', reflex: 'poor', will: 'poor' },
          skillPointsPerLevel: '2',
          classSkillIds: ['climb'],
          classType: 'base',
          levels: {},
        },
      },
    };
    
    const result = setLevelSlotClass(character, 0, 'fighter');
    
    expect(result.warnings).toHaveLength(0);
  });
});

// =============================================================================
// setLevelSlotHp Tests
// =============================================================================

describe('setLevelSlotHp', () => {
  it('should create levelSlots array if it does not exist', () => {
    const character = buildCharacter().build();
    
    const result = setLevelSlotHp(character, 0, 10);
    
    expect(result.character.levelSlots).toBeDefined();
    expect(result.character.levelSlots![0].hpRoll).toBe(10);
  });

  it('should preserve classId when setting hpRoll', () => {
    const character: CharacterBaseData = {
      ...buildCharacter().build(),
      levelSlots: [{ classId: 'fighter', hpRoll: null }],
    };
    
    const result = setLevelSlotHp(character, 0, 8);
    
    expect(result.character.levelSlots![0].classId).toBe('fighter');
    expect(result.character.levelSlots![0].hpRoll).toBe(8);
  });
});

// =============================================================================
// addLevelSlot Tests
// =============================================================================

describe('addLevelSlot', () => {
  it('should add empty slot by default', () => {
    const character = buildCharacter().build();
    
    const result = addLevelSlot(character);
    
    expect(result.character.levelSlots).toHaveLength(1);
    expect(result.character.levelSlots![0]).toEqual({ classId: null, hpRoll: null });
  });

  it('should add slot with provided values', () => {
    const character = buildCharacter().build();
    
    const result = addLevelSlot(character, { classId: 'wizard', hpRoll: 4 });
    
    expect(result.character.levelSlots![0]).toEqual({ classId: 'wizard', hpRoll: 4 });
  });

  it('should append to existing slots', () => {
    const character: CharacterBaseData = {
      ...buildCharacter().build(),
      levelSlots: [{ classId: 'fighter', hpRoll: 10 }],
    };
    
    const result = addLevelSlot(character, { classId: 'rogue', hpRoll: 6 });
    
    expect(result.character.levelSlots).toHaveLength(2);
    expect(result.character.levelSlots![1]).toEqual({ classId: 'rogue', hpRoll: 6 });
  });
});

// =============================================================================
// removeLastLevelSlot Tests
// =============================================================================

describe('removeLastLevelSlot', () => {
  it('should remove the last slot', () => {
    const character: CharacterBaseData = {
      ...buildCharacter().build(),
      levelSlots: [
        { classId: 'fighter', hpRoll: 10 },
        { classId: 'fighter', hpRoll: 6 },
      ],
    };
    
    const result = removeLastLevelSlot(character);
    
    expect(result.character.levelSlots).toHaveLength(1);
    expect(result.character.levelSlots![0].hpRoll).toBe(10);
  });

  it('should warn when no slots to remove', () => {
    const character = buildCharacter().build();
    
    const result = removeLastLevelSlot(character);
    
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].type).toBe('invalid_index');
  });

  it('should result in empty array after removing last slot', () => {
    const character: CharacterBaseData = {
      ...buildCharacter().build(),
      levelSlots: [{ classId: 'fighter', hpRoll: 10 }],
    };
    
    const result = removeLastLevelSlot(character);
    
    expect(result.character.levelSlots).toHaveLength(0);
  });
});

// =============================================================================
// getCharacterLevel Tests
// =============================================================================

describe('getCharacterLevel', () => {
  it('should return 0 for character without levelSlots', () => {
    const character = buildCharacter().build();
    
    expect(getCharacterLevel(character)).toBe(0);
  });

  it('should count only slots with classId', () => {
    const character: CharacterBaseData = {
      ...buildCharacter().build(),
      levelSlots: [
        { classId: 'fighter', hpRoll: 10 },
        { classId: null, hpRoll: null },
        { classId: 'rogue', hpRoll: 6 },
      ],
    };
    
    expect(getCharacterLevel(character)).toBe(2);
  });
});

// =============================================================================
// getClassLevel Tests
// =============================================================================

describe('getClassLevel', () => {
  it('should return 0 for class not in slots', () => {
    const character: CharacterBaseData = {
      ...buildCharacter().build(),
      levelSlots: [{ classId: 'fighter', hpRoll: 10 }],
    };
    
    expect(getClassLevel(character, 'wizard')).toBe(0);
  });

  it('should count levels in specific class', () => {
    const character: CharacterBaseData = {
      ...buildCharacter().build(),
      levelSlots: [
        { classId: 'fighter', hpRoll: 10 },
        { classId: 'fighter', hpRoll: 8 },
        { classId: 'rogue', hpRoll: 6 },
        { classId: 'fighter', hpRoll: 7 },
      ],
    };
    
    expect(getClassLevel(character, 'fighter')).toBe(3);
    expect(getClassLevel(character, 'rogue')).toBe(1);
  });
});

