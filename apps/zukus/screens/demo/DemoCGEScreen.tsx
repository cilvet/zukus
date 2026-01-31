/**
 * Demo CGE Screen
 *
 * Shows all CGE types in columns for visual testing.
 * No Supabase, no sync - all local mock data.
 */

import { ScrollView } from 'react-native'
import { YStack, XStack, Text } from 'tamagui'
import type { CalculatedCGE, CGEConfig, CalculatedTrack, CalculatedSlot, CalculatedKnownLimit } from '@zukus/core'
import { CGETabView } from '../../components/character/panels'
import { SectionCard, SectionHeader } from '../../components/character'

// =============================================================================
// Mock Data Builders
// =============================================================================

function createSlots(levels: Array<{ level: number; max: number; current?: number }>): CalculatedSlot[] {
  return levels.map(({ level, max, current }) => ({
    level,
    max,
    current: current ?? max,
    bonus: 0,
  }))
}

function createBoundSlots(
  levels: Array<{ level: number; max: number; preparations?: Array<{ entityId?: string; used?: boolean }> }>
): CalculatedSlot[] {
  return levels.map(({ level, max, preparations }) => ({
    level,
    max,
    current: max,
    bonus: 0,
    boundSlots: Array.from({ length: max }, (_, index) => ({
      slotId: `base:${level}-${index}`,
      level,
      index,
      preparedEntityId: preparations?.[index]?.entityId,
      used: preparations?.[index]?.used ?? false,
    })),
  }))
}

function createKnownLimits(levels: Array<{ level: number; max: number; current: number }>): CalculatedKnownLimit[] {
  return levels.map(({ level, max, current }) => ({ level, max, current }))
}

// =============================================================================
// Mock CGE Configurations
// =============================================================================

/**
 * Wizard 3.5: UNLIMITED + SLOTS + BOUND
 * - Spellbook (unlimited known)
 * - Prepare spells in slots
 * - Each slot bound to specific spell
 */
const wizardConfig: CGEConfig = {
  id: 'wizard-spells',
  classId: 'wizard',
  entityType: 'spell',
  levelPath: '@entity.levels.wizard',
  known: { type: 'UNLIMITED' },
  tracks: [{
    id: 'base',
    resource: { type: 'SLOTS', table: { 5: [4, 3, 2, 1, 0, 0, 0, 0, 0, 0] }, refresh: 'daily' },
    preparation: { type: 'BOUND' },
  }],
  variables: { classPrefix: 'wizard.spell', genericPrefix: 'spell', casterLevelVar: 'castingClassLevel.wizard' },
  labels: { known: 'spellbook', prepared: 'prepared_spells', slot: 'spell_slot', action: 'cast', pool: '' },
}

const wizardCGE: CalculatedCGE = {
  id: 'wizard-spells',
  classId: 'wizard',
  entityType: 'spell',
  classLevel: 5,
  knownLimits: undefined, // UNLIMITED
  tracks: [{
    id: 'base',
    resourceType: 'SLOTS',
    preparationType: 'BOUND',
    slots: createBoundSlots([
      { level: 0, max: 4, preparations: [{ entityId: 'detect-magic' }, { entityId: 'light' }, { entityId: 'mage-hand' }, { entityId: 'prestidigitation' }] },
      { level: 1, max: 3, preparations: [{ entityId: 'magic-missile', used: true }, { entityId: 'shield' }, { entityId: 'mage-armor' }] },
      { level: 2, max: 2, preparations: [{ entityId: 'scorching-ray' }, { entityId: 'invisibility', used: true }] },
      { level: 3, max: 1, preparations: [{ entityId: 'fireball' }] },
    ]),
  }],
  config: wizardConfig,
}

/**
 * Sorcerer: LIMITED_PER_ENTITY_LEVEL + SLOTS + NONE
 * - Limited spells known per level
 * - Spontaneous casting (no preparation)
 */
const sorcererConfig: CGEConfig = {
  id: 'sorcerer-spells',
  classId: 'sorcerer',
  entityType: 'spell',
  levelPath: '@entity.levels.sorcerer',
  known: { type: 'LIMITED_PER_ENTITY_LEVEL', table: { 5: [6, 4, 2, 0, 0, 0, 0, 0, 0, 0] } },
  tracks: [{
    id: 'base',
    resource: { type: 'SLOTS', table: { 5: [6, 6, 4, 0, 0, 0, 0, 0, 0, 0] }, refresh: 'daily' },
    preparation: { type: 'NONE' },
  }],
  variables: { classPrefix: 'sorcerer.spell', genericPrefix: 'spell', casterLevelVar: 'castingClassLevel.sorcerer' },
  labels: { known: 'known_spells', prepared: '', slot: 'spell_slot', action: 'cast', pool: '' },
}

const sorcererCGE: CalculatedCGE = {
  id: 'sorcerer-spells',
  classId: 'sorcerer',
  entityType: 'spell',
  classLevel: 5,
  knownLimits: createKnownLimits([
    { level: 0, max: 6, current: 6 },
    { level: 1, max: 4, current: 3 },
    { level: 2, max: 2, current: 1 },
  ]),
  tracks: [{
    id: 'base',
    resourceType: 'SLOTS',
    preparationType: 'NONE',
    slots: createSlots([
      { level: 0, max: 6 },
      { level: 1, max: 6, current: 4 },
      { level: 2, max: 4, current: 2 },
    ]),
  }],
  config: sorcererConfig,
}

/**
 * Cleric: UNLIMITED + SLOTS + BOUND
 * - Access to full spell list (divine)
 * - Prepare in slots like Wizard
 */
const clericConfig: CGEConfig = {
  id: 'cleric-spells',
  classId: 'cleric',
  entityType: 'spell',
  levelPath: '@entity.levels.cleric',
  known: { type: 'UNLIMITED' },
  tracks: [{
    id: 'base',
    resource: { type: 'SLOTS', table: { 5: [5, 3, 2, 1, 0, 0, 0, 0, 0, 0] }, refresh: 'daily' },
    preparation: { type: 'BOUND' },
  }],
  variables: { classPrefix: 'cleric.spell', genericPrefix: 'spell', casterLevelVar: 'castingClassLevel.cleric' },
  labels: { known: 'prayers', prepared: 'prepared_spells', slot: 'spell_slot', action: 'cast', pool: '' },
}

const clericCGE: CalculatedCGE = {
  id: 'cleric-spells',
  classId: 'cleric',
  entityType: 'spell',
  classLevel: 5,
  knownLimits: undefined,
  tracks: [{
    id: 'base',
    resourceType: 'SLOTS',
    preparationType: 'BOUND',
    slots: createBoundSlots([
      { level: 0, max: 5, preparations: [{ entityId: 'guidance' }, { entityId: 'resistance' }, { entityId: 'virtue' }, {}, {}] },
      { level: 1, max: 3, preparations: [{ entityId: 'bless' }, { entityId: 'cure-light-wounds', used: true }, {}] },
      { level: 2, max: 2, preparations: [{ entityId: 'hold-person' }, {}] },
      { level: 3, max: 1, preparations: [] },
    ]),
  }],
  config: clericConfig,
}

/**
 * Warblade: LIMITED_TOTAL + NONE + LIST GLOBAL (consumeOnUse)
 * - Total maneuvers known (not per level)
 * - No resource cost
 * - Readied maneuvers consumed on use, recovered manually
 */
const warbladeConfig: CGEConfig = {
  id: 'warblade-maneuvers',
  classId: 'warblade',
  entityType: 'maneuver',
  levelPath: '@entity.level',
  known: { type: 'LIMITED_TOTAL', table: { 5: [6] } },
  tracks: [{
    id: 'base',
    resource: { type: 'NONE' },
    preparation: { type: 'LIST', structure: 'GLOBAL', maxFormula: { expression: '@warblade.readiedManeuvers' }, consumeOnUse: true, recovery: 'manual' },
  }],
  variables: { classPrefix: 'warblade.maneuver', genericPrefix: 'maneuver', casterLevelVar: 'initiatorLevel.warblade' },
  labels: { known: 'known_maneuvers', prepared: 'readied_maneuvers', slot: '', action: 'initiate', pool: '' },
}

const warbladeCGE: CalculatedCGE = {
  id: 'warblade-maneuvers',
  classId: 'warblade',
  entityType: 'maneuver',
  classLevel: 5,
  knownLimits: [{ level: -1, max: 6, current: 4 }], // LIMITED_TOTAL uses level: -1
  tracks: [{
    id: 'base',
    resourceType: 'NONE',
    preparationType: 'LIST',
  }],
  config: warbladeConfig,
}

/**
 * Psion: LIMITED_TOTAL + POOL + NONE
 * - Total powers known
 * - Power points pool
 * - No preparation needed
 */
const psionConfig: CGEConfig = {
  id: 'psion-powers',
  classId: 'psion',
  entityType: 'power',
  levelPath: '@entity.level',
  known: { type: 'LIMITED_TOTAL', table: { 5: [7] } },
  tracks: [{
    id: 'base',
    resource: { type: 'POOL', maxFormula: { expression: '@psion.powerPoints' }, refresh: 'daily' },
    preparation: { type: 'NONE' },
  }],
  variables: { classPrefix: 'psion.power', genericPrefix: 'power', casterLevelVar: 'manifesterLevel.psion' },
  labels: { known: 'known_powers', prepared: '', slot: '', action: 'manifest', pool: 'power_points' },
}

const psionCGE: CalculatedCGE = {
  id: 'psion-powers',
  classId: 'psion',
  entityType: 'power',
  classLevel: 5,
  knownLimits: [{ level: -1, max: 7, current: 5 }],
  tracks: [{
    id: 'base',
    resourceType: 'POOL',
    preparationType: 'NONE',
    pool: { max: 25, current: 18 },
  }],
  config: psionConfig,
}

/**
 * Warlock: LIMITED_TOTAL + NONE + NONE
 * - Limited invocations known
 * - At-will usage (no cost, no preparation)
 */
const warlockConfig: CGEConfig = {
  id: 'warlock-invocations',
  classId: 'warlock',
  entityType: 'invocation',
  levelPath: '@entity.level',
  known: { type: 'LIMITED_TOTAL', table: { 5: [3] } },
  tracks: [{
    id: 'base',
    resource: { type: 'NONE' },
    preparation: { type: 'NONE' },
  }],
  variables: { classPrefix: 'warlock.invocation', genericPrefix: 'invocation', casterLevelVar: 'invocationLevel.warlock' },
  labels: { known: 'known_invocations', prepared: '', slot: '', action: 'invoke', pool: '' },
}

const warlockCGE: CalculatedCGE = {
  id: 'warlock-invocations',
  classId: 'warlock',
  entityType: 'invocation',
  classLevel: 5,
  knownLimits: [{ level: -1, max: 3, current: 2 }],
  tracks: [{
    id: 'base',
    resourceType: 'NONE',
    preparationType: 'NONE',
  }],
  config: warlockConfig,
}

// =============================================================================
// Demo Data Array
// =============================================================================

type DemoCGE = {
  title: string
  subtitle: string
  cge: CalculatedCGE
  description: string
}

const demoCGEs: DemoCGE[] = [
  {
    title: 'Wizard 3.5',
    subtitle: 'UNLIMITED + SLOTS + BOUND',
    cge: wizardCGE,
    description: 'Libro de conjuros ilimitado. Prepara conjuros especificos en cada slot. Al lanzar, el slot se consume.',
  },
  {
    title: 'Sorcerer',
    subtitle: 'LIMITED_PER_LEVEL + SLOTS + NONE',
    cge: sorcererCGE,
    description: 'Conocidos limitados por nivel de conjuro. Lanza espontaneamente cualquier conocido gastando slot.',
  },
  {
    title: 'Cleric',
    subtitle: 'UNLIMITED + SLOTS + BOUND',
    cge: clericCGE,
    description: 'Acceso a toda la lista divina. Prepara como el Mago pero puede cambiar cada dia.',
  },
  {
    title: 'Warblade',
    subtitle: 'LIMITED_TOTAL + NONE + LIST',
    cge: warbladeCGE,
    description: 'Maniobras totales limitadas. Prepara lista diaria. Se consumen al usar, recupera con accion.',
  },
  {
    title: 'Psion',
    subtitle: 'LIMITED_TOTAL + POOL + NONE',
    cge: psionCGE,
    description: 'Poderes totales limitados. Gasta puntos de poder. Sin preparacion.',
  },
  {
    title: 'Warlock',
    subtitle: 'LIMITED_TOTAL + NONE + NONE',
    cge: warlockCGE,
    description: 'Invocaciones limitadas. Uso a voluntad sin coste ni preparacion.',
  },
]

// =============================================================================
// Component
// =============================================================================

function CGEDemoCard({ demo }: { demo: DemoCGE }) {
  return (
    <SectionCard>
      <YStack gap={8}>
        <SectionHeader icon="*" title={demo.title} />
        <Text fontSize={11} color="$placeholderColor" opacity={0.7}>
          {demo.subtitle}
        </Text>
        <Text fontSize={12} color="$placeholderColor">
          {demo.description}
        </Text>
      </YStack>
      <YStack marginTop={12} minHeight={300}>
        <CGETabView cge={demo.cge} />
      </YStack>
    </SectionCard>
  )
}

export function DemoCGEScreen() {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
      <YStack gap={16}>
        <YStack gap={4} marginBottom={8}>
          <Text fontSize={24} fontWeight="700" color="$color">
            CGE Demo
          </Text>
          <Text fontSize={14} color="$placeholderColor">
            Ejemplos de todos los tipos de CGE soportados
          </Text>
        </YStack>

        {/* Two-column layout for desktop */}
        <XStack flexWrap="wrap" gap={16}>
          {demoCGEs.map((demo) => (
            <YStack key={demo.cge.id} width={400} minWidth={350} flexGrow={1}>
              <CGEDemoCard demo={demo} />
            </YStack>
          ))}
        </XStack>
      </YStack>
    </ScrollView>
  )
}
