import {
  ContextualizedChange,
  CustomVariableChange,
} from "../../baseData/changes";
import { ContextualChange } from "../../baseData/contextualChange";
import { CharacterBaseData } from "../../baseData/character";
import { CustomVariable } from "../../calculatedSheet/customVariables";
import { Source, SourceValue } from "../../calculatedSheet/sources";
import { getSheetWithUpdatedField } from "../calculateCharacterSheet";
import {
  calculateSource,
  SubstitutionIndex,
} from "../sources/calculateSources";
import { CharacterChanges } from "../sources/compileCharacterChanges";
import { getCalculatedSourceValues } from "../sources/sumSources";
import { valueIndexKeys } from "../valuesIndex/valuesIndex";
import { CustomVariableDefinitionChange, SpecialChange } from "../../baseData/specialChanges";
import { BaseSource } from "../../baseData/customVariables";
import { extractCustomVariableDependencies } from "../../../formulae/formula";



/**
 * Builds a dependency graph for custom variables
 */
function buildDependencyGraph(
  sources: Source<ContextualizedChange<CustomVariableChange>>[]
): Map<string, string[]> {
  const dependencyGraph = new Map<string, string[]>();
  
  sources.forEach(source => {
    const variableId = source.uniqueId;
    const dependencies = extractCustomVariableDependencies(source.formula);
    dependencyGraph.set(variableId, dependencies);
  });
  
  return dependencyGraph;
}

/**
 * Performs topological sort to resolve dependencies
 * Returns null if circular dependency is detected
 */
function topologicalSort(dependencyGraph: Map<string, string[]>): string[] | null {
  const result: string[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();
  
  function visit(node: string): boolean {
    if (visiting.has(node)) {
      // Circular dependency detected
      console.log(`Circular dependency detected involving variable: ${node}`);
      return false;
    }
    
    if (visited.has(node)) {
      return true;
    }
    
    visiting.add(node);
    
    const dependencies = dependencyGraph.get(node) || [];
    for (const dependency of dependencies) {
      if (dependencyGraph.has(dependency)) {
        if (!visit(dependency)) {
          return false;
        }
      }
    }
    
    visiting.delete(node);
    visited.add(node);
    result.push(node);
    
    return true;
  }
  
  // Visit all nodes
  for (const node of dependencyGraph.keys()) {
    if (!visited.has(node)) {
      if (!visit(node)) {
        return null; // Circular dependency detected
      }
    }
  }
  
  return result;
}

/**
 * Sorts custom variable sources by dependency order
 */
function sortSourcesByDependencies(
  sources: Source<ContextualizedChange<CustomVariableChange>>[]
): Source<ContextualizedChange<CustomVariableChange>>[] {
  const dependencyGraph = buildDependencyGraph(sources);
  const sortedVariableIds = topologicalSort(dependencyGraph);
  
  if (!sortedVariableIds) {
    // Circular dependency detected, return original order with warning
    console.log("Warning: Circular dependency detected in custom variables. Using original order.");
    return sources;
  }
  
  // Group sources by variable ID
  const sourcesByVariable = new Map<string, Source<ContextualizedChange<CustomVariableChange>>[]>();
  sources.forEach(source => {
    const variableId = source.uniqueId;
    if (!sourcesByVariable.has(variableId)) {
      sourcesByVariable.set(variableId, []);
    }
    sourcesByVariable.get(variableId)!.push(source);
  });
  
  // Build result in dependency order
  const sortedSources: Source<ContextualizedChange<CustomVariableChange>>[] = [];
  
  // First add variables in dependency order
  sortedVariableIds.forEach(variableId => {
    const variableSources = sourcesByVariable.get(variableId);
    if (variableSources) {
      sortedSources.push(...variableSources);
      sourcesByVariable.delete(variableId);
    }
  });
  
  // Add any remaining sources that weren't in the dependency graph (no dependencies)
  sourcesByVariable.forEach(remainingSources => {
    sortedSources.push(...remainingSources);
  });
  
  return sortedSources;
}

/**
 * Extracts all CUSTOM_VARIABLE_DEFINITION special changes from the compiled special changes
 */
function extractCustomVariableDefinitions(
  specialChanges?: SpecialChange[]
): CustomVariableDefinitionChange[] {
  if (!specialChanges) {
    return [];
  }

  return specialChanges.filter(
    (specialChange): specialChange is CustomVariableDefinitionChange =>
      specialChange.type === 'CUSTOM_VARIABLE_DEFINITION'
  );
}

/**
 * Converts a BaseSource to a ContextualizedChange<CustomVariableChange>
 */
function convertBaseSourceToContextualizedChange(
  baseSource: BaseSource,
  definitionOriginId: string
): ContextualizedChange<CustomVariableChange> {
  return {
    ...baseSource,
    originId: definitionOriginId,
    originType: 'other',
    name: baseSource.name
  };
}


export const getCalculatedCustomVariables: getSheetWithUpdatedField = function (
  baseData: CharacterBaseData,
  index: SubstitutionIndex,
  changes: CharacterChanges,
  contextualChanges?: ContextualChange[],
  specialChanges?: SpecialChange[]
) {
  // Extract custom variable definitions from compiled special changes
  const customVariableDefinitions = extractCustomVariableDefinitions(specialChanges);
  
  // Create a map of variableId -> definition for easy lookup
  const definitionsByVariableId = new Map<string, CustomVariableDefinitionChange>();
  customVariableDefinitions.forEach(definition => {
    definitionsByVariableId.set(definition.variableId, definition);
  });
  
  // Create contextualized changes from base sources in definitions
  const baseSourceChanges: ContextualizedChange<CustomVariableChange>[] = [];
  customVariableDefinitions.forEach(definition => {
    definition.baseSources.forEach(baseSource => {
      const contextualizedChange = convertBaseSourceToContextualizedChange(
        baseSource,
        definition.variableId
      );
      baseSourceChanges.push(contextualizedChange);
    });
  });
  
  // Combine existing changes with base source changes
  const allCustomVariableChanges = [...changes.customVariableChanges, ...baseSourceChanges];

  const { customVariables, finalIndex } = calculateCustomVariablesWithDependencies(
    allCustomVariableChanges,
    index,
    definitionsByVariableId
  );

  // Extract only the new index values that were added
  const indexValuesToUpdate: SubstitutionIndex = {};

  // Get the difference between finalIndex and original index
  Object.keys(finalIndex).forEach(key => {
    if (!(key in index) || finalIndex[key] !== index[key]) {
      indexValuesToUpdate[key] = finalIndex[key];
    }
  });

  return {
    characterSheetFields: {
      customVariables,
    },
    indexValues: indexValuesToUpdate,
  };
};

/**
 * Calculates custom variables with dependency resolution
 */
function calculateCustomVariablesWithDependencies(
  changes: ContextualizedChange<CustomVariableChange>[],
  initialIndex: SubstitutionIndex,
  definitionsByVariableId: Map<string, CustomVariableDefinitionChange>
): { customVariables: CustomVariable[], finalIndex: SubstitutionIndex } {
  const customVariables: CustomVariable[] = [];
  let currentIndex = { ...initialIndex };

  // Create initial sources to analyze dependencies
  const initialSources = changes.map(change => calculateSource(change, initialIndex));
  
  // Sort sources by dependency order
  const sortedSources = sortSourcesByDependencies(initialSources);

  // Create a map from uniqueId to original change
  const changesByUniqueId = new Map<string, ContextualizedChange<CustomVariableChange>[]>();
  changes.forEach(change => {
    if (!changesByUniqueId.has(change.uniqueId)) {
      changesByUniqueId.set(change.uniqueId, []);
    }
    changesByUniqueId.get(change.uniqueId)!.push(change);
  });

  // Group sources by uniqueId while maintaining order
  const sourcesByVariable = new Map<string, Source<ContextualizedChange<CustomVariableChange>>[]>();
  const orderedVariableIds: string[] = [];

  sortedSources.forEach((source) => {
    const variableId = source.uniqueId;
    if (!sourcesByVariable.has(variableId)) {
      sourcesByVariable.set(variableId, []);
      orderedVariableIds.push(variableId);
    }
    sourcesByVariable.get(variableId)!.push(source);
  });

  // Calculate each variable in dependency order
  orderedVariableIds.forEach(variableId => {
    // Get the original changes for this variable and calculate with current index
    const variableChanges = changesByUniqueId.get(variableId)!;
    const freshSources = variableChanges.map(change => calculateSource(change, currentIndex));
    
    const { total, sourceValues } = getCalculatedSourceValues(freshSources);

    // Check if there's a definition for this variable
    const definition = definitionsByVariableId.get(variableId);
    
    const customVariable: CustomVariable = {
      uniqueId: variableId,
      name: definition ? definition.name : variableId,
      description: definition?.description,
      totalValue: total,
      sources: sourceValues,
    };

    customVariables.push(customVariable);

    // Update the substitution index with the calculated value
    const indexKey = valueIndexKeys.CUSTOM_VARIABLE(variableId);
    currentIndex[indexKey] = total;
  });

  return { 
    customVariables, 
    finalIndex: currentIndex 
  };
}