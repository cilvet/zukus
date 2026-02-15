import { CharacterBaseData } from "../../baseData/character";
import {
  CGEDefinitionChange,
  CustomVariableDefinitionChange,
  SpecialChange,
} from "../../baseData/specialChanges";
import { getClassLevels } from "../classLevels/calculateCharacterClassLevels";
import type { CGEConfig, LevelTable } from "../../../cge/types";

/**
 * Extrae los CGE_DEFINITION de los special changes y genera
 * CUSTOM_VARIABLE_DEFINITION para cada slot y limite de conocidos.
 *
 * Esto permite que el sistema de custom variables procese los valores
 * del CGE junto con cualquier modificador externo (bonus spells, effects, etc.)
 */
export function compileCGEVariableDefinitions(
  characterBaseData: CharacterBaseData,
  specialChanges: SpecialChange[]
): CustomVariableDefinitionChange[] {
  const cgeDefinitions = extractCGEDefinitions(specialChanges);
  const classLevels = getClassLevels(characterBaseData);
  const variableDefinitions: CustomVariableDefinitionChange[] = [];

  for (const definition of cgeDefinitions) {
    const { config } = definition;
    let classLevel = classLevels[config.classId] ?? 0;

    // For racial CGEs, classId is the raceId (e.g., 'gnome').
    // If the character has a matching raceEntity, use character level.
    if (classLevel === 0 && characterBaseData.raceEntity?.id === config.classId) {
      const characterLevel = characterBaseData.levelSlots?.filter(s => s.classId !== null).length ?? 0;
      classLevel = Math.max(characterLevel, 1);
    }

    if (classLevel === 0) {
      continue;
    }

    // Generar variables de conocidos
    const knownVariables = generateKnownVariableDefinitions(config, classLevel);
    variableDefinitions.push(...knownVariables);

    // Generar variables de slots para cada track
    for (const track of config.tracks) {
      if (track.resource.type === 'SLOTS') {
        const slotVariables = generateSlotVariableDefinitions(
          config,
          track.resource.table,
          classLevel
        );
        variableDefinitions.push(...slotVariables);
      }
    }

    // Generar variable de nivel de caster
    variableDefinitions.push(
      generateCasterLevelVariable(config, classLevel)
    );
  }

  return variableDefinitions;
}

// =============================================================================
// Private Functions
// =============================================================================

function extractCGEDefinitions(specialChanges: SpecialChange[]): CGEDefinitionChange[] {
  return specialChanges.filter(
    (change): change is CGEDefinitionChange => change.type === 'CGE_DEFINITION'
  );
}

function generateKnownVariableDefinitions(
  config: CGEConfig,
  classLevel: number
): CustomVariableDefinitionChange[] {
  const definitions: CustomVariableDefinitionChange[] = [];
  const { variables, known } = config;

  if (!known) {
    return definitions;
  }

  if (known.type === 'LIMITED_PER_ENTITY_LEVEL') {
    const row = known.table[classLevel];
    if (!row) return definitions;

    for (let level = 0; level < row.length; level++) {
      const max = row[level];
      if (max > 0) {
        definitions.push({
          type: 'CUSTOM_VARIABLE_DEFINITION',
          variableId: `${variables.classPrefix}.known.${level}.max`,
          name: `${config.classId} Known Spells Level ${level}`,
          description: `Maximum known spells of level ${level} for ${config.classId}`,
          baseSources: [
            {
              type: 'CUSTOM_VARIABLE',
              uniqueId: `${variables.classPrefix}.known.${level}.max`,
              bonusTypeId: 'BASE',
              formula: { expression: String(max) },
              name: `${config.classId} Base Known Level ${level}`,
              createVariableForSource: true,
            },
          ],
        });
      }
    }
  }

  if (known.type === 'LIMITED_TOTAL') {
    const table = known.table;
    if (table) {
      const row = table[classLevel];
      if (row && row.length > 0) {
        const max = row[0];
        definitions.push({
          type: 'CUSTOM_VARIABLE_DEFINITION',
          variableId: `${variables.classPrefix}.known.total.max`,
          name: `${config.classId} Total Known`,
          description: `Maximum total known for ${config.classId}`,
          baseSources: [
            {
              type: 'CUSTOM_VARIABLE',
              uniqueId: `${variables.classPrefix}.known.total.max`,
              bonusTypeId: 'BASE',
              formula: { expression: String(max) },
              name: `${config.classId} Base Known Total`,
              createVariableForSource: true,
            },
          ],
        });
      }
    }
  }

  return definitions;
}

function generateSlotVariableDefinitions(
  config: CGEConfig,
  table: LevelTable,
  classLevel: number
): CustomVariableDefinitionChange[] {
  const definitions: CustomVariableDefinitionChange[] = [];
  const { variables } = config;

  const row = table[classLevel];
  if (!row) return definitions;

  for (let level = 0; level < row.length; level++) {
    const max = row[level];
    if (max > 0) {
      definitions.push({
        type: 'CUSTOM_VARIABLE_DEFINITION',
        variableId: `${variables.classPrefix}.slot.${level}.max`,
        name: `${config.classId} Spell Slots Level ${level}`,
        description: `Maximum spell slots of level ${level} for ${config.classId}`,
        baseSources: [
          {
            type: 'CUSTOM_VARIABLE',
            uniqueId: `${variables.classPrefix}.slot.${level}.max`,
            bonusTypeId: 'BASE',
            formula: { expression: String(max) },
            name: `${config.classId} Base Slots Level ${level}`,
            createVariableForSource: true,
          },
        ],
      });
    }
  }

  return definitions;
}

function generateCasterLevelVariable(
  config: CGEConfig,
  classLevel: number
): CustomVariableDefinitionChange {
  const { variables } = config;

  return {
    type: 'CUSTOM_VARIABLE_DEFINITION',
    variableId: variables.casterLevelVar,
    name: `${config.classId} Caster Level`,
    description: `Caster level for ${config.classId}`,
    baseSources: [
      {
        type: 'CUSTOM_VARIABLE',
        uniqueId: variables.casterLevelVar,
        bonusTypeId: 'BASE',
        formula: { expression: String(classLevel) },
        name: `${config.classId} Base Caster Level`,
        createVariableForSource: true,
      },
    ],
  };
}
