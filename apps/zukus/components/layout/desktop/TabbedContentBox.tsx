import { useState } from 'react'
import { Pressable } from 'react-native'
import { Text, XStack, YStack, ScrollView } from 'tamagui'

export type TabItem = {
  id: string
  label: string
  content: React.ReactNode
  badge?: number
}

type TabbedContentBoxProps = {
  tabs: TabItem[]
  defaultTabId?: string
}

function TabButton({
  label,
  isActive,
  onPress,
}: {
  label: string
  isActive: boolean
  onPress: () => void
}) {
  return (
    <Pressable onPress={onPress}>
      {({ hovered }: { pressed: boolean; hovered?: boolean }) => (
        <YStack
          paddingVertical={8}
          paddingHorizontal={12}
          cursor="pointer"
          borderBottomWidth={2}
          borderBottomColor={isActive ? '$color' : 'transparent'}
        >
          <Text
            fontSize={13}
            fontWeight={isActive ? '700' : '500'}
            color={isActive ? '$color' : '$placeholderColor'}
            letterSpacing={0.3}
            opacity={hovered && !isActive ? 0.8 : 1}
          >
            {label}
          </Text>
        </YStack>
      )}
    </Pressable>
  )
}

/**
 * Tabbed content box for the bottom-right area.
 * Used to display Actions, Spells, Inventory, Feats, Notes, etc.
 */
export function TabbedContentBox({ tabs, defaultTabId }: TabbedContentBoxProps) {
  const [activeTabId, setActiveTabId] = useState(defaultTabId ?? tabs[0]?.id)

  const activeTab = tabs.find((t) => t.id === activeTabId)

  if (tabs.length === 0) {
    return null
  }

  return (
    <YStack
      flex={1}
      backgroundColor="$background"
      borderWidth={1}
      borderColor="$borderColor"
      borderRadius={8}
      overflow="hidden"
    >
      {/* Tab bar */}
      <XStack
        alignItems="flex-end"
        paddingHorizontal={12}
        paddingTop={8}
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
        gap={8}
      >
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            label={tab.label}
            isActive={activeTabId === tab.id}
            onPress={() => setActiveTabId(tab.id)}
          />
        ))}
      </XStack>

      {/* Tab content */}
      <ScrollView
        flex={1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16 }}
      >
        {activeTab?.content}
      </ScrollView>
    </YStack>
  )
}

/**
 * Empty state placeholder for tabs without content.
 */
export function TabEmptyState({ message }: { message: string }) {
  return (
    <YStack flex={1} alignItems="center" justifyContent="center" paddingVertical={32}>
      <Text fontSize={14} color="$placeholderColor">
        {message}
      </Text>
    </YStack>
  )
}
