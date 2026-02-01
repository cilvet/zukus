import { CharacterBaseData } from "../../baseData/character";
import { CalculatedResources } from "../../baseData/resources";
import { CharacterChanges } from "../sources/compileCharacterChanges";
import { SubstitutionIndex, calculateSource } from "../sources/calculateSources";
import { getSheetWithUpdatedField } from "../calculateCharacterSheet";
import { ContextualChange } from "../../baseData/contextualChange";
import { ResourceDefinitionChange, SpecialChange, CGEDefinitionChange } from "../../baseData/specialChanges";
import { getCalculatedSourceValues } from "../sources/sumSources";
import { SourceValue } from "../../calculatedSheet/sources";
import { CustomVariableChange, ContextualizedChange } from "../../baseData/changes";
import { Formula } from "../../../formulae/formula";

/**
 * Extracts all RESOURCE_DEFINITION special changes from compiled special changes,
 * including resources defined inside CGE_DEFINITION configs.
 */
function extractResourceDefinitions(specialChanges?: SpecialChange[]): ResourceDefinitionChange[] {
  if (!specialChanges) {
    return [];
  }

  const directDefinitions = specialChanges.filter(
    (specialChange): specialChange is ResourceDefinitionChange =>
      specialChange.type === 'RESOURCE_DEFINITION'
  );

  // Also extract resources defined inside CGE configs
  const cgeDefinitions = specialChanges.filter(
    (specialChange): specialChange is CGEDefinitionChange =>
      specialChange.type === 'CGE_DEFINITION'
  );

  const cgeResources: ResourceDefinitionChange[] = [];
  for (const cgeDef of cgeDefinitions) {
    if (cgeDef.config.resources) {
      for (const resource of cgeDef.config.resources) {
        // Convert CGE resource to ResourceDefinitionChange
        cgeResources.push({
          type: 'RESOURCE_DEFINITION',
          ...resource,
        });
      }
    }
  }

  return [...directDefinitions, ...cgeResources];
}

/**
 * Calculates a single resource property (max, min, etc.) as a custom variable
 * Also includes any additional custom variable bonuses with the same uniqueId
 */
function calculateResourceProperty(
  resourceDef: ResourceDefinitionChange,
  propertyName: string,
  formula: Formula,
  baseData: CharacterBaseData,
  substitutionIndex: SubstitutionIndex,
  existingCustomVariableChanges: ContextualizedChange<CustomVariableChange>[]
) {
  // Use the full uniqueId format with "resources." prefix to match custom variables
  const propertyUniqueId = `resources.${resourceDef.resourceId}.${propertyName}`;
  
  // Create a custom variable change for the base property
  const baseCustomVariableChange: ContextualizedChange<CustomVariableChange> = {
    type: 'CUSTOM_VARIABLE',
    uniqueId: propertyUniqueId,
    formula: formula,
    bonusTypeId: 'BASE',
    originId: resourceDef.resourceId,
    originType: 'base',
    name: `${resourceDef.name} ${propertyName}`
  };

  // Find any additional custom variables that affect this property
  const additionalChanges = existingCustomVariableChanges.filter(
    change => change.uniqueId === propertyUniqueId
  );

  // Combine base change with additional bonuses
  const allChanges = [baseCustomVariableChange, ...additionalChanges];
  
  // Calculate sources for all changes
  const sources = allChanges.map(change => calculateSource(change, substitutionIndex));
  
  // Sum all sources using stacking rules
  const { total, sourceValues } = getCalculatedSourceValues(sources);
  
  return { value: total, sources: sourceValues };
}

export const getCalculatedResources: getSheetWithUpdatedField = (
  baseData: CharacterBaseData,
  substitutionIndex: SubstitutionIndex,
  changes: CharacterChanges,
  contextualChanges?: ContextualChange[],
  specialChanges?: SpecialChange[]
) => {
  // Extract all resource definitions
  const resourceDefinitions = extractResourceDefinitions(specialChanges);
  
  const calculatedResources: CalculatedResources = {};
  const indexValuesToUpdate: SubstitutionIndex = {};

  // Get existing custom variable changes that might affect resources
  const existingCustomVariableChanges = changes.customVariableChanges;

  // Calculate each resource
  resourceDefinitions.forEach(resourceDef => {
    // Calculate max value
    const maxResult = calculateResourceProperty(
      resourceDef, 'max', resourceDef.maxValueFormula, baseData, substitutionIndex, existingCustomVariableChanges
    );

    // Calculate min value (default to 0)
    const minFormula = resourceDef.minValueFormula || { expression: '0' };
    const minResult = calculateResourceProperty(
      resourceDef, 'min', minFormula, baseData, substitutionIndex, existingCustomVariableChanges
    );

    // Calculate default charges per use (default to 1)
    const defaultChargesFormula = resourceDef.defaultChargesPerUseFormula || { expression: '1' };
    const defaultChargesResult = calculateResourceProperty(
      resourceDef, 'defaultChargesPerUse', defaultChargesFormula, baseData, substitutionIndex, existingCustomVariableChanges
    );

    // Calculate recharge amount
    const rechargeResult = calculateResourceProperty(
      resourceDef, 'rechargeAmount', resourceDef.rechargeFormula, baseData, substitutionIndex, existingCustomVariableChanges
    );

    // Get current value from character base data or initialize
    let currentValue = baseData.resourceCurrentValues?.[resourceDef.resourceId]?.currentValue;
    
    if (currentValue === undefined) {
      // Use initial value if specified, otherwise use max value
      if (resourceDef.initialValueFormula) {
        const initialResult = calculateResourceProperty(
          resourceDef, 'initial', resourceDef.initialValueFormula, baseData, substitutionIndex, existingCustomVariableChanges
        );
        currentValue = initialResult.value;
      } else {
        currentValue = maxResult.value;
      }
    }

    // Create fake sources for current value (since it's persisted data)
    const currentValueSources: SourceValue[] = [{
      value: currentValue,
      bonusTypeId: 'BASE',
      relevant: true,
      sourceName: 'Current Value',
      sourceUniqueId: `${resourceDef.resourceId}.current`,
    }];

    const resource = {
      uniqueId: resourceDef.resourceId,
      name: resourceDef.name,
      description: resourceDef.description,
      image: resourceDef.image,
      maxValue: maxResult.value,
      minValue: minResult.value,
      currentValue,
      defaultChargesPerUse: defaultChargesResult.value,
      rechargeAmount: rechargeResult.value,
      maxValueSources: maxResult.sources,
      minValueSources: minResult.sources,
      currentValueSources,
      defaultChargesPerUseSources: defaultChargesResult.sources,
      rechargeAmountSources: rechargeResult.sources
    };

    calculatedResources[resourceDef.resourceId] = resource;

    // Update substitution index with resource variables
    indexValuesToUpdate[`resources.${resourceDef.resourceId}.max`] = maxResult.value;
    indexValuesToUpdate[`resources.${resourceDef.resourceId}.min`] = minResult.value;
    indexValuesToUpdate[`resources.${resourceDef.resourceId}.current`] = currentValue;
    indexValuesToUpdate[`resources.${resourceDef.resourceId}.defaultChargesPerUse`] = defaultChargesResult.value;
    indexValuesToUpdate[`resources.${resourceDef.resourceId}.rechargeAmount`] = rechargeResult.value;
  });

  return {
    characterSheetFields: {
      resources: calculatedResources
    },
    indexValues: indexValuesToUpdate
  };
};