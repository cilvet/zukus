import { describe, it, expect } from 'bun:test';
import { getBuildString } from './getBuildString';
import type { CharacterBaseData } from '../../baseData/character';

function makeCharacter(overrides: Partial<CharacterBaseData> = {}): CharacterBaseData {
  return {
    name: 'Test',
    currentDamage: 0,
    temporaryHp: 0,
    currentTemporalHp: 0,
    baseAbilityData: {
      strength: { baseScore: 10 },
      dexterity: { baseScore: 10 },
      constitution: { baseScore: 10 },
      intelligence: { baseScore: 10 },
      wisdom: { baseScore: 10 },
      charisma: { baseScore: 10 },
    },
    equipment: { items: [], money: 0 },
    skills: {},
    classes: [],
    level: { level: 1, xp: 0, levelsData: [] },
    skillData: {},
    feats: [],
    buffs: [],
    sharedBuffs: [],
    updatedAt: '',
    ...overrides,
  } as CharacterBaseData;
}

describe('getBuildString', () => {
  it('returns null for a character with no classes', () => {
    const char = makeCharacter();
    expect(getBuildString(char)).toBeNull();
  });

  it('returns build string from legacy system', () => {
    const char = makeCharacter({
      classes: [
        { uniqueId: 'fighter', name: 'Fighter' } as any,
        { uniqueId: 'wizard', name: 'Wizard' } as any,
      ],
      level: {
        level: 5,
        xp: 0,
        levelsData: [
          { classUniqueId: 'fighter' },
          { classUniqueId: 'fighter' },
          { classUniqueId: 'fighter' },
          { classUniqueId: 'wizard' },
          { classUniqueId: 'wizard' },
        ] as any,
      },
    });
    expect(getBuildString(char)).toBe('Fighter 3 / Wizard 2');
  });

  it('returns build string from new level system', () => {
    const char = makeCharacter({
      levelSlots: [
        { classId: 'rogue', hpRoll: 6 },
        { classId: 'rogue', hpRoll: 4 },
        { classId: 'fighter', hpRoll: 10 },
      ],
      classEntities: {
        rogue: { name: 'Rogue', entityType: 'class' } as any,
        fighter: { name: 'Fighter', entityType: 'class' } as any,
      },
      level: { level: 3, xp: 0, levelsData: [] },
    });
    expect(getBuildString(char)).toBe('Rogue 2 / Fighter 1');
  });

  it('uses classId as fallback when class name is missing', () => {
    const char = makeCharacter({
      levelSlots: [
        { classId: 'unknown-class', hpRoll: 8 },
      ],
      classEntities: {},
      level: { level: 1, xp: 0, levelsData: [] },
    });
    expect(getBuildString(char)).toBe('unknown-class 1');
  });

  it('respects current level (only counts active slots)', () => {
    const char = makeCharacter({
      levelSlots: [
        { classId: 'fighter', hpRoll: 10 },
        { classId: 'fighter', hpRoll: 8 },
        { classId: 'wizard', hpRoll: 4 },
      ],
      classEntities: {
        fighter: { name: 'Fighter', entityType: 'class' } as any,
        wizard: { name: 'Wizard', entityType: 'class' } as any,
      },
      level: { level: 2, xp: 0, levelsData: [] },
    });
    // Only 2 slots active (level 2), so wizard at slot 3 should not count
    expect(getBuildString(char)).toBe('Fighter 2');
  });

  it('returns single class build string', () => {
    const char = makeCharacter({
      classes: [
        { uniqueId: 'cleric', name: 'Cleric' } as any,
      ],
      level: {
        level: 5,
        xp: 0,
        levelsData: [
          { classUniqueId: 'cleric' },
          { classUniqueId: 'cleric' },
          { classUniqueId: 'cleric' },
          { classUniqueId: 'cleric' },
          { classUniqueId: 'cleric' },
        ] as any,
      },
    });
    expect(getBuildString(char)).toBe('Cleric 5');
  });
});
