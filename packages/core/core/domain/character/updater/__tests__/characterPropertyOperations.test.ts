import { describe, it, expect } from 'bun:test';
import { buildCharacter } from '../../../../tests/character/buildCharacter';
import { setName, setTheme } from '../operations/characterPropertyOperations';

describe('setName', () => {
  it('should update character name', () => {
    const character = buildCharacter().withName('Old Name').build();
    const result = setName(character, 'New Name');

    expect(result.warnings).toHaveLength(0);
    expect(result.character.name).toBe('New Name');
  });

  it('should work with empty string', () => {
    const character = buildCharacter().withName('Test').build();
    const result = setName(character, '');

    expect(result.warnings).toHaveLength(0);
    expect(result.character.name).toBe('');
  });
});

describe('setTheme', () => {
  it('should update character theme', () => {
    const character = buildCharacter().build();
    const result = setTheme(character, 'dark-theme');

    expect(result.warnings).toHaveLength(0);
    expect(result.character.theme).toBe('dark-theme');
  });

  it('should overwrite existing theme', () => {
    const character = buildCharacter().build();
    character.theme = 'old-theme';

    const result = setTheme(character, 'new-theme');

    expect(result.warnings).toHaveLength(0);
    expect(result.character.theme).toBe('new-theme');
  });
});

