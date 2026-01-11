import { describe, it, expect } from 'bun:test';
import { calculateSuppressions } from '../../suppression/calculateSuppressions';
import type { Entity, SuppressingFields } from '../../../entities/types/base';

// Helper type for tests: Entity with suppressing capabilities
type TestEntity = Entity & SuppressingFields & Record<string, unknown>;

describe('calculateSuppressions', () => {
  // =========================================================================
  // Basic: No suppressions
  // =========================================================================
  
  describe('when no entity suppresses anything', () => {
    it('returns empty map', () => {
      const entities: TestEntity[] = [
        { id: 'feat-a', entityType: 'feat' },
        { id: 'feat-b', entityType: 'feat' },
        { id: 'feat-c', entityType: 'feat' },
      ];
      
      const result = calculateSuppressions(entities, {}, { targetScope: 'applied' });
      
      expect(result.size).toBe(0);
    });
    
    it('returns empty map for empty entity list', () => {
      const result = calculateSuppressions([], {}, { targetScope: 'applied' });
      
      expect(result.size).toBe(0);
    });
  });
  
  // =========================================================================
  // Suppression by ID
  // =========================================================================
  
  describe('suppression by ID', () => {
    it('suppresses a single entity by explicit ID', () => {
      const entities: TestEntity[] = [
        { id: 'trapfinding', entityType: 'rogueAbility' },
        { id: 'archetype-acrobat', entityType: 'archetype', 
          suppression: [{ scope: 'applied', ids: ['trapfinding'] }] 
        },
      ];
      
      const result = calculateSuppressions(entities, {}, { targetScope: 'applied' });
      
      expect(result.size).toBe(1);
      expect(result.get('trapfinding')).toEqual({
        suppressedById: 'archetype-acrobat',
        method: 'id',
        reason: undefined,
      });
    });
    
    it('suppresses multiple entities by explicit IDs', () => {
      const entities: TestEntity[] = [
        { id: 'feature-a', entityType: 'classFeature' },
        { id: 'feature-b', entityType: 'classFeature' },
        { id: 'feature-c', entityType: 'classFeature' },
        { id: 'archetype-x', entityType: 'archetype', 
          suppression: [{ scope: 'applied', ids: ['feature-a', 'feature-b'] }] 
        },
      ];
      
      const result = calculateSuppressions(entities, {}, { targetScope: 'applied' });
      
      expect(result.size).toBe(2);
      expect(result.get('feature-a')?.suppressedById).toBe('archetype-x');
      expect(result.get('feature-b')?.suppressedById).toBe('archetype-x');
      expect(result.has('feature-c')).toBe(false);
    });
    
    it('ignores IDs that do not exist in entity list', () => {
      const entities: TestEntity[] = [
        { id: 'feature-a', entityType: 'classFeature' },
        { id: 'archetype-x', entityType: 'archetype', 
          suppression: [{ scope: 'applied', ids: ['non-existent', 'feature-a'] }] 
        },
      ];
      
      const result = calculateSuppressions(entities, {}, { targetScope: 'applied' });
      
      expect(result.size).toBe(1);
      expect(result.get('feature-a')).toBeDefined();
      expect(result.has('non-existent')).toBe(false);
    });
    
    it('does not suppress itself', () => {
      const entities: TestEntity[] = [
        { id: 'feature-a', entityType: 'classFeature', 
          suppression: [{ scope: 'applied', ids: ['feature-a'] }] 
        },
      ];
      
      const result = calculateSuppressions(entities, {}, { targetScope: 'applied' });
      
      expect(result.size).toBe(0);
    });
  });
  
  // =========================================================================
  // Suppression by Filter
  // =========================================================================
  
  describe('suppression by filter', () => {
    it('suppresses entities matching a simple filter', () => {
      const entities: TestEntity[] = [
        { id: 'totem-bear', entityType: 'totemAbility', totemType: 'bear',
          suppression: [{
            scope: 'applied',
            filter: {
              type: 'AND',
              filterPolicy: 'strict',
              conditions: [
                { field: 'entityType', operator: '==', value: 'totemAbility' },
                { field: 'totemType', operator: '!=', value: 'bear' },
              ],
            },
          }],
        },
        { id: 'totem-wolf', entityType: 'totemAbility', totemType: 'wolf' },
        { id: 'totem-eagle', entityType: 'totemAbility', totemType: 'eagle' },
        { id: 'rage', entityType: 'classAbility' },
      ];
      
      const result = calculateSuppressions(entities, {}, { targetScope: 'applied' });
      
      expect(result.size).toBe(2);
      expect(result.get('totem-wolf')?.suppressedById).toBe('totem-bear');
      expect(result.get('totem-eagle')?.suppressedById).toBe('totem-bear');
      expect(result.has('rage')).toBe(false);
    });
    
    it('does not suppress itself via filter', () => {
      const entities: TestEntity[] = [
        { id: 'totem-bear', entityType: 'totemAbility',
          suppression: [{
            scope: 'applied',
            filter: {
              type: 'AND',
              filterPolicy: 'strict',
              conditions: [
                { field: 'entityType', operator: '==', value: 'totemAbility' },
              ],
            },
          }],
        },
      ];
      
      const result = calculateSuppressions(entities, {}, { targetScope: 'applied' });
      
      expect(result.size).toBe(0);
    });
    
    it('suppresses using OR filter logic', () => {
      const entities: TestEntity[] = [
        { id: 'suppressor', entityType: 'ability',
          suppression: [{
            scope: 'applied',
            filter: {
              type: 'OR',
              filterPolicy: 'strict',
              conditions: [
                { field: 'category', operator: '==', value: 'A' },
                { field: 'category', operator: '==', value: 'B' },
              ],
            },
          }],
        },
        { id: 'entity-a', entityType: 'feature', category: 'A' },
        { id: 'entity-b', entityType: 'feature', category: 'B' },
        { id: 'entity-c', entityType: 'feature', category: 'C' },
      ];
      
      const result = calculateSuppressions(entities, {}, { targetScope: 'applied' });
      
      expect(result.size).toBe(2);
      expect(result.has('entity-a')).toBe(true);
      expect(result.has('entity-b')).toBe(true);
      expect(result.has('entity-c')).toBe(false);
    });
  });
  
  // =========================================================================
  // Suppression with Variables
  // =========================================================================
  
  describe('suppression with variables', () => {
    it('evaluates filter with variable substitution', () => {
      const entities: TestEntity[] = [
        { id: 'suppressor', entityType: 'ability',
          suppression: [{
            scope: 'applied',
            filter: {
              type: 'AND',
              filterPolicy: 'strict',
              conditions: [
                { field: 'minLevel', operator: '<=', value: '@character.level' },
              ],
            },
          }],
        },
        { id: 'low-level-feature', entityType: 'feature', minLevel: 3 },
        { id: 'mid-level-feature', entityType: 'feature', minLevel: 10 },
        { id: 'high-level-feature', entityType: 'feature', minLevel: 15 },
      ];
      
      const result = calculateSuppressions(entities, { 'character.level': 10 }, { targetScope: 'applied' });
      
      expect(result.size).toBe(2);
      expect(result.has('low-level-feature')).toBe(true);
      expect(result.has('mid-level-feature')).toBe(true);
      expect(result.has('high-level-feature')).toBe(false);
    });
  });
  
  // =========================================================================
  // Combined Suppression (IDs + Filter)
  // =========================================================================
  
  describe('combined suppression (ids + filter)', () => {
    it('applies both suppression methods additively', () => {
      const entities: TestEntity[] = [
        { id: 'archetype', entityType: 'archetype',
          suppression: [{
            scope: 'applied',
            ids: ['explicit-target'],
            filter: {
              type: 'AND',
              filterPolicy: 'strict',
              conditions: [
                { field: 'category', operator: '==', value: 'replaceable' },
              ],
            },
          }],
        },
        { id: 'explicit-target', entityType: 'feature' },
        { id: 'filter-target', entityType: 'feature', category: 'replaceable' },
        { id: 'safe-entity', entityType: 'feature', category: 'core' },
      ];
      
      const result = calculateSuppressions(entities, {}, { targetScope: 'applied' });
      
      expect(result.size).toBe(2);
      expect(result.get('explicit-target')?.method).toBe('id');
      expect(result.get('filter-target')?.method).toBe('filter');
    });
    
    it('ID suppression takes precedence when both match', () => {
      const entities: TestEntity[] = [
        { id: 'archetype', entityType: 'archetype',
          suppression: [{
            scope: 'applied',
            ids: ['target'],
            filter: {
              type: 'AND',
              filterPolicy: 'strict',
              conditions: [
                { field: 'category', operator: '==', value: 'replaceable' },
              ],
            },
          }],
        },
        { id: 'target', entityType: 'feature', category: 'replaceable' },
      ];
      
      const result = calculateSuppressions(entities, {}, { targetScope: 'applied' });
      
      expect(result.size).toBe(1);
      expect(result.get('target')?.method).toBe('id');
    });
  });
  
  // =========================================================================
  // Non-transitive Suppression
  // =========================================================================
  
  describe('non-transitive suppression', () => {
    it('suppressed entities do not suppress other entities', () => {
      const entities: TestEntity[] = [
        { id: 'entity-a', entityType: 'feature', 
          suppression: [{ scope: 'applied', ids: ['entity-b'] }] 
        },
        { id: 'entity-b', entityType: 'feature', 
          suppression: [{ scope: 'applied', ids: ['entity-c'] }] 
        },
        { id: 'entity-c', entityType: 'feature' },
      ];
      
      const result = calculateSuppressions(entities, {}, { targetScope: 'applied' });
      
      expect(result.get('entity-b')?.suppressedById).toBe('entity-a');
      expect(result.has('entity-c')).toBe(false);
    });
    
    it('handles circular suppression references gracefully', () => {
      const entities: TestEntity[] = [
        { id: 'entity-a', entityType: 'feature', 
          suppression: [{ scope: 'applied', ids: ['entity-b'] }] 
        },
        { id: 'entity-b', entityType: 'feature', 
          suppression: [{ scope: 'applied', ids: ['entity-a'] }] 
        },
      ];
      
      const result = calculateSuppressions(entities, {}, { targetScope: 'applied' });
      
      expect(result.size).toBe(1);
      expect(result.get('entity-b')?.suppressedById).toBe('entity-a');
      expect(result.has('entity-a')).toBe(false);
    });
  });
  
  // =========================================================================
  // Multiple Suppressors
  // =========================================================================
  
  describe('multiple suppressors', () => {
    it('first suppressor wins when multiple entities would suppress the same target', () => {
      const entities: TestEntity[] = [
        { id: 'suppressor-1', entityType: 'archetype', 
          suppression: [{ scope: 'applied', ids: ['target'] }] 
        },
        { id: 'suppressor-2', entityType: 'archetype', 
          suppression: [{ scope: 'applied', ids: ['target'] }] 
        },
        { id: 'target', entityType: 'feature' },
      ];
      
      const result = calculateSuppressions(entities, {}, { targetScope: 'applied' });
      
      expect(result.size).toBe(1);
      expect(result.get('target')?.suppressedById).toBe('suppressor-1');
    });
  });
  
  // =========================================================================
  // Suppression Reason
  // =========================================================================
  
  describe('suppression reason', () => {
    it('includes reason from suppression config', () => {
      const entities: TestEntity[] = [
        { id: 'trapfinding', entityType: 'rogueAbility' },
        { id: 'archetype-acrobat', entityType: 'archetype', 
          suppression: [{ 
            scope: 'applied', 
            ids: ['trapfinding'],
            reason: 'Replaced by Acrobat agility training'
          }] 
        },
      ];
      
      const result = calculateSuppressions(entities, {}, { targetScope: 'applied' });
      
      expect(result.get('trapfinding')?.reason).toBe('Replaced by Acrobat agility training');
    });
    
    it('reason is undefined when not provided', () => {
      const entities: TestEntity[] = [
        { id: 'feature-a', entityType: 'feature' },
        { id: 'suppressor', entityType: 'archetype', 
          suppression: [{ scope: 'applied', ids: ['feature-a'] }] 
        },
      ];
      
      const result = calculateSuppressions(entities, {}, { targetScope: 'applied' });
      
      expect(result.get('feature-a')?.reason).toBeUndefined();
    });
  });
  
  // =========================================================================
  // Suppression Scope
  // =========================================================================
  
  describe('suppression scope', () => {
    it('only applies suppressions with matching scope (applied)', () => {
      const entities: TestEntity[] = [
        { id: 'target-applied', entityType: 'feature' },
        { id: 'target-selectable', entityType: 'feature' },
        { id: 'suppressor', entityType: 'archetype', 
          suppression: [
            { scope: 'applied', ids: ['target-applied'] },
            { scope: 'selectable', ids: ['target-selectable'] },
          ]
        },
      ];
      
      const result = calculateSuppressions(entities, {}, { targetScope: 'applied' });
      
      expect(result.size).toBe(1);
      expect(result.has('target-applied')).toBe(true);
      expect(result.has('target-selectable')).toBe(false);
    });
    
    it('only applies suppressions with matching scope (selectable)', () => {
      const entities: TestEntity[] = [
        { id: 'target-applied', entityType: 'feature' },
        { id: 'target-selectable', entityType: 'feature' },
        { id: 'suppressor', entityType: 'archetype', 
          suppression: [
            { scope: 'applied', ids: ['target-applied'] },
            { scope: 'selectable', ids: ['target-selectable'] },
          ]
        },
      ];
      
      const result = calculateSuppressions(entities, {}, { targetScope: 'selectable' });
      
      expect(result.size).toBe(1);
      expect(result.has('target-applied')).toBe(false);
      expect(result.has('target-selectable')).toBe(true);
    });
    
    it('scope "all" applies to both applied and selectable', () => {
      const entities: TestEntity[] = [
        { id: 'target', entityType: 'feature' },
        { id: 'suppressor', entityType: 'archetype', 
          suppression: [{ scope: 'all', ids: ['target'] }]
        },
      ];
      
      const appliedResult = calculateSuppressions(entities, {}, { targetScope: 'applied' });
      const selectableResult = calculateSuppressions(entities, {}, { targetScope: 'selectable' });
      
      expect(appliedResult.has('target')).toBe(true);
      expect(selectableResult.has('target')).toBe(true);
    });
  });
  
  // =========================================================================
  // Multiple Suppression Configs
  // =========================================================================
  
  describe('multiple suppression configs', () => {
    it('processes all suppression configs for an entity', () => {
      const entities: TestEntity[] = [
        { id: 'target-a', entityType: 'feature', category: 'A' },
        { id: 'target-b', entityType: 'feature', category: 'B' },
        { id: 'target-c', entityType: 'feature', category: 'C' },
        { id: 'suppressor', entityType: 'archetype', 
          suppression: [
            { scope: 'applied', ids: ['target-a'], reason: 'Reason A' },
            { 
              scope: 'applied', 
              filter: {
                type: 'AND',
                filterPolicy: 'strict',
                conditions: [{ field: 'category', operator: '==', value: 'B' }],
              },
              reason: 'Reason B'
            },
          ]
        },
      ];
      
      const result = calculateSuppressions(entities, {}, { targetScope: 'applied' });
      
      expect(result.size).toBe(2);
      expect(result.get('target-a')?.reason).toBe('Reason A');
      expect(result.get('target-b')?.reason).toBe('Reason B');
      expect(result.has('target-c')).toBe(false);
    });
    
    it('first matching config wins for same target', () => {
      const entities: TestEntity[] = [
        { id: 'target', entityType: 'feature', category: 'A' },
        { id: 'suppressor', entityType: 'archetype', 
          suppression: [
            { scope: 'applied', ids: ['target'], reason: 'First reason' },
            { scope: 'applied', ids: ['target'], reason: 'Second reason' },
          ]
        },
      ];
      
      const result = calculateSuppressions(entities, {}, { targetScope: 'applied' });
      
      expect(result.get('target')?.reason).toBe('First reason');
    });
  });
});
