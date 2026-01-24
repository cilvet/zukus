import { YStack, Text } from 'tamagui'
import { useTheme } from '../../../contexts/ThemeContext'

/**
 * Placeholder para la imagen del personaje.
 * Muestra un area visual indicando que proximamente se podra añadir imagen.
 */
export function ImagePlaceholder() {
  const { themeColors } = useTheme()

  return (
    <YStack
      alignSelf="center"
      width={140}
      height={140}
      borderRadius={12}
      borderWidth={2}
      borderStyle="dashed"
      borderColor={themeColors.borderColor}
      backgroundColor={themeColors.uiBackgroundColor}
      alignItems="center"
      justifyContent="center"
      opacity={0.7}
    >
      <Text fontSize={32} color="$placeholderColor" marginBottom={8}>
        ?
      </Text>
      <Text fontSize={11} color="$placeholderColor" textAlign="center">
        Imagen
      </Text>
      <Text fontSize={10} color="$placeholderColor" opacity={0.6}>
        (proximamente)
      </Text>
    </YStack>
  )
}
