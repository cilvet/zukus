import { describe, it, expect } from 'bun:test';
import { resolveProvider } from '../../providers/resolveProvider';
import { EntityProvider, ProviderResolutionResult } from '../../providers/types';
import { EntityFilter } from '../../filtering/types';
import { SubstitutionIndex } from '../../filtering/types';

// =============================================================================
// Test Entities
// =============================================================================

type TestEntity = {
  id: string;
  entityType: string;
  name: string;
  category?: string;
  level?: number;
  props?: {
    addedAtClassLevel?: string[];
  };
};

const testEntities: TestEntity[] = [
  { id: 'feat-1', entityType: 'feat', name: 'Power Attack', category: 'combat' },
  { id: 'feat-2', entityType: 'feat', name: 'Cleave', category: 'combat' },
  { id: 'feat-3', entityType: 'feat', name: 'Spell Focus', category: 'magic' },
  { id: 'talent-1', entityType: 'rogueTalent', name: 'Fast Stealth', level: 3 },
  { id: 'talent-2', entityType: 'rogueTalent', name: 'Trap Sense', level: 3 },
  { id: 'talent-3', entityType: 'rogueTalent', name: 'Evasion', level: 6 },
  { 
    id: 'injected-1', 
    entityType: 'classFeature', 
    name: 'Weapon Training',
    props: { addedAtClassLevel: ['fighter.3'] }
  },
  { 
    id: 'injected-2', 
    entityType: 'classFeature', 
    name: 'Armor Training',
    props: { addedAtClassLevel: ['fighter.3', 'fighter.7'] }
  },
];

// Helper to find entities by IDs
const getEntityById = (id: string): TestEntity | undefined => {
  return testEntities.find(e => e.id === id);
};

// =============================================================================
// Granted by Specific IDs
// =============================================================================

describe('resolveProvider - granted with specificIds', () => {
  it('should resolve explicit IDs to entities', () => {
    const provider: EntityProvider = {
      granted: {
        specificIds: ['feat-1', 'feat-2'],
      },
    };

    const result = resolveProvider(provider, testEntities, getEntityById, {});

    expect(result.granted).toBeDefined();
    expect(result.granted!.entities).toHaveLength(2);
    expect(result.granted!.entities[0].id).toBe('feat-1');
    expect(result.granted!.entities[1].id).toBe('feat-2');
    expect(result.granted!.warnings).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it('should return warning for non-existent ID', () => {
    const provider: EntityProvider = {
      granted: {
        specificIds: ['feat-1', 'non-existent', 'feat-2'],
      },
    };

    const result = resolveProvider(provider, testEntities, getEntityById, {});

    expect(result.granted).toBeDefined();
    expect(result.granted!.entities).toHaveLength(2);
    expect(result.granted!.warnings).toHaveLength(1);
    expect(result.granted!.warnings[0].type).toBe('entity_not_found');
    expect(result.granted!.warnings[0].entityId).toBe('non-existent');
  });

  it('should return empty entities with warning when all IDs are invalid', () => {
    const provider: EntityProvider = {
      granted: {
        specificIds: ['invalid-1', 'invalid-2'],
      },
    };

    const result = resolveProvider(provider, testEntities, getEntityById, {});

    expect(result.granted).toBeDefined();
    expect(result.granted!.entities).toHaveLength(0);
    expect(result.granted!.warnings).toHaveLength(2);
  });

  it('should handle empty specificIds array', () => {
    const provider: EntityProvider = {
      granted: {
        specificIds: [],
      },
    };

    const result = resolveProvider(provider, testEntities, getEntityById, {});

    expect(result.granted).toBeDefined();
    expect(result.granted!.entities).toHaveLength(0);
    expect(result.granted!.warnings).toHaveLength(0);
  });
});

// =============================================================================
// Granted by Filter
// =============================================================================

describe('resolveProvider - granted with filter', () => {
  it('should resolve filter to matching entities', () => {
    const filter: EntityFilter = {
      type: 'AND',
      filterPolicy: 'strict',
      conditions: [
        { field: 'category', operator: '==', value: 'combat' }
      ]
    };

    const provider: EntityProvider = {
      granted: {
        filter: filter,
      },
    };

    const result = resolveProvider(provider, testEntities, getEntityById, {});

    expect(result.granted).toBeDefined();
    expect(result.granted!.entities).toHaveLength(2);
    expect(result.granted!.entities.map(e => e.id)).toContain('feat-1');
    expect(result.granted!.entities.map(e => e.id)).toContain('feat-2');
    expect(result.granted!.warnings).toHaveLength(0);
  });

  it('should resolve filter with contains operator for array fields', () => {
    const filter: EntityFilter = {
      type: 'AND',
      filterPolicy: 'strict',
      conditions: [
        { field: 'props.addedAtClassLevel', operator: 'contains', value: 'fighter.3' }
      ]
    };

    const provider: EntityProvider = {
      granted: {
        filter: filter,
      },
    };

    const result = resolveProvider(provider, testEntities, getEntityById, {});

    expect(result.granted).toBeDefined();
    expect(result.granted!.entities).toHaveLength(2);
    expect(result.granted!.entities.map(e => e.id)).toContain('injected-1');
    expect(result.granted!.entities.map(e => e.id)).toContain('injected-2');
  });

  it('should return empty when no entities match filter', () => {
    const filter: EntityFilter = {
      type: 'AND',
      filterPolicy: 'strict',
      conditions: [
        { field: 'category', operator: '==', value: 'nonexistent' }
      ]
    };

    const provider: EntityProvider = {
      granted: {
        filter: filter,
      },
    };

    const result = resolveProvider(provider, testEntities, getEntityById, {});

    expect(result.granted).toBeDefined();
    expect(result.granted!.entities).toHaveLength(0);
    expect(result.granted!.warnings).toHaveLength(0);
  });

  it('should ignore filterPolicy and always act as strict for granted', () => {
    const filter: EntityFilter = {
      type: 'AND',
      filterPolicy: 'permissive', // Should be ignored
      conditions: [
        { field: 'category', operator: '==', value: 'combat' }
      ]
    };

    const provider: EntityProvider = {
      granted: {
        filter: filter,
      },
    };

    const result = resolveProvider(provider, testEntities, getEntityById, {});

    expect(result.granted).toBeDefined();
    // Only returns matching entities, not all entities with match status
    expect(result.granted!.entities).toHaveLength(2);
  });

  it('should support filter with variables', () => {
    const filter: EntityFilter = {
      type: 'AND',
      filterPolicy: 'strict',
      conditions: [
        { field: 'level', operator: '<=', value: '@characterLevel' }
      ]
    };

    const provider: EntityProvider = {
      granted: {
        filter: filter,
      },
    };

    const variables: SubstitutionIndex = {
      characterLevel: 3
    };

    const result = resolveProvider(provider, testEntities, getEntityById, variables);

    expect(result.granted).toBeDefined();
    // talent-1 (level 3) and talent-2 (level 3) should match, not talent-3 (level 6)
    expect(result.granted!.entities).toHaveLength(2);
    expect(result.granted!.entities.map(e => e.id)).toContain('talent-1');
    expect(result.granted!.entities.map(e => e.id)).toContain('talent-2');
  });
});

// =============================================================================
// Granted with both specificIds and filter (additive)
// =============================================================================

describe('resolveProvider - granted with specificIds AND filter', () => {
  it('should combine specificIds and filter additively', () => {
    const filter: EntityFilter = {
      type: 'AND',
      filterPolicy: 'strict',
      conditions: [
        { field: 'category', operator: '==', value: 'magic' }
      ]
    };

    const provider: EntityProvider = {
      granted: {
        specificIds: ['feat-1'],  // combat feat
        filter: filter,           // magic feats
      },
    };

    const result = resolveProvider(provider, testEntities, getEntityById, {});

    expect(result.granted).toBeDefined();
    // Should have feat-1 (from specificIds) + feat-3 (from filter matching magic)
    expect(result.granted!.entities).toHaveLength(2);
    expect(result.granted!.entities.map(e => e.id)).toContain('feat-1');
    expect(result.granted!.entities.map(e => e.id)).toContain('feat-3');
  });

  it('should deduplicate when same entity matches both specificIds and filter', () => {
    const filter: EntityFilter = {
      type: 'AND',
      filterPolicy: 'strict',
      conditions: [
        { field: 'category', operator: '==', value: 'combat' }
      ]
    };

    const provider: EntityProvider = {
      granted: {
        specificIds: ['feat-1'],  // also matches filter
        filter: filter,
      },
    };

    const result = resolveProvider(provider, testEntities, getEntityById, {});

    expect(result.granted).toBeDefined();
    // feat-1 and feat-2 from filter, feat-1 from specificIds - but deduplicated
    expect(result.granted!.entities).toHaveLength(2);
    expect(result.granted!.entities.map(e => e.id)).toContain('feat-1');
    expect(result.granted!.entities.map(e => e.id)).toContain('feat-2');
  });
});

// =============================================================================
// Selector with IDs
// =============================================================================

describe('resolveProvider - selector with entityIds', () => {
  it('should return eligible entities from ID list', () => {
    const provider: EntityProvider = {
      selector: {
        id: 'feat-selector',
        name: 'Select a Combat Feat',
        entityIds: ['feat-1', 'feat-2', 'feat-3'],
        min: 1,
        max: 1,
      },
    };

    const result = resolveProvider(provider, testEntities, getEntityById, {});

    expect(result.selector).toBeDefined();
    expect(result.selector!.selector.id).toBe('feat-selector');
    expect(result.selector!.eligibleEntities).toHaveLength(3);
    expect(result.selector!.eligibleEntities.every(e => e.matches)).toBe(true);
    expect(result.selector!.warnings).toHaveLength(0);
  });

  it('should return warning for non-existent ID in selector', () => {
    const provider: EntityProvider = {
      selector: {
        id: 'feat-selector',
        name: 'Select a Feat',
        entityIds: ['feat-1', 'invalid-id'],
        min: 1,
        max: 1,
      },
    };

    const result = resolveProvider(provider, testEntities, getEntityById, {});

    expect(result.selector).toBeDefined();
    expect(result.selector!.eligibleEntities).toHaveLength(1);
    expect(result.selector!.warnings).toHaveLength(1);
    expect(result.selector!.warnings[0].entityId).toBe('invalid-id');
  });

  it('should include min/max in selector result', () => {
    const provider: EntityProvider = {
      selector: {
        id: 'talent-selector',
        name: 'Select Rogue Talents',
        entityIds: ['talent-1', 'talent-2', 'talent-3'],
        min: 1,
        max: 3,
      },
    };

    const result = resolveProvider(provider, testEntities, getEntityById, {});

    expect(result.selector).toBeDefined();
    expect(result.selector!.selector.min).toBe(1);
    expect(result.selector!.selector.max).toBe(3);
  });
});

// =============================================================================
// Selector with Filter
// =============================================================================

describe('resolveProvider - selector with filter', () => {
  it('should return filtered entities with match status (strict)', () => {
    const filter: EntityFilter = {
      type: 'AND',
      filterPolicy: 'strict',
      conditions: [
        { field: 'category', operator: '==', value: 'combat' }
      ]
    };

    const provider: EntityProvider = {
      selector: {
        id: 'combat-feat-selector',
        name: 'Select a Combat Feat',
        filter: filter,
        min: 1,
        max: 1,
      },
    };

    const result = resolveProvider(provider, testEntities, getEntityById, {});

    expect(result.selector).toBeDefined();
    // Strict: only matching entities
    expect(result.selector!.eligibleEntities).toHaveLength(2);
    expect(result.selector!.eligibleEntities.every(e => e.matches)).toBe(true);
  });

  it('should return all entities with match status (permissive)', () => {
    const filter: EntityFilter = {
      type: 'AND',
      filterPolicy: 'permissive',
      conditions: [
        { field: 'category', operator: '==', value: 'combat' }
      ]
    };

    const provider: EntityProvider = {
      selector: {
        id: 'feat-selector',
        name: 'Select a Feat',
        filter: filter,
        min: 1,
        max: 1,
      },
    };

    const result = resolveProvider(provider, testEntities, getEntityById, {});

    expect(result.selector).toBeDefined();
    // Permissive: all entities, with matches indicating eligibility
    expect(result.selector!.eligibleEntities.length).toBeGreaterThan(2);
    
    const matchingEntities = result.selector!.eligibleEntities.filter(e => e.matches);
    const nonMatchingEntities = result.selector!.eligibleEntities.filter(e => !e.matches);
    
    expect(matchingEntities).toHaveLength(2);
    expect(nonMatchingEntities.length).toBeGreaterThan(0);
  });

  it('should filter by entityType when specified', () => {
    const provider: EntityProvider = {
      selector: {
        id: 'talent-selector',
        name: 'Select a Rogue Talent',
        entityType: 'rogueTalent',
        min: 1,
        max: 1,
      },
    };

    const result = resolveProvider(provider, testEntities, getEntityById, {});

    expect(result.selector).toBeDefined();
    expect(result.selector!.eligibleEntities).toHaveLength(3);
    expect(result.selector!.eligibleEntities.every(e => e.entity.entityType === 'rogueTalent')).toBe(true);
  });

  it('should combine entityType with filter', () => {
    const filter: EntityFilter = {
      type: 'AND',
      filterPolicy: 'strict',
      conditions: [
        { field: 'level', operator: '==', value: 3 }
      ]
    };

    const provider: EntityProvider = {
      selector: {
        id: 'talent-selector',
        name: 'Select a Level 3 Rogue Talent',
        entityType: 'rogueTalent',
        filter: filter,
        min: 1,
        max: 1,
      },
    };

    const result = resolveProvider(provider, testEntities, getEntityById, {});

    expect(result.selector).toBeDefined();
    expect(result.selector!.eligibleEntities).toHaveLength(2);
    expect(result.selector!.eligibleEntities.map(e => e.entity.id)).toContain('talent-1');
    expect(result.selector!.eligibleEntities.map(e => e.entity.id)).toContain('talent-2');
  });
});

// =============================================================================
// Provider with both granted and selector
// =============================================================================

describe('resolveProvider - with both granted and selector', () => {
  it('should resolve both granted and selector independently', () => {
    const provider: EntityProvider = {
      granted: {
        specificIds: ['feat-1'],
      },
      selector: {
        id: 'feat-selector',
        name: 'Select additional feats',
        entityIds: ['feat-2', 'feat-3'],
        min: 1,
        max: 2,
      },
    };

    const result = resolveProvider(provider, testEntities, getEntityById, {});

    // Granted should have feat-1
    expect(result.granted).toBeDefined();
    expect(result.granted!.entities).toHaveLength(1);
    expect(result.granted!.entities[0].id).toBe('feat-1');

    // Selector should have feat-2 and feat-3 as eligible
    expect(result.selector).toBeDefined();
    expect(result.selector!.eligibleEntities).toHaveLength(2);
    expect(result.selector!.eligibleEntities.map(e => e.entity.id)).toContain('feat-2');
    expect(result.selector!.eligibleEntities.map(e => e.entity.id)).toContain('feat-3');
  });
});

// =============================================================================
// Empty Provider
// =============================================================================

describe('resolveProvider - empty provider', () => {
  it('should return warning for provider with neither granted nor selector', () => {
    const provider: EntityProvider = {};

    const result = resolveProvider(provider, testEntities, getEntityById, {});

    expect(result.granted).toBeUndefined();
    expect(result.selector).toBeUndefined();
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].type).toBe('empty_provider');
  });
});
