import { describe, it, expect } from 'bun:test';
import {
  getInstanceFieldsFromCompendium,
  hasInstanceFieldsFromCompendium,
  hasInstanceField,
  getInstanceField,
} from '../getInstanceFields';
import { dnd35ExampleCompendium } from '../../../compendiums';

describe('getInstanceFieldsFromCompendium', () => {
  describe('with D&D 3.5 compendium', () => {
    it('should return equipped field for armor', () => {
      const fields = getInstanceFieldsFromCompendium('armor', dnd35ExampleCompendium);

      expect(fields.length).toBeGreaterThan(0);
      const equippedField = fields.find((f) => f.name === 'equipped');
      expect(equippedField).toBeDefined();
      expect(equippedField?.type).toBe('boolean');
      expect(equippedField?.default).toBe(false);
    });

    it('should return equipped field for shield', () => {
      const fields = getInstanceFieldsFromCompendium('shield', dnd35ExampleCompendium);

      expect(fields.length).toBeGreaterThan(0);
      const equippedField = fields.find((f) => f.name === 'equipped');
      expect(equippedField).toBeDefined();
      expect(equippedField?.type).toBe('boolean');
    });

    it('should return equipped field for wondrousItem', () => {
      const fields = getInstanceFieldsFromCompendium('wondrousItem', dnd35ExampleCompendium);

      expect(fields.length).toBeGreaterThan(0);
      const equippedField = fields.find((f) => f.name === 'equipped');
      expect(equippedField).toBeDefined();
      expect(equippedField?.type).toBe('boolean');
    });

    it('should return equipped field for weapon', () => {
      const fields = getInstanceFieldsFromCompendium('weapon', dnd35ExampleCompendium);

      expect(fields.length).toBeGreaterThan(0);
      const equippedField = fields.find((f) => f.name === 'equipped');
      expect(equippedField).toBeDefined();
      expect(equippedField?.type).toBe('boolean');
      expect(equippedField?.default).toBe(false);
    });

    it('should return empty array for spell (no instance fields)', () => {
      const fields = getInstanceFieldsFromCompendium('spell', dnd35ExampleCompendium);

      expect(fields).toEqual([]);
    });

    it('should return empty array for unknown entity type', () => {
      const fields = getInstanceFieldsFromCompendium('unknownType', dnd35ExampleCompendium);

      expect(fields).toEqual([]);
    });
  });

  describe('hasInstanceFieldsFromCompendium', () => {
    it('should return true for armor', () => {
      expect(hasInstanceFieldsFromCompendium('armor', dnd35ExampleCompendium)).toBe(true);
    });

    it('should return true for shield', () => {
      expect(hasInstanceFieldsFromCompendium('shield', dnd35ExampleCompendium)).toBe(true);
    });

    it('should return true for wondrousItem', () => {
      expect(hasInstanceFieldsFromCompendium('wondrousItem', dnd35ExampleCompendium)).toBe(true);
    });

    it('should return false for spell', () => {
      expect(hasInstanceFieldsFromCompendium('spell', dnd35ExampleCompendium)).toBe(false);
    });

    it('should return true for weapon', () => {
      expect(hasInstanceFieldsFromCompendium('weapon', dnd35ExampleCompendium)).toBe(true);
    });

    it('should have equipped instance field for weapon', () => {
      expect(hasInstanceField('weapon', 'equipped', dnd35ExampleCompendium)).toBe(true);
    });
  });

  describe('hasInstanceField', () => {
    it('should return true when armor has equipped field', () => {
      expect(hasInstanceField('armor', 'equipped', dnd35ExampleCompendium)).toBe(true);
    });

    it('should return true when shield has equipped field', () => {
      expect(hasInstanceField('shield', 'equipped', dnd35ExampleCompendium)).toBe(true);
    });

    it('should return false when armor does not have wielded field', () => {
      expect(hasInstanceField('armor', 'wielded', dnd35ExampleCompendium)).toBe(false);
    });

    it('should return false for spell with any field', () => {
      expect(hasInstanceField('spell', 'equipped', dnd35ExampleCompendium)).toBe(false);
    });

    it('should return false for unknown entity type', () => {
      expect(hasInstanceField('unknownType', 'equipped', dnd35ExampleCompendium)).toBe(false);
    });
  });

  describe('getInstanceField', () => {
    it('should return equipped field definition for armor', () => {
      const field = getInstanceField('armor', 'equipped', dnd35ExampleCompendium);

      expect(field).toBeDefined();
      expect(field?.name).toBe('equipped');
      expect(field?.type).toBe('boolean');
      expect(field?.default).toBe(false);
    });

    it('should return undefined for non-existent field', () => {
      const field = getInstanceField('armor', 'wielded', dnd35ExampleCompendium);

      expect(field).toBeUndefined();
    });

    it('should return undefined for unknown entity type', () => {
      const field = getInstanceField('unknownType', 'equipped', dnd35ExampleCompendium);

      expect(field).toBeUndefined();
    });

    it('should return undefined for entity type without instance fields', () => {
      const field = getInstanceField('spell', 'equipped', dnd35ExampleCompendium);

      expect(field).toBeUndefined();
    });
  });
});
