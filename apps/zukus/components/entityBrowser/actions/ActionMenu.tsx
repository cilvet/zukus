import { Platform } from 'react-native'
import { Popover, Adapt, YStack, XStack, Text, Separator } from 'tamagui'
import { FontAwesome6 } from '@expo/vector-icons'
import { BottomSheet } from '../../../ui/atoms/BottomSheet'
import type { ActionGroup, ActionState } from '../types'

type ActionMenuProps = {
  /** Trigger element that opens the menu */
  trigger: React.ReactNode
  /** Whether the menu is open */
  open: boolean
  /** Called when menu should close */
  onOpenChange: (open: boolean) => void
  /** Menu title (shown in mobile sheet) */
  title: string
  /** Grouped actions to display */
  groups: ActionGroup[]
  /** Theme colors */
  accentColor: string
  placeholderColor: string
  /** Get dynamic state for each action */
  getActionState?: (actionId: string) => ActionState
  /** Called when an action is selected */
  onSelectAction: (actionId: string) => void
}

/**
 * Adaptive action menu component.
 *
 * - Desktop (web): Renders as a Popover next to the trigger
 * - Mobile: Renders as a BottomSheet
 */
export function ActionMenu({
  trigger,
  open,
  onOpenChange,
  title,
  groups,
  accentColor,
  placeholderColor,
  getActionState,
  onSelectAction,
}: ActionMenuProps) {
  const isDesktopWeb = Platform.OS === 'web'

  const handleSelectAction = (actionId: string) => {
    onSelectAction(actionId)
    onOpenChange(false)
  }

  // Render menu content (shared between popover and sheet)
  const menuContent = (
    <YStack gap="$2" padding="$2">
      {groups.map((group, groupIndex) => {
        const visibleActions = group.actions.filter((action) => {
          const state = getActionState?.(action.id)
          return !state?.hidden
        })

        if (visibleActions.length === 0) return null

        return (
          <YStack key={groupIndex} gap="$1">
            {group.label && (
              <Text
                fontSize={11}
                fontWeight="600"
                color="$placeholderColor"
                textTransform="uppercase"
                letterSpacing={0.5}
                paddingHorizontal="$2"
                paddingTop="$1"
              >
                {group.label}
              </Text>
            )}
            {visibleActions.map((action) => {
              const state = getActionState?.(action.id)
              const isDisabled = state?.disabled ?? false

              return (
                <YStack
                  key={action.id}
                  paddingHorizontal="$3"
                  paddingVertical="$2"
                  borderRadius="$2"
                  opacity={isDisabled ? 0.5 : 1}
                  hoverStyle={isDisabled ? {} : { backgroundColor: '$backgroundHover' }}
                  pressStyle={isDisabled ? {} : { backgroundColor: '$backgroundPress' }}
                  cursor={isDisabled ? 'not-allowed' : 'pointer'}
                  onPress={() => {
                    if (!isDisabled) {
                      handleSelectAction(action.id)
                    }
                  }}
                >
                  <XStack alignItems="center" gap="$2">
                    {action.icon && (
                      <FontAwesome6
                        name={action.icon as any}
                        size={14}
                        color={isDisabled ? placeholderColor : accentColor}
                      />
                    )}
                    <YStack flex={1}>
                      <Text
                        fontSize={14}
                        fontWeight="500"
                        color={isDisabled ? '$placeholderColor' : '$color'}
                      >
                        {action.label}
                      </Text>
                      {state?.subtext && (
                        <Text fontSize={12} color="$placeholderColor">
                          {state.subtext}
                        </Text>
                      )}
                    </YStack>
                  </XStack>
                </YStack>
              )
            })}
            {groupIndex < groups.length - 1 && (
              <Separator marginVertical="$1" />
            )}
          </YStack>
        )
      })}
    </YStack>
  )

  // Desktop web: Use Popover
  if (isDesktopWeb) {
    return (
      <Popover
        open={open}
        onOpenChange={onOpenChange}
        placement="bottom-end"
        allowFlip
        offset={4}
      >
        <Popover.Trigger asChild>
          {trigger}
        </Popover.Trigger>

        <Popover.Content
          backgroundColor="$background"
          borderWidth={1}
          borderColor="$borderColor"
          borderRadius="$3"
          padding={0}
          minWidth={200}
          elevate
        >
          <Popover.Arrow
            backgroundColor="$background"
            borderWidth={1}
            borderColor="$borderColor"
          />
          {menuContent}
        </Popover.Content>
      </Popover>
    )
  }

  // Mobile: Use BottomSheet
  return (
    <>
      {trigger}
      <BottomSheet
        visible={open}
        onClose={() => onOpenChange(false)}
        title={title}
        heightPercent={0.4}
      >
        {menuContent}
      </BottomSheet>
    </>
  )
}
