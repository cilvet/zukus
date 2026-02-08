import { Stack, useLocalSearchParams } from 'expo-router'
import { Text, YStack } from 'tamagui'
import { Platform, useWindowDimensions } from 'react-native'
import { EditCharacterScreen } from '../../../screens'
import { useCharacterName, useCharacterBuild } from '../../../ui'
import { useCharacterSync } from '../../../hooks'

const DESKTOP_BREAKPOINT = 768

function CustomHeaderTitle() {
  const name = useCharacterName()
  const build = useCharacterBuild()

  return (
    <YStack alignItems="flex-start" gap={0}>
      <Text fontSize={17} fontWeight="600" color="$color" numberOfLines={1}>
        Editar {name || 'Personaje'}
      </Text>
      {build ? (
        <Text fontSize={12} color="$placeholderColor" numberOfLines={1}>
          {build}
        </Text>
      ) : null}
    </YStack>
  )
}

export default function EditCharacterRoute() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const characterId = id ?? ''
  useCharacterSync(characterId)

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
      <EditCharacterScreen />
    </>
  )
}
