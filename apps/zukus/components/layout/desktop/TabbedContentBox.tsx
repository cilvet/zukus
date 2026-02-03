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
  badge,
  onPress,
}: {
  label: string
  isActive: boolean
  badge?: number
  onPress: () => void
}) {
  return (
    <Pressable onPress={onPress}>
      {({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => (
        <XStack
          alignItems="center"
          gap={6}
          paddingVertical={10}
          paddingHorizontal={16}
          backgroundColor={isActive ? '$accentColor' : pressed ? '$backgroundHover' : hovered ? '$backgroundHover' : 'transparent'}
          borderRadius={6}
          cursor="pointer"
        >
          <Text
            fontSize={12}
            fontWeight={isActive ? '700' : '600'}
            color={isActive ? '#FFFFFF' : '$color'}
            letterSpacing={0.5}
            textTransform="uppercase"
          >
            {label}
          </Text>
          {typeof badge === 'number' && badge > 0 ? (
            <YStack
              backgroundColor={isActive ? 'rgba(255,255,255,0.3)' : '$borderColor'}
              paddingHorizontal={6}
              paddingVertical={2}
              borderRadius={10}
            >
              <Text fontSize={10} fontWeight="700" color={isActive ? '#FFFFFF' : '$placeholderColor'}>
                {badge}
              </Text>
            </YStack>
          ) : null}
        </XStack>
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
        alignItems="center"
        paddingHorizontal={8}
        paddingVertical={8}
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
        gap={4}
        flexWrap="wrap"
      >
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            label={tab.label}
            isActive={activeTabId === tab.id}
            badge={tab.badge}
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
