import type { StandardEntity } from '../entities/types/base';
import type { CompendiumWarning, ResolvedCompendiumContext } from './types';

export type ValidationResult = {
  validEntities: StandardEntity[];
  warnings: CompendiumWarning[];
};

/**
 * Valida las customEntities del personaje contra los schemas.
 * 
 * @param customEntities - Entidades del usuario por entityType
 * @param compendiumContext - Contexto resuelto con validadores
 * @returns Entidades válidas + warnings
 */
export function validateCustomEntities(
  customEntities: Record<string, StandardEntity[]> | undefined,
  compendiumContext: ResolvedCompendiumContext | undefined
): ValidationResult {
  const validEntities: StandardEntity[] = [];
  const warnings: CompendiumWarning[] = [];

  // Si no hay customEntities, retornar vacío
  if (!customEntities) {
    return { validEntities, warnings };
  }

  // Si no hay contexto de compendios, generar warning y skip todas
  if (!compendiumContext) {
    warnings.push({
      type: 'no_context',
      message: 'No compendium context provided, skipping all custom entities validation',
      context: { 
        entityCount: Object.values(customEntities).flat().length 
      }
    });
    return { validEntities, warnings };
  }

  // Validar cada grupo de entidades
  for (const [entityType, entities] of Object.entries(customEntities)) {
    const resolvedType = compendiumContext.entityTypes.get(entityType);

    // Verificar que el entityType existe
    if (!resolvedType) {
      warnings.push({
        type: 'unknown_entity_type',
        message: `Unknown entity type '${entityType}', skipping ${entities.length} entities`,
        context: { 
          entityType, 
          entityCount: entities.length,
          availableTypes: compendiumContext.availableTypeNames
        }
      });
      continue;
    }

    // Validar cada entidad
    for (const entity of entities) {
      const result = resolvedType.validator.safeParse(entity);

      if (result.success) {
        validEntities.push(entity);
      } else {
        warnings.push({
          type: 'invalid_entity',
          message: `Invalid entity '${entity.id}' of type '${entityType}': ${result.error.message}`,
          context: {
            entityId: entity.id,
            entityType,
            errors: result.error.issues
          }
        });
      }
    }
  }

  return { validEntities, warnings };
}

