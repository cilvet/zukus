import { describe, it, expect } from 'bun:test';
import { validateCustomEntities } from '../validateCustomEntities';
import { resolveCompendiumContext } from '../resolve';
import type { StandardEntity } from '../../entities/types/base';
import type { Compendium, CompendiumRegistry, ResolvedCompendiumContext } from '../types';

// Helper to create a mock compendium context
function createMockContext(): ResolvedCompendiumContext {
  const coreCompendium: Compendium = {
    id: 'core',
    name: 'Core',
    version: '1.0.0',
    dependencies: [],
    schemas: [
      {
        typeName: 'spell',
        fields: [
          { name: 'level', type: 'integer' },
          { name: 'school', type: 'string', optional: true }
        ],
        version: '1.0.0'
      },
      {
        typeName: 'feat',
        fields: [
          { name: 'prerequisite', type: 'string', optional: true }
        ],
        version: '1.0.0'
      }
    ],
    entities: {}
  };

  const registry: CompendiumRegistry = {
    available: [{ id: 'core', name: 'Core' }],
    active: ['core']
  };

  return resolveCompendiumContext(registry, (id) => {
    if (id === 'core') return coreCompendium;
    return undefined;
  });
}

describe('validateCustomEntities', () => {
  describe('basic validation', () => {
    it('should return empty arrays when no custom entities provided', () => {
      const context = createMockContext();
      
      const result = validateCustomEntities(undefined, context);
      
      expect(result.validEntities).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('should validate a valid custom entity', () => {
      const context = createMockContext();
      
      const customEntities: Record<string, StandardEntity[]> = {
        spell: [
          {
            id: 'custom-fireball',
            entityType: 'spell',
            name: 'Custom Fireball',
            level: 3,
            school: 'Evocation'
          } as StandardEntity
        ]
      };
      
      const result = validateCustomEntities(customEntities, context);
      
      expect(result.validEntities).toHaveLength(1);
      expect(result.validEntities[0].id).toBe('custom-fireball');
      expect(result.warnings).toHaveLength(0);
    });

    it('should validate multiple entities of the same type', () => {
      const context = createMockContext();
      
      const customEntities: Record<string, StandardEntity[]> = {
        spell: [
          { id: 'spell-1', entityType: 'spell', name: 'Spell 1', level: 1 } as StandardEntity,
          { id: 'spell-2', entityType: 'spell', name: 'Spell 2', level: 2 } as StandardEntity,
          { id: 'spell-3', entityType: 'spell', name: 'Spell 3', level: 3 } as StandardEntity
        ]
      };
      
      const result = validateCustomEntities(customEntities, context);
      
      expect(result.validEntities).toHaveLength(3);
      expect(result.warnings).toHaveLength(0);
    });

    it('should validate entities of different types', () => {
      const context = createMockContext();
      
      const customEntities: Record<string, StandardEntity[]> = {
        spell: [
          { id: 'spell-1', entityType: 'spell', name: 'Spell 1', level: 1 } as StandardEntity
        ],
        feat: [
          { id: 'feat-1', entityType: 'feat', name: 'Feat 1' } as StandardEntity
        ]
      };
      
      const result = validateCustomEntities(customEntities, context);
      
      expect(result.validEntities).toHaveLength(2);
      expect(result.warnings).toHaveLength(0);
    });
  });

  describe('no context handling', () => {
    it('should generate warning when no context provided', () => {
      const customEntities: Record<string, StandardEntity[]> = {
        spell: [
          { id: 'spell-1', entityType: 'spell', name: 'Spell 1', level: 1 } as StandardEntity
        ]
      };
      
      const result = validateCustomEntities(customEntities, undefined);
      
      expect(result.validEntities).toHaveLength(0);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].type).toBe('no_context');
    });

    it('should skip all entities when no context provided', () => {
      const customEntities: Record<string, StandardEntity[]> = {
        spell: [
          { id: 'spell-1', entityType: 'spell', name: 'Spell 1', level: 1 } as StandardEntity,
          { id: 'spell-2', entityType: 'spell', name: 'Spell 2', level: 2 } as StandardEntity
        ],
        feat: [
          { id: 'feat-1', entityType: 'feat', name: 'Feat 1' } as StandardEntity
        ]
      };
      
      const result = validateCustomEntities(customEntities, undefined);
      
      expect(result.validEntities).toHaveLength(0);
      expect(result.warnings[0].context?.entityCount).toBe(3);
    });
  });

  describe('unknown entity type handling', () => {
    it('should generate warning for unknown entity type', () => {
      const context = createMockContext();
      
      const customEntities: Record<string, StandardEntity[]> = {
        unknown_type: [
          { id: 'entity-1', entityType: 'unknown_type', name: 'Entity 1' } as StandardEntity
        ]
      };
      
      const result = validateCustomEntities(customEntities, context);
      
      expect(result.validEntities).toHaveLength(0);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].type).toBe('unknown_entity_type');
      expect(result.warnings[0].context?.entityType).toBe('unknown_type');
    });

    it('should skip entities of unknown type but process known types', () => {
      const context = createMockContext();
      
      const customEntities: Record<string, StandardEntity[]> = {
        spell: [
          { id: 'spell-1', entityType: 'spell', name: 'Spell 1', level: 1 } as StandardEntity
        ],
        unknown_type: [
          { id: 'unknown-1', entityType: 'unknown_type', name: 'Unknown 1' } as StandardEntity
        ]
      };
      
      const result = validateCustomEntities(customEntities, context);
      
      expect(result.validEntities).toHaveLength(1);
      expect(result.validEntities[0].id).toBe('spell-1');
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].type).toBe('unknown_entity_type');
    });
  });

  describe('invalid entity handling', () => {
    it('should generate warning for invalid entity', () => {
      const context = createMockContext();
      
      const customEntities: Record<string, StandardEntity[]> = {
        spell: [
          { 
            id: 'invalid-spell', 
            entityType: 'spell', 
            name: 'Invalid Spell'
            // missing required 'level' field
          } as StandardEntity
        ]
      };
      
      const result = validateCustomEntities(customEntities, context);
      
      expect(result.validEntities).toHaveLength(0);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].type).toBe('invalid_entity');
      expect(result.warnings[0].context?.entityId).toBe('invalid-spell');
    });

    it('should filter out invalid entities but keep valid ones', () => {
      const context = createMockContext();
      
      const customEntities: Record<string, StandardEntity[]> = {
        spell: [
          { id: 'valid-spell', entityType: 'spell', name: 'Valid Spell', level: 1 } as StandardEntity,
          { id: 'invalid-spell', entityType: 'spell', name: 'Invalid Spell' } as StandardEntity, // missing level
          { id: 'another-valid', entityType: 'spell', name: 'Another Valid', level: 5 } as StandardEntity
        ]
      };
      
      const result = validateCustomEntities(customEntities, context);
      
      expect(result.validEntities).toHaveLength(2);
      expect(result.validEntities.map(e => e.id)).toContain('valid-spell');
      expect(result.validEntities.map(e => e.id)).toContain('another-valid');
      expect(result.validEntities.map(e => e.id)).not.toContain('invalid-spell');
      expect(result.warnings).toHaveLength(1);
    });

    it('should handle wrong field type in entity', () => {
      const context = createMockContext();
      
      const customEntities: Record<string, StandardEntity[]> = {
        spell: [
          { 
            id: 'wrong-type', 
            entityType: 'spell', 
            name: 'Wrong Type Spell', 
            level: 'not-a-number' // should be integer
          } as unknown as StandardEntity
        ]
      };
      
      const result = validateCustomEntities(customEntities, context);
      
      expect(result.validEntities).toHaveLength(0);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].type).toBe('invalid_entity');
    });
  });

  describe('mixed scenarios', () => {
    it('should handle complex scenario with multiple types and validations', () => {
      const context = createMockContext();
      
      const customEntities: Record<string, StandardEntity[]> = {
        spell: [
          { id: 'valid-spell-1', entityType: 'spell', name: 'Valid 1', level: 1 } as StandardEntity,
          { id: 'invalid-spell', entityType: 'spell', name: 'Invalid' } as StandardEntity,
          { id: 'valid-spell-2', entityType: 'spell', name: 'Valid 2', level: 2 } as StandardEntity
        ],
        feat: [
          { id: 'valid-feat', entityType: 'feat', name: 'Valid Feat' } as StandardEntity
        ],
        unknown: [
          { id: 'unknown-1', entityType: 'unknown', name: 'Unknown' } as StandardEntity
        ]
      };
      
      const result = validateCustomEntities(customEntities, context);
      
      // 2 valid spells + 1 valid feat = 3 valid entities
      expect(result.validEntities).toHaveLength(3);
      
      // 1 invalid spell + 1 unknown type = 2 warnings
      expect(result.warnings).toHaveLength(2);
      expect(result.warnings.some(w => w.type === 'invalid_entity')).toBe(true);
      expect(result.warnings.some(w => w.type === 'unknown_entity_type')).toBe(true);
    });
  });
});

