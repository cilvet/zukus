/**
 * LevelDetail - Panel for editing a specific level slot
 *
 * Shows:
 * - Class selector row
 * - HP Roll section with manual input and roll button
 * - System-level providers (feats, ability increases)
 * - Class-level providers (class features)
 */

'use no memo'

import { YStack, XStack, Text, Button, Input, Separator } from 'tamagui'
import { FontAwesome6 } from '@expo/vector-icons'
import { useAudioPlayer } from 'expo-audio'
import type {
  EntityProvider,
  StandardEntity,
  EntityInstance,
  ProviderLocation,
} from '@zukus/core'
import { ProviderSummaryRow } from '../../EntityProvider'
import { useTheme } from '../../../contexts/ThemeContext'
import { hapticMedium } from '../../../../utils/haptics'

const diceRollSound = require('../../../../assets/sounds/dice-roll.mp3')

export type LevelSlotData = {
  classId: string | null
  hpRoll: number | null
}

export type ProviderWithResolution = {
  provider: EntityProvider
  providerLocation: ProviderLocation
  grantedEntities: StandardEntity[]
  selectedEntities: EntityInstance[]
}

export type LevelDetailProps = {
  levelIndex: number
  levelSlot: LevelSlotData
  className: string | null
  classLevel: number | null
  hitDie: number | null
  systemProviders: ProviderWithResolution[]
  classProviders: ProviderWithResolution[]
  onOpenClassSelector: () => void
  onHpChange: (hp: number | null) => void
  onRollHp: () => void
  onSelectorPress: (providerLocation: ProviderLocation) => void
  onGrantedEntityPress: (entity: StandardEntity) => void
  onSelectedEntityPress: (entityInstance: EntityInstance) => void
}

function rollHitDie(hitDie: number, isFirstLevel: boolean): number {
  if (isFirstLevel) return hitDie
  return Math.floor(Math.random() * hitDie) + 1
}

export function LevelDetail({
  levelIndex,
  levelSlot,
  className,
  classLevel,
  hitDie,
  systemProviders,
  classProviders,
  onOpenClassSelector,
  onHpChange,
  onRollHp,
  onSelectorPress,
  onGrantedEntityPress,
  onSelectedEntityPress,
}: LevelDetailProps) {
  const { themeColors } = useTheme()
  const dicePlayer = useAudioPlayer(diceRollSound)
  const levelNumber = levelIndex + 1
  const isFirstLevel = levelIndex === 0
  const hasClass = levelSlot.classId !== null

  const hasSystemProviders = systemProviders.length > 0
  const hasClassProviders = classProviders.length > 0

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
    hapticMedium()
    dicePlayer.seekTo(0)
    dicePlayer.play()
    const rolledHp = rollHitDie(hitDie, isFirstLevel)
    onHpChange(rolledHp)
    onRollHp()
  }

  return (
    <YStack>
      {/* Class Selector Row */}
      <XStack
        paddingVertical={12}
        alignItems="center"
        justifyContent="space-between"
        {...(!hasClass && { backgroundColor: '$yellow3', paddingHorizontal: 12 })}
        cursor="pointer"
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
        <FontAwesome6 name="chevron-right" size={14} color="#9ca3af" />
      </XStack>

      <Separator borderColor="$borderColor" />

      {/* Hit Die Row - only if class is selected and hitDie exists */}
      {hasClass && hitDie && (
        <XStack paddingVertical={12} alignItems="center" gap={12}>
          <YStack flex={1}>
            <Text fontSize={12} color="$placeholderColor">
              Dado de Golpe
            </Text>
            <Text fontSize={16} fontWeight="700" color="$accent">
              1d{hitDie}
            </Text>
          </YStack>
          <Input
            width={60}
            textAlign="center"
            keyboardType="numeric"
            placeholder={`${hitDie}`}
            value={levelSlot.hpRoll?.toString() ?? ''}
            onChangeText={handleHpInputChange}
          />
          <Button
            size="$3"
            onPress={handleRollHp}
            aria-label="Tirar dado de golpe"
          >
            <FontAwesome6 name="dice" size={20} color={themeColors.color} />
          </Button>
        </XStack>
      )}

      {/* Separator before providers */}
      {(hasSystemProviders || hasClassProviders) && <Separator borderColor="$borderColor" />}

      {/* System Providers */}
      {hasSystemProviders && (
        <YStack>
          <Text
            fontSize={12}
            fontWeight="700"
            color="$placeholderColor"
            letterSpacing={1.5}
            textTransform="uppercase"
            marginTop={16}
            marginBottom={8}
          >
            NIVEL {levelNumber}
          </Text>
          {systemProviders.map((providerData) => (
            <ProviderSummaryRow
              key={`system-${providerData.providerLocation.providerIndex}`}
              provider={providerData.provider}
              grantedEntities={providerData.grantedEntities}
              selectedEntities={providerData.selectedEntities}
              onSelectorPress={() => onSelectorPress(providerData.providerLocation)}
              onGrantedEntityPress={onGrantedEntityPress}
              onSelectedEntityPress={onSelectedEntityPress}
            />
          ))}
        </YStack>
      )}

      {/* Class Providers */}
      {hasClassProviders && (
        <YStack>
          <Text
            fontSize={12}
            fontWeight="700"
            color="$placeholderColor"
            letterSpacing={1.5}
            textTransform="uppercase"
            marginTop={16}
            marginBottom={8}
          >
            {className} {classLevel}
          </Text>
          {classProviders.map((providerData) => (
            <ProviderSummaryRow
              key={`class-${providerData.providerLocation.providerIndex}`}
              provider={providerData.provider}
              grantedEntities={providerData.grantedEntities}
              selectedEntities={providerData.selectedEntities}
              onSelectorPress={() => onSelectorPress(providerData.providerLocation)}
              onGrantedEntityPress={onGrantedEntityPress}
              onSelectedEntityPress={onSelectedEntityPress}
            />
          ))}
        </YStack>
      )}

      {/* Message when no class is selected */}
      {!hasClass && (
        <Text fontSize={14} color="$placeholderColor" paddingVertical={16}>
          {hasSystemProviders
            ? 'Selecciona una clase para este nivel para configurar HP'
            : 'Selecciona una clase para este nivel primero'}
        </Text>
      )}
    </YStack>
  )
}
