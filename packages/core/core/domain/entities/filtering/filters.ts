import { Entity } from '../types/base';

// Filter criteria
export type EntityFilterCriteria = {
  [fieldName: string]: any;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
};

export type EntityFilter = {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  fieldMatch?: {
    [fieldName: string]: string | string[] | number | number[] | boolean;
  };
};

// Filter types
export type FilterType = 'AND' | 'OR' | 'NOT';

export type FilterOperator = '==' | '!=' | '>' | '<' | '>=' | '<=' | 'contains' | 'in';

// Enhanced filtering function
export function filterEntities(entities: Entity[], criteria: EntityFilterCriteria): Entity[] {
  let filtered = entities.filter(entity => {
    return Object.entries(criteria).every(([key, value]) => {
      // Skip sorting parameters
      if (key === 'sort_by' || key === 'sort_order') {
        return true;
      }

      if (value === undefined || value === null || value === '') {
        return true;
      }

      const entityValue = (entity as any)[key];

      // Handle array filtering (tags, or custom array fields)
      if (Array.isArray(value)) {
        if (!Array.isArray(entityValue)) {
          return false;
        }
        // All values in filter must be present in entity array
        return value.every(filterVal => entityValue.includes(filterVal));
      }

      // Handle array entity values (when filtering arrays with single values)
      if (Array.isArray(entityValue)) {
        return entityValue.includes(value);
      }

      // Handle string matching (can be partial for text fields)
      if (typeof value === 'string' && typeof entityValue === 'string') {
        return entityValue.toLowerCase().includes(value.toLowerCase());
      }

      // Strict equality for other types
      return entityValue === value;
    });
  });

  // Apply sorting if specified
  if (criteria.sort_by) {
    const sortField = criteria.sort_by;
    const sortOrder = criteria.sort_order || 'asc';

    filtered.sort((a, b) => {
      const aValue = (a as any)[sortField];
      const bValue = (b as any)[sortField];

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortOrder === 'asc' ? 1 : -1;
      if (bValue == null) return sortOrder === 'asc' ? -1 : 1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortOrder === 'asc' ? comparison : -comparison;
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Fallback to string comparison
      const comparison = String(aValue).localeCompare(String(bValue));
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }

  return filtered;
}
