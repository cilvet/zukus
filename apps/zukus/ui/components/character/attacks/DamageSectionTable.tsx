import { useState } from 'react'
import { Text, XStack, YStack } from 'tamagui'
import type { DamageSectionValue } from '@zukus/core'

export type DamageSectionTableProps = {
  damageSections: DamageSectionValue[]
}

/**
 * Tabla de desglose de daño por secciones.
 * Cada sección muestra su nombre y un valor toggleable entre finalText y originalText.
 * Si hay multiplicadores aplicados, se muestran como badges al togglear.
 */
export function DamageSectionTable({ damageSections }: DamageSectionTableProps) {
  const [showOriginal, setShowOriginal] = useState(false)

  const hasAnyToggleable = damageSections.some(
    section => section.originalText !== section.finalText || section.multipliersApplied.length > 0
  )

  const handleToggle = () => {
    if (hasAnyToggleable) {
      setShowOriginal(!showOriginal)
    }
  }

  if (damageSections.length === 0) {
    return (
      <Text fontSize={13} color="$placeholderColor" fontStyle="italic" paddingHorizontal={16}>
        Sin daño
      </Text>
    )
  }

  return (
    <YStack>
      {damageSections.map((section, index) => {
        const isToggleable = section.originalText !== section.finalText || section.multipliersApplied.length > 0
        const displayValue = showOriginal && isToggleable ? section.originalText : section.finalText

        return (
          <XStack
            key={`${section.name}-${index}`}
            paddingVertical={8}
            paddingHorizontal={16}
            borderBottomWidth={index < damageSections.length - 1 ? 1 : 0}
            borderBottomColor="$borderColor"
            justifyContent="space-between"
            alignItems="center"
            onPress={hasAnyToggleable ? handleToggle : undefined}
            cursor={hasAnyToggleable ? 'pointer' : 'default'}
            hoverStyle={hasAnyToggleable ? { opacity: 0.8 } : undefined}
          >
            {/* Damage Section Name */}
            <Text flex={1} fontSize={13} color="$color" numberOfLines={1}>
              {section.name}
            </Text>

            {/* Value Pill */}
            <XStack alignItems="center" gap={8}>
              <XStack
                backgroundColor={isToggleable && hasAnyToggleable ? '$borderColor' : 'transparent'}
                borderRadius={4}
                paddingVertical={4}
                paddingHorizontal={8}
                alignItems="center"
                gap={4}
              >
                <Text
                  fontSize={13}
                  fontWeight={showOriginal && isToggleable ? '400' : '700'}
                  color="$color"
                >
                  {displayValue}
                </Text>
                
                {/* Multiplier badges - solo cuando mostramos original y hay multiplicadores */}
                {showOriginal && isToggleable && section.multipliersApplied.length > 0 && (
                  <XStack gap={4} alignItems="center">
                    {section.multipliersApplied.map((multiplier, idx) => (
                      <XStack
                        key={idx}
                        backgroundColor="$accentBackground"
                        borderRadius={4}
                        paddingVertical={2}
                        paddingHorizontal={4}
                      >
                        <Text fontSize={10} fontWeight="600" color="$accentColor">
                          x{multiplier}
                        </Text>
                      </XStack>
                    ))}
                  </XStack>
                )}
              </XStack>
            </XStack>
          </XStack>
        )
      })}
    </YStack>
  )
}
