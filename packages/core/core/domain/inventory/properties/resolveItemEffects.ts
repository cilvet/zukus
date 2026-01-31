/**
 * Resolución de efectos de propiedades sobre items.
 *
 * Cuando un item tiene un campo con `applyEffectsToParent: true`,
 * los Effects de las entidades referenciadas se resuelven y aplican
 * al item contenedor.
 *
 * Ejemplo: Un arma con la propiedad "Keen" tiene un Effect con
 * target "@item.critRange" que duplica el rango de crítico.
 */

import type { Effect, EffectFormula } from '../../character/baseData/effects';
import type { StandardEntity } from '../../entities/types/base';

/**
 * Obtiene la expresión de fórmula como string.
 * Para switch formulas, retorna el defaultValue ya que no podemos evaluar aquí.
 */
function getFormulaExpression(formula: EffectFormula): string {
  if (typeof formula === 'string') {
    return formula;
  }
  // Es un objeto Formula
  if ('type' in formula && formula.type === 'switch') {
    // Para switch formulas, usamos defaultValue como placeholder
    return formula.defaultValue;
  }
  if ('expression' in formula) {
    return formula.expression;
  }
  return '';
}

/**
 * Contexto para resolver efectos de propiedades.
 */
export type ItemEffectContext = {
  /** El item contenedor (e.g., la weapon) */
  item: StandardEntity & Record<string, unknown>;
  /** Las propiedades resueltas (e.g., entidades de weaponProperty) */
  properties: StandardEntity[];
};

/**
 * Resultado de aplicar efectos de propiedades a un item.
 */
export type ResolvedItem<T extends StandardEntity = StandardEntity> = T & {
  /** Propiedades resueltas (entidades completas para auto-contenido) */
  _resolvedProperties?: StandardEntity[];
  /** Efectos aplicados desde propiedades */
  _appliedEffects?: AppliedPropertyEffect[];
  /** Valores modificados por propiedades */
  _modifiedFields?: Record<string, unknown>;
};

/**
 * Registro de un efecto aplicado desde una propiedad.
 */
export type AppliedPropertyEffect = {
  /** ID de la propiedad que aportó el efecto */
  propertyId: string;
  /** Nombre de la propiedad para display */
  propertyName: string;
  /** El efecto original */
  effect: Effect;
  /** Campo del item que fue modificado */
  targetField: string;
  /** Valor original antes de la modificación */
  originalValue: unknown;
  /** Valor después de la modificación */
  modifiedValue: unknown;
};

/**
 * Extrae el nombre del campo de un target de efecto.
 * Soporta targets como "@item.critRange" -> "critRange"
 *
 * @param target - El target del efecto
 * @returns El nombre del campo o null si no es un target de item
 */
export function extractItemFieldFromTarget(target: string): string | null {
  const match = target.match(/^@item\.(.+)$/);
  return match ? match[1] : null;
}

/**
 * Recolecta todos los efectos de las propiedades que aplican al item.
 *
 * @param properties - Array de entidades de propiedad
 * @returns Array de efectos con metadata de su origen
 */
export function collectPropertyEffects(
  properties: StandardEntity[]
): Array<{ property: StandardEntity; effect: Effect }> {
  const collectedEffects: Array<{ property: StandardEntity; effect: Effect }> = [];

  for (const property of properties) {
    const effects = property.effects ?? [];

    for (const effect of effects) {
      // Solo incluir efectos que apuntan a campos del item
      if (effect.target && extractItemFieldFromTarget(effect.target)) {
        collectedEffects.push({ property, effect });
      }
    }
  }

  return collectedEffects;
}

/**
 * Aplica los efectos de propiedades a un item.
 *
 * Esta función crea una copia del item con los valores modificados
 * según los efectos de sus propiedades.
 *
 * NOTA: Esta es una implementación simplificada. La evaluación completa
 * de fórmulas y el sistema de bonus types se haría en el CharacterUpdater
 * cuando se integre con el sistema de cálculo del personaje.
 *
 * @param item - El item a modificar
 * @param properties - Las propiedades del item
 * @param evaluateFormula - Función opcional para evaluar fórmulas
 * @returns El item con los valores modificados
 */
export function applyPropertyEffectsToItem<T extends StandardEntity>(
  item: T & Record<string, unknown>,
  properties: StandardEntity[],
  evaluateFormula?: (formula: string, context: Record<string, unknown>) => unknown
): ResolvedItem<T> {
  // Si no hay propiedades, retornar el item sin cambios
  if (properties.length === 0) {
    return item;
  }

  const collectedEffects = collectPropertyEffects(properties);
  const appliedEffects: AppliedPropertyEffect[] = [];
  const modifiedFields: Record<string, unknown> = {};

  // Crear copia del item para no mutar el original
  const resolvedItem: Record<string, unknown> = { ...item };

  for (const { property, effect } of collectedEffects) {
    const fieldName = extractItemFieldFromTarget(effect.target);
    if (!fieldName) continue;

    const originalValue = resolvedItem[fieldName];

    // Evaluar el nuevo valor
    let modifiedValue: unknown;

    if (effect.formula && evaluateFormula) {
      // Crear contexto para la fórmula con acceso a campos del item
      const formulaContext: Record<string, unknown> = {
        item: resolvedItem,
        [`@item.${fieldName}`]: originalValue,
      };

      // Añadir todos los campos del item como @item.fieldName
      for (const [key, value] of Object.entries(resolvedItem)) {
        formulaContext[`@item.${key}`] = value;
      }

      const formulaStr = getFormulaExpression(effect.formula);
      modifiedValue = evaluateFormula(formulaStr, formulaContext);
    } else if (effect.formula) {
      // Si hay fórmula pero no evaluador, usar la expresión como valor
      // Esto permite casos donde la fórmula es un valor constante como "1d6 fire"
      const formulaStr = getFormulaExpression(effect.formula);
      modifiedValue = formulaStr;
    } else {
      // Si no hay fórmula, saltar
      continue;
    }

    // Aplicar la modificación
    resolvedItem[fieldName] = modifiedValue;
    modifiedFields[fieldName] = modifiedValue;

    appliedEffects.push({
      propertyId: property.id,
      propertyName: property.name,
      effect,
      targetField: fieldName,
      originalValue,
      modifiedValue,
    });
  }

  return {
    ...resolvedItem,
    _resolvedProperties: properties,  // Guardar entidades completas para auto-contenido
    _appliedEffects: appliedEffects.length > 0 ? appliedEffects : undefined,
    _modifiedFields: Object.keys(modifiedFields).length > 0 ? modifiedFields : undefined,
  } as ResolvedItem<T>;
}

/**
 * Verifica si un item tiene propiedades que aplican efectos.
 *
 * @param item - El item a verificar
 * @param propertiesFieldName - Nombre del campo de propiedades (default: "properties")
 * @returns true si el item tiene propiedades con efectos
 */
export function hasPropertyEffects(
  item: StandardEntity & Record<string, unknown>,
  propertiesFieldName: string = 'properties'
): boolean {
  const propertyIds = item[propertiesFieldName];

  if (!Array.isArray(propertyIds) || propertyIds.length === 0) {
    return false;
  }

  return true;
}
