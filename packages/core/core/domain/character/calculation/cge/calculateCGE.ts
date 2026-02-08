import { CharacterBaseData } from "../../baseData/character";
import { CharacterChanges } from "../sources/compileCharacterChanges";
import { SubstitutionIndex } from "../sources/calculateSources";
import { CharacterSheet, CharacterWarning } from "../../calculatedSheet/sheet";
import { ContextualChange } from "../../baseData/contextualChange";
import { CGEDefinitionChange, SpecialChange } from "../../baseData/specialChanges";
import { CompiledEffects } from "../effects/compileEffects";
import { getClassLevels } from "../classLevels/calculateCharacterClassLevels";
import { valueIndexKeys } from "../valuesIndex/valuesIndex";
import type { getSheetWithUpdatedField } from "../calculateCharacterSheet";
import type {
  CGEConfig,
  CalculatedCGE,
  CalculatedTrack,
  CalculatedSlot,
  CalculatedKnownLimit,
  CalculatedBoundSlot,
  LevelTable,
  Track,
} from "../../../cge/types";

type KnownLimitsResult = {
  limits: CalculatedKnownLimit[] | undefined;
  warnings: CharacterWarning[];
};

/**
 * Calcula todos los CGEs del personaje a partir de los special changes.
 */
export const getCalculatedCGE: getSheetWithUpdatedField = (
  baseData: CharacterBaseData,
  substitutionIndex: SubstitutionIndex,
  changes: CharacterChanges,
  contextualChanges?: ContextualChange[],
  specialChanges?: SpecialChange[],
  effects?: CompiledEffects
) => {
  const cgeDefinitions = extractCGEDefinitions(specialChanges ?? []);
  const calculatedCGEs: Record<string, CalculatedCGE> = {};
  const indexValuesToUpdate: SubstitutionIndex = {};
  const cgeWarnings: CharacterWarning[] = [];

  for (const definition of cgeDefinitions) {
    const { config } = definition;
    const classLevel = getClassLevel(baseData, config.classId);

    if (classLevel === 0) {
      // No tiene niveles en esta clase, saltar
      continue;
    }

    const { calculatedCGE, warnings } = calculateSingleCGE(
      config,
      classLevel,
      baseData,
      substitutionIndex,
      indexValuesToUpdate
    );

    calculatedCGEs[config.id] = calculatedCGE;
    cgeWarnings.push(...warnings);
  }

  return {
    characterSheetFields: {
      cge: calculatedCGEs,
      // Warnings will be merged in calculateCharacterSheet
      _cgeWarnings: cgeWarnings,
    } as any,
    indexValues: indexValuesToUpdate,
  };
};

// =============================================================================
// Private Functions
// =============================================================================

function extractCGEDefinitions(specialChanges: SpecialChange[]): CGEDefinitionChange[] {
  return specialChanges.filter(
    (change): change is CGEDefinitionChange => change.type === 'CGE_DEFINITION'
  );
}

function getClassLevel(baseData: CharacterBaseData, classId: string): number {
  const classLevels = getClassLevels(baseData);
  return classLevels[classId] ?? 0;
}

type SingleCGEResult = {
  calculatedCGE: CalculatedCGE;
  warnings: CharacterWarning[];
};

function calculateSingleCGE(
  config: CGEConfig,
  classLevel: number,
  baseData: CharacterBaseData,
  substitutionIndex: SubstitutionIndex,
  indexValuesToUpdate: SubstitutionIndex
): SingleCGEResult {
  const { variables } = config;
  const warnings: CharacterWarning[] = [];

  // Leer limites de conocidos desde substitutionIndex (ya procesados por custom variables)
  const knownResult = calculateKnownLimits(
    config,
    classLevel,
    baseData,
    substitutionIndex,
    indexValuesToUpdate,
    variables.classPrefix
  );
  warnings.push(...knownResult.warnings);

  // Calcular tracks leyendo valores finales de substitutionIndex
  const tracksResult = calculateTracks(
    config,
    classLevel,
    baseData,
    substitutionIndex,
    indexValuesToUpdate,
    variables.classPrefix
  );
  warnings.push(...tracksResult.warnings);

  return {
    calculatedCGE: {
      id: config.id,
      classId: config.classId,
      entityType: config.entityType,
      classLevel,
      knownLimits: knownResult.limits,
      tracks: tracksResult.tracks,
      config,
    },
    warnings,
  };
}

function calculateKnownLimits(
  config: CGEConfig,
  classLevel: number,
  baseData: CharacterBaseData,
  substitutionIndex: SubstitutionIndex,
  indexValuesToUpdate: SubstitutionIndex,
  classPrefix: string
): KnownLimitsResult {
  const warnings: CharacterWarning[] = [];
  const cgeState = baseData.cgeState?.[config.id];
  const knownSelections = cgeState?.knownSelections ?? {};

  if (!config.known) {
    return { limits: undefined, warnings };
  }

  const known = config.known;

  if (known.type === 'UNLIMITED') {
    // Derive available levels from the first SLOTS track
    const firstTrack = config.tracks[0];
    if (!firstTrack || firstTrack.resource.type !== 'SLOTS') {
      return { limits: undefined, warnings };
    }

    const row = firstTrack.resource.table[classLevel];
    if (!row) {
      return { limits: undefined, warnings };
    }

    const limits: CalculatedKnownLimit[] = [];
    for (let level = 0; level < row.length; level++) {
      if (row[level] === 0) continue;
      const current = knownSelections[String(level)]?.length ?? 0;
      limits.push({ level, max: -1, current });
    }
    return { limits, warnings };
  }

  if (known.type === 'LIMITED_PER_ENTITY_LEVEL') {
    const table = known.table;
    const row = table[classLevel];
    if (!row) {
      return { limits: [], warnings };
    }

    const limits: CalculatedKnownLimit[] = [];
    for (let level = 0; level < row.length; level++) {
      const baseMax = row[level];
      if (baseMax > 0) {
        // Leer el valor final del substitutionIndex (con prefijo customVariable.)
        const varId = `${classPrefix}.known.${level}.max`;
        const customVarKey = valueIndexKeys.CUSTOM_VARIABLE(varId);
        const max = (substitutionIndex[customVarKey] as number) ?? baseMax;

        // Count known entities from cgeState
        const current = knownSelections[String(level)]?.length ?? 0;

        limits.push({ level, max, current });

        // Generate warning if over limit
        if (current > max) {
          warnings.push({
            type: 'known_limit_exceeded',
            message: `${config.id}: ${current}/${max} level ${level} ${config.entityType}s known (${current - max} over limit)`,
            context: {
              cgeId: config.id,
              entityType: config.entityType,
              level,
              current,
              max,
              over: current - max,
            },
          });
        }

        // Exponer tambien sin prefijo para acceso conveniente
        indexValuesToUpdate[varId] = max;
        indexValuesToUpdate[`${classPrefix}.known.${level}.current`] = current;
      }
    }
    return { limits, warnings };
  }

  if (known.type === 'LIMITED_TOTAL') {
    const table = known.table;
    if (table) {
      const row = table[classLevel];
      if (row && row.length > 0) {
        const varId = `${classPrefix}.known.total.max`;
        const customVarKey = valueIndexKeys.CUSTOM_VARIABLE(varId);
        const max = (substitutionIndex[customVarKey] as number) ?? row[0];

        // Count total known entities from all levels
        let current = 0;
        for (const entityIds of Object.values(knownSelections)) {
          current += entityIds.length;
        }

        // Generate warning if over limit
        if (current > max) {
          warnings.push({
            type: 'known_limit_exceeded',
            message: `${config.id}: ${current}/${max} total ${config.entityType}s known (${current - max} over limit)`,
            context: {
              cgeId: config.id,
              entityType: config.entityType,
              level: -1,
              current,
              max,
              over: current - max,
            },
          });
        }

        indexValuesToUpdate[varId] = max;
        indexValuesToUpdate[`${classPrefix}.known.total.current`] = current;
        return { limits: [{ level: -1, max, current }], warnings };
      }
    }
    return { limits: [], warnings };
  }

  return { limits: undefined, warnings };
}

type TracksResult = {
  tracks: CalculatedTrack[];
  warnings: CharacterWarning[];
};

function calculateTracks(
  config: CGEConfig,
  classLevel: number,
  baseData: CharacterBaseData,
  substitutionIndex: SubstitutionIndex,
  indexValuesToUpdate: SubstitutionIndex,
  classPrefix: string
): TracksResult {
  const warnings: CharacterWarning[] = [];

  const tracks = config.tracks.map(track => {
    const calculatedTrack: CalculatedTrack = {
      id: track.id,
      label: track.label,
      resourceType: track.resource.type,
      preparationType: track.preparation.type,
    };

    if (track.resource.type === 'SLOTS') {
      const slotsResult = calculateSlots(
        track,
        track.id, // trackId for slot namespacing
        classLevel,
        baseData,
        config,
        substitutionIndex,
        indexValuesToUpdate,
        classPrefix
      );
      calculatedTrack.slots = slotsResult.slots;
      warnings.push(...slotsResult.warnings);
    }

    if (track.resource.type === 'POOL') {
      const resourceId = track.resource.resourceId;
      // Read from substitutionIndex (resources are calculated before CGE)
      const max = (substitutionIndex[`resources.${resourceId}.max`] as number) ?? 0;
      const current = (substitutionIndex[`resources.${resourceId}.current`] as number) ?? max;
      calculatedTrack.pool = { max, current };
    }

    return calculatedTrack;
  });

  return { tracks, warnings };
}

type SlotsResult = {
  slots: CalculatedSlot[];
  warnings: CharacterWarning[];
};

function calculateSlots(
  track: Track,
  trackId: string,
  classLevel: number,
  baseData: CharacterBaseData,
  config: CGEConfig,
  substitutionIndex: SubstitutionIndex,
  indexValuesToUpdate: SubstitutionIndex,
  classPrefix: string
): SlotsResult {
  if (track.resource.type !== 'SLOTS') {
    return { slots: [], warnings: [] };
  }

  const table = track.resource.table;
  const row = table[classLevel];
  if (!row) {
    return { slots: [], warnings: [] };
  }

  const slots: CalculatedSlot[] = [];
  const warnings: CharacterWarning[] = [];
  const cgeId = config.id;
  const cgeState = baseData.cgeState?.[cgeId];
  const boundPreparations = cgeState?.boundPreparations ?? {};
  const knownSelections = cgeState?.knownSelections ?? {};
  const usedBoundSlots = cgeState?.usedBoundSlots ?? {};
  const isBoundPreparation = track.preparation.type === 'BOUND';

  for (let level = 0; level < row.length; level++) {
    const baseMax = row[level];
    if (baseMax > 0) {
      // Leer el valor final del substitutionIndex (con prefijo customVariable.)
      const varId = `${classPrefix}.slot.${level}.max`;
      const customVarKey = valueIndexKeys.CUSTOM_VARIABLE(varId);
      const max = (substitutionIndex[customVarKey] as number) ?? baseMax;

      // Obtener valor actual del estado persistido
      // Si no hay valor, current = max (slots sin usar)
      // Si hay valor negativo, significa "gastados desde max" (ej: -2 = max - 2)
      // Si hay valor positivo, se usa directamente (para compatibilidad)
      const storedValue = cgeState?.slotCurrentValues?.[String(level)];
      let current: number;
      if (storedValue === undefined) {
        current = max;
      } else if (storedValue <= 0) {
        // Valor negativo o cero: interpretar como delta desde max
        current = max + storedValue;
      } else {
        // Valor positivo: usar directamente (compatibilidad con valores absolutos)
        current = storedValue;
      }

      const calculatedSlot: CalculatedSlot = {
        level,
        max,
        current,
        bonus: 0, // TODO: Calcular bonus de atributo
      };

      // Si es BOUND preparation, construir los slots individuales
      if (isBoundPreparation) {
        const boundSlots: CalculatedBoundSlot[] = [];

        for (let index = 0; index < max; index++) {
          const slotId = `${trackId}:${level}-${index}`;
          const preparedEntityId = boundPreparations[slotId];
          const used = usedBoundSlots[slotId] === true;

          boundSlots.push({
            slotId,
            level,
            index,
            preparedEntityId,
            used,
          });

          // Validar que la entidad preparada esta en los conocidos
          if (preparedEntityId && config.known) {
            const isKnown = isEntityInKnownSelections(
              knownSelections,
              preparedEntityId
            );
            if (!isKnown) {
              warnings.push({
                type: 'prepared_entity_not_known',
                message: `${config.id}: Entity "${preparedEntityId}" is prepared in slot ${slotId} but is not in the spellbook`,
                context: {
                  cgeId,
                  entityId: preparedEntityId,
                  slotId,
                  level,
                  index,
                },
              });
            }
          }
        }

        calculatedSlot.boundSlots = boundSlots;
      }

      slots.push(calculatedSlot);

      // Exponer variables para acceso conveniente en formulas
      indexValuesToUpdate[varId] = max;
      indexValuesToUpdate[`${classPrefix}.slot.${level}.current`] = current;
    }
  }

  // Verificar preparaciones en slots que no existen (fuera de rango)
  if (isBoundPreparation) {
    const outOfBoundsWarnings = validateBoundPreparationsInRange(
      boundPreparations,
      slots,
      config
    );
    warnings.push(...outOfBoundsWarnings);
  }

  return { slots, warnings };
}

/**
 * Checks if an entity ID is in any of the known selections.
 */
function isEntityInKnownSelections(
  knownSelections: Record<string, string[]>,
  entityId: string
): boolean {
  for (const entityIds of Object.values(knownSelections)) {
    if (entityIds.includes(entityId)) {
      return true;
    }
  }
  return false;
}

/**
 * Validates that all bound preparations are within valid slot ranges.
 */
function validateBoundPreparationsInRange(
  boundPreparations: Record<string, string>,
  slots: CalculatedSlot[],
  config: CGEConfig
): CharacterWarning[] {
  const warnings: CharacterWarning[] = [];

  // Build a set of valid slot IDs
  const validSlotIds = new Set<string>();
  for (const slot of slots) {
    for (let index = 0; index < slot.max; index++) {
      validSlotIds.add(`${slot.level}-${index}`);
    }
  }

  // Check each preparation
  for (const slotId of Object.keys(boundPreparations)) {
    if (!validSlotIds.has(slotId)) {
      warnings.push({
        type: 'preparation_slot_out_of_bounds',
        message: `${config.id}: Preparation in slot ${slotId} is out of bounds (slot does not exist)`,
        context: {
          cgeId: config.id,
          slotId,
          entityId: boundPreparations[slotId],
        },
      });
    }
  }

  return warnings;
}
