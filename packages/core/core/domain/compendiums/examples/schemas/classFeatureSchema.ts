/**
 * Schema definition for D&D 3.5 Class Features
 */

import type { EntitySchemaDefinition } from '../../../entities/types/schema';

export const classFeatureSchema: EntitySchemaDefinition = {
  typeName: 'classFeature',
  description: 'D&D 3.5 Class Feature (Aptitudes de clase)',
  version: '1.0.0',
  addons: ['searchable', 'taggable', 'effectful', 'suppressing', 'providable'],
  fields: [
    {
      name: 'definesVariables',
      type: 'object_array',
      optional: true,
      description: 'Variables this feature defines (e.g., sneakAttackDice)',
      objectFields: [
        { name: 'name', type: 'string', description: 'Variable name' },
        { name: 'value', type: 'integer', optional: true, description: 'Static value' },
        {
          name: 'formula',
          type: 'object',
          optional: true,
          description: 'Dynamic formula',
          objectFields: [
            { name: 'expression', type: 'string', description: 'Formula expression' },
          ],
        },
      ],
    },
  ],
};

