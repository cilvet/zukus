import { describe, expect, it } from 'bun:test';
import { createEntitySchemaWithAddons } from '../../entities/createEntitySchemaWithAddons';
import { defaultAddonRegistry } from '../../entities/defaultAddons';
import type { AddonRegistry } from '../../entities/types';
import type { EntitySchemaDefinition } from '../../../entities/types/schema';

describe('createEntitySchemaWithAddons', () => {
  describe('base fields (implicit)', () => {
    it('should always include id field', () => {
      const definition: EntitySchemaDefinition = {
        typeName: 'testEntity',
        fields: [],
        addons: [],
      };

      const schema = createEntitySchemaWithAddons(definition, defaultAddonRegistry);
      
      const validEntity = { id: 'test-1', entityType: 'testEntity' };
      const result = schema.safeParse(validEntity);
      
      expect(result.success).toBe(true);
    });

    it('should always include entityType field', () => {
      const definition: EntitySchemaDefinition = {
        typeName: 'testEntity',
        fields: [],
        addons: [],
      };

      const schema = createEntitySchemaWithAddons(definition, defaultAddonRegistry);
      
      const invalidEntity = { id: 'test-1' }; // missing entityType
      const result = schema.safeParse(invalidEntity);
      
      expect(result.success).toBe(false);
    });
  });

  describe('addon field injection', () => {
    it('should inject searchable addon fields', () => {
      const definition: EntitySchemaDefinition = {
        typeName: 'testEntity',
        fields: [],
        addons: ['searchable'],
      };

      const schema = createEntitySchemaWithAddons(definition, defaultAddonRegistry);
      
      // name is required by searchable addon
      const withName = { id: 'test-1', entityType: 'testEntity', name: 'Test' };
      const withoutName = { id: 'test-1', entityType: 'testEntity' };
      
      expect(schema.safeParse(withName).success).toBe(true);
      expect(schema.safeParse(withoutName).success).toBe(false);
    });

    it('should inject taggable addon fields', () => {
      const definition: EntitySchemaDefinition = {
        typeName: 'testEntity',
        fields: [],
        addons: ['taggable'],
      };

      const schema = createEntitySchemaWithAddons(definition, defaultAddonRegistry);
      
      const withTags = { id: 'test-1', entityType: 'testEntity', tags: ['combat', 'magic'] };
      const withoutTags = { id: 'test-1', entityType: 'testEntity' };
      
      // tags is optional
      expect(schema.safeParse(withTags).success).toBe(true);
      expect(schema.safeParse(withoutTags).success).toBe(true);
    });

    it('should inject effectful addon fields', () => {
      const definition: EntitySchemaDefinition = {
        typeName: 'testEntity',
        fields: [],
        addons: ['effectful'],
      };

      const schema = createEntitySchemaWithAddons(definition, defaultAddonRegistry);
      
      const withEffects = { 
        id: 'test-1', 
        entityType: 'testEntity', 
        effects: [],
        specialEffects: [],
      };
      const withoutEffects = { id: 'test-1', entityType: 'testEntity' };
      
      // effects are optional
      expect(schema.safeParse(withEffects).success).toBe(true);
      expect(schema.safeParse(withoutEffects).success).toBe(true);
    });

    it('should inject suppressing addon fields', () => {
      const definition: EntitySchemaDefinition = {
        typeName: 'testEntity',
        fields: [],
        addons: ['suppressing'],
      };

      const schema = createEntitySchemaWithAddons(definition, defaultAddonRegistry);
      
      const withSuppression = { 
        id: 'test-1', 
        entityType: 'testEntity', 
        suppression: [],
      };
      const withoutSuppression = { id: 'test-1', entityType: 'testEntity' };
      
      // suppression is optional
      expect(schema.safeParse(withSuppression).success).toBe(true);
      expect(schema.safeParse(withoutSuppression).success).toBe(true);
    });
  });

  describe('multiple addons', () => {
    it('should inject fields from multiple addons', () => {
      const definition: EntitySchemaDefinition = {
        typeName: 'testEntity',
        fields: [],
        addons: ['searchable', 'taggable', 'effectful'],
      };

      const schema = createEntitySchemaWithAddons(definition, defaultAddonRegistry);
      
      const entity = { 
        id: 'test-1', 
        entityType: 'testEntity',
        name: 'Test Entity',
        description: 'A test',
        tags: ['test'],
        effects: [],
      };
      
      expect(schema.safeParse(entity).success).toBe(true);
    });

    it('should combine required fields from all addons', () => {
      const definition: EntitySchemaDefinition = {
        typeName: 'testEntity',
        fields: [],
        addons: ['searchable', 'taggable'],
      };

      const schema = createEntitySchemaWithAddons(definition, defaultAddonRegistry);
      
      // searchable requires name
      const withName = { id: 'test-1', entityType: 'testEntity', name: 'Test' };
      const withoutName = { id: 'test-1', entityType: 'testEntity' };
      
      expect(schema.safeParse(withName).success).toBe(true);
      expect(schema.safeParse(withoutName).success).toBe(false);
    });
  });

  describe('custom fields', () => {
    it('should include custom fields from definition', () => {
      const definition: EntitySchemaDefinition = {
        typeName: 'spell',
        fields: [
          { name: 'level', type: 'integer' },
          { name: 'school', type: 'string' },
        ],
        addons: ['searchable'],
      };

      const schema = createEntitySchemaWithAddons(definition, defaultAddonRegistry);
      
      const spell = { 
        id: 'fireball', 
        entityType: 'spell',
        name: 'Fireball',
        level: 3,
        school: 'evocation',
      };
      
      expect(schema.safeParse(spell).success).toBe(true);
    });

    it('should validate custom field types', () => {
      const definition: EntitySchemaDefinition = {
        typeName: 'spell',
        fields: [
          { name: 'level', type: 'integer' },
        ],
        addons: [],
      };

      const schema = createEntitySchemaWithAddons(definition, defaultAddonRegistry);
      
      const validLevel = { id: 'spell-1', entityType: 'spell', level: 3 };
      const invalidLevel = { id: 'spell-1', entityType: 'spell', level: 'three' };
      
      expect(schema.safeParse(validLevel).success).toBe(true);
      expect(schema.safeParse(invalidLevel).success).toBe(false);
    });

    it('should support optional custom fields', () => {
      const definition: EntitySchemaDefinition = {
        typeName: 'spell',
        fields: [
          { name: 'level', type: 'integer' },
          { name: 'components', type: 'string_array', optional: true },
        ],
        addons: [],
      };

      const schema = createEntitySchemaWithAddons(definition, defaultAddonRegistry);
      
      const withComponents = { id: 'spell-1', entityType: 'spell', level: 3, components: ['V', 'S'] };
      const withoutComponents = { id: 'spell-1', entityType: 'spell', level: 3 };
      
      expect(schema.safeParse(withComponents).success).toBe(true);
      expect(schema.safeParse(withoutComponents).success).toBe(true);
    });
  });

  describe('no addons', () => {
    it('should work with empty addons array', () => {
      const definition: EntitySchemaDefinition = {
        typeName: 'minimal',
        fields: [],
        addons: [],
      };

      const schema = createEntitySchemaWithAddons(definition, defaultAddonRegistry);
      
      const minimal = { id: 'min-1', entityType: 'minimal' };
      
      expect(schema.safeParse(minimal).success).toBe(true);
    });

    it('should work without addons field (undefined)', () => {
      const definition: EntitySchemaDefinition = {
        typeName: 'minimal',
        fields: [],
      };

      const schema = createEntitySchemaWithAddons(definition, defaultAddonRegistry);
      
      const minimal = { id: 'min-1', entityType: 'minimal' };
      
      expect(schema.safeParse(minimal).success).toBe(true);
    });
  });

  describe('unknown addon handling', () => {
    it('should throw error for unknown addon id', () => {
      const definition: EntitySchemaDefinition = {
        typeName: 'testEntity',
        fields: [],
        addons: ['nonexistent'],
      };

      expect(() => {
        createEntitySchemaWithAddons(definition, defaultAddonRegistry);
      }).toThrow(/unknown addon/i);
    });
  });

  describe('custom addon registry', () => {
    it('should use custom addon registry', () => {
      const customRegistry: AddonRegistry = {
        custom: {
          id: 'custom',
          name: 'Custom Addon',
          fields: [
            { name: 'customField', type: 'string' },
          ],
        },
      };

      const definition: EntitySchemaDefinition = {
        typeName: 'testEntity',
        fields: [],
        addons: ['custom'],
      };

      const schema = createEntitySchemaWithAddons(definition, customRegistry);
      
      const withCustomField = { id: 'test-1', entityType: 'testEntity', customField: 'value' };
      const withoutCustomField = { id: 'test-1', entityType: 'testEntity' };
      
      expect(schema.safeParse(withCustomField).success).toBe(true);
      expect(schema.safeParse(withoutCustomField).success).toBe(false);
    });
  });
});

