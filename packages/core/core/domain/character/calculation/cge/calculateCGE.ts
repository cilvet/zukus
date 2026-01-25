import { CharacterBaseData } from "../../baseData/character";
import { CharacterChanges } from "../sources/compileCharacterChanges";
import { SubstitutionIndex } from "../sources/calculateSources";
import { CharacterSheet } from "../../calculatedSheet/sheet";
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

  for (const definition of cgeDefinitions) {
    const { config } = definition;
    const classLevel = getClassLevel(baseData, config.classId);

    if (classLevel === 0) {
      // No tiene niveles en esta clase, saltar
      continue;
    }

    const calculatedCGE = calculateSingleCGE(
      config,
      classLevel,
      baseData,
      substitutionIndex,
      indexValuesToUpdate
    );

    calculatedCGEs[config.id] = calculatedCGE;
  }

  return {
    characterSheetFields: { cge: calculatedCGEs },
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

function calculateSingleCGE(
  config: CGEConfig,
  classLevel: number,
  baseData: CharacterBaseData,
  substitutionIndex: SubstitutionIndex,
  indexValuesToUpdate: SubstitutionIndex
): CalculatedCGE {
  const { variables } = config;

  // Leer limites de conocidos desde substitutionIndex (ya procesados por custom variables)
  const knownLimits = calculateKnownLimits(
    config,
    classLevel,
    substitutionIndex,
    indexValuesToUpdate,
    variables.classPrefix
  );

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
    id: config.id,
    classId: config.classId,
    entityType: config.entityType,
    classLevel,
    knownLimits,
    tracks,
    config,
  };
}

function calculateKnownLimits(
  config: CGEConfig,
  classLevel: number,
  substitutionIndex: SubstitutionIndex,
  indexValuesToUpdate: SubstitutionIndex,
  classPrefix: string
): CalculatedKnownLimit[] | undefined {
  if (!config.known) {
    return undefined;
  }

  const known = config.known;

  if (known.type === 'UNLIMITED') {
    return undefined;
  }

  if (known.type === 'LIMITED_PER_ENTITY_LEVEL') {
    const table = known.table;
    const row = table[classLevel];
    if (!row) {
      return [];
    }

    const limits: CalculatedKnownLimit[] = [];
    for (let level = 0; level < row.length; level++) {
      const baseMax = row[level];
      if (baseMax > 0) {
        // Leer el valor final del substitutionIndex (con prefijo customVariable.)
        const varId = `${classPrefix}.known.${level}.max`;
        const customVarKey = valueIndexKeys.CUSTOM_VARIABLE(varId);
        const max = (substitutionIndex[customVarKey] as number) ?? baseMax;
        limits.push({ level, max, current: 0 });

        // Exponer tambien sin prefijo para acceso conveniente
        indexValuesToUpdate[varId] = max;
      }
    }
    return limits;
  }

  if (known.type === 'LIMITED_TOTAL') {
    const table = known.table;
    if (table) {
      const row = table[classLevel];
      if (row && row.length > 0) {
        const varId = `${classPrefix}.known.total.max`;
        const customVarKey = valueIndexKeys.CUSTOM_VARIABLE(varId);
        const max = (substitutionIndex[customVarKey] as number) ?? row[0];
        indexValuesToUpdate[varId] = max;
        return [{ level: -1, max, current: 0 }];
      }
    }
    return [];
  }

  return undefined;
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
