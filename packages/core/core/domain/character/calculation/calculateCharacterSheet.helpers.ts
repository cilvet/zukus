import { CharacterBaseData, SpecialFeature } from "../baseData/character";
import { ContextualChange } from "../baseData/contextualChange";
import { SpecialChange } from "../baseData/specialChanges";
import { CharacterSheet, CharacterWarning } from "../calculatedSheet/sheet";
import { resolveLevelEntities } from "../../levels/resolution/resolveLevelEntities";
import { validateCustomEntities } from "../../compendiums/validateCustomEntities";
import { compileCharacterEntities } from "./entities/compileCharacterEntities";
import {
  CharacterChanges,
  compileContextualizedChanges,
  categorizeChanges,
  mergeCharacterChanges,
} from "./sources/compileCharacterChanges";
import { CompiledEffects, compileCharacterEffects } from "./effects/compileEffects";
import type { ResolvedCompendiumContext } from "../../compendiums/types";
import type { ComputedEntity } from "../../entities/types/base";

// =============================================================================
// Types
// =============================================================================

export type ResolvedCharacterResult = {
  characterData: CharacterBaseData;
  warnings: CharacterWarning[];
};

export type CompiledChangesResult = {
  characterChanges: CharacterChanges;
  contextualChanges: ContextualChange[];
  specialChanges: SpecialChange[];
  effects: CompiledEffects;
  computedEntities: ComputedEntity[];
  warnings: CharacterWarning[];
};

// =============================================================================
// Level System Resolution
// =============================================================================

/**
 * Resolves level system entities by marking them as applicable/not applicable
 * based on the current levelSlots configuration.
 */
export function resolveLevelSystemEntities(
  characterBaseData: CharacterBaseData
): ResolvedCharacterResult {
  const warnings: CharacterWarning[] = [];
  
  const hasLevelSystemData = characterBaseData.entities || characterBaseData.classEntities;
  if (!hasLevelSystemData) {
    return { characterData: characterBaseData, warnings };
  }
  
  const resolutionResult = resolveLevelEntities(characterBaseData);
  
  const resolvedCharacterData = {
    ...characterBaseData,
    entities: resolutionResult.entities,
  };
  
  const resolutionWarnings = resolutionResult.warnings.map(w => ({
    type: w.type,
    message: w.message,
    context: {
      classId: w.classId,
      instanceId: w.instanceId,
    }
  }));
  
  warnings.push(...resolutionWarnings);
  
  return { characterData: resolvedCharacterData, warnings };
}

// =============================================================================
// Change Compilation
// =============================================================================

/**
 * Compiles and merges all character changes from different sources:
 * - Legacy changes (feats, buffs, items, etc.)
 * - Entity changes (customEntities + level system entities)
 * 
 * Also validates custom entities and compiles effects.
 */
export function compileAndMergeChanges(
  characterData: CharacterBaseData,
  compendiumContext?: ResolvedCompendiumContext
): CompiledChangesResult {
  const warnings: CharacterWarning[] = [];
  
  // Validate custom entities if they exist
  if (characterData.customEntities) {
    const validationResult = validateCustomEntities(
      characterData.customEntities,
      compendiumContext
    );
    
    const validationWarnings = validationResult.warnings.map(w => ({
      type: w.type,
      message: w.message,
      context: w.context
    }));
    
    warnings.push(...validationWarnings);
  }
  
  // Compile all entities (customEntities + level system entities)
  const entitiesResult = compileCharacterEntities(characterData, compendiumContext);
  warnings.push(...entitiesResult.warnings);
  
  // Compile legacy changes (feats, buffs, items, etc.)
  const [legacyChanges, legacyContextualChanges, legacySpecialChanges] =
    compileContextualizedChanges(characterData);
  
  // Categorize entity changes and merge with legacy changes
  const entityChanges = categorizeChanges(entitiesResult.changes);
  const characterChanges = mergeCharacterChanges(legacyChanges, entityChanges);
  
  // Merge contextual and special changes
  const contextualChanges = [
    ...legacyContextualChanges,
    ...entitiesResult.contextualChanges,
  ];
  const specialChanges = [
    ...legacySpecialChanges,
    ...entitiesResult.specialChanges,
  ];
  
  // Compile effects from all sources (buffs + custom entities)
  const effects = compileCharacterEffects(characterData, entitiesResult.computedEntities);
  
  return {
    characterChanges,
    contextualChanges,
    specialChanges,
    effects,
    computedEntities: entitiesResult.computedEntities,
    warnings,
  };
}

// =============================================================================
// Special Features
// =============================================================================

/**
 * Extracts special features from the character sheet's class features
 * and merges them with the base character's special features.
 */
export function getSpecialFeaturesFromSheet(
  characterData: CharacterBaseData,
  characterSheet: CharacterSheet
): SpecialFeature[] {
  const baseFeatures = characterData.specialFeatures ?? [];
  
  const classFeatures = characterSheet.level.levelsData.flatMap(levelData =>
    levelData.levelClassFeatures.map(classFeature => ({
      uniqueId: classFeature.uniqueId,
      title: classFeature.name,
      description: classFeature.description,
      changes: classFeature.changes,
      contextualChanges: classFeature.contextualChanges,
      specialChanges: classFeature.specialChanges,
    }))
  );
  
  return [...baseFeatures, ...classFeatures];
}

