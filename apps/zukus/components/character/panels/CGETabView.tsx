import { useState, useMemo } from 'react'
import { Pressable } from 'react-native'
import { YStack, XStack, Text } from 'tamagui'
import { useTheme } from '../../../ui'
import { CGEUsePanel } from './CGEUsePanel'
import { CGEManagementPanel } from './CGEManagementPanel'
import { CGEKnownPanel } from './CGEKnownPanel'
import type { CalculatedCGE } from '@zukus/core'

type CGETabViewProps = {
  cge?: CalculatedCGE | null
}

type TabId = 'known' | 'prepare' | 'use'

type TabConfig = {
  id: TabId
  label: string
}

type TabButtonProps = {
  label: string
  isActive: boolean
  onPress: () => void
  accentColor: string
}

function TabButton({ label, isActive, onPress, accentColor }: TabButtonProps) {
  return (
    <Pressable onPress={onPress} style={{ flex: 1 }}>
      {({ pressed }) => (
        <YStack
          alignItems="center"
          paddingVertical={12}
          borderBottomWidth={2}
          borderBottomColor={isActive ? accentColor : 'transparent'}
          opacity={pressed ? 0.7 : 1}
        >
          <Text
            fontSize={14}
            fontWeight={isActive ? '700' : '500'}
            color={isActive ? '$color' : '$placeholderColor'}
          >
            {label}
          </Text>
        </YStack>
      )}
    </Pressable>
  )
}

/**
 * Determines which tabs to show based on CGE configuration.
 *
 * - "Known" tab: shown if config.known exists (Sorcerer, Wizard)
 * - "Prepare" tab: shown if any track has preparationType === 'BOUND' (Cleric, Wizard)
 * - "Use" tab: always shown
 */
function getAvailableTabs(cge: CalculatedCGE | null | undefined): TabConfig[] {
  const tabs: TabConfig[] = []

  // Always show "Use" tab first
  tabs.push({ id: 'use', label: 'Usar' })

  if (!cge) {
    return tabs
  }

  // Show "Known" tab if CGE has known configuration
  if (cge.config.known) {
    const knownLabel =
      cge.config.known.type === 'UNLIMITED' ? 'Libro' : 'Conocidos'
    tabs.push({ id: 'known', label: knownLabel })
  }

  // Show "Prepare" tab if any track uses BOUND preparation
  const hasBoundPreparation = cge.tracks.some(
    (track) => track.preparationType === 'BOUND'
  )
  if (hasBoundPreparation) {
    tabs.push({ id: 'prepare', label: 'Preparar' })
  }

  return tabs
}

/**
 * CGE Tab View - Container with dynamic tabs based on CGE configuration.
 *
 * Shows different tabs depending on the CGE type:
 * - Sorcerer (spontaneous): Known, Use
 * - Cleric (prepared divine): Prepare, Use
 * - Wizard (prepared arcane): Known, Prepare, Use
 */
export function CGETabView({ cge }: CGETabViewProps) {
  const { themeInfo } = useTheme()
  const accentColor = themeInfo.colors.accent

  const availableTabs = useMemo(() => getAvailableTabs(cge), [cge])

  // Initialize with first available tab
  const [activeTab, setActiveTab] = useState<TabId>(() => availableTabs[0]?.id ?? 'use')

  // If active tab is no longer available, switch to first available
  const validActiveTab = availableTabs.some((t) => t.id === activeTab)
    ? activeTab
    : availableTabs[0]?.id ?? 'use'

  return (
    <YStack flex={1}>
      {/* Tab bar */}
      <XStack borderBottomWidth={1} borderBottomColor="$borderColor">
        {availableTabs.map((tab) => (
          <TabButton
            key={tab.id}
            label={tab.label}
            isActive={validActiveTab === tab.id}
            onPress={() => setActiveTab(tab.id)}
            accentColor={accentColor}
          />
        ))}
      </XStack>

      {/* Tab content */}
      {validActiveTab === 'known' && <CGEKnownPanel cge={cge} />}
      {validActiveTab === 'prepare' && <CGEManagementPanel cge={cge} />}
      {validActiveTab === 'use' && <CGEUsePanel cge={cge} />}
    </YStack>
  )
}
