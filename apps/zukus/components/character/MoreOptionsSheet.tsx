import { Pressable } from 'react-native'
import { Text, XStack } from 'tamagui'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useTheme } from '../../ui'
import { BottomSheet } from '../../ui/atoms/BottomSheet'
import type { CharacterPage } from './data'

type MoreOptionsSheetProps = {
  visible: boolean
  pages: CharacterPage[]
  currentPage: number
  startIndex: number
  onSelect: (index: number) => void
  onClose: () => void
}

/**
 * Bottom sheet con las opciones adicionales del CharacterScreen.
 * Se abre desde la tab "Mas" cuando hay mas de 5 paginas.
 */
export function MoreOptionsSheet({
  visible,
  pages,
  currentPage,
  startIndex,
  onSelect,
  onClose,
}: MoreOptionsSheetProps) {
  const { themeColors } = useTheme()

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Secciones"
      showCloseButton={false}
      heightPercent={0.45}
    >
      {pages.map((page, index) => {
        const realIndex = startIndex + index
        const isActive = currentPage === realIndex
        return (
          <Pressable
            key={page.key}
            onPress={() => onSelect(realIndex)}
            style={({ pressed }) => [{
              backgroundColor: isActive
                ? themeColors.uiBackgroundColor
                : pressed
                  ? themeColors.backgroundHover
                  : 'transparent',
              borderRadius: 10,
              marginBottom: 4,
            }]}
          >
            <XStack alignItems="center" gap={12} paddingVertical={14} paddingHorizontal={16}>
              <FontAwesome
                name={page.icon}
                size={18}
                color={isActive ? themeColors.color : themeColors.placeholderColor}
              />
              <Text
                fontSize={15}
                fontWeight={isActive ? '600' : '400'}
                color={isActive ? '$color' : '$placeholderColor'}
                flex={1}
              >
                {page.label}
              </Text>
              {isActive && (
                <FontAwesome name="check" size={16} color={themeColors.color} />
              )}
            </XStack>
          </Pressable>
        )
      })}
    </BottomSheet>
  )
}
