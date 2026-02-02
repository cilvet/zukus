import { Pressable, StyleSheet } from 'react-native'
import { YStack, XStack, Text } from 'tamagui'
import { FontAwesome6 } from '@expo/vector-icons'
import { BottomSheet } from '../../../ui/atoms/BottomSheet'
import type { ActionGroup, ActionState } from '../types'

type ActionDropdownSheetProps = {
  visible: boolean
  onClose: () => void
  entityName: string
  groups: ActionGroup[]
  accentColor: string
  placeholderColor: string
  /** Get dynamic state for each action */
  getActionState?: (actionId: string) => ActionState
  /** Called when an action is selected */
  onSelectAction: (actionId: string) => void
}

/**
 * Bottom sheet with grouped action options.
 *
 * Shows entity name as title, with grouped actions (each group can have a label).
 * Actions can have subtext (e.g., price) and disabled state.
 */
export function ActionDropdownSheet({
  visible,
  onClose,
  entityName,
  groups,
  accentColor,
  placeholderColor,
  getActionState,
  onSelectAction,
}: ActionDropdownSheetProps) {
  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={entityName}
      heightPercent={0.4}
    >
      <YStack gap={16}>
        {groups.map((group, groupIndex) => {
          const visibleActions = group.actions.filter((action) => {
            const state = getActionState?.(action.id)
            return !state?.hidden
          })

          if (visibleActions.length === 0) return null

          return (
            <YStack key={groupIndex} gap={8}>
              {group.label && (
                <Text
                  fontSize={12}
                  fontWeight="600"
                  color="$placeholderColor"
                  textTransform="uppercase"
                  letterSpacing={0.5}
                >
                  {group.label}
                </Text>
              )}
              {visibleActions.map((action) => {
                const state = getActionState?.(action.id)
                const isDisabled = state?.disabled ?? false

                return (
                  <Pressable
                    key={action.id}
                    onPress={() => {
                      if (!isDisabled) {
                        onSelectAction(action.id)
                      }
                    }}
                    disabled={isDisabled}
                  >
                    {({ pressed }) => (
                      <XStack
                        backgroundColor="$uiBackgroundColor"
                        padding={14}
                        borderRadius={10}
                        alignItems="center"
                        gap={12}
                        borderWidth={1}
                        borderColor="$borderColor"
                        opacity={isDisabled ? 0.5 : pressed ? 0.7 : 1}
                      >
                        {action.icon && (
                          <FontAwesome6
                            name={action.icon as any}
                            size={16}
                            color={isDisabled ? placeholderColor : accentColor}
                          />
                        )}
                        <YStack flex={1} gap={2}>
                          <Text
                            fontSize={15}
                            fontWeight="500"
                            color={isDisabled ? '$placeholderColor' : '$color'}
                          >
                            {action.label}
                          </Text>
                          {state?.subtext && (
                            <Text fontSize={13} color="$placeholderColor">
                              {state.subtext}
                            </Text>
                          )}
                        </YStack>
                        <FontAwesome6
                          name="chevron-right"
                          size={14}
                          color={placeholderColor}
                        />
                      </XStack>
                    )}
                  </Pressable>
                )
              })}
            </YStack>
          )
        })}
      </YStack>
    </BottomSheet>
  )
}
