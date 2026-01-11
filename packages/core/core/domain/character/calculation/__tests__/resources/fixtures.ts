import { ResourceDefinitionChange } from "../../../baseData/specialChanges";
import { buildCharacter } from "../../../../../tests/character/buildCharacter";
import { bard } from "../../../../../../srd/classes";

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
        expression: '3'
    },
    defaultChargesPerUseFormula: {
        expression: '1'
    },
    rechargeFormula: {
        expression: '3'
    }
};

/**
 * Ki Pool simplificado para testing sin dependencia de nivel de monk
 */
export const simplifiedKiPool = {
    ...kiPoolResource,
    maxValueFormula: {
        expression: '2 + @ability.wisdom.modifier'
    },
    rechargeFormula: {
        expression: '2 + @ability.wisdom.modifier'
    }
};

/**
 * Standard ability scores for testing
 */
export const standardAbilityScores = {
    strength: 10,
    dexterity: 14,
    constitution: 12,
    intelligence: 13,
    wisdom: 11,
    charisma: 16
};

/**
 * Base character builder with bard class and bardic music resource
 */
export function createBaseBard(level: number = 4) {
    return buildCharacter()
        .withName("Test Bard")
        .withBaseAbilityScores(standardAbilityScores)
        .withClassLevels(bard, level)
        .withSpecialFeatures([
            {
                uniqueId: "bardic_music",
                title: "Bardic Music",
                description: "Inspire allies with musical performances",
                specialChanges: [bardicMusicResource]
            }
        ]);
}
