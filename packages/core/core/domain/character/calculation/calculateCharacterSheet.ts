import { CharacterBaseData, SpecialFeature } from "../baseData/character";
import { getCalculatedAbilityScores } from "./abilityScores/calculateAbilityScores";
import { getInitialValuesIndex } from "./valuesIndex/valuesIndex";
import { CharacterChanges } from "./sources/compileCharacterChanges";
import { getCalculatedInitiative } from "./initiative/calculateInitiative";
import { SubstitutionIndex } from "./sources/calculateSources";
import {
  CharacterSheet,
  CharacterWarning,
  getInitialCharacterSheet,
} from "../calculatedSheet/sheet";
import { getCalculatedHitPoints } from "./hitPoints/calculateHitPoints";
import { getCalculatedBaseAttackBonus } from "./baseAttackBonus/calculateBaseAttackBonus";
import { getCalculatedSavingThrows } from "./savingThrows/calculateSavingThrows";
import { getCalculatedArmorClass } from "./armorClass/calculateArmorClass";
import { ContextualChange } from "../baseData/contextualChange";
import { getCalculatedAttackData } from "./attacks/getCalculatedAttackData";
import { getCalculatedSize } from "./size/calculateSize";
import { getCalculatedSkills } from "./skills/calculateSkills";
import { getCalculatedCustomVariables } from "./customVariables/calculateCustomVariables";
import { getCalculatedResources } from "./resources/calculateResources";
import { getResourceCustomVariables } from "./resources/createResourceCustomVariables";
import { getCalculatedCGE } from "./cge/calculateCGE";
import { SpecialChange } from "../baseData/specialChanges";
import { CompiledEffects } from "./effects/compileEffects";
import type { CalculationContext } from "../../compendiums/types";
import {
  resolveLevelSystemEntities,
  compileAndMergeChanges,
  getSpecialFeaturesFromSheet,
} from "./calculateCharacterSheet.helpers";

export type getSheetWithUpdatedField = (
  baseData: CharacterBaseData,
  substitutionIndex: SubstitutionIndex,
  changes: CharacterChanges,
  contextualChanges?: ContextualChange[],
  specialChanges?: SpecialChange[],
  effects?: CompiledEffects
) => {
  characterSheetFields: Partial<CharacterSheet>;
  indexValues: SubstitutionIndex;
};

/**
 * The order of the calculation functions is important.
 * Some calculations depend on the result of previous calculations.
 * For example, the AC calculation depends on the DEX (ability score) calculation.
 */
const calculationFunctions: getSheetWithUpdatedField[] = [
  getCalculatedSize,
  getCalculatedAbilityScores,
  getCalculatedInitiative,
  getCalculatedHitPoints,
  getCalculatedBaseAttackBonus,
  getCalculatedSavingThrows,
  getCalculatedArmorClass,
  getCalculatedSkills,
  getCalculatedCustomVariables, // Procesa CGE variable definitions (generadas en compilacion)
  getCalculatedCGE, // Lee valores finales de substitutionIndex
  getCalculatedResources,
  getResourceCustomVariables, // Crea custom variables de resources (despues de calcularse)
];

/**
 * Calculates a complete character sheet from base character data.
 * 
 * @param characterBaseData - Base character data (abilities, classes, equipment, etc.)
 * @param context - Optional calculation context. Only used for validating customEntities
 *                  against compendium schemas. The calculation works perfectly fine without it.
 *                  If provided, validates entity types and generates warnings for invalid entities.
 * @returns Complete calculated character sheet with all stats, bonuses, and warnings
 */
export function calculateCharacterSheet(
  characterBaseData: CharacterBaseData,
  context?: CalculationContext
): CharacterSheet {
  const startTime = performance.now();
  const warnings: CharacterWarning[] = [];
  
  // Resolve level system entities
  const resolvedResult = resolveLevelSystemEntities(characterBaseData);
  const resolvedCharacterData = resolvedResult.characterData;
  warnings.push(...resolvedResult.warnings);
  
  // Compile all changes from all sources
  const compiledChanges = compileAndMergeChanges(
    resolvedCharacterData,
    context?.compendiumContext
  );
  warnings.push(...compiledChanges.warnings);
  
  // Run calculation pipeline
  const { characterSheet, valuesIndex } = runCalculationPipeline(
    resolvedCharacterData,
    compiledChanges.characterChanges,
    compiledChanges.contextualChanges,
    compiledChanges.specialChanges,
    compiledChanges.effects
  );

  // Merge pending resource custom variables with existing custom variables
  // Use a Map to deduplicate by uniqueId (keep the last occurrence)
  const sheetWithPending = characterSheet as CharacterSheet & {
    _pendingResourceCustomVariables?: typeof characterSheet.customVariables
  };
  if (sheetWithPending._pendingResourceCustomVariables) {
    const variableMap = new Map<string, typeof characterSheet.customVariables[0]>();
    for (const variable of characterSheet.customVariables) {
      variableMap.set(variable.uniqueId, variable);
    }
    for (const variable of sheetWithPending._pendingResourceCustomVariables) {
      variableMap.set(variable.uniqueId, variable);
    }
    characterSheet.customVariables = Array.from(variableMap.values());
    delete sheetWithPending._pendingResourceCustomVariables;
  }

  // Populate remaining sheet fields
  characterSheet.specialFeatures = getSpecialFeaturesFromSheet(
    resolvedCharacterData,
    characterSheet
  );
  
  characterSheet.attackData = getCalculatedAttackData(
    characterSheet,
    compiledChanges.characterChanges.attackChanges,
    compiledChanges.contextualChanges,
    valuesIndex
  );

  characterSheet.substitutionValues = valuesIndex;
  characterSheet.warnings = warnings;
  characterSheet.computedEntities = compiledChanges.computedEntities;
  
  logCalculationTime(startTime);
  
  return characterSheet;
}

// =============================================================================
// Private Functions
// =============================================================================

function runCalculationPipeline(
  characterData: CharacterBaseData,
  characterChanges: CharacterChanges,
  contextualChanges: ContextualChange[],
  specialChanges: SpecialChange[],
  effects: CompiledEffects
): { characterSheet: CharacterSheet; valuesIndex: SubstitutionIndex } {
  return calculationFunctions.reduce(
    (acc, calculationFunction) => {
      const { characterSheet, valuesIndex } = acc;
      const { characterSheetFields, indexValues } = calculationFunction(
        characterData,
        valuesIndex,
        characterChanges,
        contextualChanges,
        specialChanges,
        effects
      );

      return {
        characterSheet: {
          ...characterSheet,
          ...characterSheetFields,
        },
        valuesIndex: {
          ...valuesIndex,
          ...indexValues,
        },
      };
    },
    {
      characterSheet: getInitialCharacterSheet(characterData),
      valuesIndex: getInitialValuesIndex(characterData),
    }
  );
}

function logCalculationTime(startTime: number): void {
  const endTime = performance.now();
  const totalTime = endTime - startTime;
  console.log(`⏱️ Character sheet calculation took ${totalTime.toFixed(2)}ms`);
}
