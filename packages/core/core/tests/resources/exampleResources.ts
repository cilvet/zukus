import { ResourceDefinitionChange } from "../../domain/character/baseData/specialChanges";

/**
 * Ejemplo de puntos de poder psiónico para un Psion
 */
export const psionicPowerPointsResource: ResourceDefinitionChange = {
  type: 'RESOURCE_DEFINITION',
  resourceId: 'psionic_power_points',
  name: 'Psionic Power Points',
  description: 'Points used to manifest psionic powers',
  maxValueFormula: {
    expression: '@class.psion.level + @ability.intelligence.modifier'
  },
  minValueFormula: {
    expression: '0'
  },
  defaultChargesPerUseFormula: {
    expression: '1'
  },
  rechargeFormula: {
    expression: '@class.psion.level + @ability.intelligence.modifier'
  }
};

/**
 * Simple test resource for testing
 */
export const simpleTestResource: ResourceDefinitionChange = {
  type: 'RESOURCE_DEFINITION',
  resourceId: 'simple_test_resource',
  name: 'Simple Test Resource',
  description: 'A simple resource for testing',
  maxValueFormula: {
    expression: '5 + @ability.intelligence.modifier'
  },
  minValueFormula: {
    expression: '0'
  },
  defaultChargesPerUseFormula: {
    expression: '1'
  },
  rechargeFormula: {
    expression: '5 + @ability.intelligence.modifier'
  }
};

/**
 * Ejemplo de usos diarios de Canción Bárdica
 */
export const bardicMusicResource: ResourceDefinitionChange = {
  type: 'RESOURCE_DEFINITION',
  resourceId: 'bardic_music_uses',
  name: 'Bardic Music Uses',
  description: 'Daily uses of bardic music abilities',
  maxValueFormula: {
    expression: 'max(@class.bard.level, 1)'
  },
  defaultChargesPerUseFormula: {
    expression: '1'
  },
  rechargeFormula: {
    expression: 'max(@class.bard.level, 1)'
  }
};

/**
 * Ejemplo de Ki Pool para Monk
 */
export const kiPoolResource: ResourceDefinitionChange = {
  type: 'RESOURCE_DEFINITION',
  resourceId: 'ki_pool',
  name: 'Ki Pool',
  description: 'Supernatural energy used for special abilities',
  maxValueFormula: {
    expression: 'floor(@class.monk.level / 2) + @ability.wisdom.modifier'
  },
  defaultChargesPerUseFormula: {
    expression: '1'
  },
  rechargeFormula: {
    expression: 'floor(@class.monk.level / 2) + @ability.wisdom.modifier'
  }
};

/**
 * Ejemplo de recurso con recarga limitada (por ejemplo, habilidad racial)
 */
export const draconicBreathResource: ResourceDefinitionChange = {
  type: 'RESOURCE_DEFINITION',
  resourceId: 'draconic_breath_weapon',
  name: 'Draconic Breath Weapon',
  description: 'Daily uses of breath weapon',
  maxValueFormula: {
    expression: '3' // Ejemplo: 3 usos por día
  },
  defaultChargesPerUseFormula: {
    expression: '1'
  },
  rechargeFormula: {
    expression: '3' // Se recargan todos los usos
  }
};