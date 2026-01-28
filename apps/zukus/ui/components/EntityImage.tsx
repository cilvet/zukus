import { Image, View } from 'react-native'
import { Text, YStack } from 'tamagui'

const ICONS_BASE_URL =
  'https://utimatychnwjuxogjfwc.supabase.co/storage/v1/object/public/icons'

/** Default size for entity images across the app */
const DEFAULT_SIZE = 40
const DEFAULT_RADIUS = 6

export type EntityImageProps = {
  /** Image path relative to the icons bucket (e.g., "SkillsIcons/Skillicons/fire.webp") */
  image: string | undefined
  /** Fallback text to show when no image (usually first letter of name) */
  fallbackText?: string
  /** Custom size (width and height) */
  size?: number
}

/**
 * Displays an entity image from Supabase Storage CDN.
 * Shows a fallback with the first letter if no image is available.
 */
export function EntityImage({
  image,
  fallbackText = '?',
  size = DEFAULT_SIZE,
}: EntityImageProps) {
  const imageUrl = image ? `${ICONS_BASE_URL}/${image}` : null
  const radius = Math.round(size * (DEFAULT_RADIUS / DEFAULT_SIZE))
  const fontSize = Math.round(size * 0.4)

  if (imageUrl) {
    return (
      <View
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.15)',
          overflow: 'hidden',
        }}
      >
        <Image
          source={{ uri: imageUrl }}
          style={{ width: size, height: size, borderRadius: radius }}
          resizeMode="cover"
        />
      </View>
    )
  }

  return (
    <YStack
      width={size}
      height={size}
      borderRadius={radius}
      backgroundColor="$backgroundHover"
      borderWidth={1}
      borderColor="$borderColor"
      alignItems="center"
      justifyContent="center"
    >
      <Text fontSize={fontSize} color="$placeholderColor" fontWeight="600">
        {fallbackText.charAt(0).toUpperCase()}
      </Text>
    </YStack>
  )
}
