import { Image, Pressable, View, StyleSheet } from 'react-native'
import { ScrollView, Separator, Text, XStack, YStack } from 'tamagui'
import { useCharacterList } from '../../hooks'
import { useTheme } from '../../ui'
import { SafeAreaBottomSpacer } from '../../components/layout'

export function CharacterListScreen() {
  const { themeColors } = useTheme()
  const { characters, isLoading, error, navigateToCharacter } = useCharacterList()

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ScrollView flex={1} backgroundColor="$background">
      <YStack padding="$4">
        {/* TODO: Añadir ruta /characters/server-list si se necesita */}
      </YStack>

      {isLoading ? (
        <YStack padding="$4">
          <Text color="$placeholderColor">Cargando personajes...</Text>
        </YStack>
      ) : null}

      {error ? (
        <YStack padding="$4">
          <Text color="$colorFocus">{error}</Text>
        </YStack>
      ) : null}

      {!isLoading && !error && characters.length === 0 ? (
        <YStack padding="$4">
          <Text color="$placeholderColor">No hay personajes disponibles.</Text>
        </YStack>
      ) : null}

      <YStack>
        {characters.map((character, index) => (
          <YStack key={character.id}>
            <Pressable onPress={() => navigateToCharacter(character.id)}>
              {({ pressed }) => (
                <XStack
                  alignItems="center"
                  paddingVertical="$3"
                  paddingHorizontal="$4"
                  backgroundColor={pressed ? '$backgroundPress' : 'transparent'}
                  gap="$3"
                >
                  {character.imageUrl ? (
                    <Image
                      source={{ uri: character.imageUrl }}
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        backgroundColor: '#333',
                      }}
                    />
                  ) : (
                    <YStack
                      width={44}
                      height={44}
                      borderRadius={22}
                      backgroundColor="$uiBackgroundColor"
                      borderWidth={2}
                      borderColor="$borderColor"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text fontSize={18} fontWeight="700" color="$color">
                        {character.name.charAt(0).toUpperCase()}
                      </Text>
                    </YStack>
                  )}
                  <YStack gap="$0.5" flex={1}>
                    <Text fontSize={16} fontWeight="500" color="$color" numberOfLines={1}>
                      {character.name}
                    </Text>
                    {character.build ? (
                      <Text fontSize={12} color="$placeholderColor" numberOfLines={1}>
                        {character.build}
                      </Text>
                    ) : null}
                  </YStack>
                </XStack>
              )}
            </Pressable>
            {index < characters.length - 1 ? (
              <Separator borderColor="$borderColor" />
            ) : null}
          </YStack>
        ))}
      </YStack>
    </ScrollView>
    <SafeAreaBottomSpacer />
  </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
