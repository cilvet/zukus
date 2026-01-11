import { describe, it, expect } from 'bun:test';
import { resolveCompendiumContext } from '../resolve';
import type { Compendium, CompendiumRegistry } from '../types';

// Mock compendiums for testing
const createMockCompendium = (id: string, overrides: Partial<Compendium> = {}): Compendium => ({
  id,
  name: `${id} Compendium`,
  version: '1.0.0',
  dependencies: [],
  schemas: [],
  entities: {},
  ...overrides
});

describe('resolveCompendiumContext', () => {
  describe('basic resolution', () => {
    it('should resolve a compendium without dependencies', () => {
      const coreCompendium = createMockCompendium('core', {
        schemas: [
          {
            typeName: 'spell',
            description: 'Magic spells',
            fields: [
              { name: 'level', type: 'integer' }
            ],
            version: '1.0.0'
          }
        ]
      });

      const registry: CompendiumRegistry = {
        available: [{ id: 'core', name: 'Core' }],
        active: ['core']
      };

      const loadCompendium = (id: string) => {
        if (id === 'core') {
          return coreCompendium;
        }
        return undefined;
      };

      const context = resolveCompendiumContext(registry, loadCompendium);

      expect(context.availableTypeNames).toContain('spell');
      expect(context.entityTypes.has('spell')).toBe(true);
      expect(context.activeCompendiums).toHaveLength(1);
      expect(context.warnings).toHaveLength(0);
    });

    it('should resolve multiple compendiums', () => {
      const coreCompendium = createMockCompendium('core', {
        schemas: [
          { typeName: 'spell', fields: [], version: '1.0.0' }
        ]
      });

      const expansionCompendium = createMockCompendium('expansion', {
        dependencies: ['core'],
        schemas: [
          { typeName: 'feat', fields: [], version: '1.0.0' }
        ]
      });

      const registry: CompendiumRegistry = {
        available: [
          { id: 'core', name: 'Core' },
          { id: 'expansion', name: 'Expansion' }
        ],
        active: ['core', 'expansion']
      };

      const loadCompendium = (id: string) => {
        if (id === 'core') return coreCompendium;
        if (id === 'expansion') return expansionCompendium;
        return undefined;
      };

      const context = resolveCompendiumContext(registry, loadCompendium);

      expect(context.availableTypeNames).toContain('spell');
      expect(context.availableTypeNames).toContain('feat');
      expect(context.activeCompendiums).toHaveLength(2);
      expect(context.warnings).toHaveLength(0);
    });
  });

  describe('dependency handling', () => {
    it('should generate warning when dependency is missing', () => {
      const expansionCompendium = createMockCompendium('expansion', {
        dependencies: ['core'],
        schemas: [
          { typeName: 'feat', fields: [], version: '1.0.0' }
        ]
      });

      const registry: CompendiumRegistry = {
        available: [{ id: 'expansion', name: 'Expansion' }],
        active: ['expansion']  // core not active
      };

      const loadCompendium = (id: string) => {
        if (id === 'expansion') return expansionCompendium;
        return undefined;
      };

      const context = resolveCompendiumContext(registry, loadCompendium);

      expect(context.warnings.some(w => w.type === 'missing_dependency')).toBe(true);
      // Still processes the compendium
      expect(context.availableTypeNames).toContain('feat');
    });

    it('should resolve compendium with satisfied dependencies', () => {
      const coreCompendium = createMockCompendium('core', {
        schemas: [{ typeName: 'spell', fields: [], version: '1.0.0' }]
      });

      const expansionCompendium = createMockCompendium('expansion', {
        dependencies: ['core'],
        schemas: [{ typeName: 'feat', fields: [], version: '1.0.0' }]
      });

      const registry: CompendiumRegistry = {
        available: [
          { id: 'core', name: 'Core' },
          { id: 'expansion', name: 'Expansion' }
        ],
        active: ['core', 'expansion']
      };

      const loadCompendium = (id: string) => {
        if (id === 'core') return coreCompendium;
        if (id === 'expansion') return expansionCompendium;
        return undefined;
      };

      const context = resolveCompendiumContext(registry, loadCompendium);

      expect(context.warnings).toHaveLength(0);
      expect(context.availableTypeNames).toContain('spell');
      expect(context.availableTypeNames).toContain('feat');
    });
  });

  describe('schema conflicts', () => {
    it('should generate warning on schema conflict and use first definition', () => {
      const coreCompendium = createMockCompendium('core', {
        schemas: [
          { 
            typeName: 'spell', 
            description: 'Core spells',
            fields: [{ name: 'level', type: 'integer' }], 
            version: '1.0.0' 
          }
        ]
      });

      const alternateCompendium = createMockCompendium('alternate', {
        schemas: [
          { 
            typeName: 'spell', 
            description: 'Alternate spells',
            fields: [{ name: 'power', type: 'integer' }], 
            version: '2.0.0' 
          }
        ]
      });

      const registry: CompendiumRegistry = {
        available: [
          { id: 'core', name: 'Core' },
          { id: 'alternate', name: 'Alternate' }
        ],
        active: ['core', 'alternate']
      };

      const loadCompendium = (id: string) => {
        if (id === 'core') return coreCompendium;
        if (id === 'alternate') return alternateCompendium;
        return undefined;
      };

      const context = resolveCompendiumContext(registry, loadCompendium);

      // Should have conflict warning
      expect(context.warnings.some(w => w.type === 'schema_conflict')).toBe(true);
      
      // First compendium (core) wins
      const spellType = context.entityTypes.get('spell');
      expect(spellType?.sourceCompendiumId).toBe('core');
      expect(spellType?.schema.description).toBe('Core spells');
    });
  });

  describe('error handling', () => {
    it('should handle non-existent compendium gracefully', () => {
      const registry: CompendiumRegistry = {
        available: [{ id: 'nonexistent', name: 'Does not exist' }],
        active: ['nonexistent']
      };

      const loadCompendium = () => undefined;

      const context = resolveCompendiumContext(registry, loadCompendium);

      expect(context.warnings.some(w => w.type === 'missing_dependency')).toBe(true);
      expect(context.availableTypeNames).toHaveLength(0);
      expect(context.activeCompendiums).toHaveLength(0);
    });

    it('should return empty context with empty registry', () => {
      const registry: CompendiumRegistry = {
        available: [],
        active: []
      };

      const loadCompendium = () => undefined;

      const context = resolveCompendiumContext(registry, loadCompendium);

      expect(context.availableTypeNames).toHaveLength(0);
      expect(context.activeCompendiums).toHaveLength(0);
      expect(context.warnings).toHaveLength(0);
    });
  });

  describe('validator generation', () => {
    it('should generate working Zod validators for schemas', () => {
      const coreCompendium = createMockCompendium('core', {
        schemas: [
          {
            typeName: 'spell',
            fields: [
              { name: 'level', type: 'integer' },
              { name: 'school', type: 'string', optional: true }
            ],
            version: '1.0.0'
          }
        ]
      });

      const registry: CompendiumRegistry = {
        available: [{ id: 'core', name: 'Core' }],
        active: ['core']
      };

      const loadCompendium = (id: string) => {
        if (id === 'core') return coreCompendium;
        return undefined;
      };

      const context = resolveCompendiumContext(registry, loadCompendium);

      const spellType = context.entityTypes.get('spell');
      expect(spellType).toBeDefined();

      // Valid spell
      const validSpell = {
        id: 'fireball',
        name: 'Fireball',
        entityType: 'spell',
        level: 3,
        school: 'Evocation'
      };

      const result = spellType!.validator.safeParse(validSpell);
      expect(result.success).toBe(true);

      // Invalid spell (missing required field)
      const invalidSpell = {
        id: 'bad-spell',
        name: 'Bad Spell',
        entityType: 'spell'
        // missing level
      };

      const invalidResult = spellType!.validator.safeParse(invalidSpell);
      expect(invalidResult.success).toBe(false);
    });
  });
});

