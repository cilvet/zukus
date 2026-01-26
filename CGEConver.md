el tema de los modificadores Es algo que no va a funcionar como tú lo has propuesto, ya que la forma en la que lo haremos funcionar es que en el futuro tendremos contextos y por ello será importante 
que estos contextos serán contextos de acción y estas acciones tendrán que ver por ejemplo con el concepto de los CGE. La forma en la que tendrán que ver es que las entidades del CGE muy habitualmente 
van a ser entidades accionables, por lo tanto definirán acciones, esto es algo que no vamos a implementar de momento, pero lo harán. El tema es que para ejecutar acciones crearemos unos sistemas de 
contextos y para... En base a esos contextos lo que haremos será que... Tendremos por ejemplo un contexto de preparación en el cual podremos preparar conjuros o cualquier otro tipo de entidad. Este 
tipo de contextos lo que harán serán a efectos prácticos como funciones, es decir, recibirán una serie de inputs de forma obligada y devolverán unos resultados. Por ejemplo, a la hora de preparar el 
contexto de preparación de un conjto recibirá el conjuro a preparar como entidad, como parámetro y también recibirá una serie de efectos contextuales que habrán definido previamente que pertenecen a 
este contexto de preparación que provenerán de las dotes metamágicas que tenga el personaje. Estos dotes definirán entonces unos efectos contextuales que añadirán valor a la variable que representará 
el nivel efectivo del conjuro o más bien el nivel de preparación del conjuro ya que si recordamos en 3.5 el nivel efectivo de los conjuros no cambia cuando se le aplican dotes metamágicas. Dicho lo 
cual, en este contexto habrá definidas unas variables unas variables que se definirán dentro de ese scope y que acabarán como resultado del contexto también. Estas variables, en este caso por ejemplo, 
serán las de preparación de conjuros. Lo que estoy pensando es que tal vez el CGE debería permitir para cada tipo de entidad o para su tipo de entidad en caso de que sea un CGE de tipo preparación, 
recordemos que los CGE son para un so que olvida lo que he dicho para cada tipo. Debería poder definir un contexto de preparación de entidad. Este contexto definirá los campos que yo te he dicho y 
asumirá que va a recibir una entidad y el propio CGE será el que lo gestione para en última instancia preparar esa entidad y colocarla en el slot adecuado. Por otra parte me gustaría hablarte de 
recursos. Los recursos son uno de los primitivos de esta aplicación y los definimos hace tiempo. Quiero que los investigues para que veas cómo son. Los recursos nos permiten definir un tipo de dato que
 puede ser utilizado, que va a tener propiedades como un mínimo y un máximo y que por norma general se visualizaran dentro del sistema. Lo que tenemos que hacer con el CGE es ver qué tipo de recursos 
exponemos y cómo rellenamos esas propiedades de forma automática. Al fin y al cabo, por ejemplo, los slots de nivel de el hechicero son un recurso que puede utilizarse y de hecho hay dotes que permiten
 utilizar slots de cierto nivel para realizar acciones. Teniendo en cuenta todo esto y teniendo en cuenta que no tenemos por qué implementarlo ahora, dime cómo quedaría tu "assessment" de la situación.
 Si tienes dudas, puedes hacérmelas. 

⏺ Entiendo. Esto cambia fundamentalmente el enfoque. Déjame investigar el sistema de recursos existente primero:

⏺ Search(pattern: "type Resource|ResourceDefinition|ResourceInstance", path: "packages/core")
  ⎿  Found 13 files (ctrl+o to expand)

⏺ Search(pattern: "**/resource*.ts", path: "packages/core")
  ⎿  Found 7 files (ctrl+o to expand)

⏺ Read(packages/core/core/domain/character/baseData/resources.ts)
  ⎿  Read 33 lines

⏺ Read(packages/core/core/domain/spells/resources.ts)
  ⎿  Read 34 lines

⏺ Read(packages/core/core/domain/spells/actionsAndResources.md)
  ⎿  Read 415 lines

⏺ Ahora entiendo. Déjame darte mi assessment revisado:

  ---
  ASSESSMENT REVISADO: CGE y Contextos

  Lo que el CGE NO debe hacer

  El CGE NO debe definir cómo funcionan los modificadores. Los modificadores (metamagia, etc.) son entidades con efectos contextuales que pertenecen a contextos específicos. El sistema de contextos (futuro) se encargará de:

  1. Recibir inputs (entidad + efectos contextuales de dotes/features)
  2. Procesar en su scope
  3. Devolver resultados (variables resueltas, entidad modificada)

  Lo que el CGE SÍ debe hacer

  type CGETemplate = {
    id: string;
    labels: CGELabels;
    targetEntityType: string;

    // === POOL Y SELECCIÓN (como antes) ===
    poolSource: PoolSourceConfig;
    selectionStage: SelectionStageConfig;

    // === RECURSOS QUE GENERA ===
    // El CGE define QUÉ recursos expone, el sistema de Resources los gestiona
    exposedResources: ResourceDefinition[];

    // === CONTEXTOS QUE UTILIZA ===
    // El CGE declara qué contextos necesita, NO cómo funcionan
    contexts: {
      preparation?: ContextReference;  // Si aplica preparación
      usage?: ContextReference;        // Contexto de uso/casting
      recovery?: ContextReference;     // Contexto de recuperación
    };

    // === VARIABLES EXPUESTAS ===
    exposedVariables: VariableDefinition[];

    // === CONFIGURACIÓN DE RECOVERY ===
    recovery: RecoveryConfig;

    // === RESTRICCIONES ===
    restrictions: RestrictionsConfig;
  }

  Recursos que el CGE expone

  El CGE debe generar definiciones de Resource (el tipo que ya tenéis):

  type CGEResourceDefinition = {
    // Patrón de ID para generar recursos
    // Ej: "spell-slot-{level}" genera spell-slot-1, spell-slot-2, etc.
    idPattern: string;

    // Cómo se genera el nombre
    namePattern: string;  // "Slot de nivel {level}"

    // Fórmula para maxValue (usa variables del CGE/clase)
    maxValueFormula: string;  // "@cge.slotsPerDay[{level}]" o tabla

    // RefreshType del Resource existente
    refreshType: ResourceRefreshType;  // 'daily', 'encounter', etc.

    // Si genera múltiples recursos (por nivel de entidad)
    generatesMultiple?: {
      iterateOver: 'entityLevel';  // 0-9 para spells
      range: [number, number];     // [0, 9]
      condition?: string;          // "@cge.maxEntityLevel >= {level}"
    };
  }

  Ejemplo para Wizard (slots por nivel):

  const wizardSlotResources: CGEResourceDefinition = {
    idPattern: 'wizard-spell-slot-{level}',
    namePattern: 'Slot de conjuro nivel {level}',
    maxValueFormula: '@tables.wizardSlotsPerDay[@class.wizard.level][{level}] + @cge.bonusSlotsFromInt[{level}]',
    refreshType: 'daily',
    generatesMultiple: {
      iterateOver: 'entityLevel',
      range: [0, 9],
      condition: '@class.wizard.level >= (@level * 2) - 1'
    }
  }

  Ejemplo para Psion (pool único):

  const psionPowerPoints: CGEResourceDefinition = {
    idPattern: 'psion-power-points',
    namePattern: 'Power Points',
    maxValueFormula: '@tables.psionPP[@class.psion.level] + floor(@ability.intelligence.modifier * @class.psion.level * 0.5)',
    refreshType: 'daily'
    // Sin generatesMultiple - es un solo recurso
  }

  Contextos que el CGE referencia

  El CGE no define el contexto, solo lo referencia:

  type ContextReference = {
    contextId: string;           // ID del contexto a usar
    entityInputField: string;    // Qué se pasa como "entidad" al contexto

    // Qué efectos contextuales se recogen
    // (Ej: dotes con effectContext: 'spell-preparation')
    collectsEffectsFrom: string; // 'spell-preparation', 'spell-casting', etc.

    // Variables que el CGE espera recibir de vuelta del contexto
    expectedOutputs: string[];   // ['effectiveSlotLevel', 'castingTime', etc.]
  }

  Ejemplo:

  const wizardPreparationContext: ContextReference = {
    contextId: 'prepared-caster-preparation',
    entityInputField: 'spell',
    collectsEffectsFrom: 'spell-preparation',  // Metamagia, etc.
    expectedOutputs: ['effectiveSlotLevel', 'preparedSpellId']
  }

  El contexto en sí (definido fuera del CGE) sería algo como:

  // FUTURO - No implementar ahora
  type Context = {
    id: 'prepared-caster-preparation';
    inputs: ['entity', 'effectContextuals'];  // Lo que recibe

    // Variables de scope del contexto
    scopeVariables: {
      'baseSpellLevel': '@entity.level',
      'effectiveSlotLevel': '@baseSpellLevel',  // Será modificado por efectos
    };

    // Cómo se procesan los efectos
    effectProcessing: {
      target: 'effectiveSlotLevel',
      operation: 'sum'  // Los efectos metamágicos suman al slot
    };

    outputs: ['effectiveSlotLevel', 'entity'];
  }

  Flujo completo

  1. Usuario quiere preparar Fireball con Maximize Spell
  2. CGE invoca su contexto de preparación
  3. Contexto recibe:
     - entity: Fireball (level 3)
     - effectContextuals: [MaximizeSpell.preparationEffect (+3 slot)]
  4. Contexto procesa en su scope:
     - baseSpellLevel = 3
     - effectiveSlotLevel = 3 + 3 = 6
  5. Contexto devuelve:
     - effectiveSlotLevel: 6
  6. CGE usa el resultado para:
     - Verificar que hay slot de nivel 6 disponible
     - Colocar Fireball (Maximized) en ese slot
     - Consumir el recurso wizard-spell-slot-6

  Assessment final

  | Aspecto                           | Responsabilidad                  |
  |-----------------------------------|----------------------------------|
  | Definir tipos de recursos         | CGE (genera ResourceDefinitions) |
  | Calcular valores de recursos      | Sistema de Resources existente   |
  | Definir modificadores (metamagia) | Entidades con effectContextuals  |
  | Procesar modificadores            | Sistema de Contextos (futuro)    |
  | Orquestar flujo                   | CGE invoca contextos             |
  | Persistir estado                  | Resources.currentValue           |

  Preguntas para ti:

  1. ¿Los contextos serán entidades del compendio o definiciones hardcodeadas?
  2. ¿Un efecto contextual de una dote especifica a qué contexto pertenece, o el contexto busca efectos por tag?
  3. Para recursos multi-nivel (slots), ¿prefieres N recursos separados (slot-1, slot-2...) o un recurso con estructura interna?

> De momento los contextos de uso y recovery no los vamos a crear, no nos hacen falta porque el único contexto que tiene que definir correctamente el CGE es el de preparación ya que es el único 
contexto que dispara el propio CGE y no la entidad en sí. Por otra parte no acabo de comprender por qué has creado el resource definition para el CGE ya que el propio resource debería ser suficiente, 
el propio tipo de resource genérico que tenemos en la aplicación debería ser suficiente para esto. O eso, o yo no me estoy entrando muy bien. Respecto al tipo que podría tener un contexto, creo que te 
lo has inventado totalmente. Creo que eso es mejor que no lo intentemos definir de momento. Además, lo de recolectar efectos desde algún sitio tampoco tienes que tenerlo en cuenta porque eso lo 
gestionará el propio sistema automáticamente. O sea que no la referencia a contexto tampoco nos hace falta. Por favor investiga cómo funcionan ahora mismo los recursos para que puedas verlo 

⏺ Tienes razón, me adelanté demasiado. Déjame investigar cómo funcionan los recursos actualmente:

⏺ Read(packages/core/core/domain/character/calculation/resources/calculateResources.ts)
  ⎿  Read 167 lines

⏺ Search(pattern: "Resource", path: "packages/core/core/domain/character/baseData", output_mode: "content")
  ⎿  Found 17 lines (ctrl+o to expand)

⏺ Read(packages/core/core/domain/character/baseData/specialChanges.ts)
  ⎿  Read 114 lines

⏺ Ahora entiendo. El sistema ya tiene:

  1. Resource (tipo base): uniqueId, name, maxValue/minValue/initialValue como Formula, refreshType
  2. ResourceDefinitionChange (special change): Para crear recursos desde el pipeline de cambios
  3. Los recursos se definen en múltiples lugares: equipment.resources, buffs.resources, features.resources, race.resources, etc.
  4. El cálculo extrae ResourceDefinitionChange, evalúa las fórmulas, y expone variables: @resources.{id}.max, @resources.{id}.current, etc.

  ---
  ASSESSMENT SIMPLIFICADO

  El CGE solo necesita:

  type CGETemplate = {
    id: string;
    labels: CGELabels;
    targetEntityType: string;

    // Cómo se accede a las entidades
    poolSource: PoolSourceConfig;

    // Si requiere preparación y cómo
    selectionStage: SelectionStageConfig;

    // Recursos que genera (usando el tipo Resource existente)
    resources: Resource[];

    // Si tiene contexto de preparación
    preparationContext?: {
      contextId: string;
      // Variables que el contexto debe devolver
      // (el contexto en sí se define fuera del CGE)
    };

    // Cómo se recuperan los recursos
    recovery: RecoveryConfig;

    // Restricciones de acceso
    restrictions: RestrictionsConfig;

    // Variables expuestas al sistema de fórmulas
    exposedVariables: CustomVariableDefinitionChange[];
  }

  Ejemplo: Wizard con slots

  El CGE del Wizard generaría estos Resource[]:

  const wizardResources: Resource[] = [
    {
      uniqueId: 'wizard-slot-0',
      name: 'Slot de nivel 0',
      refreshType: 'daily',
      maxValue: { expression: '@tables.wizardSlots[@class.wizard.level][0]' },
    },
    {
      uniqueId: 'wizard-slot-1',
      name: 'Slot de nivel 1',
      refreshType: 'daily',
      maxValue: { expression: '@tables.wizardSlots[@class.wizard.level][1] + @cge.bonusSlotsFromInt[1]' },
    },
    // ... slots 2-9
  ];

  Estos recursos se inyectarían al personaje y el sistema existente los calcularía automáticamente.

  Pregunta clave

  ¿Los recursos del CGE deberían:

  A) Definirse como Resource[] estáticos en el template del CGE y añadirse al personaje cuando tiene esa clase/feature

  B) Generarse dinámicamente desde el CGE basándose en el nivel del personaje (ej: solo generar wizard-slot-5 si el wizard tiene nivel suficiente)

  C) Usar el Resource.maxValue con fórmula que devuelva 0 si no está disponible (el recurso siempre existe pero su max es 0)

> Una vez más no me importa que hagas el recovery config, no lo queremos para nada, porque los recursos gestionan su propia forma de recuperarse. El problema que le veo a este approach es que hay que 
definir los resources manualmente, y cre que la gracia de tener "presets" es que se creen automáticamente, aunque esto podría ser una automatización que hagamos ad-hoc en un formulario específico para 
cada preset, de forma que el usuario no tenga que rellenar todos los resources. lo que sí tenemos que definir para el CGE es el preparation context: definirá varias variables: el nivel de slot que 
ocupa la entidad, así como el hecho de que recibe una entidad de x tipo como input, lo cuál permitirá a los efectos aplicar cambios a los diferentes valores de la entidad. aquí tendremos que ver cómo 
usamos JMESpath para ser capaces de afectar a múltiples campos de dicha entidad, pero esto vendrá en el futuro. de momento este contexto de preparación afectará únicamente al nivel de slot del conjuro,
 que será la única variable final. 

⏺ Entendido. Simplificando aún más:

  CGE - Assessment Final

  type CGETemplate = {
    id: string;
    labels: CGELabels;
    targetEntityType: string;

    poolSource: PoolSourceConfig;
    selectionStage: SelectionStageConfig;

    // Recursos - generados automáticamente por presets en el formulario
    resources: Resource[];

    // Contexto de preparación (si el CGE lo requiere)
    preparationContext?: {
      // Tipo de entidad que recibe como input
      inputEntityType: string;  // 'spell', 'maneuver', etc.

      // Variable de salida: nivel de slot efectivo
      // Fórmula base antes de que los efectos contextuales la modifiquen
      effectiveSlotLevelBase: string;  // '@entity.level'
    };

    restrictions: RestrictionsConfig;
  }

  Flujo del contexto de preparación

  1. Usuario prepara Fireball + Maximize Spell

  2. CGE invoca preparationContext:
     - Input: Fireball (entity)
     - effectiveSlotLevel = @entity.level = 3

  3. Sistema recoge efectos contextuales (automáticamente):
     - Maximize Spell tiene: { context: 'preparation', slotLevelModifier: +3 }

  4. Sistema aplica efectos:
     - effectiveSlotLevel = 3 + 3 = 6

  5. CGE recibe resultado:
     - effectiveSlotLevel: 6

  6. CGE verifica recurso y prepara:
     - ¿Tiene wizard-slot-6 disponible? → Sí
     - Consume 1 uso de wizard-slot-6
     - Almacena Fireball(Maximized) en slot

  Los presets generan resources

  El formulario del CGE tendría presets que auto-generan los Resource[]:

  | Preset                   | Genera                                                       |
  |--------------------------|--------------------------------------------------------------|
  | Slots por nivel (Wizard) | 10 recursos: {id}-slot-0 a {id}-slot-9 con fórmulas de tabla |
  | Power Points (Psion)     | 1 recurso: {id}-power-points con fórmula de pool             |
  | At-will (Warlock)        | 0 recursos                                                   |
  | Per-encounter (ToB)      | N recursos según maneuvers readied                           |

  El usuario selecciona preset → se generan los Resource[] → puede ajustarlos si quiere.

  Pregunta

  ¿El preparationContext debería definir también la fórmula de verificación de si hay recurso disponible? Es decir:

  preparationContext: {
    inputEntityType: 'spell',
    effectiveSlotLevelBase: '@entity.level',

    // ¿Cómo verificar disponibilidad?
    resourceCheck: '@resources.{cgeId}-slot-{effectiveSlotLevel}.current > 0'
  }

  ¿O esto siempre será derivado del patrón de recursos generados?

> hmmm no, el preparationcontext deberá definir su propio tipo, el entity type, y una variable. la variable deberá ser del tipo variable que ya tenemos (con sus basesources y todo eso). lo demás lo veo
 más o menos bien. lo único te has dejado la interacción del usuario, quien es quien decide sobre los efectos (en este caso, qué efectos metamágicos se aplican). quiero que además muestres cómo 
quedarían los casos en los que se elige una lista al principio del día 

⏺ Déjame revisar el tipo de variable existente primero:

⏺ Read(packages/core/core/domain/character/baseData/customVariables.ts)
  ⎿  Read 7 lines

⏺ Search(pattern: "type CustomVariableChange", path: "packages/core", output_mode: "content")
  ⎿  Found 35 lines (ctrl+o to expand)

⏺ Search(pattern: "CustomVariableChangeSchema", path: "packages/core/core/domain/character/baseData/changes.ts", output_mode: "content")
  ⎿  Found 43 lines (ctrl+o to expand)

⏺ Ahora entiendo el sistema de variables. Aquí está el assessment corregido:

  ---
  CGE - Assessment Corregido

  type CGETemplate = {
    id: string;
    labels: CGELabels;
    targetEntityType: string;

    poolSource: PoolSourceConfig;
    selectionStage: SelectionStageConfig;

    // Recursos - generados por presets
    resources: Resource[];

    // Contexto de preparación (si aplica)
    preparationContext?: PreparationContextDefinition;

    restrictions: RestrictionsConfig;
  }

  type PreparationContextDefinition = {
    // Tipo de entidad que recibe como input
    inputEntityType: string;  // 'spell', 'maneuver', etc.

    // Variable de salida usando el sistema existente
    effectiveSlotLevel: {
      variableId: string;  // 'effectiveSlotLevel'
      baseSources: BaseSource[];  // Fórmula base: @entity.level
    };
  }

  ---
  Caso 1: DAILY_SLOTS (Wizard)

  Preparación slot por slot, con interacción del usuario para metamagia.

  Flujo

  MAÑANA (Preparación)
  ━━━━━━━━━━━━━━━━━━━━

  1. Usuario abre UI de preparación
     → Ve slots disponibles: [0: 4] [1: 3] [2: 2] [3: 1]
     → Ve lista de conjuros en spellbook

  2. Usuario selecciona slot de nivel 3
     → Arrastra "Fireball" al slot

  3. Sistema muestra modal de efectos:
     ┌─────────────────────────────────────┐
     │ Preparar Fireball (nivel 3)         │
     │                                     │
     │ Efectos disponibles:                │
     │ ☐ Empower Spell (+2 niveles)        │
     │ ☐ Maximize Spell (+3 niveles)       │
     │ ☐ Quicken Spell (+4 niveles)        │
     │                                     │
     │ Nivel de slot resultante: 3         │
     │                                     │
     │ [Cancelar]  [Preparar]              │
     └─────────────────────────────────────┘

  4. Usuario marca "Maximize Spell"
     → UI actualiza: "Nivel de slot resultante: 6"

  5. Usuario confirma
     → CGE invoca preparationContext:
       - Input: Fireball, efectos: [MaximizeSpell]
       - effectiveSlotLevel.baseSources: @entity.level = 3
       - Sistema aplica efectos: +3 de Maximize
       - Output: effectiveSlotLevel = 6

     → CGE verifica: ¿wizard-slot-6.current > 0? → Sí
     → CGE consume: wizard-slot-6.current -= 1
     → CGE almacena: preparedSlots[6] = { entity: Fireball, effects: [Maximize] }

  6. Repite para cada slot...

  ---
  Caso 2: DAILY_LIST (Spirit Shaman)

  Se elige una lista al principio del día, luego casting espontáneo.

  Configuración CGE

  const spiritShamanCGE: CGETemplate = {
    id: 'spirit-shaman-spellcasting',
    targetEntityType: 'spell',

    poolSource: {
      type: 'FULL_LIST_ACCESS',
      baseFilter: { lists: ['druid'] }
    },

    selectionStage: {
      type: 'DAILY_LIST',
      listSelection: {
        // Tabla de cuántos conjuros se pueden "retrieve" por nivel
        selectionTable: 'spirit-shaman-retrieved',
        // La metamagia se aplica AQUÍ, no al lanzar
        hasPreparationContext: true,
      }
    },

    resources: [
      // Slots de casting (cuántas veces puede lanzar)
      { uniqueId: 'ss-slot-0', maxValue: { expression: '@tables.ssSlots[@level][0]' }, ... },
      { uniqueId: 'ss-slot-1', maxValue: { expression: '@tables.ssSlots[@level][1]' }, ... },
      // ...
    ],

    preparationContext: {
      inputEntityType: 'spell',
      effectiveSlotLevel: {
        variableId: 'effectiveSlotLevel',
        baseSources: [{
          type: 'CUSTOM_VARIABLE',
          uniqueId: 'effectiveSlotLevel',
          formula: { expression: '@entity.level' },
          bonusTypeId: 'BASE',
          name: 'Nivel base del conjuro',
          createVariableForSource: true,
        }]
      }
    }
  }

  Flujo

  MAÑANA (Retrieve)
  ━━━━━━━━━━━━━━━━━

  1. Usuario abre UI de retrieve
     → Ve cuántos puede retrieve por nivel: [0: 3] [1: 2] [2: 1]
     → Ve lista completa de druida

  2. Usuario selecciona "Call Lightning" (nivel 3) para retrieve

  3. Sistema muestra modal de efectos:
     ┌─────────────────────────────────────┐
     │ Retrieve Call Lightning (nivel 3)  │
     │                                     │
     │ Efectos disponibles:                │
     │ ☐ Empower Spell (+2 niveles)        │
     │ ☐ Extend Spell (+1 nivel)           │
     │                                     │
     │ Ocupará slot de retrieve: nivel 3   │
     │                                     │
     │ [Cancelar]  [Retrieve]              │
     └─────────────────────────────────────┘

  4. Usuario marca "Empower Spell"
     → UI actualiza: "Ocupará slot de retrieve: nivel 5"

  5. Usuario confirma
     → CGE invoca preparationContext
     → effectiveSlotLevel = 3 + 2 = 5
     → CGE verifica: ¿tiene slot de retrieve nivel 5? → Sí
     → CGE almacena en retrieved: { entity: CallLightning, effects: [Empower], slotLevel: 5 }

  6. Repite hasta llenar retrieved...


  COMBATE (Casting espontáneo)
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  1. Usuario quiere lanzar "Call Lightning (Empowered)"

  2. Sistema verifica:
     → ¿Está en retrieved? → Sí
     → ¿Tiene ss-slot-5.current > 0? → Sí

  3. Usuario confirma
     → CGE consume: ss-slot-5.current -= 1
     → Conjuro lanzado (SIN penalización de tiempo porque metamagia fue en retrieve)

  ---
  Caso 3: DAILY_LIST (Tome of Battle - Warblade)

  Lista de maniobras readied, sin contexto de preparación (no hay metamagia).

  Configuración CGE

  const warbladeCGE: CGETemplate = {
    id: 'warblade-maneuvers',
    targetEntityType: 'maneuver',

    poolSource: {
      type: 'CURATED_SELECTION',
      baseFilter: { disciplines: ['iron-heart', 'diamond-mind', ...] },
      knownProgression: 'warblade-known'
    },

    selectionStage: {
      type: 'DAILY_LIST',
      listSelection: {
        selectionTable: 'warblade-readied',
        hasPreparationContext: false,  // No hay metamagia
      }
    },

    // Sin recursos de "slots" - es encounter-based
    resources: [],

    // Sin preparationContext - no hay modificadores
    preparationContext: undefined,
  }

  Flujo

  MAÑANA (Ready)
  ━━━━━━━━━━━━━━

  1. Usuario abre UI de ready
     → Ve maniobras conocidas: [Steel Wind, Iron Heart Surge, Diamond Mind Strike, ...]
     → Ve cuántas puede ready: 5

  2. Usuario selecciona 5 maniobras
     → No hay modal de efectos (no aplica metamagia)
     → CGE almacena: readied = [SteelWind, IronHeartSurge, ...]

  3. Todas las readied empiezan como "available"


  COMBATE
  ━━━━━━━

  1. Usuario usa "Steel Wind"
     → CGE marca: SteelWind.status = 'expended'

  2. Usuario quiere recuperar
     → Acción: Swift action + melee attack
     → CGE marca: todas las expended → 'available'

  ---
  Resumen de diferencias

  | Aspecto           | DAILY_SLOTS (Wizard)         | DAILY_LIST (Spirit Shaman)          | DAILY_LIST (ToB)   |
  |-------------------|------------------------------|-------------------------------------|--------------------|
  | Qué se selecciona | Conjuro por slot individual  | Lista de conjuros + slot que ocupan | Lista de maniobras |
  | Metamagia         | Al preparar cada slot        | Al retrieve                         | No aplica          |
  | Recurso de uso    | El slot preparado se consume | Slot separado del retrieve          | Encounter-based    |
  | Casting           | 1 uso del conjuro preparado  | Espontáneo de los retrieved         | 1 uso por maniobra |

> no me gusta que hayas llamado retrieved a los del shaman. al final lo que hace es prepararlos también. de todas formas, no me gusta que el shaman, una vez más, defina sus propios resources. los 
resources se deberían autodefinir en ese caso también, en base a la configuración del CGE. si me estoy equivocando, por favor dímelo, me gustaría tener una conversación contigo al respecto 

⏺ Tienes razón en ambos puntos. Vamos a discutirlo:

  Sobre los nombres

  "Retrieved" es jerga específica del Spirit Shaman. El CGE debería usar términos genéricos internamente y las labels para la UI. Internamente todo es "prepared" o "selected".

  Sobre los resources auto-generados

  Entiendo tu punto: si el CGE ya define que usa "slots por nivel" con una tabla de progresión, ¿por qué hay que definir los resources manualmente?

  Mi propuesta:

  El CGE no define resources: Resource[] directamente, sino una estrategia de generación:

  type CGETemplate = {
    // ...

    resourceStrategy: ResourceStrategy;
  }

  type ResourceStrategy =
    | { type: 'NONE' }  // At-will, no genera recursos

    | {
        type: 'SLOTS_PER_ENTITY_LEVEL';
        levelRange: [number, number];           // [0, 9] para spells
        maxFormula: string;                     // '@tables.{cgeId}Slots[@classLevel][{level}]'
        bonusFromAbility?: string;              // 'intelligence' - usa fórmula estándar
        refreshType: ResourceRefreshType;
      }

    | {
        type: 'UNIFIED_POOL';
        maxFormula: string;                     // '@tables.psionPP[@classLevel] + ...'
        refreshType: ResourceRefreshType;
      }

    | {
        type: 'PER_PREPARED_ENTITY';            // ToB: cada maniobra readied es un "uso"
        refreshType: ResourceRefreshType;
      };

  El sistema entonces genera automáticamente los Resource[] correctos.

  Mis dudas:

  1. ¿Dónde vive la tabla de progresión? Si el CGE dice maxFormula: '@tables.wizardSlots[@classLevel][{level}]', ¿esa tabla está en el CGE, en la clase, o en el compendio?
  2. ¿El bonus por ability es siempre la fórmula estándar de D&D 3.5? O cada CGE podría tener una fórmula diferente?
  3. Casos mixtos: El Cleric tiene slots normales + 1 slot de dominio por nivel. ¿Esto serían dos ResourceStrategies? ¿O el slot de dominio es un "bonus" al strategy principal?

  ¿Qué opinas de este approach? ¿Me estoy complicando demasiado o va en la dirección correcta?

> 1. la tabla está en el CGE porque es parte del propio CGE, sí. 2. cada CGE tendrá que exponer una fórmula diferente, claro. de hecho, no es tanto que expongan una fórmula como que expongan unas 
variables. si los hacemos recursos, los recursos ya exponen su min y max como variables, por ejemplo. la idea aquí es que ese efecto de que el bonus aumenta los conjuros diarios, por ejemplo, venga de 
fuera. 3. la cosa aquí es que los slots de dominio deberían tener su propia lista de preparación. Además, no solo eso, sino que creo que nos estamos dejando algo importante: al buscar conjuros para 
preparar para un slot, deberíamos tener unos filtros preset para buscar los conjuros a preparar 

⏺ Esto clarifica mucho. Déjame reformular:

  Puntos clave

  1. Las tablas viven en el CGE
  2. El CGE expone variables via recursos - Los recursos ya exponen @resources.{id}.max, .current, etc. Los efectos externos (como "INT alta da bonus spells") aplican cambios a esas variables desde fuera.
  3. Múltiples CGEs por personaje - El Cleric tiene:
    - CGE de slots normales (prepara de lista cleric)
    - CGE de slots de dominio (prepara SOLO de conjuros de sus dominios)

  Un Cleric/Wizard tendría 3 CGEs activos.
  4. Filtros de preparación - Cada CGE define qué entidades son elegibles para sus slots.

  CGE revisado

  type CGETemplate = {
    id: string;
    labels: CGELabels;
    targetEntityType: string;

    // Cómo accede a las entidades (spellbook, lista completa, etc.)
    poolSource: PoolSourceConfig;

    // Tipo de selección (slots individuales, lista diaria, ninguna)
    selectionStage: SelectionStageConfig;

    // Estrategia de generación de recursos
    resourceStrategy: ResourceStrategy;

    // Filtro para buscar entidades elegibles al preparar
    preparationFilter: EntityFilter;

    // Contexto de preparación (si aplica modificadores)
    preparationContext?: PreparationContextDefinition;

    // Tablas de progresión del CGE
    tables: {
      [tableId: string]: DataTable;
    };
  }

  Ejemplo: Cleric con dos CGEs

  // CGE 1: Slots normales
  const clericBaseCGE: CGETemplate = {
    id: 'cleric-base',
    labels: {
      known: 'Lista de clérigo',
      prepared: 'Conjuros preparados',
      resource: 'Slots de conjuro',
      // ...
    },

    poolSource: { type: 'FULL_LIST_ACCESS' },
    selectionStage: { type: 'DAILY_SLOTS' },

    resourceStrategy: {
      type: 'SLOTS_PER_ENTITY_LEVEL',
      levelRange: [0, 9],
      // Solo genera el recurso, el max viene de la tabla
      // Los bonuses por WIS vienen de FUERA (class feature)
    },

    // Filtro: lista de cleric, respetando restricciones de alineamiento
    preparationFilter: {
      entityType: 'spell',
      lists: ['cleric'],
      excludeAlignmentDescriptors: '@character.prohibitedAlignments',
    },

    tables: {
      slotsPerDay: { /* tabla nivel -> slots por nivel de conjuro */ }
    }
  }

  // CGE 2: Slots de dominio
  const clericDomainCGE: CGETemplate = {
    id: 'cleric-domain',
    labels: {
      known: 'Conjuros de dominio',
      prepared: 'Conjuro de dominio preparado',
      resource: 'Slot de dominio',
      // ...
    },

    poolSource: { type: 'FULL_LIST_ACCESS' },
    selectionStage: { type: 'DAILY_SLOTS' },

    resourceStrategy: {
      type: 'SLOTS_PER_ENTITY_LEVEL',
      levelRange: [1, 9],  // Dominios no tienen nivel 0
      // 1 slot por nivel (no usa tabla, es fijo)
    },

    // Filtro: SOLO conjuros de los dominios del personaje
    preparationFilter: {
      entityType: 'spell',
      domainIds: '@character.clericDomains',  // ['war', 'strength']
    },

    tables: {
      slotsPerDay: { /* 1 por nivel */ }
    }
  }

  Pregunta

  El preparationFilter usa variables del personaje (@character.prohibitedAlignments, @character.clericDomains).

  ¿Estas variables:
  - A) Se definen en el personaje directamente (el sistema de dominios las crea)
  - B) El CGE las define como "variables que necesita" y algo externo las provee
  - C) El filtro usa el sistema de fórmulas existente y accede al substitutionIndex

> hmmmm no, un mismo CGE debería permitir tener dos listados de conjuros preparados, por ejemplo, no haría falta tener dos CGE 

⏺ Entendido. Un CGE puede tener múltiples "tracks" o "pools" de preparación. El Cleric sería:

  type CGETemplate = {
    id: string;
    labels: CGELabels;
    targetEntityType: string;

    poolSource: PoolSourceConfig;

    // Múltiples tracks de preparación dentro del mismo CGE
    preparationTracks: PreparationTrack[];

    preparationContext?: PreparationContextDefinition;

    tables: Record<string, DataTable>;
  }

  type PreparationTrack = {
    id: string;                        // 'base', 'domain'
    label: string;                     // 'Slots normales', 'Slots de dominio'

    resourceStrategy: ResourceStrategy;
    preparationFilter: EntityFilter;
  }

  Ejemplo: Cleric

  const clericCGE: CGETemplate = {
    id: 'cleric-spellcasting',
    targetEntityType: 'spell',

    poolSource: {
      type: 'FULL_LIST_ACCESS',
      baseFilter: { lists: ['cleric'] }
    },

    preparationTracks: [
      {
        id: 'base',
        label: 'Slots de conjuro',
        resourceStrategy: {
          type: 'SLOTS_PER_ENTITY_LEVEL',
          levelRange: [0, 9],
          tableRef: 'slotsPerDay',
        },
        preparationFilter: {
          lists: ['cleric'],
          excludeAlignmentDescriptors: '@character.prohibitedAlignments',
        }
      },
      {
        id: 'domain',
        label: 'Slots de dominio',
        resourceStrategy: {
          type: 'SLOTS_PER_ENTITY_LEVEL',
          levelRange: [1, 9],
          fixedPerLevel: 1,  // Siempre 1 por nivel
        },
        preparationFilter: {
          domainIds: '@character.clericDomains',
        }
      }
    ],

    tables: {
      slotsPerDay: { /* ... */ }
    }
  }

  Pregunta

  ¿El selectionStage (DAILY_SLOTS vs DAILY_LIST vs NONE) debería ser:

  A) Global al CGE (todos los tracks usan el mismo tipo)

  B) Por track (un CGE podría tener un track DAILY_SLOTS y otro DAILY_LIST)

  Intuitivamente diría A, pero quiero confirmar.

> sigues metiendo mierdas super específicas como           excludeAlignmentDescriptors: '@character.prohibitedAlignments', lo cual no tiene NINGUN SENTIDO en un sistema genérico... 

⏺ Tienes toda la razón. Me estoy inventando campos específicos cuando debería usar el sistema de filtros genérico que ya existe.

  type PreparationTrack = {
    id: string;
    label: string;
    resourceStrategy: ResourceStrategy;

    // Filtro genérico - usa el EntityFilter del sistema de entidades
    preparationFilter: EntityFilter;
  }

  El EntityFilter ya debería poder expresar cualquier filtro que necesites, usando el sistema de condiciones/filtrado existente. Si necesitas filtrar por alineamiento, por dominio, o por lo que sea, eso se expresa con el EntityFilter genérico, no con campos ad-hoc.

  ¿El sistema de EntityFilter actual soporta referencias a variables del personaje para filtros dinámicos? Por ejemplo, para que el track de dominio filtre por domainId IN [los dominios que el personaje eligió].

  ---

