import { Stack } from 'expo-router'
import { Text, YStack } from 'tamagui'
import { Platform, useWindowDimensions } from 'react-native'
import { CharacterScreen } from '../../screens'
import { useCharacterName, useCharacterBuild } from '../../ui'

const DESKTOP_BREAKPOINT = 768

function CustomHeaderTitle() {
  const name = useCharacterName()
  const build = useCharacterBuild()

  return (
    <YStack alignItems="flex-start" gap={0}>
      <Text fontSize={17} fontWeight="600" color="$color" numberOfLines={1}>
        {name || 'Personaje'}
      </Text>
      {build ? (
        <Text fontSize={12} color="$placeholderColor" numberOfLines={1}>
          {build}
        </Text>
      ) : null}
    </YStack>
  )
}

export default function CharacterDetailRoute() {
  const { width } = useWindowDimensions()
  const isWebDesktop = Platform.OS === 'web' && width >= DESKTOP_BREAKPOINT

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: !isWebDesktop,
          headerTitle: () => <CustomHeaderTitle />,
        }}
      />
      <CharacterScreen />
    </>
  )
}
