import { useState } from 'react'
import { Pressable } from 'react-native'
import { Popover, XStack, YStack, Text } from 'tamagui'
import { useLocale } from '../hooks/useLocale'
import { useAllAvailableLocales } from '../stores/translationStore'

function getLocaleLabel(code: string): string {
  return code.toUpperCase()
}

export function LocaleSelector() {
  'use no memo'

  const { locale, setLocale } = useLocale()
  const availableLocales = useAllAvailableLocales()

  if (availableLocales.length <= 1) {
    return null
  }

  if (availableLocales.length === 2) {
    return (
      <SegmentedLocaleSelector
        locales={availableLocales}
        active={locale}
        onSelect={setLocale}
      />
    )
  }

  return (
    <DropdownLocaleSelector
      locales={availableLocales}
      active={locale}
      onSelect={setLocale}
    />
  )
}

function SegmentedLocaleSelector({
  locales,
  active,
  onSelect,
}: {
  locales: string[]
  active: string
  onSelect: (code: string) => void
}) {
  return (
    <XStack
      alignSelf="flex-start"
      borderRadius={8}
      borderWidth={1}
      borderColor="$borderColor"
      overflow="hidden"
    >
      {locales.map((code) => {
        const isActive = code === active
        return (
          <Pressable key={code} onPress={() => onSelect(code)}>
            {({ pressed }) => (
              <XStack
                paddingHorizontal={12}
                paddingVertical={6}
                backgroundColor={isActive ? '$colorFocus' : '$uiBackgroundColor'}
                opacity={pressed ? 0.7 : 1}
              >
                <Text
                  fontSize={12}
                  fontWeight={isActive ? '700' : '400'}
                  color={isActive ? 'white' : '$placeholderColor'}
                >
                  {getLocaleLabel(code)}
                </Text>
              </XStack>
            )}
          </Pressable>
        )
      })}
    </XStack>
  )
}

function DropdownLocaleSelector({
  locales,
  active,
  onSelect,
}: {
  locales: string[]
  active: string
  onSelect: (code: string) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      placement="bottom-start"
      allowFlip
      offset={4}
    >
      <Popover.Trigger asChild>
        <Pressable onPress={() => setOpen(!open)}>
          {({ pressed }) => (
            <XStack
              alignSelf="flex-start"
              borderRadius={8}
              borderWidth={1}
              borderColor="$borderColor"
              paddingHorizontal={12}
              paddingVertical={6}
              backgroundColor="$uiBackgroundColor"
              opacity={pressed ? 0.7 : 1}
              gap={6}
              alignItems="center"
            >
              <Text fontSize={12} fontWeight="700" color="$color">
                {getLocaleLabel(active)}
              </Text>
              <Text fontSize={10} color="$placeholderColor">
                ▼
              </Text>
            </XStack>
          )}
        </Pressable>
      </Popover.Trigger>

      <Popover.Content
        backgroundColor="$background"
        borderWidth={1}
        borderColor="$borderColor"
        borderRadius={8}
        padding={4}
        elevate
      >
        <Popover.Arrow
          backgroundColor="$background"
          borderWidth={1}
          borderColor="$borderColor"
        />
        <YStack>
          {locales.map((code) => {
            const isActive = code === active
            return (
              <Pressable
                key={code}
                onPress={() => {
                  onSelect(code)
                  setOpen(false)
                }}
              >
                {({ pressed }) => (
                  <XStack
                    paddingHorizontal={12}
                    paddingVertical={8}
                    borderRadius={6}
                    backgroundColor={isActive ? '$colorFocus' : 'transparent'}
                    opacity={pressed ? 0.7 : 1}
                  >
                    <Text
                      fontSize={13}
                      fontWeight={isActive ? '700' : '400'}
                      color={isActive ? 'white' : '$color'}
                    >
                      {getLocaleLabel(code)}
                    </Text>
                  </XStack>
                )}
              </Pressable>
            )
          })}
        </YStack>
      </Popover.Content>
    </Popover>
  )
}
