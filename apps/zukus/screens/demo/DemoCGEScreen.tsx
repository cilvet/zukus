/**
 * Demo CGE Screen
 *
 * Interactive demo of all CGE types with real functionality.
 * Uses the characterStore to enable full CGE interaction.
 */

import { useState, useEffect, useMemo } from 'react'
import { Pressable } from 'react-native'
import { YStack, XStack, Text } from 'tamagui'
import {
  useCharacterStore,
  useCharacterSheet,
  usePrimaryCGE,
  useTheme,
  useCompendiumContext,
} from '../../ui'
import { usePanelNavigation } from '../../hooks'
import {
  SectionCard,
  SectionHeader,
  CGETabView,
  CGEManagementPanel,
  CGEEntitySelectPanel,
} from '../../components/character'
import {
  ColumnsContainer,
  VerticalSection,
  SidePanel,
  SidePanelContainer,
} from '../../components/layout'
import { CompendiumEntityDetail } from '../../components/compendiums'
import {
  CharacterUpdater,
  calculateCharacterSheet,
  filterSpells,
  allManeuvers,
  type CharacterBaseData,
  type CGEConfig,
  type CGEState,
  type LevelTable,
  type SpecialFeature,
  type CGEDefinitionChange,
} from '@zukus/core'

// =============================================================================
// CGE Configurations (from srd/testClasses)
// =============================================================================

const WIZARD_SLOTS: LevelTable = {
  5: [4, 3, 2, 1, 0, 0, 0, 0, 0, 0],
}

const SORCERER_SLOTS: LevelTable = {
  5: [6, 6, 4, 0, 0, 0, 0, 0, 0, 0],
}

const SORCERER_KNOWN: LevelTable = {
  5: [6, 4, 2, 0, 0, 0, 0, 0, 0, 0],
}

const CLERIC_SLOTS: LevelTable = {
  5: [5, 3, 2, 1, 0, 0, 0, 0, 0, 0],
}

const WARBLADE_KNOWN: LevelTable = {
  5: [6],
}

const PSION_KNOWN: LevelTable = {
  5: [7],
}

const WARLOCK_KNOWN: LevelTable = {
  5: [3],
}

// =============================================================================
// Demo Character Definitions
// =============================================================================

type DemoCharacterDef = {
  id: string
  name: string
  subtitle: string
  description: string
  classId: string
  entityType: string
  cgeConfig: CGEConfig
  initialCgeState: CGEState
}

function createWizardDef(): DemoCharacterDef {
  const config: CGEConfig = {
    id: 'wizard-spells',
    classId: 'wizard',
    entityType: 'spell',
    levelPath: '@entity.levels.wizard',
    known: { type: 'UNLIMITED' },
    tracks: [{
      id: 'base',
      resource: { type: 'SLOTS', table: WIZARD_SLOTS, refresh: 'daily' },
      preparation: { type: 'BOUND' },
    }],
    variables: { classPrefix: 'wizard.spell', genericPrefix: 'spell', casterLevelVar: 'castingClassLevel.wizard' },
    labels: { known: 'spellbook', prepared: 'prepared_spells', slot: 'spell_slot', action: 'cast', pool: '' },
  }

  // Get some wizard spells
  const wizardSpells0 = filterSpells('wizard', 0).slice(0, 6)
  const wizardSpells1 = filterSpells('wizard', 1).slice(0, 5)
  const wizardSpells2 = filterSpells('wizard', 2).slice(0, 4)
  const wizardSpells3 = filterSpells('wizard', 3).slice(0, 3)

  return {
    id: 'demo-wizard',
    name: 'Wizard Demo',
    subtitle: 'UNLIMITED + SLOTS + BOUND',
    description: 'Libro de conjuros ilimitado. Prepara conjuros especificos en cada slot.',
    classId: 'wizard',
    entityType: 'spell',
    cgeConfig: config,
    initialCgeState: {
      knownSelections: {
        '0': wizardSpells0.map(s => s.id),
        '1': wizardSpells1.map(s => s.id),
        '2': wizardSpells2.map(s => s.id),
        '3': wizardSpells3.map(s => s.id),
      },
      boundPreparations: {
        'base:0-0': wizardSpells0[0]?.id,
        'base:0-1': wizardSpells0[1]?.id,
        'base:0-2': wizardSpells0[2]?.id,
        'base:0-3': wizardSpells0[3]?.id,
        'base:1-0': wizardSpells1[0]?.id,
        'base:1-1': wizardSpells1[1]?.id,
        'base:1-2': wizardSpells1[2]?.id,
        'base:2-0': wizardSpells2[0]?.id,
        'base:2-1': wizardSpells2[1]?.id,
        'base:3-0': wizardSpells3[0]?.id,
      },
    },
  }
}

function createSorcererDef(): DemoCharacterDef {
  const config: CGEConfig = {
    id: 'sorcerer-spells',
    classId: 'sorcerer',
    entityType: 'spell',
    levelPath: '@entity.levels.sorcerer',
    known: { type: 'LIMITED_PER_ENTITY_LEVEL', table: SORCERER_KNOWN },
    tracks: [{
      id: 'base',
      resource: { type: 'SLOTS', table: SORCERER_SLOTS, refresh: 'daily' },
      preparation: { type: 'NONE' },
    }],
    variables: { classPrefix: 'sorcerer.spell', genericPrefix: 'spell', casterLevelVar: 'castingClassLevel.sorcerer' },
    labels: { known: 'known_spells', prepared: '', slot: 'spell_slot', action: 'cast', pool: '' },
  }

  const sorcSpells0 = filterSpells('sorcerer', 0).slice(0, 5)
  const sorcSpells1 = filterSpells('sorcerer', 1).slice(0, 3)
  const sorcSpells2 = filterSpells('sorcerer', 2).slice(0, 1)

  return {
    id: 'demo-sorcerer',
    name: 'Sorcerer Demo',
    subtitle: 'LIMITED_PER_LEVEL + SLOTS + NONE',
    description: 'Conocidos limitados por nivel. Lanza espontaneamente gastando slots.',
    classId: 'sorcerer',
    entityType: 'spell',
    cgeConfig: config,
    initialCgeState: {
      knownSelections: {
        '0': sorcSpells0.map(s => s.id),
        '1': sorcSpells1.map(s => s.id),
        '2': sorcSpells2.map(s => s.id),
      },
      slotCurrentValues: { '1': -2, '2': -1 }, // Some slots used
    },
  }
}

function createClericDef(): DemoCharacterDef {
  const config: CGEConfig = {
    id: 'cleric-spells',
    classId: 'cleric',
    entityType: 'spell',
    levelPath: '@entity.levels.cleric',
    known: { type: 'UNLIMITED' },
    tracks: [{
      id: 'base',
      resource: { type: 'SLOTS', table: CLERIC_SLOTS, refresh: 'daily' },
      preparation: { type: 'BOUND' },
    }],
    variables: { classPrefix: 'cleric.spell', genericPrefix: 'spell', casterLevelVar: 'castingClassLevel.cleric' },
    labels: { known: 'prayers', prepared: 'prepared_spells', slot: 'spell_slot', action: 'cast', pool: '' },
  }

  const clericSpells0 = filterSpells('cleric', 0).slice(0, 5)
  const clericSpells1 = filterSpells('cleric', 1).slice(0, 3)
  const clericSpells2 = filterSpells('cleric', 2).slice(0, 2)

  return {
    id: 'demo-cleric',
    name: 'Cleric Demo',
    subtitle: 'UNLIMITED + SLOTS + BOUND',
    description: 'Acceso a toda la lista divina. Prepara como el Mago.',
    classId: 'cleric',
    entityType: 'spell',
    cgeConfig: config,
    initialCgeState: {
      knownSelections: {
        '0': clericSpells0.map(s => s.id),
        '1': clericSpells1.map(s => s.id),
        '2': clericSpells2.map(s => s.id),
      },
      boundPreparations: {
        'base:0-0': clericSpells0[0]?.id,
        'base:0-1': clericSpells0[1]?.id,
        'base:1-0': clericSpells1[0]?.id,
        'base:1-1': clericSpells1[1]?.id,
      },
      usedBoundSlots: { 'base:1-0': true },
    },
  }
}

function createWarbladeDef(): DemoCharacterDef {
  const config: CGEConfig = {
    id: 'warblade-maneuvers',
    classId: 'warblade',
    entityType: 'maneuver',
    levelPath: '@entity.level',
    known: { type: 'LIMITED_TOTAL', table: WARBLADE_KNOWN },
    tracks: [{
      id: 'base',
      resource: { type: 'NONE' },
      preparation: { type: 'LIST', structure: 'GLOBAL', maxFormula: { expression: '4' }, consumeOnUse: true, recovery: 'manual' },
    }],
    variables: { classPrefix: 'warblade.maneuver', genericPrefix: 'maneuver', casterLevelVar: 'initiatorLevel.warblade' },
    labels: { known: 'known_maneuvers', prepared: 'readied_maneuvers', slot: '', action: 'initiate', pool: '' },
  }

  // Get warblade maneuvers
  const warbladeManeuvers = allManeuvers.filter(m => m.classData.classLevels['warblade'] !== undefined).slice(0, 4)

  return {
    id: 'demo-warblade',
    name: 'Warblade Demo',
    subtitle: 'LIMITED_TOTAL + NONE + LIST',
    description: 'Maniobras totales. Se consumen al usar, recupera con accion.',
    classId: 'warblade',
    entityType: 'maneuver',
    cgeConfig: config,
    initialCgeState: {
      knownSelections: {
        '-1': warbladeManeuvers.map(m => m.id),
      },
    },
  }
}

function createPsionDef(): DemoCharacterDef {
  const config: CGEConfig = {
    id: 'psion-powers',
    classId: 'psion',
    entityType: 'power',
    levelPath: '@entity.level',
    known: { type: 'LIMITED_TOTAL', table: PSION_KNOWN },
    tracks: [{
      id: 'base',
      resource: { type: 'POOL', maxFormula: { expression: '25' }, refresh: 'daily' },
      preparation: { type: 'NONE' },
    }],
    variables: { classPrefix: 'psion.power', genericPrefix: 'power', casterLevelVar: 'manifesterLevel.psion' },
    labels: { known: 'known_powers', prepared: '', slot: '', action: 'manifest', pool: 'power_points' },
  }

  return {
    id: 'demo-psion',
    name: 'Psion Demo',
    subtitle: 'LIMITED_TOTAL + POOL + NONE',
    description: 'Poderes totales. Gasta puntos de poder. Sin preparacion.',
    classId: 'psion',
    entityType: 'power',
    cgeConfig: config,
    initialCgeState: {
      knownSelections: { '-1': [] },
      poolCurrentValue: 18,
    },
  }
}

function createWarlockDef(): DemoCharacterDef {
  const config: CGEConfig = {
    id: 'warlock-invocations',
    classId: 'warlock',
    entityType: 'invocation',
    levelPath: '@entity.level',
    known: { type: 'LIMITED_TOTAL', table: WARLOCK_KNOWN },
    tracks: [{
      id: 'base',
      resource: { type: 'NONE' },
      preparation: { type: 'NONE' },
    }],
    variables: { classPrefix: 'warlock.invocation', genericPrefix: 'invocation', casterLevelVar: 'invocationLevel.warlock' },
    labels: { known: 'known_invocations', prepared: '', slot: '', action: 'invoke', pool: '' },
  }

  return {
    id: 'demo-warlock',
    name: 'Warlock Demo',
    subtitle: 'LIMITED_TOTAL + NONE + NONE',
    description: 'Invocaciones limitadas. Uso a voluntad sin coste.',
    classId: 'warlock',
    entityType: 'invocation',
    cgeConfig: config,
    initialCgeState: {
      knownSelections: { '-1': [] },
    },
  }
}

// =============================================================================
// Character Builder
// =============================================================================

function createDemoCharacterBaseData(def: DemoCharacterDef): CharacterBaseData {
  const cgeDefinition: CGEDefinitionChange = {
    type: 'CGE_DEFINITION',
    config: def.cgeConfig,
  }

  const spellcastingFeature: SpecialFeature = {
    uniqueId: `${def.classId}-spellcasting`,
    title: `${def.name} Spellcasting`,
    description: def.description,
    specialChanges: [cgeDefinition],
  }

  // Use type assertion for demo purposes - full Skills type is complex
  const minimalBaseData = {
    name: def.name,
    temporaryHp: 0,
    currentDamage: 0,
    currentTemporalHp: 0,
    baseAbilityData: {
      strength: { baseScore: 10 },
      dexterity: { baseScore: 14 },
      constitution: { baseScore: 14 },
      intelligence: { baseScore: 16 },
      wisdom: { baseScore: 12 },
      charisma: { baseScore: 16 },
    },
    skills: {},
    skillData: {},
    classes: [],
    level: {
      level: 5,
      xp: 10000,
      levelsData: Array.from({ length: 5 }, (_, i) => ({
        classUniqueId: def.classId,
        level: i + 1,
        hitDie: 6,
        hitDieRoll: 4,
        levelClassFeatures: [],
        levelFeats: [],
        permanentIntelligenceStatAtLevel: 16,
      })),
    },
    equipment: { items: [], money: 0 },
    feats: [],
    buffs: [],
    sharedBuffs: [],
    specialFeatures: [spellcastingFeature],
    cgeState: {
      [def.cgeConfig.id]: def.initialCgeState,
    },
    updatedAt: new Date().toISOString(),
  }

  return minimalBaseData as unknown as CharacterBaseData
}

// =============================================================================
// Demo Characters
// =============================================================================

const DEMO_CHARACTERS: DemoCharacterDef[] = [
  createWizardDef(),
  createSorcererDef(),
  createClericDef(),
  createWarbladeDef(),
  createPsionDef(),
  createWarlockDef(),
]

// =============================================================================
// Components
// =============================================================================

type CharacterSelectorProps = {
  characters: DemoCharacterDef[]
  selectedId: string
  onSelect: (id: string) => void
}

function CharacterSelector({ characters, selectedId, onSelect }: CharacterSelectorProps) {
  const { themeInfo } = useTheme()
  const accentColor = themeInfo.colors.accent

  return (
    <XStack flexWrap="wrap" gap={8} paddingHorizontal={16} paddingVertical={12}>
      {characters.map((char) => {
        const isSelected = char.id === selectedId
        return (
          <Pressable key={char.id} onPress={() => onSelect(char.id)}>
            {({ pressed }) => (
              <YStack
                backgroundColor={isSelected ? accentColor : '$uiBackgroundColor'}
                paddingHorizontal={16}
                paddingVertical={10}
                borderRadius={8}
                borderWidth={1}
                borderColor={isSelected ? accentColor : '$borderColor'}
                opacity={pressed ? 0.7 : 1}
              >
                <Text
                  fontSize={13}
                  fontWeight="600"
                  color={isSelected ? '#FFFFFF' : '$color'}
                >
                  {char.name.replace(' Demo', '')}
                </Text>
                <Text
                  fontSize={10}
                  color={isSelected ? 'rgba(255,255,255,0.7)' : '$placeholderColor'}
                >
                  {char.subtitle}
                </Text>
              </YStack>
            )}
          </Pressable>
        )
      })}
    </XStack>
  )
}

function DemoCGEContent() {
  'use no memo'

  const characterSheet = useCharacterSheet()
  const primaryCGE = usePrimaryCGE()
  const { currentPanel, isPanelOpen, canGoBack, closePanel, goBack } = usePanelNavigation('character')

  const panelInfo = useMemo(() => {
    if (!currentPanel?.path) return null
    const [type, ...rest] = currentPanel.path.split('/')
    const id = rest.join('/')
    if (!type || !id) return null
    return { type, id }
  }, [currentPanel?.path])

  if (!characterSheet || !primaryCGE) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Text color="$placeholderColor">Cargando...</Text>
      </YStack>
    )
  }

  return (
    <SidePanelContainer>
      <ColumnsContainer>
        <VerticalSection width={400}>
          <YStack width="100%" gap={16}>
            <SectionCard>
              <YStack gap={8}>
                <SectionHeader icon="*" title={characterSheet.name} />
                <Text fontSize={12} color="$placeholderColor">
                  Nivel 5 {primaryCGE.classId}
                </Text>
                <Text fontSize={11} color="$placeholderColor" marginTop={4}>
                  CGE: {primaryCGE.config.known?.type ?? 'N/A'} + {primaryCGE.tracks[0]?.resourceType} + {primaryCGE.tracks[0]?.preparationType}
                </Text>
              </YStack>
              <YStack marginTop={16} minHeight={400}>
                <CGETabView cge={primaryCGE} />
              </YStack>
            </SectionCard>
          </YStack>
        </VerticalSection>
      </ColumnsContainer>

      <SidePanel
        isOpen={isPanelOpen}
        onClose={closePanel}
        onBack={goBack}
        canGoBack={canGoBack}
        title={currentPanel?.title ?? 'Detail'}
        disableScroll={panelInfo?.type === 'cgeEntitySelect' || panelInfo?.type === 'compendiumEntity'}
      >
        {panelInfo?.type === 'cgeManagement' && <CGEManagementPanel />}
        {panelInfo?.type === 'cgeEntitySelect' && panelInfo?.id && (
          <CGEEntitySelectPanel selectionId={panelInfo.id} />
        )}
        {panelInfo?.type === 'compendiumEntity' && panelInfo?.id && (
          <CompendiumEntityDetail entityId={panelInfo.id} />
        )}
      </SidePanel>
    </SidePanelContainer>
  )
}

export function DemoCGEScreen() {
  const [selectedCharId, setSelectedCharId] = useState(DEMO_CHARACTERS[0].id)
  const setCharacter = useCharacterStore((state) => state.setCharacter)

  // Load selected character into store
  useEffect(() => {
    const def = DEMO_CHARACTERS.find((c) => c.id === selectedCharId)
    if (!def) return

    const baseData = createDemoCharacterBaseData(def)
    const sheet = calculateCharacterSheet(baseData)
    setCharacter(sheet, baseData)
  }, [selectedCharId, setCharacter])

  return (
    <YStack flex={1}>
      {/* Header */}
      <YStack
        paddingHorizontal={16}
        paddingTop={16}
        paddingBottom={8}
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
      >
        <Text fontSize={20} fontWeight="700" color="$color">
          CGE Demo
        </Text>
        <Text fontSize={13} color="$placeholderColor" marginTop={4}>
          Selecciona un tipo de clase para probar el sistema CGE
        </Text>
      </YStack>

      {/* Character Selector */}
      <CharacterSelector
        characters={DEMO_CHARACTERS}
        selectedId={selectedCharId}
        onSelect={setSelectedCharId}
      />

      {/* CGE Content */}
      <YStack flex={1}>
        <DemoCGEContent />
      </YStack>
    </YStack>
  )
}
