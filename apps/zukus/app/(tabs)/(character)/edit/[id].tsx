import { Stack, useRouter } from 'expo-router'
import { Text, XStack, YStack } from 'tamagui'
import { Pressable } from 'react-native'
import { EditCharacterScreen } from '../../../../screens'
import { useCharacterName, useCharacterBuild, useTheme } from '../../../../ui'

function CustomHeaderLeft() {
  const router = useRouter()
  const { themeColors } = useTheme()
  const name = useCharacterName()
  const build = useCharacterBuild()

  return (
    <XStack alignItems="center" gap="$2" marginLeft={0}>
      <Pressable onPress={() => router.back()} hitSlop={{ top: 16, bottom: 16, left: 16, right: 40 }}>
        {({ pressed }) => (
          <Text
            fontSize={40}
            lineHeight={40}
            color="$color"
            opacity={pressed ? 0.5 : 1}
          >
            ‹
          </Text>
        )}
      </Pressable>
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
    </XStack>
  )
}

function HeaderOptions() {
  return (
    <Stack.Screen
      options={{
        headerTitle: '',
        headerLeft: () => <CustomHeaderLeft />,
        headerBackVisible: false,
      }}
    />
  )
}

export default function EditCharacterRoute() {
  return (
    <>
      <HeaderOptions />
      <EditCharacterScreen />
    </>
  )
}
