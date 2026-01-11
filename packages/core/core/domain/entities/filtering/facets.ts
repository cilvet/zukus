import { Entity, SearchableFields, TaggableFields, EnumOption } from '../types/base';
import { EntitySchemaDefinition } from '../types/schema';
import { hasAllowedValues, isEnumField } from '../types/fields';

// Facet for filtering
export type EntityFacet = {
  fieldName: string;
  displayName: string;
  type: 'text' | 'select' | 'multiselect' | 'number' | 'boolean';
  options?: string[] | number[] | EnumOption[]; // For select/multiselect, can include metadata
};

// Type for entities that can be used with facets
type FacetableEntity = Entity & SearchableFields & Partial<TaggableFields>;

// Generate facets for filtering from entity definition
export function generateFacets(definition: EntitySchemaDefinition, entities: FacetableEntity[] = []): EntityFacet[] {
  const facets: EntityFacet[] = [
    // Base facets for SearchableEntity
    {
      fieldName: 'name',
      displayName: 'Name',
      type: 'text'
    },
    {
      fieldName: 'entityType',
      displayName: 'Type',
      type: 'select',
      options: [...new Set(entities.map(e => e.entityType))]
    },
    {
      fieldName: 'tags',
      displayName: 'Tags',
      type: 'multiselect',
      options: [...new Set(entities.flatMap(e => e.tags || []))]
    }
  ];

  // Add facets for custom fields
  definition.fields.forEach(field => {
    let facet: EntityFacet;

    switch (field.type) {
      case 'string':
        if (hasAllowedValues(field) && typeof field.allowedValues[0] === 'string') {
          // Field has predefined values, create select facet
          facet = {
            fieldName: field.name,
            displayName: field.description || field.name,
            type: 'select',
            options: field.allowedValues as string[]
          };
        } else {
          // Regular string field, create text facet
          facet = {
            fieldName: field.name,
            displayName: field.description || field.name,
            type: 'text'
          };
        }
        break;
      case 'integer':
        if (hasAllowedValues(field) && typeof field.allowedValues[0] === 'number') {
          // Field has predefined values, create select facet
          facet = {
            fieldName: field.name,
            displayName: field.description || field.name,
            type: 'select',
            options: field.allowedValues as number[]
          };
        } else {
          // Regular integer field, create number facet
          facet = {
            fieldName: field.name,
            displayName: field.description || field.name,
            type: 'number'
          };
        }
        break;
      case 'boolean':
        facet = {
          fieldName: field.name,
          displayName: field.description || field.name,
          type: 'boolean'
        };
        break;
      case 'string_array':
        let stringOptions: string[];
        if (hasAllowedValues(field) && typeof field.allowedValues[0] === 'string') {
          // Use predefined values
          stringOptions = field.allowedValues as string[];
        } else {
          // Extract unique values from entities for this field
          stringOptions = entities
            .map(e => (e as any)[field.name])
            .filter(value => Array.isArray(value))
            .flat()
            .filter((value, index, array) => array.indexOf(value) === index);
        }
        
        facet = {
          fieldName: field.name,
          displayName: field.description || field.name,
          type: 'multiselect',
          options: stringOptions
        };
        break;
      case 'integer_array':
        let intOptions: number[];
        if (hasAllowedValues(field) && typeof field.allowedValues[0] === 'number') {
          // Use predefined values
          intOptions = field.allowedValues as number[];
        } else {
          // Extract unique values from entities for this field
          intOptions = entities
            .map(e => (e as any)[field.name])
            .filter(value => Array.isArray(value))
            .flat()
            .filter((value, index, array) => array.indexOf(value) === index)
            .sort((a, b) => a - b);
        }
        
        facet = {
          fieldName: field.name,
          displayName: field.description || field.name,
          type: 'multiselect',
          options: intOptions
        };
        break;
      case 'reference':
        // Extract unique reference IDs from entities for this field
        const referenceValues = entities
          .map(e => (e as any)[field.name])
          .filter(value => Array.isArray(value))
          .flat()
          .filter((value, index, array) => array.indexOf(value) === index)
          .sort();
        
        facet = {
          fieldName: field.name,
          displayName: field.description || field.name,
          type: 'multiselect',
          options: referenceValues
        };
        break;
      case 'enum':
        if (isEnumField(field) && field.options && field.options.length > 0) {
          // Use enum options with full metadata
          facet = {
            fieldName: field.name,
            displayName: field.description || field.name,
            type: 'select',
            options: field.options // Include full EnumOption objects with metadata
          };
        } else {
          return; // Skip invalid enum fields
        }
        break;
      default:
        return; // Skip unsupported types
    }

    facets.push(facet);
  });

  return facets;
}