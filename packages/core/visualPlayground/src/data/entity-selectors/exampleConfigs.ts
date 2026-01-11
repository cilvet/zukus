import type { EntityProvider } from '@root/core/domain/levels/providers/types'
import type { ExampleConfig } from '@/components/entity-selectors/types'

export const defaultExamples: ExampleConfig[] = [
  {
    id: 'simple-single',
    title: 'Selector simple (single)',
    description: 'Elige 1 feat de una lista cerrada de IDs',
    provider: {
      selector: {
        id: 'combat-feat',
        name: 'Elige un feat de combate',
        entityIds: ['feat-1', 'feat-2', 'feat-4', 'feat-5'],
        min: 1,
        max: 1,
      },
    },
  },
  {
    id: 'multi-select',
    title: 'Selector múltiple',
    description: 'Elige de 1 a 3 entidades',
    provider: {
      selector: {
        id: 'rogue-talents',
        name: 'Elige talentos de pícaro',
        entityType: 'rogueTalent',
        min: 1,
        max: 3,
      },
    },
  },
  {
    id: 'filter-strict',
    title: 'Filtro Strict',
    description: 'Solo muestra entidades que cumplen el filtro',
    provider: {
      selector: {
        id: 'combat-only',
        name: 'Elige un feat',
        filter: {
          type: 'AND',
          filterPolicy: 'strict',
          conditions: [{ field: 'category', operator: '==', value: 'combat' }],
        },
        min: 1,
        max: 1,
      },
    },
  },
  {
    id: 'filter-permissive',
    title: 'Filtro Permissive',
    description: 'Muestra todas, marca las no elegibles',
    provider: {
      selector: {
        id: 'combat-permissive',
        name: 'Elige un feat de combate',
        filter: {
          type: 'AND',
          filterPolicy: 'permissive',
          conditions: [{ field: 'category', operator: '==', value: 'combat' }],
        },
        min: 1,
        max: 1,
      },
    },
  },
  {
    id: 'with-variables',
    title: 'Con variables',
    description: 'Filtro dinámico basado en variables del personaje',
    defaultVariables: { characterLevel: 6 },
    provider: {
      selector: {
        id: 'level-talents',
        name: 'Talentos disponibles',
        entityType: 'rogueTalent',
        filter: {
          type: 'AND',
          filterPolicy: 'permissive',
          conditions: [{ field: 'level', operator: '<=', value: '@characterLevel' }],
        },
        min: 1,
        max: 2,
      },
    },
  },
  {
    id: 'granted-only',
    title: 'Solo Granted',
    description: 'Entidades otorgadas automáticamente por IDs',
    provider: {
      granted: {
        specificIds: ['feat-1', 'feat-2'],
      },
    },
  },
  {
    id: 'granted-plus-selector',
    title: 'Granted + Selector',
    description: 'Combina entidades automáticas con selección',
    provider: {
      granted: {
        specificIds: ['feat-1'],
      },
      selector: {
        id: 'bonus-feat',
        name: 'Elige un feat adicional',
        entityIds: ['feat-2', 'feat-3', 'feat-4', 'feat-5'],
        min: 1,
        max: 1,
      },
    },
  },
  {
    id: 'spell-selector',
    title: 'Selector de conjuros',
    description: 'Elige conjuros de nivel 1 (2792 conjuros con virtualización)',
    provider: {
      selector: {
        id: 'spell-selector',
        name: 'Elige un conjuro de nivel 1',
        entityType: 'spell',
        filter: {
          type: 'AND',
          filterPolicy: 'strict',
          conditions: [{ field: 'level', operator: '==', value: 1 }],
        },
        min: 1,
        max: 3,
      },
    },
  },
  {
    id: 'granted-filter',
    title: 'Granted con Filtro',
    description: 'Otorga automáticamente feats de combate de nivel <= characterLevel',
    defaultVariables: { characterLevel: 2 },
    provider: {
      granted: {
        filter: {
          type: 'AND',
          filterPolicy: 'strict',
          conditions: [
            { field: 'category', operator: '==', value: 'combat' },
            { field: 'level', operator: '<=', value: '@characterLevel' }
          ],
        },
      },
    },
  },
  {
    id: 'spell-school',
    title: 'Conjuros por escuela',
    description: 'Elige conjuros de Evocación',
    provider: {
      selector: {
        id: 'evocation-spells',
        name: 'Elige un conjuro de Evocación',
        entityType: 'spell',
        filter: {
          type: 'AND',
          filterPolicy: 'strict',
          conditions: [{ field: 'school', operator: '==', value: 'Evocación' }],
        },
        min: 1,
        max: 2,
      },
    },
  },
  {
    id: 'fighter-bonus-feat',
    title: 'Fighter Bonus Feat (Nested Provider)',
    description: 'Class feature with internal selector (providable addon)',
    provider: {
      granted: {
        specificIds: ['fighter-bonus-feat'],
      },
    },
  },
  {
    id: 'rogue-talent',
    title: 'Rogue Talent (Nested Provider)',
    description: 'Class feature that provides talent selection',
    provider: {
      granted: {
        specificIds: ['rogue-talent-selector'],
      },
    },
  },
  // =========================================================================
  // DOUBLE NESTING EXAMPLES (Tier 0 -> Tier 1 -> Tier 2 -> Tier 3)
  // =========================================================================
  {
    id: 'prestige-specialization',
    title: 'Prestige Specialization (Doble Anidación)',
    description: 'Nivel 0: Elige Path → Nivel 1: Elige Mastery → Nivel 2: Granted + Capstone selector → Nivel 3: Capstones finales',
    provider: {
      granted: {
        specificIds: ['prestige-specialization'],
      },
    },
  },
  {
    id: 'dual-path-mastery',
    title: 'Dual Path (Granted + Selector anidados)',
    description: 'Nivel 0: Granted Elementalist + Selector Warrior. Cada path tiene sus propios providers con masteries y capstones.',
    provider: {
      granted: {
        specificIds: ['dual-path-mastery'],
      },
    },
  },
  {
    id: 'direct-specialization-selector',
    title: 'Selector de Especialización Directo',
    description: 'Selecciona directamente una especialización (sin wrapper). Demuestra 3 niveles de anidación.',
    provider: {
      selector: {
        id: 'spec-selector',
        name: 'Elige tu Camino',
        entityType: 'specialization',
        min: 1,
        max: 1,
      },
    },
  },
  {
    id: 'warrior-path-direct',
    title: 'Warrior Path (Granted + Selector + Anidación)',
    description: 'Warrior Path granted directamente. Tiene granted Blade Mastery + selector Shield Mastery. Cada mastery tiene capstones.',
    provider: {
      granted: {
        specificIds: ['spec-warrior'],
      },
    },
  },
]

