import { createEntitySchema } from '../entities/schema/creation';
import type { 
  Compendium, 
  CompendiumRegistry, 
  CompendiumWarning, 
  ResolvedCompendiumContext, 
  ResolvedEntityType 
} from './types';

/**
 * Resuelve los compendios activos a un contexto utilizable.
 * 
 * @param registry - Registro con IDs de compendios disponibles/activos
 * @param loadCompendium - Función para cargar un compendio por ID
 * @returns Contexto resuelto con entityTypes y warnings
 */
export function resolveCompendiumContext(
  registry: CompendiumRegistry,
  loadCompendium: (id: string) => Compendium | undefined
): ResolvedCompendiumContext {
  const entityTypes = new Map<string, ResolvedEntityType>();
  const warnings: CompendiumWarning[] = [];
  const activeCompendiums: { id: string; name: string }[] = [];
  const loadedCompendiumIds = new Set<string>();

  // Cargar cada compendio activo
  for (const compendiumId of registry.active) {
    const compendium = loadCompendium(compendiumId);
    
    if (!compendium) {
      warnings.push({
        type: 'missing_dependency',
        message: `Compendium '${compendiumId}' not found`,
        context: { compendiumId }
      });
      continue;
    }

    loadedCompendiumIds.add(compendiumId);
  }

  // Verificar dependencias y procesar compendios
  for (const compendiumId of registry.active) {
    const compendium = loadCompendium(compendiumId);
    if (!compendium) {
      continue;
    }

    // Verificar dependencias
    const missingDependencies: string[] = [];
    for (const depId of compendium.dependencies) {
      if (!loadedCompendiumIds.has(depId)) {
        missingDependencies.push(depId);
      }
    }

    if (missingDependencies.length > 0) {
      warnings.push({
        type: 'missing_dependency',
        message: `Compendium '${compendium.name}' has missing dependencies: ${missingDependencies.join(', ')}`,
        context: { 
          compendiumId: compendium.id, 
          missingDependencies 
        }
      });
      // Continuamos procesando, pero registramos el warning
    }

    // Registrar schemas
    for (const schema of compendium.schemas) {
      const existingType = entityTypes.get(schema.typeName);
      
      if (existingType) {
        // Conflicto de schemas: el primero gana
        warnings.push({
          type: 'schema_conflict',
          message: `Schema conflict for '${schema.typeName}': already defined by '${existingType.sourceCompendiumId}', ignoring definition from '${compendium.id}'`,
          context: {
            typeName: schema.typeName,
            existingSource: existingType.sourceCompendiumId,
            conflictingSource: compendium.id
          }
        });
        continue;
      }

      // Generar validador Zod
      const validator = createEntitySchema(schema);

      entityTypes.set(schema.typeName, {
        schema,
        validator,
        sourceCompendiumId: compendium.id
      });
    }

    activeCompendiums.push({
      id: compendium.id,
      name: compendium.name
    });
  }

  return {
    entityTypes,
    availableTypeNames: Array.from(entityTypes.keys()),
    activeCompendiums,
    warnings
  };
}

