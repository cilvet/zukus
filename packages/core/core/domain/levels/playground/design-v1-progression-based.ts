/**
 * Design V1: Progression-Based System
 * 
 * Exploración de un sistema donde:
 * - El sistema de juego define qué campos hay por nivel (HP roll, etc.)
 * - El sistema de juego también provee entidades a ciertos niveles (dotes, subidas de atributo)
 * - Las "clases" son entidades con progresión
 * - Los efectos pueden referenciar propiedades de la entidad (@entity.props.X)
 * 
 * CAMBIOS v1.1:
 * - LevelFieldDefinition usa el mismo sistema que EntityFieldDefinition
 * - Los proveedores del sistema (dotes, subidas de atributo) son EntityProviders
 * - Las subidas de atributo son entidades seleccionables
 */

import type { EntityProvider } from '../providers/types';
import type { Condition } from '../../character/baseData/conditions';
import type { EntityFilter } from '../filtering/types';
import type { EntityFieldDefinition } from '../../entities/types/fields';

// =============================================================================
// EXTENSIÓN DE CAMPOS - Añadimos min/max para enteros
// =============================================================================

/**
 * Extensión de EntityFieldDefinition para campos numéricos con límites.
 * TODO: Esto debería proponerse como adición al sistema de entidades.
 */
type ExtendedFieldDefinition = EntityFieldDefinition & {
    /** Valor mínimo (para integer) - puede ser fórmula */
    min?: string | number;
    /** Valor máximo (para integer) - puede ser fórmula */
    max?: string | number;
};

// =============================================================================
// CAMPOS DE NIVEL - Usan el mismo sistema que entidades
// =============================================================================

/**
 * Definición de un campo que el sistema requiere por nivel.
 * Extiende el sistema de campos de entidades.
 * 
 * El campo 'formula' permite calcular valores usando propiedades de la clase.
 */
type LevelFieldDefinition = ExtendedFieldDefinition & {
    /** 
     * Fórmula para calcular el valor o límites.
     * Puede usar @class.X para propiedades de la clase del nivel.
     * Ejemplo: "1d@class.hitDie" para HP roll
     */
    formula?: string;

    /**
     * Si true, este campo es una tirada de dado (usa la fórmula como dado)
     */
    isRoll?: boolean;
};

// =============================================================================
// SISTEMA DE JUEGO
// =============================================================================

/**
 * Definición de las reglas de niveles para un sistema de juego.
 */
type GameSystemLevelRules = {
    id: string;
    name: string;

    /**
     * Campos que se aplican en CADA nivel.
     * Las fórmulas pueden usar @class.X para propiedades de la clase.
     */
    perLevelFields: LevelFieldDefinition[];

    /**
     * Proveedores de entidades del sistema por nivel de personaje.
     * Clave = nivel de personaje, Valor = providers que aplican en ese nivel.
     * 
     * Ejemplo: { 1: [featSelector], 3: [featSelector], 4: [attributeSelector], ... }
     */
    systemProviders: Record<number, EntityProvider[]>;
};

// =============================================================================
// ENTIDAD CON PROGRESIÓN
// =============================================================================

/**
 * Un paso en la progresión de una entidad.
 */
type ProgressionStep = {
    level: number;
    providers: EntityProvider[];
};

/**
 * Propiedades que una entidad con progresión puede tener.
 * Estas son referenciadas por las fórmulas con @class.X
 */
type ProgressionEntityProperties = {
    [key: string]: string | number | boolean;
};

/**
 * Entidad que tiene progresión de niveles.
 */
type EntityWithProgression = {
    id: string;
    entityType: string;
    name: string;
    properties: ProgressionEntityProperties;
    progression: ProgressionStep[];
};

// =============================================================================
// ENTIDADES DE AUMENTO DE ATRIBUTO (definidas por el sistema D&D 3.5)
// =============================================================================

/**
 * Ejemplo de cómo el sistema D&D 3.5 definiría las entidades de aumento de atributo.
 * Estas son entidades normales que el selector del sistema ofrece.
 * 
 * El efecto usa @entity.props.attributeId para saber qué atributo aumentar.
 */
type AttributeIncreaseEntity = {
    id: string;
    entityType: 'levelAttributeIncrease';
    name: string;
    props: {
        attributeId: string;  // 'strength', 'dexterity', etc.
    };
    changes: Array<{
        type: 'ABILITY_SCORE';
        abilityUniqueId: '@entity.props.attributeId';  // Referencia a prop de la entidad
        bonusTypeId: 'LEVEL_INCREASE';
        formula: { expression: '1' };
    }>;
};

// Entidades que D&D 3.5 definiría:
const strengthIncrease: AttributeIncreaseEntity = {
    id: 'level-attribute-increase-strength',
    entityType: 'levelAttributeIncrease',
    name: 'Aumentar Fuerza',
    props: { attributeId: 'strength' },
    changes: [{
        type: 'ABILITY_SCORE',
        abilityUniqueId: '@entity.props.attributeId',
        bonusTypeId: 'LEVEL_INCREASE',
        formula: { expression: '1' },
    }],
};

const dexterityIncrease: AttributeIncreaseEntity = {
    id: 'level-attribute-increase-dexterity',
    entityType: 'levelAttributeIncrease',
    name: 'Aumentar Destreza',
    props: { attributeId: 'dexterity' },
    changes: [{
        type: 'ABILITY_SCORE',
        abilityUniqueId: '@entity.props.attributeId',
        bonusTypeId: 'LEVEL_INCREASE',
        formula: { expression: '1' },
    }],
};

// ... etc para cada atributo

// =============================================================================
// EJEMPLO: D&D 3.5 LEVEL RULES
// =============================================================================

const dnd35LevelRules: GameSystemLevelRules = {
    id: 'dnd-3.5',
    name: 'Dungeons & Dragons 3.5',

    perLevelFields: [
        {
            name: 'hp-roll',
            type: 'integer',
            description: 'Tirada de Puntos de Golpe',
            isRoll: true,
            formula: '1d@class.hitDie',
            min: 1,
            max: '@class.hitDie',
        },
        // Nota: Skill points se manejan diferente (x4 en nivel 1, entran en el provider de la clase)
    ],

    systemProviders: {
        // Nivel 1: Dote de personaje
        1: [
            {
                selector: {
                    id: 'character-feat',
                    name: 'Dote de Personaje',
                    min: 1,
                    max: 1,
                    filter: {
                        type: 'AND',
                        filterPolicy: 'strict',
                        conditions: [{ field: 'entityType', operator: '==', value: 'feat' }]
                    },
                },
            },
        ],

        // Nivel 3: Dote de personaje
        3: [
            {
                selector: {
                    id: 'character-feat',
                    name: 'Dote de Personaje',
                    min: 1,
                    max: 1,
                    filter: {
                        type: 'AND',
                        filterPolicy: 'strict',
                        conditions: [{ field: 'entityType', operator: '==', value: 'feat' }]
                    },
                },
            },
        ],

        // Nivel 4: Subida de atributo
        4: [
            {
                selector: {
                    id: 'level-attribute-increase',
                    name: 'Subida de Atributo',
                    min: 1,
                    max: 1,
                    filter: {
                        type: 'AND',
                        filterPolicy: 'strict',
                        conditions: [{ field: 'entityType', operator: '==', value: 'levelAttributeIncrease' }]
                    },
                },
            },
        ],

        // Nivel 6: Dote de personaje
        6: [
            {
                selector: {
                    id: 'character-feat',
                    name: 'Dote de Personaje',
                    min: 1,
                    max: 1,
                    filter: {
                        type: 'AND',
                        filterPolicy: 'strict',
                        conditions: [{ field: 'entityType', operator: '==', value: 'feat' }]
                    },
                },
            },
        ],

        // Nivel 8: Subida de atributo
        8: [
            {
                selector: {
                    id: 'level-attribute-increase',
                    name: 'Subida de Atributo',
                    min: 1,
                    max: 1,
                    filter: {
                        type: 'AND',
                        filterPolicy: 'strict',
                        conditions: [{ field: 'entityType', operator: '==', value: 'levelAttributeIncrease' }]
                    },
                },
            },
        ],

        // Nivel 9: Dote de personaje
        9: [
            {
                selector: {
                    id: 'character-feat',
                    name: 'Dote de Personaje',
                    min: 1,
                    max: 1,
                    filter: {
                        type: 'AND',
                        filterPolicy: 'strict',
                        conditions: [{ field: 'entityType', operator: '==', value: 'feat' }]
                    },
                },
            },
        ],

        // Nivel 12: Dote + Subida de atributo
        12: [
            {
                selector: {
                    id: 'character-feat',
                    name: 'Dote de Personaje',
                    min: 1,
                    max: 1,
                    filter: {
                        type: 'AND',
                        filterPolicy: 'strict',
                        conditions: [{ field: 'entityType', operator: '==', value: 'feat' }]
                    },
                },
            },
            {
                selector: {
                    id: 'level-attribute-increase',
                    name: 'Subida de Atributo',
                    min: 1,
                    max: 1,
                    filter: {
                        type: 'AND',
                        filterPolicy: 'strict',
                        conditions: [{ field: 'entityType', operator: '==', value: 'levelAttributeIncrease' }]
                    },
                },
            },
        ],

        // ... etc para niveles 15, 16, 18, 20
    },
};

// =============================================================================
// EJEMPLO: ROGUE CLASS
// =============================================================================

const rogueClass: EntityWithProgression = {
    id: 'rogue',
    entityType: 'class',
    name: 'Pícaro',

    properties: {
        hitDie: 6,
        skillPointsPerLevel: 8,
        babProgression: 'medium',
    },

    progression: [
        {
            level: 1,
            providers: [
                { granted: { specificIds: ['sneak-attack-1d6', 'trapfinding'] } },
                // Skill points como selector (x4 en nivel 1, pero eso es lógica de cálculo)
                {
                    selector: {
                        id: 'rogue-skills-1',
                        name: 'Habilidades de Pícaro',
                        min: 8,  // En realidad sería: @class.skillPointsPerLevel + @abilityModifier.intelligence
                        max: 8,
                        filter: {
                            type: 'AND',
                            filterPolicy: 'strict',
                            conditions: [{ field: 'entityType', operator: '==', value: 'skill' }]
                        },
                    },
                },
            ],
        },
        {
            level: 2,
            providers: [
                { granted: { specificIds: ['evasion'] } },
                {
                    selector: {
                        id: 'rogue-skills-2',
                        name: 'Habilidades de Pícaro',
                        min: 8,
                        max: 8,
                        filter: {
                            type: 'AND',
                            filterPolicy: 'strict',
                            conditions: [{ field: 'entityType', operator: '==', value: 'skill' }]
                        },
                    },
                },
            ],
        },
        {
            level: 3,
            providers: [
                { granted: { specificIds: ['sneak-attack-2d6', 'trap-sense-1'] } },
                {
                    selector: {
                        id: 'rogue-skills-3',
                        name: 'Habilidades de Pícaro',
                        min: 8,
                        max: 8,
                        filter: {
                            type: 'AND',
                            filterPolicy: 'strict',
                            conditions: [{ field: 'entityType', operator: '==', value: 'skill' }]
                        },
                    },
                },
            ],
        },
    ],
};

// =============================================================================
// EJEMPLO: BARD CLASS
// =============================================================================

const bardClass: EntityWithProgression = {
    id: 'bard',
    entityType: 'class',
    name: 'Bardo',

    properties: {
        hitDie: 6,
        skillPointsPerLevel: 6,
        babProgression: 'medium',
    },

    progression: [
        {
            level: 1,
            providers: [
                { granted: { specificIds: ['bardic-music', 'bardic-knowledge', 'countersong', 'fascinate', 'inspire-courage-1'] } },
                {
                    selector: {
                        id: 'bard-spells-known-0',
                        name: 'Trucos Conocidos',
                        min: 4,
                        max: 4,
                        filter: {
                            type: 'AND',
                            filterPolicy: 'strict',
                            conditions: [
                                { field: 'entityType', operator: '==', value: 'spell' },
                                { field: 'level', operator: '==', value: 0 },
                                // TODO: bard spell list condition
                            ]
                        },
                    },
                },
                {
                    selector: {
                        id: 'bard-skills-1',
                        name: 'Habilidades de Bardo',
                        min: 6,
                        max: 6,
                        filter: {
                            type: 'AND',
                            filterPolicy: 'strict',
                            conditions: [{ field: 'entityType', operator: '==', value: 'skill' }]
                        },
                    },
                },
            ],
        },
    ],
};

// =============================================================================
// ESTADO DEL PERSONAJE
// =============================================================================

type LevelFieldValues = {
    [fieldId: string]: number | string | string[];
};

type CharacterLevelTaken = {
    progressionEntityId: string;
    progressionEntityType: string;
    levelInProgression?: number;

    /** Valores de los campos del sistema (hp-roll, etc.) */
    fieldValues: LevelFieldValues;

    /** Selecciones de providers de la clase */
    providerSelections: {
        [selectorId: string]: string[];
    };

    /** Selecciones de providers del sistema (dotes de personaje, subidas de atributo) */
    systemProviderSelections: {
        [selectorId: string]: string[];
    };
};

type CharacterLevelState = {
    levelsTaken: CharacterLevelTaken[];
};

// =============================================================================
// EJEMPLO: DERVIN (Rogue 2 / Bard 1)
// =============================================================================

const dervinLevelState: CharacterLevelState = {
    levelsTaken: [
        // Nivel 1 de personaje = Rogue 1
        {
            progressionEntityId: 'rogue',
            progressionEntityType: 'class',
            levelInProgression: 1,
            fieldValues: {
                'hp-roll': 6,  // Máximo en nivel 1
            },
            providerSelections: {
                'rogue-skills-1': ['stealth', 'perception', 'acrobatics', 'disable-device', 'hide', 'move-silently', 'open-lock', 'tumble'],
            },
            systemProviderSelections: {
                'character-feat': ['improved-initiative'],  // Dote de nivel 1
            },
        },

        // Nivel 2 de personaje = Rogue 2
        {
            progressionEntityId: 'rogue',
            progressionEntityType: 'class',
            levelInProgression: 2,
            fieldValues: {
                'hp-roll': 4,  // Tiró 4 en 1d6
            },
            providerSelections: {
                'rogue-skills-2': ['bluff', 'diplomacy', 'sense-motive', 'sleight-of-hand', 'search', 'spot', 'listen', 'escape-artist'],
            },
            systemProviderSelections: {},  // No hay providers del sistema en nivel 2
        },

        // Nivel 3 de personaje = Bard 1
        {
            progressionEntityId: 'bard',
            progressionEntityType: 'class',
            levelInProgression: 1,
            fieldValues: {
                'hp-roll': 5,  // Tiró 5 en 1d6
            },
            providerSelections: {
                'bard-spells-known-0': ['light', 'mending', 'prestidigitation', 'read-magic'],
                'bard-skills-1': ['perform-sing', 'knowledge-history', 'spellcraft', 'use-magic-device', 'gather-information', 'decipher-script'],
            },
            systemProviderSelections: {
                'character-feat': ['weapon-finesse'],  // Dote de nivel 3
            },
        },

        // Nivel 4 de personaje = Rogue 3 (ejemplo futuro)
        // {
        //   progressionEntityId: 'rogue',
        //   progressionEntityType: 'class',
        //   levelInProgression: 3,
        //   fieldValues: { 'hp-roll': 3 },
        //   providerSelections: { 'rogue-skills-3': [...] },
        //   systemProviderSelections: {
        //     'level-attribute-increase': ['level-attribute-increase-dexterity'],  // Subida a nivel 4
        //   },
        // },
    ],
};

// =============================================================================
// CÁLCULOS DERIVADOS
// =============================================================================

function calculateClassLevels(state: CharacterLevelState): Record<string, number> {
    const levels: Record<string, number> = {};
    for (const level of state.levelsTaken) {
        const key = level.progressionEntityId;
        levels[key] = (levels[key] || 0) + 1;
    }
    return levels;
}

function calculateCharacterLevel(state: CharacterLevelState): number {
    return state.levelsTaken.length;
}

function calculateTotalHP(state: CharacterLevelState): number {
    let total = 0;
    for (const level of state.levelsTaken) {
        const hpRoll = level.fieldValues['hp-roll'];
        if (typeof hpRoll === 'number') {
            total += hpRoll;
        }
    }
    // Nota: Faltaría añadir CON modifier por nivel
    return total;
}

// =============================================================================
// NOTAS DE DISEÑO v1.1
// =============================================================================

/**
 * CAMBIOS RESPECTO A v1:
 * 
 * 1. LevelFieldDefinition extiende EntityFieldDefinition
 *    - Reutiliza el sistema de tipos de campos
 *    - Añade min/max para enteros (propuesta para el sistema de entidades)
 *    - Añade formula e isRoll para campos dinámicos
 * 
 * 2. systemProviders en GameSystemLevelRules
 *    - Las dotes de personaje son un EntityProvider con selector
 *    - Las subidas de atributo son un EntityProvider con selector
 *    - Usan characterLevels para indicar cuándo aplican
 * 
 * 3. Subidas de atributo como entidades
 *    - Entidades de tipo 'levelAttributeIncrease'
 *    - Tienen props.attributeId para identificar el atributo
 *    - El efecto usa @entity.props.attributeId
 * 
 * 4. @entity.props.X en efectos
 *    - Permite que los efectos referencien propiedades de la propia entidad
 *    - Ejemplo: abilityUniqueId: '@entity.props.attributeId'
 * 
 * PREGUNTAS PENDIENTES:
 * 
 * 1. ¿Cómo resolvemos @entity.props.X en el sistema de fórmulas?
 *    - Necesitamos pasar el contexto de la entidad al resolver fórmulas
 * 
 * 2. ¿Las skill points deberían ser un campo del sistema o un provider de la clase?
 *    - Actualmente están como provider en la clase
 *    - Pero la fórmula (skillPointsPerLevel + INT mod) podría ser del sistema
 * 
 * 3. ¿Cómo manejamos el x4 de skills en nivel 1?
 *    - ¿Condición en el provider?
 *    - ¿Campo especial firstLevelMultiplier?
 * 
 * 4. ¿Los IDs de selector deberían ser únicos globalmente o por nivel?
 *    - Actualmente: 'rogue-skills-1', 'rogue-skills-2', etc.
 *    - Alternativa: usar el nivel como parte del contexto
 */

export type {
    GameSystemLevelRules,
    LevelFieldDefinition,
    ExtendedFieldDefinition,
    EntityWithProgression,
    ProgressionStep,
    CharacterLevelState,
    CharacterLevelTaken,
    LevelFieldValues,
    AttributeIncreaseEntity,
};


// la clase será seleccionada multiples veces (en múltiples niveles) por lo tanto cada vez que se seleccione, se sumará 1 al nivel de la clase,
// con el objetivo de que en cada nivel se otorgen las aptitudes y selectores correspondientes.
const characterClass = {
    id: "rogue",
    name: "Pícaro",
    levelProviders: [
        // suma 1 al nivel de la clase.
        // Esto es un efecto que se aplica en cada nivel de la clase y por lo tanto no tiene condiciones.
        {
            type: "effect",
            effect: {
                id: "rogue-level-1-provider",
                key: "@class.level.rogue",
                value: 1
            }
        },
        {
            type: "table",
            table: {
                // depending on the value of the key at evaluation time, we will return a different provider.
                key: "@class.level.rogue",
                values: {
                    1: [
                        {
                            granted: {
                                specificIds: [
                                    "improved-initiative",
                                    "trapfinding"
                                ]
                            },
                        },
                        {
                            type: "selector",
                            selector: {
                                id: "rogue-level-1-selector",
                                name: "Pícaro",
                                entityType: "feat",
                                filter: {
                                    type: "AND",
                                    entityType: "feat",
                                    entityIds: [
                                        "improved-initiative",
                                        "trapfinding"
                                    ]
                                }
                            }
                        },
                    ]
                }
            }
        }
    ]
}