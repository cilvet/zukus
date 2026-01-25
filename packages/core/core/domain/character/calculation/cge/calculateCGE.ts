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
  LevelTable,
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
  const tracks = calculateTracks(
    config,
    classLevel,
    baseData,
    substitutionIndex,
    indexValuesToUpdate,
    variables.classPrefix
  );

  return {
    calculatedCGE: {
      id: config.id,
      classId: config.classId,
      entityType: config.entityType,
      classLevel,
      knownLimits: knownResult.limits,
      tracks,
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
    return { limits: undefined, warnings };
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

function calculateTracks(
  config: CGEConfig,
  classLevel: number,
  baseData: CharacterBaseData,
  substitutionIndex: SubstitutionIndex,
  indexValuesToUpdate: SubstitutionIndex,
  classPrefix: string
): CalculatedTrack[] {
  return config.tracks.map(track => {
    const calculatedTrack: CalculatedTrack = {
      id: track.id,
      label: track.label,
      resourceType: track.resource.type,
      preparationType: track.preparation.type,
    };

    if (track.resource.type === 'SLOTS') {
      calculatedTrack.slots = calculateSlots(
        track.resource.table,
        classLevel,
        baseData,
        config.id,
        substitutionIndex,
        indexValuesToUpdate,
        classPrefix
      );
    }

    if (track.resource.type === 'POOL') {
      // TODO: Implementar pool
      calculatedTrack.pool = { max: 0, current: 0 };
    }

    return calculatedTrack;
  });
}

function calculateSlots(
  table: LevelTable,
  classLevel: number,
  baseData: CharacterBaseData,
  cgeId: string,
  substitutionIndex: SubstitutionIndex,
  indexValuesToUpdate: SubstitutionIndex,
  classPrefix: string
): CalculatedSlot[] {
  const row = table[classLevel];
  if (!row) {
    return [];
  }

  const slots: CalculatedSlot[] = [];
  const cgeState = baseData.cgeState?.[cgeId];

  for (let level = 0; level < row.length; level++) {
    const baseMax = row[level];
    if (baseMax > 0) {
      // Leer el valor final del substitutionIndex (con prefijo customVariable.)
      const varId = `${classPrefix}.slot.${level}.max`;
      const customVarKey = valueIndexKeys.CUSTOM_VARIABLE(varId);
      const max = (substitutionIndex[customVarKey] as number) ?? baseMax;

      // Obtener valor actual del estado persistido, o usar max como default
      const current = cgeState?.slotCurrentValues?.[String(level)] ?? max;

      slots.push({
        level,
        max,
        current,
        bonus: 0, // TODO: Calcular bonus de atributo
      });

      // Exponer variables para acceso conveniente en formulas
      indexValuesToUpdate[varId] = max;
      indexValuesToUpdate[`${classPrefix}.slot.${level}.current`] = current;
    }
  }

  return slots;
}
