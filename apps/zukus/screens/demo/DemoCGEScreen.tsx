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
import { DEMO_CHARACTER_DEFS, buildDemoCharacter, type DemoCharacterDef } from './demoCharacters'

// =============================================================================
// Components
// =============================================================================

type CharacterSelectorProps = {
  characters: DemoCharacterDef[]
  selectedId: string
  onSelect: (id: string) => void
}

function CharacterSelector({ characters, selectedId, onSelect }: CharacterSelectorProps) {
  'use no memo'

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
  'use no memo'

  const [selectedCharId, setSelectedCharId] = useState(DEMO_CHARACTER_DEFS[0].id)
  const setCharacter = useCharacterStore((state) => state.setCharacter)

  // Load selected character into store
  useEffect(() => {
    const def = DEMO_CHARACTER_DEFS.find((c) => c.id === selectedCharId)
    if (!def) return

    const { baseData, sheet } = buildDemoCharacter(def)
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
        characters={DEMO_CHARACTER_DEFS}
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
