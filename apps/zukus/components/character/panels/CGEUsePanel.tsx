import { useState, useEffect } from 'react'
import { Pressable, TextInput, StyleSheet, Platform, ToastAndroid } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { YStack, XStack, Text } from 'tamagui'
import * as Haptics from 'expo-haptics'
import { usePrimaryCGE, useCharacterStore, useCompendiumContext, useTheme } from '../../../ui'
import { useNavigateToDetail } from '../../../navigation'
import { calculatePoolCost, type CalculatedCGE, type CalculatedBoundSlot, type ResourceConfigPool } from '@zukus/core'
import { EntityRow, LevelHeader, ENTITY_ROW_PADDING_HORIZONTAL } from './EntityRow'

function showCastToast(entityName: string) {
  "use no memo"
  if (Platform.OS === 'android') {
    ToastAndroid.show(`Lanzado ${entityName}`, ToastAndroid.SHORT)
  }
}

type KnownEntityDisplay = {
  id: string
  name: string
  image?: string
}

type CGEUsePanelProps = {
  cge?: CalculatedCGE | null
}

/**
 * Groups bound slots by entityId for display.
 * Returns a map of entityId -> { total, available, slots }
 */
function groupBoundSlotsByEntity(
  boundSlots: CalculatedBoundSlot[]
): Map<string, { total: number; available: number; slots: CalculatedBoundSlot[] }> {
  const grouped = new Map<string, { total: number; available: number; slots: CalculatedBoundSlot[] }>()

  for (const slot of boundSlots) {
    if (!slot.preparedEntityId) continue

    const existing = grouped.get(slot.preparedEntityId)
    if (existing) {
      existing.total++
      if (!slot.used) existing.available++
      existing.slots.push(slot)
    } else {
      grouped.set(slot.preparedEntityId, {
        total: 1,
        available: slot.used ? 0 : 1,
        slots: [slot],
      })
    }
  }

  return grouped
}

/**
 * CGE Use Panel - Runtime view for casting spells/using abilities.
 *
 * For BOUND preparation (Cleric, Wizard): Shows prepared entities grouped by entityId.
 * When cast, one slot of that entity becomes unavailable until rest.
 * Displays "X/Y disponibles" when same entity is prepared multiple times.
 *
 * For other preparation types (Sorcerer): Shows level-based slot consumption.
 */
export function CGEUsePanel({ cge: propsCge }: CGEUsePanelProps) {
  "use no memo"

  const getLevelLabel = (level: number): string => {
    if (level === 0) return 'Nivel 0'
    return `Nivel ${level}`
  }

  const hookCge = usePrimaryCGE()
  const primaryCGE = propsCge ?? hookCge
  const useSlotForCGE = useCharacterStore((state) => state.useSlotForCGE)
  const useBoundSlotForCGE = useCharacterStore((state) => state.useBoundSlotForCGE)
  const setSlotValueForCGE = useCharacterStore((state) => state.setSlotValueForCGE)
  const compendium = useCompendiumContext()
  const navigateToDetail = useNavigateToDetail()
  const { themeInfo, themeColors } = useTheme()
  const accentColor = themeInfo.colors.accent
  const textColor = themeColors.color

  if (!primaryCGE) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Text color="$placeholderColor">No hay CGE disponible</Text>
      </YStack>
    )
  }

  const baseData = useCharacterStore((state) => state.baseData)
  const cgeId = primaryCGE.id

  const primaryTrack = primaryCGE.tracks[0]
  const slots = primaryTrack?.slots ?? []
  const isBoundPreparation = primaryTrack?.preparationType === 'BOUND'
  const isPoolResource = primaryTrack?.resourceType === 'POOL'
  const pool = primaryTrack?.pool

  // Get resourceId from config for POOL type
  const trackConfig = primaryCGE.config.tracks[0]
  const poolResourceId = trackConfig?.resource.type === 'POOL'
    ? (trackConfig.resource as ResourceConfigPool).resourceId
    : undefined
  const consumeResource = useCharacterStore((state) => state.consumeResource)

  // Get known entities for spontaneous casters
  const knownSelections = baseData?.cgeState?.[cgeId]?.knownSelections ?? {}

  // Build a map of level -> known entities for display
  const getKnownEntitiesForLevel = (level: number): KnownEntityDisplay[] => {
    const entityIds = knownSelections[String(level)] ?? []
    return entityIds.map((entityId) => {
      const entity = compendium.getEntityById(entityId)
      const displayName = entity?.name ?? entityId
        .replace(/-/g, ' ')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (l: string) => l.toUpperCase())
      return {
        id: entityId,
        name: displayName,
        image: entity?.image,
      }
    })
  }

  // For BOUND: use the first available slot of that entity
  const handleCastBoundEntity = (entitySlots: CalculatedBoundSlot[]) => {
    // Find the first available (not used) slot
    const availableSlot = entitySlots.find(s => !s.used)
    if (!availableSlot) return

    const result = useBoundSlotForCGE(primaryCGE.id, availableSlot.slotId)
    if (!result.success) {
      console.warn('Failed to use bound slot:', result.error)
    }
  }

  // For non-BOUND: use generic level slot
  const handleCastLevelSlot = (level: number) => {
    const result = useSlotForCGE(primaryCGE.id, level)
    if (!result.success) {
      console.warn('Failed to use slot:', result.error)
    }
  }

  // For POOL: consume resource points
  const handleManifestPower = (cost: number) => {
    if (!poolResourceId) return
    const result = consumeResource(poolResourceId, cost)
    if (!result.success) {
      console.warn('Failed to consume pool:', result.error)
    }
  }

  // Render POOL-based system (Psion)
  if (isPoolResource && pool) {
    // For LIMITED_TOTAL, known powers are in knownSelections['-1']
    const knownPowerIds = knownSelections['-1'] ?? []

    // Get costPath from track config
    const costPath = trackConfig?.resource.type === 'POOL'
      ? (trackConfig.resource as ResourceConfigPool).costPath
      : undefined

    type KnownPowerDisplay = KnownEntityDisplay & { cost: number }
    const knownPowers: KnownPowerDisplay[] = knownPowerIds.map((powerId) => {
      const entity = compendium.getEntityById(powerId)
      const displayName = entity?.name ?? powerId
        .replace(/-/g, ' ')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (l: string) => l.toUpperCase())

      // Calculate cost using the CGE's costPath formula
      const cost = entity ? calculatePoolCost(costPath, entity as Record<string, unknown>) : 1

      return {
        id: powerId,
        name: displayName,
        image: entity?.image,
        cost,
      }
    })

    return (
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingVertical: 12 }}
        showsVerticalScrollIndicator={false}
      >
        <YStack>
          {/* Pool Header */}
          <PoolHeader
            label={primaryCGE.config.labels?.pool ?? 'Pool'}
            current={pool.current}
            max={pool.max}
            accentColor={accentColor}
          />

          {/* Known Entities */}
          <YStack marginTop={16}>
            <LevelHeader label={primaryCGE.config.labels?.known ?? 'Conocidos'} count={String(knownPowers.length)} />
            {knownPowers.length === 0 ? (
              <Text
                fontSize={11}
                color="$placeholderColor"
                textAlign="center"
                paddingVertical={10}
                paddingHorizontal={ENTITY_ROW_PADDING_HORIZONTAL}
              >
                Sin entidades conocidas
              </Text>
            ) : (
              knownPowers.map((power, index) => {
                const canManifest = pool.current >= power.cost
                const poolLabel = primaryCGE.config.labels?.pool ?? 'pool'
                return (
                  <EntityRow
                    key={power.id}
                    name={power.name}
                    image={power.image}
                    subtitle={`Coste: ${power.cost} ${poolLabel}`}
                    isLast={index === knownPowers.length - 1}
                    opacity={canManifest ? 1 : 0.5}
                    onPress={() => navigateToDetail('compendiumEntity', power.id, power.name)}
                    rightElement={
                      <ManifestButton
                        canManifest={canManifest}
                        accentColor={accentColor}
                        disabledColor={themeColors.borderColor}
                        entityName={power.name}
                        actionLabel={primaryCGE.config.labels?.action ?? 'Usar'}
                        onPress={() => handleManifestPower(power.cost)}
                      />
                    }
                  />
                )
              })
            )}
          </YStack>
        </YStack>
      </ScrollView>
    )
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingVertical: 12 }}
      showsVerticalScrollIndicator={false}
    >
      <YStack>
        {slots.map((slot) => {
          if (slot.max === 0) return null

          const levelLabel = getLevelLabel(slot.level)

          // For BOUND preparation: group by entity and show counts
          if (isBoundPreparation && slot.boundSlots) {
            const preparedSlots = slot.boundSlots.filter(bs => bs.preparedEntityId)
            const groupedByEntity = groupBoundSlotsByEntity(preparedSlots)
            const entityEntries = Array.from(groupedByEntity.entries())

            const totalAvailable = preparedSlots.filter(bs => !bs.used).length
            const totalPrepared = preparedSlots.length

            return (
              <YStack key={slot.level}>
                <LevelHeader label={levelLabel} count={`${totalAvailable}/${totalPrepared}`} />

                {entityEntries.length === 0 ? (
                  <Text
                    fontSize={11}
                    color="$placeholderColor"
                    textAlign="center"
                    paddingVertical={10}
                    paddingHorizontal={ENTITY_ROW_PADDING_HORIZONTAL}
                  >
                    Sin preparaciones
                  </Text>
                ) : (
                  entityEntries.map(([entityId, data], index) => {
                    const entity = compendium.getEntityById(entityId)
                    const displayName = entity?.name ?? entityId
                      .replace(/-/g, ' ')
                      .replace(/_/g, ' ')
                      .replace(/\b\w/g, (l: string) => l.toUpperCase())
                    const canCast = data.available > 0
                    const subtitle = data.total > 1
                      ? `${data.available}/${data.total} disponibles`
                      : !canCast ? 'Usado' : undefined

                    return (
                      <EntityRow
                        key={entityId}
                        name={displayName}
                        image={entity?.image}
                        subtitle={subtitle}
                        isLast={index === entityEntries.length - 1}
                        opacity={canCast ? 1 : 0.5}
                        onPress={() => navigateToDetail('compendiumEntity', entityId, displayName)}
                        rightElement={
                          <CastButton
                            canCast={canCast}
                            accentColor={accentColor}
                            disabledColor={themeColors.borderColor}
                            entityName={displayName}
                            onPress={() => handleCastBoundEntity(data.slots)}
                          />
                        }
                      />
                    )
                  })
                )}
              </YStack>
            )
          }

          // For non-BOUND (spontaneous): show known entities with slot consumption
          const slotsRemaining = slot.current
          const knownEntities = getKnownEntitiesForLevel(slot.level)
          const canCast = slotsRemaining > 0

          const handleSlotValueChange = (value: number) => {
            setSlotValueForCGE(primaryCGE.id, slot.level, value, slot.max)
          }

          return (
            <YStack key={slot.level}>
              <SlotLevelHeader
                label={levelLabel}
                current={slotsRemaining}
                max={slot.max}
                textColor={textColor}
                onValueChange={handleSlotValueChange}
              />

              {knownEntities.length === 0 ? (
                <Text
                  fontSize={11}
                  color="$placeholderColor"
                  textAlign="center"
                  paddingVertical={10}
                  paddingHorizontal={ENTITY_ROW_PADDING_HORIZONTAL}
                >
                  Sin conjuros conocidos
                </Text>
              ) : (
                knownEntities.map((entity, index) => (
                  <EntityRow
                    key={entity.id}
                    name={entity.name}
                    image={entity.image}
                    isLast={index === knownEntities.length - 1}
                    opacity={canCast ? 1 : 0.5}
                    onPress={() => navigateToDetail('compendiumEntity', entity.id, entity.name)}
                    rightElement={
                      <CastButton
                        canCast={canCast}
                        accentColor={accentColor}
                        disabledColor={themeColors.borderColor}
                        entityName={entity.name}
                        onPress={() => handleCastLevelSlot(slot.level)}
                      />
                    }
                  />
                ))
              )}
            </YStack>
          )
        })}
      </YStack>
    </ScrollView>
  )
}

type CastButtonProps = {
  canCast: boolean
  accentColor: string
  disabledColor: string
  entityName: string
  onPress: () => void
}

function CastButton({ canCast, accentColor, disabledColor, entityName, onPress }: CastButtonProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    showCastToast(entityName)
    onPress()
  }

  return (
    <Pressable onPress={handlePress} disabled={!canCast} hitSlop={8}>
      {({ pressed }) => (
        <XStack
          paddingVertical={4}
          paddingHorizontal={10}
          backgroundColor="transparent"
          borderWidth={1}
          borderColor={canCast ? accentColor : disabledColor}
          borderRadius={6}
          opacity={pressed ? 0.7 : canCast ? 1 : 0.5}
        >
          <Text
            fontSize={11}
            fontWeight="600"
            color={canCast ? accentColor : '$placeholderColor'}
          >
            Lanzar
          </Text>
        </XStack>
      )}
    </Pressable>
  )
}

type SlotLevelHeaderProps = {
  label: string
  current: number
  max: number
  textColor: string
  onValueChange: (value: number) => void
}

function SlotLevelHeader({ label, current, max, textColor, onValueChange }: SlotLevelHeaderProps) {
  const [inputValue, setInputValue] = useState(String(current))
  const [isFocused, setIsFocused] = useState(false)

  // Sync from props when not focused
  useEffect(() => {
    if (!isFocused) {
      setInputValue(String(current))
    }
  }, [current, isFocused])

  const handleBlur = () => {
    setIsFocused(false)
    const parsed = parseInt(inputValue, 10)
    if (!isNaN(parsed) && parsed !== current) {
      onValueChange(parsed)
    } else {
      setInputValue(String(current))
    }
  }

  const handleFocus = () => {
    setIsFocused(true)
  }

  const handleChangeText = (text: string) => {
    // Allow empty string or numbers (including negative)
    if (text === '' || text === '-' || /^-?\d+$/.test(text)) {
      setInputValue(text)
    }
  }

  return (
    <XStack
      borderBottomWidth={2}
      borderColor="$borderColor"
      paddingTop={10}
      paddingBottom={6}
      paddingHorizontal={16}
      marginTop={16}
      alignItems="center"
      justifyContent="space-between"
    >
      <Text fontSize={18} color="$color" fontWeight="700">
        {label}
      </Text>
      <XStack alignItems="center" gap={4}>
        <TextInput
          style={[styles.slotInput, { color: textColor }]}
          value={inputValue}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          keyboardType="number-pad"
          selectTextOnFocus
          underlineColorAndroid="transparent"
        />
        <Text fontSize={18} color="$color" fontWeight="600">
          / {max}
        </Text>
      </XStack>
    </XStack>
  )
}

type PoolHeaderProps = {
  label: string
  current: number
  max: number
  accentColor: string
}

function PoolHeader({ label, current, max, accentColor }: PoolHeaderProps) {
  const percentage = max > 0 ? (current / max) * 100 : 0

  return (
    <YStack paddingHorizontal={16} gap={8}>
      <XStack justifyContent="space-between" alignItems="center">
        <Text fontSize={14} color="$placeholderColor" fontWeight="600" textTransform="uppercase">
          {label}
        </Text>
        <Text fontSize={24} color="$color" fontWeight="700">
          {current} / {max}
        </Text>
      </XStack>
      {/* Progress bar */}
      <YStack
        height={8}
        backgroundColor="$borderColor"
        borderRadius={4}
        overflow="hidden"
      >
        <YStack
          height="100%"
          width={`${percentage}%`}
          backgroundColor={accentColor}
          borderRadius={4}
        />
      </YStack>
    </YStack>
  )
}

type ManifestButtonProps = {
  canManifest: boolean
  accentColor: string
  disabledColor: string
  entityName: string
  actionLabel: string
  onPress: () => void
}

function ManifestButton({ canManifest, accentColor, disabledColor, entityName, actionLabel, onPress }: ManifestButtonProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    showCastToast(entityName)
    onPress()
  }

  return (
    <Pressable onPress={handlePress} disabled={!canManifest} hitSlop={8}>
      {({ pressed }) => (
        <XStack
          paddingVertical={4}
          paddingHorizontal={10}
          backgroundColor="transparent"
          borderWidth={1}
          borderColor={canManifest ? accentColor : disabledColor}
          borderRadius={6}
          opacity={pressed ? 0.7 : canManifest ? 1 : 0.5}
        >
          <Text
            fontSize={11}
            fontWeight="600"
            color={canManifest ? accentColor : '$placeholderColor'}
          >
            {actionLabel}
          </Text>
        </XStack>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  slotInput: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    width: 36,
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.3)',
    borderRadius: 4,
  },
})
