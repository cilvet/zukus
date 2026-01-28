import { useState } from 'react'
import { Pressable } from 'react-native'
import { YStack, XStack, Text } from 'tamagui'
import { useTheme } from '../../../ui'
import { CGEUsePanel } from './CGEUsePanel'
import { CGEManagementPanel } from './CGEManagementPanel'
import type { CalculatedCGE } from '@zukus/core'

type CGETabViewProps = {
  cge?: CalculatedCGE | null
}

type TabId = 'use' | 'manage'

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
 * CGE Tab View - Container with tabs for Use and Manage panels.
 * Used in both desktop SidePanel and mobile character screen.
 */
export function CGETabView({ cge }: CGETabViewProps) {
  const [activeTab, setActiveTab] = useState<TabId>('use')
  const { themeInfo } = useTheme()
  const accentColor = themeInfo.colors.accent

  return (
    <YStack flex={1}>
      {/* Tab bar */}
      <XStack borderBottomWidth={1} borderBottomColor="$borderColor">
        <TabButton
          label="Usar"
          isActive={activeTab === 'use'}
          onPress={() => setActiveTab('use')}
          accentColor={accentColor}
        />
        <TabButton
          label="Gestionar"
          isActive={activeTab === 'manage'}
          onPress={() => setActiveTab('manage')}
          accentColor={accentColor}
        />
      </XStack>

      {/* Tab content */}
      {activeTab === 'use' ? (
        <CGEUsePanel cge={cge} />
      ) : (
        <CGEManagementPanel cge={cge} />
      )}
    </YStack>
  )
}
