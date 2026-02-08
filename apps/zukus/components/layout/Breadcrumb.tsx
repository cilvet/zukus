'use no memo'

import { Fragment } from 'react'
import { Pressable } from 'react-native'
import { XStack, Text } from 'tamagui'

type BreadcrumbSegment = {
  label: string
  onPress?: () => void
}

export function Breadcrumb({ segments }: { segments: BreadcrumbSegment[] }) {
  return (
    <XStack alignItems="center" gap={6}>
      {segments.map((segment, index) => (
        <Fragment key={index}>
          {index > 0 && (
            <Text fontSize={12} color="$placeholderColor">
              /
            </Text>
          )}
          {segment.onPress ? (
            <Pressable onPress={segment.onPress} hitSlop={4}>
              {({ pressed }) => (
                <Text
                  fontSize={13}
                  color="$placeholderColor"
                  opacity={pressed ? 0.5 : 1}
                >
                  {segment.label}
                </Text>
              )}
            </Pressable>
          ) : (
            <Text fontSize={13} color="$color" fontWeight="600">
              {segment.label}
            </Text>
          )}
        </Fragment>
      ))}
    </XStack>
  )
}
