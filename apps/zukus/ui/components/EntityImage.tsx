import { Image, StyleSheet, View } from 'react-native'
import { Text, YStack } from 'tamagui'

const ICONS_BASE_URL =
  'https://utimatychnwjuxogjfwc.supabase.co/storage/v1/object/public/icons'

/** Standard size for entity images across the app */
const ENTITY_IMAGE_SIZE = 40
const ENTITY_IMAGE_RADIUS = 6

export type EntityImageProps = {
  /** Image path relative to the icons bucket (e.g., "SkillsIcons/Skillicons/fire.webp") */
  image: string | undefined
  /** Fallback text to show when no image (usually first letter of name) */
  fallbackText?: string
}

/**
 * Displays an entity image from Supabase Storage CDN.
 * Shows a fallback with the first letter if no image is available.
 */
export function EntityImage({
  image,
  fallbackText = '?',
}: EntityImageProps) {
  const imageUrl = image ? `${ICONS_BASE_URL}/${image}` : null

  if (imageUrl) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
      </View>
    )
  }

  return (
    <YStack
      width={ENTITY_IMAGE_SIZE}
      height={ENTITY_IMAGE_SIZE}
      borderRadius={ENTITY_IMAGE_RADIUS}
      backgroundColor="$backgroundHover"
      borderWidth={1}
      borderColor="$borderColor"
      alignItems="center"
      justifyContent="center"
    >
      <Text fontSize={16} color="$placeholderColor" fontWeight="600">
        {fallbackText.charAt(0).toUpperCase()}
      </Text>
    </YStack>
  )
}

const styles = StyleSheet.create({
  container: {
    width: ENTITY_IMAGE_SIZE,
    height: ENTITY_IMAGE_SIZE,
    borderRadius: ENTITY_IMAGE_RADIUS,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
  },
  image: {
    width: ENTITY_IMAGE_SIZE,
    height: ENTITY_IMAGE_SIZE,
    borderRadius: ENTITY_IMAGE_RADIUS,
  },
})
