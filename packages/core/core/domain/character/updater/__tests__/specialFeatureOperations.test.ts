import { describe, it, expect } from 'bun:test';
import { buildCharacter } from '../../../../tests/character/buildCharacter';
import {
  addSpecialFeature,
  updateSpecialFeature,
  removeSpecialFeature,
  setSpecialFeatures,
} from '../operations/specialFeatureOperations';
import type { SpecialFeature } from '../../baseData/character';

describe('addSpecialFeature', () => {
  it('should add a special feature', () => {
    const feature: SpecialFeature = {
      uniqueId: 'feature-1',
      name: 'Test Feature',
      description: 'A test feature',
      changes: [],
    };

    const character = buildCharacter().build();
    const result = addSpecialFeature(character, feature);

    expect(result.warnings).toHaveLength(0);
    expect(result.character.specialFeatures).toHaveLength(1);
    expect(result.character.specialFeatures![0].uniqueId).toBe('feature-1');
  });

  it('should return warning for duplicate feature', () => {
    const feature: SpecialFeature = {
      uniqueId: 'feature-1',
      name: 'Test Feature',
      description: 'A test feature',
      changes: [],
    };

    const character = buildCharacter().withSpecialFeatures([feature]).build();
    const result = addSpecialFeature(character, feature);

    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].type).toBe('already_exists');
  });

  it('should work when character has no special features', () => {
    const feature: SpecialFeature = {
      uniqueId: 'feature-1',
      name: 'Test Feature',
      description: 'A test feature',
      changes: [],
    };

    const character = buildCharacter().build();
    character.specialFeatures = undefined;

    const result = addSpecialFeature(character, feature);

    expect(result.warnings).toHaveLength(0);
    expect(result.character.specialFeatures).toHaveLength(1);
  });
});

describe('updateSpecialFeature', () => {
  it('should update an existing special feature', () => {
    const originalFeature: SpecialFeature = {
      uniqueId: 'feature-1',
      name: 'Original Name',
      description: 'Original description',
      changes: [],
    };

    const updatedFeature: SpecialFeature = {
      ...originalFeature,
      name: 'Updated Name',
      description: 'Updated description',
    };

    const character = buildCharacter()
      .withSpecialFeatures([originalFeature])
      .build();
    const result = updateSpecialFeature(character, 'feature-1', updatedFeature);

    expect(result.warnings).toHaveLength(0);
    expect(result.character.specialFeatures![0].name).toBe('Updated Name');
    expect(result.character.specialFeatures![0].description).toBe(
      'Updated description'
    );
  });

  it('should return warning if feature not found', () => {
    const feature: SpecialFeature = {
      uniqueId: 'nonexistent',
      name: 'Test',
      description: 'Test',
      changes: [],
    };

    const character = buildCharacter().build();
    const result = updateSpecialFeature(character, 'nonexistent', feature);

    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].type).toBe('not_found');
  });

  it('should return warning if character has no special features', () => {
    const feature: SpecialFeature = {
      uniqueId: 'feature-1',
      name: 'Test',
      description: 'Test',
      changes: [],
    };

    const character = buildCharacter().build();
    character.specialFeatures = undefined;

    const result = updateSpecialFeature(character, 'feature-1', feature);

    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].type).toBe('not_found');
  });
});

describe('removeSpecialFeature', () => {
  it('should remove an existing special feature', () => {
    const feature: SpecialFeature = {
      uniqueId: 'feature-1',
      name: 'Test Feature',
      description: 'A test feature',
      changes: [],
    };

    const character = buildCharacter().withSpecialFeatures([feature]).build();
    const result = removeSpecialFeature(character, 'feature-1');

    expect(result.warnings).toHaveLength(0);
    expect(result.character.specialFeatures).toHaveLength(0);
  });

  it('should return warning if feature not found', () => {
    const character = buildCharacter().build();
    const result = removeSpecialFeature(character, 'nonexistent');

    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].type).toBe('not_found');
  });

  it('should return warning if character has no special features', () => {
    const character = buildCharacter().build();
    character.specialFeatures = undefined;

    const result = removeSpecialFeature(character, 'feature-1');

    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].type).toBe('not_found');
  });
});

describe('setSpecialFeatures', () => {
  it('should replace all special features', () => {
    const oldFeature: SpecialFeature = {
      uniqueId: 'old',
      name: 'Old Feature',
      description: 'Old',
      changes: [],
    };

    const newFeatures: SpecialFeature[] = [
      {
        uniqueId: 'new-1',
        name: 'New Feature 1',
        description: 'New 1',
        changes: [],
      },
      {
        uniqueId: 'new-2',
        name: 'New Feature 2',
        description: 'New 2',
        changes: [],
      },
    ];

    const character = buildCharacter()
      .withSpecialFeatures([oldFeature])
      .build();
    const result = setSpecialFeatures(character, newFeatures);

    expect(result.warnings).toHaveLength(0);
    expect(result.character.specialFeatures).toHaveLength(2);
    expect(result.character.specialFeatures![0].uniqueId).toBe('new-1');
    expect(result.character.specialFeatures![1].uniqueId).toBe('new-2');
  });

  it('should work with empty array', () => {
    const feature: SpecialFeature = {
      uniqueId: 'feature-1',
      name: 'Test Feature',
      description: 'Test',
      changes: [],
    };

    const character = buildCharacter().withSpecialFeatures([feature]).build();
    const result = setSpecialFeatures(character, []);

    expect(result.warnings).toHaveLength(0);
    expect(result.character.specialFeatures).toHaveLength(0);
  });
});

