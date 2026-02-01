/**
 * Example Psionic Powers
 *
 * TEST ENTITIES - Not D&D 3.5 SRD
 *
 * Disciplines:
 * - Clairsentience: Perception and knowledge
 * - Metacreativity: Creation of matter and energy
 * - Psychokinesis: Control of energy and force
 * - Psychometabolism: Self-transformation
 * - Psychoportation: Movement and teleportation
 * - Telepathy: Mind-to-mind contact
 */

import type { StandardEntity, RelationFieldConfig } from '../../../../entities/types/base'
import {
  buildRelationIndex,
  enrichEntitiesWithRelations,
  type RelationEntity,
  type RelationFieldDef,
} from '../../../../entities/relations/compiler'

// =============================================================================
// Types
// =============================================================================

/**
 * Raw power entity in the compendium (before enrichment)
 */
type PowerEntity = StandardEntity & {
  level: number
  discipline: string
  subdiscipline?: string
  descriptors?: string[]
  display?: string[]
  manifestingTime?: string
  range?: string
  target?: string
  area?: string
  effect?: string
  duration?: string
  savingThrow?: string
  powerResistance?: string
  powerPoints?: number
  augment?: string
}

/**
 * Enriched power with class-level data (after enrichment)
 */
export type EnrichedPower = PowerEntity & {
  classData: {
    relations: Array<{ targetId: string; metadata: { level: number } }>
    classLevelKeys: string[]
    classLevels: Record<string, number>
  }
}

// =============================================================================
// Configuration
// =============================================================================

/**
 * Configuration for power-class relation field
 */
const POWER_CLASS_FIELD_CONFIG: RelationFieldConfig = {
  relationType: 'power-class-relation',
  targetEntityType: 'class',
  metadataFields: [{ name: 'level', type: 'integer', required: true }],
  compile: {
    keyFormat: '{targetId}:{metadata.level}',
    keysFieldName: 'classLevelKeys',
    mapFieldName: 'classLevels',
    mapValueField: 'level',
  },
}

const RELATION_FIELD_DEF: RelationFieldDef = {
  fieldName: 'classData',
  config: POWER_CLASS_FIELD_CONFIG,
}

// =============================================================================
// TELEPATHY - Mind-to-Mind Contact
// =============================================================================

const mindLink: PowerEntity = {
  id: 'mind-link',
  entityType: 'power',
  name: 'Mind Link',
  description: 'You forge a telepathic bond with another creature within range. You can communicate telepathically through the bond.',
  level: 1,
  discipline: 'telepathy',
  subdiscipline: 'charm',
  descriptors: ['mind-affecting'],
  display: ['mental'],
  manifestingTime: '1 standard action',
  range: 'Close (25 ft. + 5 ft./2 levels)',
  target: 'You and one other willing creature',
  duration: '10 min./level',
  savingThrow: 'None',
  powerResistance: 'Yes (harmless)',
  powerPoints: 1,
}

const mindThrust: PowerEntity = {
  id: 'mind-thrust',
  entityType: 'power',
  name: 'Mind Thrust',
  description: 'You instantly deliver a massive assault on the thought pathways of any one creature, dealing 1d10 points of damage.',
  level: 1,
  discipline: 'telepathy',
  descriptors: ['mind-affecting'],
  display: ['auditory'],
  manifestingTime: '1 standard action',
  range: 'Close (25 ft. + 5 ft./2 levels)',
  target: 'One creature',
  duration: 'Instantaneous',
  savingThrow: 'Will negates',
  powerResistance: 'Yes',
  powerPoints: 1,
  augment: 'For every 2 additional power points, damage increases by 1d10.',
}

const charmPsionic: PowerEntity = {
  id: 'charm-psionic',
  entityType: 'power',
  name: 'Charm, Psionic',
  description: 'As charm person, but manifested psionically. Target regards you as a trusted friend.',
  level: 1,
  discipline: 'telepathy',
  subdiscipline: 'charm',
  descriptors: ['mind-affecting'],
  display: ['mental'],
  manifestingTime: '1 standard action',
  range: 'Close (25 ft. + 5 ft./2 levels)',
  target: 'One humanoid creature',
  duration: '1 hour/level',
  savingThrow: 'Will negates',
  powerResistance: 'Yes',
  powerPoints: 1,
}

const readThoughts: PowerEntity = {
  id: 'read-thoughts',
  entityType: 'power',
  name: 'Read Thoughts',
  description: 'You can detect surface thoughts. You can probe deeper for specific information.',
  level: 2,
  discipline: 'telepathy',
  descriptors: ['mind-affecting'],
  display: ['mental', 'visual'],
  manifestingTime: '1 standard action',
  range: '60 ft.',
  area: 'Cone-shaped emanation',
  duration: 'Concentration, up to 1 min./level',
  savingThrow: 'Will negates',
  powerResistance: 'Yes',
  powerPoints: 3,
}

const dominatePsionic: PowerEntity = {
  id: 'dominate-psionic',
  entityType: 'power',
  name: 'Dominate, Psionic',
  description: 'You can control the actions of any humanoid creature through a telepathic link.',
  level: 4,
  discipline: 'telepathy',
  subdiscipline: 'compulsion',
  descriptors: ['mind-affecting'],
  display: ['mental'],
  manifestingTime: '1 round',
  range: 'Medium (100 ft. + 10 ft./level)',
  target: 'One humanoid',
  duration: '1 day/level',
  savingThrow: 'Will negates',
  powerResistance: 'Yes',
  powerPoints: 7,
}

const mindBlank: PowerEntity = {
  id: 'mind-blank-psionic',
  entityType: 'power',
  name: 'Mind Blank, Psionic',
  description: 'Subject is protected from all devices and powers that detect, influence, or read emotions or thoughts.',
  level: 8,
  discipline: 'telepathy',
  display: ['mental'],
  manifestingTime: '1 standard action',
  range: 'Close (25 ft. + 5 ft./2 levels)',
  target: 'One creature',
  duration: '1 day',
  savingThrow: 'Will negates (harmless)',
  powerResistance: 'Yes (harmless)',
  powerPoints: 15,
}

// =============================================================================
// PSYCHOKINESIS - Energy and Force
// =============================================================================

const energyRay: PowerEntity = {
  id: 'energy-ray',
  entityType: 'power',
  name: 'Energy Ray',
  description: 'You create a ray of energy of your choice (cold, electricity, fire, or sonic). You must succeed on a ranged touch attack to deal 1d6 points of damage.',
  level: 1,
  discipline: 'psychokinesis',
  descriptors: ['cold', 'electricity', 'fire', 'sonic'],
  display: ['auditory'],
  manifestingTime: '1 standard action',
  range: 'Close (25 ft. + 5 ft./2 levels)',
  effect: 'Ray',
  duration: 'Instantaneous',
  savingThrow: 'None',
  powerResistance: 'Yes',
  powerPoints: 1,
  augment: 'For every 2 additional power points, damage increases by 1d6.',
}

const forceSphere: PowerEntity = {
  id: 'force-sphere',
  entityType: 'power',
  name: 'Force Sphere',
  description: 'You create an invisible sphere of force around yourself. The sphere has hardness 0 and 10 hit points per manifester level.',
  level: 2,
  discipline: 'psychokinesis',
  descriptors: ['force'],
  display: ['material'],
  manifestingTime: '1 standard action',
  range: 'Personal',
  target: 'You',
  duration: '1 min./level (D)',
  powerPoints: 3,
}

const energyBall: PowerEntity = {
  id: 'energy-ball',
  entityType: 'power',
  name: 'Energy Ball',
  description: 'An explosion of energy of your choice (cold, electricity, fire, or sonic) that deals 7d6 points of damage in a 20-ft. radius burst.',
  level: 4,
  discipline: 'psychokinesis',
  descriptors: ['cold', 'electricity', 'fire', 'sonic'],
  display: ['auditory'],
  manifestingTime: '1 standard action',
  range: 'Long (400 ft. + 40 ft./level)',
  area: '20-ft.-radius spread',
  duration: 'Instantaneous',
  savingThrow: 'Reflex half',
  powerResistance: 'Yes',
  powerPoints: 7,
  augment: 'For every 2 additional power points, damage increases by 1d6.',
}

const telekinesis: PowerEntity = {
  id: 'telekinesis-psionic',
  entityType: 'power',
  name: 'Telekinesis, Psionic',
  description: 'You move objects or creatures by concentrating on them. Depending on the version selected, the power can provide a gentle, sustained force, perform a variety of combat maneuvers, or exert a single short, violent thrust.',
  level: 5,
  discipline: 'psychokinesis',
  descriptors: ['force'],
  display: ['visual'],
  manifestingTime: '1 standard action',
  range: 'Long (400 ft. + 40 ft./level)',
  target: 'See text',
  duration: 'Concentration (up to 1 round/level) or instantaneous',
  savingThrow: 'Will negates (object) or None',
  powerResistance: 'Yes (object)',
  powerPoints: 9,
}

// =============================================================================
// PSYCHOMETABOLISM - Self-Transformation
// =============================================================================

const vigor: PowerEntity = {
  id: 'vigor',
  entityType: 'power',
  name: 'Vigor',
  description: 'You gain 5 temporary hit points. These temporary hit points last for 1 minute per manifester level.',
  level: 1,
  discipline: 'psychometabolism',
  display: ['material', 'olfactory'],
  manifestingTime: '1 standard action',
  range: 'Personal',
  target: 'You',
  duration: '1 min./level',
  powerPoints: 1,
  augment: 'For every additional power point, gain an additional 5 temporary hit points.',
}

const bodyAdjustment: PowerEntity = {
  id: 'body-adjustment',
  entityType: 'power',
  name: 'Body Adjustment',
  description: 'You heal yourself of 1d12 points of damage.',
  level: 3,
  discipline: 'psychometabolism',
  display: ['auditory', 'material'],
  manifestingTime: '1 round',
  range: 'Personal',
  target: 'You',
  duration: 'Instantaneous',
  powerPoints: 5,
  augment: 'For every 2 additional power points, you heal an additional 1d12 points of damage.',
}

const metamorphosis: PowerEntity = {
  id: 'metamorphosis',
  entityType: 'power',
  name: 'Metamorphosis',
  description: 'You assume the form of a creature of the same type as yourself. You gain the physical qualities of the new form while retaining your own mind.',
  level: 4,
  discipline: 'psychometabolism',
  display: ['material', 'olfactory'],
  manifestingTime: '1 standard action',
  range: 'Personal',
  target: 'You',
  duration: '1 min./level (D)',
  powerPoints: 7,
}

const trueMetamorphosis: PowerEntity = {
  id: 'true-metamorphosis',
  entityType: 'power',
  name: 'True Metamorphosis',
  description: 'You can transform into any living creature, or even inorganic matter. You gain all its physical and natural abilities.',
  level: 9,
  discipline: 'psychometabolism',
  display: ['material', 'mental', 'olfactory'],
  manifestingTime: '1 round',
  range: 'Personal',
  target: 'You',
  duration: '1 min./level',
  powerPoints: 17,
}

// =============================================================================
// CLAIRSENTIENCE - Knowledge and Perception
// =============================================================================

const precognition: PowerEntity = {
  id: 'precognition',
  entityType: 'power',
  name: 'Precognition',
  description: 'You gain a +2 insight bonus to one die roll that you are about to make. You can use this power before your die roll.',
  level: 1,
  discipline: 'clairsentience',
  display: ['visual'],
  manifestingTime: '1 immediate action',
  range: 'Personal',
  target: 'You',
  duration: 'Instantaneous',
  powerPoints: 1,
}

const clairvoyantSense: PowerEntity = {
  id: 'clairvoyant-sense',
  entityType: 'power',
  name: 'Clairvoyant Sense',
  description: 'You can see and hear a distant location almost as if you were there.',
  level: 2,
  discipline: 'clairsentience',
  subdiscipline: 'scrying',
  display: ['auditory', 'visual'],
  manifestingTime: '1 standard action',
  range: 'See text',
  effect: 'Psionic sensor',
  duration: '1 min./level (D)',
  savingThrow: 'None',
  powerResistance: 'No',
  powerPoints: 3,
}

const remoteViewing: PowerEntity = {
  id: 'remote-viewing',
  entityType: 'power',
  name: 'Remote Viewing',
  description: 'You can see and hear a specific creature, regardless of where it is.',
  level: 4,
  discipline: 'clairsentience',
  subdiscipline: 'scrying',
  display: ['mental'],
  manifestingTime: '1 hour',
  range: 'See text',
  effect: 'Psionic sensor',
  duration: '1 min./level (D)',
  savingThrow: 'Will negates',
  powerResistance: 'No',
  powerPoints: 7,
}

const metafaculty: PowerEntity = {
  id: 'metafaculty',
  entityType: 'power',
  name: 'Metafaculty',
  description: 'You gain near-perfect knowledge of the subject. You can learn one piece of information per manifester level.',
  level: 9,
  discipline: 'clairsentience',
  display: ['mental', 'auditory', 'visual'],
  manifestingTime: '1 hour',
  range: 'Personal',
  target: 'You',
  duration: 'Instantaneous',
  powerPoints: 17,
}

// =============================================================================
// PSYCHOPORTATION - Movement and Teleportation
// =============================================================================

const burstSpeed: PowerEntity = {
  id: 'burst-speed',
  entityType: 'power',
  name: 'Burst',
  description: 'You increase your land speed by 10 feet for 1 round.',
  level: 1,
  discipline: 'psychoportation',
  display: ['auditory'],
  manifestingTime: '1 swift action',
  range: 'Personal',
  target: 'You',
  duration: '1 round',
  powerPoints: 1,
  augment: 'For every 2 additional power points, your speed increases by an additional 10 feet.',
}

const dimensionSlide: PowerEntity = {
  id: 'dimension-slide',
  entityType: 'power',
  name: 'Dimension Slide',
  description: 'You instantly transfer yourself from your current location to any other spot within range.',
  level: 3,
  discipline: 'psychoportation',
  display: ['visual'],
  manifestingTime: '1 standard action',
  range: 'Close (25 ft. + 5 ft./2 levels)',
  target: 'You',
  duration: 'Instantaneous',
  powerPoints: 5,
}

const psionicDimensionDoor: PowerEntity = {
  id: 'dimension-door-psionic',
  entityType: 'power',
  name: 'Dimension Door, Psionic',
  description: 'You instantly transfer yourself from your current location to any other spot within range. You always arrive at exactly the spot desired.',
  level: 4,
  discipline: 'psychoportation',
  display: ['visual'],
  manifestingTime: '1 standard action',
  range: 'Long (400 ft. + 40 ft./level)',
  target: 'You and touched objects or other touched willing creatures',
  duration: 'Instantaneous',
  savingThrow: 'None and Will negates (object)',
  powerResistance: 'No and Yes (object)',
  powerPoints: 7,
}

const psionicTeleport: PowerEntity = {
  id: 'teleport-psionic',
  entityType: 'power',
  name: 'Teleport, Psionic',
  description: 'You instantly transfer yourself from your current location to any other spot to which you have line of effect. You can also carry objects and other willing creatures.',
  level: 5,
  discipline: 'psychoportation',
  display: ['visual'],
  manifestingTime: '1 standard action',
  range: 'Personal and touch',
  target: 'You and touched objects or other touched willing creatures',
  duration: 'Instantaneous',
  savingThrow: 'None and Will negates (object)',
  powerResistance: 'No and Yes (object)',
  powerPoints: 9,
}

const planeShiftPsionic: PowerEntity = {
  id: 'plane-shift-psionic',
  entityType: 'power',
  name: 'Plane Shift, Psionic',
  description: 'You move yourself or some other creature to another plane of existence or alternate dimension.',
  level: 8,
  discipline: 'psychoportation',
  display: ['visual'],
  manifestingTime: '1 standard action',
  range: 'Touch',
  target: 'Creature touched, or up to eight willing creatures joining hands',
  duration: 'Instantaneous',
  savingThrow: 'Will negates',
  powerResistance: 'Yes',
  powerPoints: 15,
}

// =============================================================================
// METACREATIVITY - Creation
// =============================================================================

const astralConstruct: PowerEntity = {
  id: 'astral-construct',
  entityType: 'power',
  name: 'Astral Construct',
  description: 'You create a construct of ectoplasm that obeys your commands. The construct is 1st level.',
  level: 1,
  discipline: 'metacreativity',
  subdiscipline: 'creation',
  display: ['visual'],
  manifestingTime: '1 round',
  range: 'Close (25 ft. + 5 ft./2 levels)',
  effect: 'One created astral construct',
  duration: '1 round/level (D)',
  powerPoints: 1,
  augment: 'For every 2 additional power points, the construct gains one level.',
}

const ectoplasticForm: PowerEntity = {
  id: 'ectoplasmic-form',
  entityType: 'power',
  name: 'Ectoplasmic Form',
  description: 'You and all your gear become a partially translucent mass of ectoplasm. You can pass through small holes or narrow openings.',
  level: 3,
  discipline: 'metacreativity',
  display: ['olfactory'],
  manifestingTime: '1 standard action',
  range: 'Personal',
  target: 'You',
  duration: '1 min./level (D)',
  powerPoints: 5,
}

const quintessence: PowerEntity = {
  id: 'quintessence',
  entityType: 'power',
  name: 'Quintessence',
  description: 'You create a 1-inch-thick sheet of quintessence at any spot within range. The quintessence stops time for anything in contact with it.',
  level: 4,
  discipline: 'metacreativity',
  subdiscipline: 'creation',
  display: ['material', 'olfactory'],
  manifestingTime: '1 round',
  range: 'Medium (100 ft. + 10 ft./level)',
  effect: 'One 5-ft. square of quintessence per 2 levels',
  duration: '1 round/level (D)',
  powerPoints: 7,
}

const greaterAstralConstruct: PowerEntity = {
  id: 'greater-astral-construct',
  entityType: 'power',
  name: 'Greater Astral Construct',
  description: 'As astral construct, but the construct is 5th level and has improved abilities.',
  level: 5,
  discipline: 'metacreativity',
  subdiscipline: 'creation',
  display: ['visual'],
  manifestingTime: '1 round',
  range: 'Close (25 ft. + 5 ft./2 levels)',
  effect: 'One created astral construct',
  duration: '1 round/level (D)',
  powerPoints: 9,
  augment: 'For every 2 additional power points, the construct gains one level (maximum 9th).',
}

// =============================================================================
// Raw Powers Array
// =============================================================================

const rawPowers: PowerEntity[] = [
  // Telepathy
  mindLink,
  mindThrust,
  charmPsionic,
  readThoughts,
  dominatePsionic,
  mindBlank,
  // Psychokinesis
  energyRay,
  forceSphere,
  energyBall,
  telekinesis,
  // Psychometabolism
  vigor,
  bodyAdjustment,
  metamorphosis,
  trueMetamorphosis,
  // Clairsentience
  precognition,
  clairvoyantSense,
  remoteViewing,
  metafaculty,
  // Psychoportation
  burstSpeed,
  dimensionSlide,
  psionicDimensionDoor,
  psionicTeleport,
  planeShiftPsionic,
  // Metacreativity
  astralConstruct,
  ectoplasticForm,
  quintessence,
  greaterAstralConstruct,
]

// =============================================================================
// Relations (inline for simplicity - powers available to Psion)
// =============================================================================

const powerClassRelations: RelationEntity[] = rawPowers.map(power => ({
  id: `power-class-${power.id}-psion`,
  entityType: 'power-class-relation',
  fromEntityId: power.id,
  toEntityId: 'psion',
  metadata: { level: power.level },
}))

// =============================================================================
// Loader
// =============================================================================

/**
 * Load and enrich all powers with class-level relations.
 */
function loadEnrichedPowers(): EnrichedPower[] {
  // Build index
  const index = buildRelationIndex(powerClassRelations)

  // Enrich entities
  const enriched = enrichEntitiesWithRelations(rawPowers, [RELATION_FIELD_DEF], index)

  return enriched as EnrichedPower[]
}

// =============================================================================
// Exports
// =============================================================================

/**
 * All powers, enriched with class-level data.
 */
export const allPowers: EnrichedPower[] = loadEnrichedPowers()

/**
 * Get all unique class IDs that have powers
 */
export function getPowerClasses(): string[] {
  const classes = new Set<string>()
  for (const power of allPowers) {
    for (const targetId of Object.keys(power.classData.classLevels)) {
      classes.add(targetId)
    }
  }
  return Array.from(classes).sort()
}

/**
 * Get all power levels available for a specific class
 */
export function getPowerLevelsForClass(classId: string): number[] {
  const levels = new Set<number>()
  for (const power of allPowers) {
    const level = power.classData.classLevels[classId]
    if (level !== undefined) {
      levels.add(level)
    }
  }
  return Array.from(levels).sort((a, b) => a - b)
}

/**
 * Filter powers by class and optionally level
 */
export function filterPowers(classId: string, level?: number): EnrichedPower[] {
  return allPowers.filter((power) => {
    if (level !== undefined) {
      return power.classData.classLevelKeys.includes(`${classId}:${level}`)
    }
    return power.classData.classLevels[classId] !== undefined
  })
}

/**
 * Re-export relation types for external use
 */
export { POWER_CLASS_FIELD_CONFIG }

// Named exports for individual use (raw, without enrichment)
export {
  // Telepathy
  mindLink,
  mindThrust,
  charmPsionic,
  readThoughts,
  dominatePsionic,
  mindBlank,
  // Psychokinesis
  energyRay,
  forceSphere,
  energyBall,
  telekinesis,
  // Psychometabolism
  vigor,
  bodyAdjustment,
  metamorphosis,
  trueMetamorphosis,
  // Clairsentience
  precognition,
  clairvoyantSense,
  remoteViewing,
  metafaculty,
  // Psychoportation
  burstSpeed,
  dimensionSlide,
  psionicDimensionDoor,
  psionicTeleport,
  planeShiftPsionic,
  // Metacreativity
  astralConstruct,
  ectoplasticForm,
  quintessence,
  greaterAstralConstruct,
}
