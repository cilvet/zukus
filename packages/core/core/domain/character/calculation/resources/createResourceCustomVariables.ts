import { CharacterBaseData } from "../../baseData/character";
import { CustomVariable } from "../../calculatedSheet/customVariables";
import { SourceValue } from "../../calculatedSheet/sources";
import { ContextualChange } from "../../baseData/contextualChange";
import { ResourceDefinitionChange, SpecialChange } from "../../baseData/specialChanges";
import { CharacterChanges } from "../sources/compileCharacterChanges";
import { SubstitutionIndex } from "../sources/calculateSources";
import { getSheetWithUpdatedField } from "../calculateCharacterSheet";

/**
 * Extracts resource definitions from special changes
 */
function extractResourceDefinitions(
  specialChanges?: SpecialChange[]
): ResourceDefinitionChange[] {
  if (!specialChanges) {
    return [];
  }

  return specialChanges.filter(
    (specialChange): specialChange is ResourceDefinitionChange =>
      specialChange.type === 'RESOURCE_DEFINITION'
  );
}

/**
 * Creates custom variables for all resource properties based on values in substitution index.
 * This step runs AFTER calculateResources so the values are available.
 */
export const getResourceCustomVariables: getSheetWithUpdatedField = function (
  baseData: CharacterBaseData,
  substitutionIndex: SubstitutionIndex,
  changes: CharacterChanges,
  contextualChanges?: ContextualChange[],
  specialChanges?: SpecialChange[]
) {
  const resourceDefinitions = extractResourceDefinitions(specialChanges);
  const resourceCustomVariables: CustomVariable[] = [];

  resourceDefinitions.forEach(resourceDef => {
    const resourceId = resourceDef.resourceId;
    const resourceName = resourceDef.name;

    // Get values from substitution index (calculated by resources step)
    const maxValue = (substitutionIndex[`resources.${resourceId}.max`] as number) ?? 0;
    const minValue = (substitutionIndex[`resources.${resourceId}.min`] as number) ?? 0;
    const currentValue = (substitutionIndex[`resources.${resourceId}.current`] as number) ?? 0;
    const defaultChargesPerUse = (substitutionIndex[`resources.${resourceId}.defaultChargesPerUse`] as number) ?? 1;
    const rechargeAmount = (substitutionIndex[`resources.${resourceId}.rechargeAmount`] as number) ?? 0;

    // Create a source value for each property
    const createSource = (value: number, propertyName: string): SourceValue[] => [{
      value,
      bonusTypeId: 'BASE',
      relevant: true,
      sourceName: `${resourceName} ${propertyName}`,
      sourceUniqueId: `resources.${resourceId}.${propertyName}`,
    }];

    // Create custom variables for each resource property
    resourceCustomVariables.push(
      {
        uniqueId: `resources.${resourceId}.max`,
        name: `${resourceName} - Max`,
        description: `Maximum value for ${resourceName}`,
        totalValue: maxValue,
        sources: createSource(maxValue, 'max'),
      },
      {
        uniqueId: `resources.${resourceId}.min`,
        name: `${resourceName} - Min`,
        description: `Minimum value for ${resourceName}`,
        totalValue: minValue,
        sources: createSource(minValue, 'min'),
      },
      {
        uniqueId: `resources.${resourceId}.current`,
        name: `${resourceName} - Current`,
        description: `Current value for ${resourceName}`,
        totalValue: currentValue,
        sources: createSource(currentValue, 'current'),
      },
      {
        uniqueId: `resources.${resourceId}.defaultChargesPerUse`,
        name: `${resourceName} - Default Charges Per Use`,
        description: `Default charges consumed per use for ${resourceName}`,
        totalValue: defaultChargesPerUse,
        sources: createSource(defaultChargesPerUse, 'defaultChargesPerUse'),
      },
      {
        uniqueId: `resources.${resourceId}.rechargeAmount`,
        name: `${resourceName} - Recharge Amount`,
        description: `Amount restored when ${resourceName} is recharged`,
        totalValue: rechargeAmount,
        sources: createSource(rechargeAmount, 'rechargeAmount'),
      }
    );
  });

  return {
    characterSheetFields: {
      // Return as pending field - will be merged with customVariables in calculateCharacterSheet
      _pendingResourceCustomVariables: resourceCustomVariables,
    } as any,
    indexValues: {},
  };
};
