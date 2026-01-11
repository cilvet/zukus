import { describe, expect, it } from 'bun:test';
import { createEntitySchemaWithAddons } from '../../entities/createEntitySchemaWithAddons';
import { defaultAddonRegistry } from '../../entities/defaultAddons';
import type { EntitySchemaDefinition } from '../../../entities/types/schema';

describe('providableAddon', () => {
  describe('basic validation', () => {
    it('validates entity with empty providers array', () => {
      const definition: EntitySchemaDefinition = {
        typeName: 'testEntity',
        fields: [],
        addons: ['providable'],
      };

      const schema = createEntitySchemaWithAddons(definition, defaultAddonRegistry);
      
      const entity = { 
        id: 'test-1', 
        entityType: 'testEntity',
        providers: [],
      };
      
      const result = schema.safeParse(entity);
      
      expect(result.success).toBe(true);
    });

    it('validates entity with providers containing objects', () => {
      const definition: EntitySchemaDefinition = {
        typeName: 'testEntity',
        fields: [],
        addons: ['providable'],
      };

      const schema = createEntitySchemaWithAddons(definition, defaultAddonRegistry);
      
      // Note: providers uses objectFields: [] which means z.array(z.record(z.unknown()))
      // Any object is valid since the EntityProvider structure is validated separately
      const entity = { 
        id: 'test-1', 
        entityType: 'testEntity',
        providers: [
          { someField: 'value' },
          { anotherField: 123 },
        ],
      };
      
      const result = schema.safeParse(entity);
      
      expect(result.success).toBe(true);
    });

    it('providers field is optional', () => {
      const definition: EntitySchemaDefinition = {
        typeName: 'testEntity',
        fields: [],
        addons: ['providable'],
      };

      const schema = createEntitySchemaWithAddons(definition, defaultAddonRegistry);
      
      const withProviders = { 
        id: 'test-1', 
        entityType: 'testEntity',
        providers: [],
      };
      const withoutProviders = { 
        id: 'test-2', 
        entityType: 'testEntity',
      };
      
      expect(schema.safeParse(withProviders).success).toBe(true);
      expect(schema.safeParse(withoutProviders).success).toBe(true);
    });
  });

  describe('combined with other addons', () => {
    it('works combined with searchable addon', () => {
      const definition: EntitySchemaDefinition = {
        typeName: 'feature',
        fields: [],
        addons: ['searchable', 'providable'],
      };

      const schema = createEntitySchemaWithAddons(definition, defaultAddonRegistry);
      
      const feature = { 
        id: 'bonus-feat', 
        entityType: 'feature',
        name: 'Bonus Feat',
        description: 'Gain an additional feat',
        providers: [],
      };
      
      const result = schema.safeParse(feature);
      
      expect(result.success).toBe(true);
    });

    it('works combined with effectful addon', () => {
      const definition: EntitySchemaDefinition = {
        typeName: 'feature',
        fields: [],
        addons: ['searchable', 'effectful', 'providable'],
      };

      const schema = createEntitySchemaWithAddons(definition, defaultAddonRegistry);
      
      const feature = { 
        id: 'versatile-feature', 
        entityType: 'feature',
        name: 'Versatile Feature',
        effects: [],
        providers: [],
      };
      
      const result = schema.safeParse(feature);
      
      expect(result.success).toBe(true);
    });

    it('requires searchable fields when combined with searchable', () => {
      const definition: EntitySchemaDefinition = {
        typeName: 'feature',
        fields: [],
        addons: ['searchable', 'providable'],
      };

      const schema = createEntitySchemaWithAddons(definition, defaultAddonRegistry);
      
      const withName = { 
        id: 'test-1', 
        entityType: 'feature',
        name: 'Test Feature',
        providers: [],
      };
      const withoutName = { 
        id: 'test-2', 
        entityType: 'feature',
        providers: [],
      };
      
      expect(schema.safeParse(withName).success).toBe(true);
      expect(schema.safeParse(withoutName).success).toBe(false);
    });
  });

  describe('provider content validation', () => {
    it('accepts providers with any object structure', () => {
      const definition: EntitySchemaDefinition = {
        typeName: 'feature',
        fields: [],
        addons: ['providable'],
      };

      const schema = createEntitySchemaWithAddons(definition, defaultAddonRegistry);
      
      // Note: Since objectFields is [], any object structure is valid
      // The actual EntityProvider structure is validated separately by the levels system
      const feature = { 
        id: 'test-1', 
        entityType: 'feature',
        providers: [
          { anyField: 'anyValue' },
        ],
      };
      
      expect(schema.safeParse(feature).success).toBe(true);
    });

    it('accepts providers with nested structures', () => {
      const definition: EntitySchemaDefinition = {
        typeName: 'feature',
        fields: [],
        addons: ['providable'],
      };

      const schema = createEntitySchemaWithAddons(definition, defaultAddonRegistry);
      
      const feature = { 
        id: 'test-1', 
        entityType: 'feature',
        providers: [
          { 
            nested: { deeply: { object: 'value' } },
            array: [1, 2, 3],
          },
        ],
      };
      
      expect(schema.safeParse(feature).success).toBe(true);
    });

    it('accepts multiple providers', () => {
      const definition: EntitySchemaDefinition = {
        typeName: 'feature',
        fields: [],
        addons: ['providable'],
      };

      const schema = createEntitySchemaWithAddons(definition, defaultAddonRegistry);
      
      const feature = { 
        id: 'test-1', 
        entityType: 'feature',
        providers: [
          { type: 'granted' },
          { type: 'selector' },
          { type: 'combined' },
        ],
      };
      
      expect(schema.safeParse(feature).success).toBe(true);
    });
  });

  describe('realistic use cases', () => {
    it('validates Fighter Bonus Feat feature structure', () => {
      const definition: EntitySchemaDefinition = {
        typeName: 'classFeature',
        fields: [],
        addons: ['searchable', 'providable'],
      };

      const schema = createEntitySchemaWithAddons(definition, defaultAddonRegistry);
      
      // Schema validates basic structure; EntityProvider content validated separately
      const fighterBonusFeat = { 
        id: 'fighter-bonus-feat', 
        entityType: 'classFeature',
        name: 'Bonus Feat',
        description: 'A fighter gets a bonus combat-oriented feat.',
        providers: [],
      };
      
      const result = schema.safeParse(fighterBonusFeat);
      
      expect(result.success).toBe(true);
    });

    it('validates Rogue Talent Selector feature structure', () => {
      const definition: EntitySchemaDefinition = {
        typeName: 'classFeature',
        fields: [],
        addons: ['searchable', 'providable'],
      };

      const schema = createEntitySchemaWithAddons(definition, defaultAddonRegistry);
      
      const rogueTalent = { 
        id: 'rogue-talent-selector', 
        entityType: 'classFeature',
        name: 'Rogue Talent',
        description: 'Select a special ability from the rogue talent pool.',
        providers: [],
      };
      
      const result = schema.safeParse(rogueTalent);
      
      expect(result.success).toBe(true);
    });
  });
});

