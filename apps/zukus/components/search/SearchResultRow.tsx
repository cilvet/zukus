'use no memo'

import { View } from 'react-native'
import { XStack, YStack, Text } from 'tamagui'
import { EntityImage } from '../../ui/components/EntityImage'
import type { SearchResult } from './types'

type SearchResultRowProps = {
  result: SearchResult
  isSelected: boolean
  onSelect: () => void
  onHover: () => void
}

export function SearchResultRow({ result, isSelected, onSelect, onHover }: SearchResultRowProps) {
  return (
    <View
      // Prevent mousedown from stealing focus from the input
      onStartShouldSetResponder={() => true}
      {...({
        onClick: onSelect,
        onMouseDown: (e: any) => e.preventDefault(),
        onMouseEnter: onHover,
      } as any)}
    >
      <XStack
        padding="$2"
        paddingHorizontal="$3"
        cursor="pointer"
        borderRadius="$2"
        alignItems="center"
        gap="$2.5"
        backgroundColor={isSelected ? '$backgroundColorGlow' : 'transparent'}
        hoverStyle={{ backgroundColor: isSelected ? '$backgroundColorGlow' : '$backgroundHover' }}
      >
        <EntityImage image={result.image} fallbackText={result.title} size={32} />
        <YStack flex={1} gap={2}>
          <Text fontFamily="$body" fontSize="$3" fontWeight="500" color="$color">
            {result.title}
          </Text>
          {result.description ? (
            <Text
              fontFamily="$body"
              fontSize="$2"
              color="$placeholderColor"
              numberOfLines={1}
            >
              {result.description}
            </Text>
          ) : null}
        </YStack>
        <Text fontFamily="$label" fontSize="$1" color="$placeholderColor" marginLeft="$2">
          {result.category}
        </Text>
      </XStack>
    </View>
  )
}
