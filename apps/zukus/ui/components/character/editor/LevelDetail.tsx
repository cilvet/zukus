/**
 * LevelDetail - Panel for editing a specific level slot
 *
 * Shows:
 * - Level number header
 * - Class selector (with navigation to ClassSelectorDetail)
 * - HP Roll section with manual input and roll button
 */

import { YStack, XStack, Text, ScrollView, Button, Input } from 'tamagui'
import FontAwesome from '@expo/vector-icons/FontAwesome'

export type LevelSlotData = {
  classId: string | null
  hpRoll: number | null
}

export type LevelDetailProps = {
  levelIndex: number
  levelSlot: LevelSlotData
  className: string | null
  hitDie: number | null
  onOpenClassSelector: () => void
  onHpChange: (hp: number | null) => void
  onRollHp: () => void
}

function rollHitDie(hitDie: number, isFirstLevel: boolean): number {
  if (isFirstLevel) return hitDie
  return Math.floor(Math.random() * hitDie) + 1
}

export function LevelDetail({
  levelIndex,
  levelSlot,
  className,
  hitDie,
  onOpenClassSelector,
  onHpChange,
  onRollHp,
}: LevelDetailProps) {
  const levelNumber = levelIndex + 1
  const isFirstLevel = levelIndex === 0
  const hasClass = levelSlot.classId !== null

  function handleHpInputChange(text: string) {
    const trimmed = text.trim()
    if (trimmed === '') {
      onHpChange(null)
      return
    }
    const hp = parseInt(trimmed, 10)
    if (!isNaN(hp) && hp > 0) {
      onHpChange(hp)
    }
  }

  function handleRollHp() {
    if (!hitDie) return
    const rolledHp = rollHitDie(hitDie, isFirstLevel)
    onHpChange(rolledHp)
    onRollHp()
  }

  return (
    <ScrollView>
      <YStack padding="$4" gap="$4">
        {/* Header */}
        <Text fontSize={24} fontWeight="700" color="$color">
          Nivel {levelNumber}
        </Text>

        {/* Class Selector */}
        <XStack
          width="100%"
          paddingVertical="$2"
          paddingHorizontal="$3"
          backgroundColor={hasClass ? '$backgroundHover' : '$yellow3'}
          borderRadius="$2"
          alignItems="center"
          justifyContent="space-between"
          cursor="pointer"
          hoverStyle={{ backgroundColor: hasClass ? '$backgroundPress' : '$yellow4' }}
          pressStyle={{ scale: 0.98 }}
          onPress={onOpenClassSelector}
        >
          <YStack flex={1}>
            <Text fontSize={12} color="$placeholderColor">
              Clase
            </Text>
            <Text fontSize={16} fontWeight="500" color="$color">
              {className || 'Seleccionar clase'}
            </Text>
          </YStack>
          <FontAwesome name="chevron-right" size={16} color="#9ca3af" />
        </XStack>

        {/* HP Roll Section - only if class is selected */}
        {hasClass && hitDie && (
          <YStack
            backgroundColor="$background"
            padding="$3"
            borderRadius="$3"
            borderWidth={1}
            borderColor="$borderColor"
            gap="$2"
          >
            <Text fontSize={16} fontWeight="700" color="$color">
              HP Roll
            </Text>
            <XStack gap="$3" alignItems="center">
              <Text fontSize={20} fontWeight="700" color="$placeholderColor">
                d{hitDie}
              </Text>
              <Input
                width={80}
                value={levelSlot.hpRoll?.toString() ?? ''}
                onChangeText={handleHpInputChange}
                keyboardType="numeric"
                placeholder={`1-${hitDie}`}
                textAlign="center"
              />
              <Button
                size="$3"
                onPress={handleRollHp}
                icon={<FontAwesome name="random" size={16} />}
                aria-label="Roll hit die"
              />
            </XStack>
            <Text fontSize={12} color="$placeholderColor">
              {isFirstLevel
                ? `Nivel 1 siempre obtiene HP maximo (${hitDie})`
                : `Tira 1d${hitDie} para HP (1-${hitDie})`}
            </Text>
          </YStack>
        )}

        {/* Message when no class is selected */}
        {!hasClass && (
          <YStack
            backgroundColor="$background"
            padding="$3"
            borderRadius="$3"
            borderWidth={1}
            borderColor="$borderColor"
          >
            <Text fontSize={14} color="$placeholderColor">
              Selecciona una clase para este nivel primero
            </Text>
          </YStack>
        )}
      </YStack>
    </ScrollView>
  )
}
