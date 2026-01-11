import { describe, it, expect } from 'bun:test';
import { buildCharacter } from '../../../../tests/character/buildCharacter';
import {
  toggleBuff,
  addBuff,
  editBuff,
  deleteBuff,
  toggleSharedBuff,
} from '../operations/buffOperations';
import type { Buff } from '../../baseData/buffs';

describe('toggleBuff', () => {
  it('should toggle buff active state from true to false', () => {
    const activeBuff: Buff = {
      uniqueId: 'buff-1',
      name: 'Test Buff',
      description: 'A test buff',
      active: true,
      changes: [],
    };

    const character = buildCharacter().withBuff(activeBuff).build();
    const result = toggleBuff(character, 'buff-1');

    expect(result.warnings).toHaveLength(0);
    expect(result.character.buffs[0].active).toBe(false);
  });

  it('should toggle buff active state from false to true', () => {
    const inactiveBuff: Buff = {
      uniqueId: 'buff-1',
      name: 'Test Buff',
      description: 'A test buff',
      active: false,
      changes: [],
    };

    const character = buildCharacter().withBuff(inactiveBuff).build();
    const result = toggleBuff(character, 'buff-1');

    expect(result.warnings).toHaveLength(0);
    expect(result.character.buffs[0].active).toBe(true);
  });

  it('should return warning if buff not found', () => {
    const character = buildCharacter().build();
    const result = toggleBuff(character, 'nonexistent');

    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].type).toBe('not_found');
    expect(result.warnings[0].message).toBe('Buff not found');
  });
});

describe('addBuff', () => {
  it('should add a valid buff', () => {
    const newBuff: Buff = {
      uniqueId: 'buff-1',
      name: 'Test Buff',
      description: 'A test buff',
      active: true,
      changes: [],
    };

    const character = buildCharacter().build();
    const result = addBuff(character, newBuff);

    expect(result.warnings).toHaveLength(0);
    expect(result.character.buffs).toHaveLength(1);
    expect(result.character.buffs[0].uniqueId).toBe('buff-1');
  });

  it('should return warning for invalid buff (empty name)', () => {
    const invalidBuff: Buff = {
      uniqueId: 'buff-1',
      name: '',
      description: 'A test buff',
      active: true,
      changes: [],
    };

    const character = buildCharacter().build();
    const result = addBuff(character, invalidBuff);

    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].type).toBe('invalid_data');
  });

  it('should return warning for duplicate buff', () => {
    const existingBuff: Buff = {
      uniqueId: 'buff-1',
      name: 'Test Buff',
      description: 'A test buff',
      active: true,
      changes: [],
    };

    const character = buildCharacter().withBuff(existingBuff).build();
    const result = addBuff(character, existingBuff);

    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].type).toBe('already_exists');
  });
});

describe('editBuff', () => {
  it('should edit an existing buff', () => {
    const originalBuff: Buff = {
      uniqueId: 'buff-1',
      name: 'Original Name',
      description: 'Original description',
      active: true,
      changes: [],
    };

    const editedBuff: Buff = {
      ...originalBuff,
      name: 'Edited Name',
      description: 'Edited description',
    };

    const character = buildCharacter().withBuff(originalBuff).build();
    const result = editBuff(character, editedBuff);

    expect(result.warnings).toHaveLength(0);
    expect(result.character.buffs[0].name).toBe('Edited Name');
    expect(result.character.buffs[0].description).toBe('Edited description');
  });

  it('should return warning for invalid buff', () => {
    const invalidBuff: Buff = {
      uniqueId: 'buff-1',
      name: '',
      description: 'Test',
      active: true,
      changes: [],
    };

    const character = buildCharacter().build();
    const result = editBuff(character, invalidBuff);

    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].type).toBe('invalid_data');
  });
});

describe('deleteBuff', () => {
  it('should delete an existing buff', () => {
    const buff: Buff = {
      uniqueId: 'buff-1',
      name: 'Test Buff',
      description: 'A test buff',
      active: true,
      changes: [],
    };

    const character = buildCharacter().withBuff(buff).build();
    const result = deleteBuff(character, 'buff-1');

    expect(result.warnings).toHaveLength(0);
    expect(result.character.buffs).toHaveLength(0);
  });

  it('should return warning if buff not found', () => {
    const character = buildCharacter().build();
    const result = deleteBuff(character, 'nonexistent');

    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].type).toBe('not_found');
  });
});

describe('toggleSharedBuff', () => {
  it('should activate a shared buff', () => {
    const sharedBuff: Buff = {
      uniqueId: 'shared-1',
      name: 'Shared Buff',
      description: 'A shared buff',
      active: true,
      changes: [],
    };

    const character = buildCharacter().build();
    const result = toggleSharedBuff(character, 'shared-1', [sharedBuff]);

    expect(result.warnings).toHaveLength(0);
    expect(result.character.sharedBuffs).toHaveLength(1);
    expect(result.character.sharedBuffs[0].uniqueId).toBe('shared-1');
    expect(result.character.sharedBuffs[0].active).toBe(true);
  });

  it('should deactivate a shared buff', () => {
    const sharedBuff: Buff = {
      uniqueId: 'shared-1',
      name: 'Shared Buff',
      description: 'A shared buff',
      active: true,
      changes: [],
    };

    const character = buildCharacter().build();
    character.sharedBuffs = [sharedBuff];

    const result = toggleSharedBuff(character, 'shared-1', [sharedBuff]);

    expect(result.warnings).toHaveLength(0);
    expect(result.character.sharedBuffs).toHaveLength(0);
  });

  it('should return warning if shared buff not found', () => {
    const character = buildCharacter().build();
    const result = toggleSharedBuff(character, 'nonexistent', []);

    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].type).toBe('not_found');
  });
});

