import { useState, useCallback } from 'react'
import { Pressable, StyleSheet, Platform } from 'react-native'
import { YStack, XStack, Text, Popover, Separator } from 'tamagui'
import { FontAwesome6 } from '@expo/vector-icons'
import { EntityImage } from '../../ui'
import { ActionButton } from './actions'
import type { ButtonConfig, ActionGroup, ActionState, DropdownButtonConfig } from './types'
import { isDropdownConfig } from './types'

/**
 * Altura fija del EntityRow - DEBE coincidir con estimatedItemSize de FlashList.
 */
export const ENTITY_ROW_HEIGHT = 72

export type EntityRowWithMenuProps = {
  id: string
  name: string
  description?: string
  metaLine?: string
  badge?: string | null
  image?: string
  color: string
  placeholderColor: string
  accentColor: string
  buttonConfig: ButtonConfig
  buttonDisabled?: boolean
  /** Called when row is pressed (navigate to detail) */
  onPress: (id: string) => void
  /** For mobile: Called when dropdown needs to open (handled by parent) */
  onOpenDropdown?: (id: string) => void
  /** Called when counter action is executed */
  onExecuteAction?: (actionId: string, entityId: string) => void
  /** For desktop popover: get action state */
  getActionState?: (actionId: string, entityId: string) => ActionState
}

/**
 * Entity row with integrated menu support.
 *
 * - Desktop web: Inline Popover appears next to the button
 * - Mobile: Triggers parent's shared BottomSheet via callback
 */
export function EntityRowWithMenu({
  id,
  name,
  description,
  metaLine,
  badge,
  image,
  color,
  placeholderColor,
  accentColor,
  buttonConfig,
  buttonDisabled,
  onPress,
  onOpenDropdown,
  onExecuteAction,
  getActionState,
}: EntityRowWithMenuProps) {
  const [popoverOpen, setPopoverOpen] = useState(false)
  const isDesktopWeb = Platform.OS === 'web'
  const isDropdown = isDropdownConfig(buttonConfig)

  // For mobile dropdown - delegate to parent's sheet
  const handleMobileButtonPress = useCallback(() => {
    if (buttonDisabled) return
    if (isDropdown) {
      onOpenDropdown?.(id)
    } else {
      onExecuteAction?.(buttonConfig.action.id, id)
    }
  }, [buttonDisabled, isDropdown, id, onOpenDropdown, onExecuteAction, buttonConfig])

  // For popover actions
  const handleSelectAction = useCallback((actionId: string) => {
    setPopoverOpen(false)
    onExecuteAction?.(actionId, id)
  }, [id, onExecuteAction])

  // Render popover content for dropdown configs
  const renderPopoverContent = () => {
    if (!isDropdown) return null

    const dropdownConfig = buttonConfig as DropdownButtonConfig
    const groups = dropdownConfig.groups

    return (
      <YStack
        gap="$1"
        padding="$2"
        minWidth={180}
        onPress={(e: any) => e.stopPropagation()}
      >
        {groups.map((group, groupIndex) => {
          const visibleActions = group.actions.filter((action) => {
            const state = getActionState?.(action.id, id)
            return !state?.hidden
          })

          if (visibleActions.length === 0) return null

          return (
            <YStack key={groupIndex}>
              {group.label && (
                <Text
                  fontSize={11}
                  fontWeight="600"
                  color="$placeholderColor"
                  textTransform="uppercase"
                  letterSpacing={0.5}
                  paddingHorizontal="$2"
                  paddingVertical="$1"
                >
                  {group.label}
                </Text>
              )}
              {visibleActions.map((action) => {
                const state = getActionState?.(action.id, id)
                const isDisabled = state?.disabled ?? false

                return (
                  <XStack
                    key={action.id}
                    paddingHorizontal="$3"
                    paddingVertical="$2"
                    borderRadius="$2"
                    opacity={isDisabled ? 0.5 : 1}
                    hoverStyle={isDisabled ? {} : { backgroundColor: '$backgroundHover' }}
                    pressStyle={isDisabled ? {} : { backgroundColor: '$backgroundPress' }}
                    cursor={isDisabled ? 'not-allowed' : 'pointer'}
                    alignItems="center"
                    gap="$2"
                    onPress={(e: any) => {
                      e.stopPropagation()
                      if (!isDisabled) {
                        handleSelectAction(action.id)
                      }
                    }}
                  >
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
  }

  // Render action button content (outline style)
  const actionButtonContent = (
    <XStack
      backgroundColor="transparent"
      paddingHorizontal={10}
      paddingVertical={6}
      borderRadius={6}
      borderWidth={1}
      borderColor={buttonDisabled ? '$borderColor' : accentColor}
      alignItems="center"
      gap={6}
      opacity={buttonDisabled ? 0.5 : 1}
      cursor={buttonDisabled ? 'not-allowed' : 'pointer'}
    >
      {isDropdown && buttonConfig.icon && (
        <FontAwesome6
          name={buttonConfig.icon as any}
          size={11}
          color={buttonDisabled ? placeholderColor : accentColor}
        />
      )}
      {!isDropdown && buttonConfig.action.icon && (
        <FontAwesome6
          name={buttonConfig.action.icon as any}
          size={11}
          color={buttonDisabled ? placeholderColor : accentColor}
        />
      )}
      <Text
        fontSize={12}
        fontWeight="600"
        color={buttonDisabled ? '$placeholderColor' : accentColor}
      >
        {isDropdown ? buttonConfig.label : buttonConfig.action.label}
      </Text>
      {isDropdown && (
        <FontAwesome6
          name="chevron-down"
          size={9}
          color={buttonDisabled ? placeholderColor : accentColor}
        />
      )}
    </XStack>
  )

  return (
    <Pressable onPress={() => onPress(id)} style={styles.container}>
      {({ pressed }) => (
        <XStack
          height={ENTITY_ROW_HEIGHT}
          alignItems="center"
          paddingHorizontal={16}
          gap={12}
          opacity={pressed ? 0.6 : 1}
          borderBottomWidth={StyleSheet.hairlineWidth}
          borderBottomColor="$borderColor"
        >
          {/* Entity image */}
          <EntityImage image={image} fallbackText={name} />

          {/* Content */}
          <YStack flex={1} gap={2}>
            <XStack alignItems="center" justifyContent="space-between">
              <Text
                fontSize={15}
                color={color}
                fontWeight="500"
                flex={1}
                numberOfLines={1}
              >
                {name}
              </Text>
              {badge && (
                <Text fontSize={12} color={placeholderColor} marginLeft={8}>
                  {badge}
                </Text>
              )}
            </XStack>
            {metaLine && (
              <Text fontSize={12} color={placeholderColor} numberOfLines={1}>
                {metaLine}
              </Text>
            )}
            {description && (
              <Text fontSize={12} color={placeholderColor} numberOfLines={1}>
                {description}
              </Text>
            )}
          </YStack>

          {/* Action button - different handling for desktop vs mobile */}
          {isDesktopWeb && isDropdown ? (
            // Desktop: Popover controls everything
            <Popover
              open={popoverOpen}
              onOpenChange={setPopoverOpen}
              placement="bottom-end"
              allowFlip
              offset={4}
            >
              <Popover.Trigger asChild>
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation()
                    if (!buttonDisabled) {
                      setPopoverOpen(true)
                    }
                  }}
                >
                  {actionButtonContent}
                </Pressable>
              </Popover.Trigger>

              <Popover.Content
                backgroundColor="$background"
                borderWidth={1}
                borderColor="$borderColor"
                borderRadius="$3"
                padding={0}
                elevate
                onPress={(e: any) => e.stopPropagation()}
                onPointerDown={(e: any) => e.stopPropagation()}
              >
                <Popover.Arrow
                  backgroundColor="$background"
                  borderWidth={1}
                  borderColor="$borderColor"
                />
                {renderPopoverContent()}
              </Popover.Content>
            </Popover>
          ) : (
            // Mobile: Simple button that delegates to parent (outline style)
            <Pressable
              onPress={(e) => {
                e.stopPropagation()
                handleMobileButtonPress()
              }}
            >
              {({ pressed: btnPressed }) => (
                <XStack
                  backgroundColor="transparent"
                  paddingHorizontal={10}
                  paddingVertical={6}
                  borderRadius={6}
                  borderWidth={1}
                  borderColor={buttonDisabled ? '$borderColor' : accentColor}
                  alignItems="center"
                  gap={6}
                  opacity={buttonDisabled ? 0.5 : btnPressed ? 0.7 : 1}
                >
                  {isDropdown && buttonConfig.icon && (
                    <FontAwesome6
                      name={buttonConfig.icon as any}
                      size={11}
                      color={buttonDisabled ? placeholderColor : accentColor}
                    />
                  )}
                  {!isDropdown && buttonConfig.action.icon && (
                    <FontAwesome6
                      name={buttonConfig.action.icon as any}
                      size={11}
                      color={buttonDisabled ? placeholderColor : accentColor}
                    />
                  )}
                  <Text
                    fontSize={12}
                    fontWeight="600"
                    color={buttonDisabled ? '$placeholderColor' : accentColor}
                  >
                    {isDropdown ? buttonConfig.label : buttonConfig.action.label}
                  </Text>
                  {isDropdown && (
                    <FontAwesome6
                      name="chevron-down"
                      size={9}
                      color={buttonDisabled ? placeholderColor : accentColor}
                    />
                  )}
                </XStack>
              )}
            </Pressable>
          )}
        </XStack>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
})
