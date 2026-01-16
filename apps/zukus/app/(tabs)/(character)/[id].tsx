  import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native'
import { useLocalSearchParams, useRouter, Stack } from 'expo-router'
import { themes, type CharacterDetailParams } from '../../../ui'

const CURRENT_THEME = 'zukus' as keyof typeof themes
const theme = themes[CURRENT_THEME]

// Mock data para sub-navegación
const MOCK_ABILITIES = [
  { id: 'str', name: 'Fuerza', value: 10, modifier: 0 },
  { id: 'dex', name: 'Destreza', value: 14, modifier: 2 },
  { id: 'con', name: 'Constitución', value: 12, modifier: 1 },
  { id: 'int', name: 'Inteligencia', value: 18, modifier: 4 },
  { id: 'wis', name: 'Sabiduría', value: 16, modifier: 3 },
  { id: 'cha', name: 'Carisma', value: 14, modifier: 2 },
]

const SECTION_TITLES: Record<string, string> = {
  abilities: 'Habilidades',
  skills: 'Competencias',
  inventory: 'Inventario',
  spells: 'Conjuros',
}

export default function CharacterDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()

  const sectionTitle = SECTION_TITLES[id ?? ''] ?? 'Detalle'

  const handleAbilityPress = (abilityId: string, abilityName: string) => {
    router.push({
      pathname: '/(tabs)/(character)/ability/[id]',
      params: { id: abilityId, name: abilityName },
    })
  }

  return (
    <>
      <Stack.Screen options={{ title: sectionTitle }} />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{sectionTitle}</Text>
          <Text style={styles.subtitle}>
            Sección: {id}
          </Text>
        </View>

        {id === 'abilities' ? (
          <View style={styles.listContainer}>
            <Text style={styles.listTitle}>
              Pulsa una habilidad para ver el detalle anidado
            </Text>
            {MOCK_ABILITIES.map((ability) => (
              <Pressable
                key={ability.id}
                style={({ pressed }) => [
                  styles.abilityCard,
                  pressed && styles.abilityCardPressed,
                ]}
                onPress={() => handleAbilityPress(ability.id, ability.name)}
              >
                <View style={styles.abilityInfo}>
                  <Text style={styles.abilityName}>{ability.name}</Text>
                  <Text style={styles.abilityId}>{ability.id.toUpperCase()}</Text>
                </View>
                <View style={styles.abilityStats}>
                  <Text style={styles.abilityValue}>{ability.value}</Text>
                  <Text style={styles.abilityModifier}>
                    {ability.modifier >= 0 ? '+' : ''}{ability.modifier}
                  </Text>
                </View>
                <Text style={styles.arrow}>→</Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderEmoji}>📋</Text>
            <Text style={styles.placeholderText}>
              Contenido de {sectionTitle}
            </Text>
            <Text style={styles.placeholderSubtext}>
              Esta es una pantalla mock para demostrar la navegación stack.
              Ve a "Habilidades" para ver navegación anidada.
            </Text>
          </View>
        )}

        <View style={styles.navigationInfo}>
          <Text style={styles.infoTitle}>Navegación actual:</Text>
          <Text style={styles.infoPath}>
            (tabs) → (character) → [{id}]
          </Text>
          <Text style={styles.infoDescription}>
            Estás en el segundo nivel de navegación dentro del tab Character.
            Usa el botón back del header para volver.
          </Text>
        </View>
      </ScrollView>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderColor,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.color,
  },
  subtitle: {
    fontSize: 14,
    color: theme.placeholderColor,
    marginTop: 4,
  },
  listContainer: {
    padding: 16,
  },
  listTitle: {
    fontSize: 14,
    color: theme.placeholderColor,
    marginBottom: 16,
  },
  abilityCard: {
    backgroundColor: theme.backgroundHover,
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.borderColor,
    flexDirection: 'row',
    alignItems: 'center',
  },
  abilityCardPressed: {
    backgroundColor: theme.backgroundPress,
  },
  abilityInfo: {
    flex: 1,
  },
  abilityName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.color,
  },
  abilityId: {
    fontSize: 12,
    color: theme.placeholderColor,
    marginTop: 2,
  },
  abilityStats: {
    alignItems: 'center',
    marginRight: 16,
  },
  abilityValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.color,
  },
  abilityModifier: {
    fontSize: 14,
    color: theme.colorFocus,
    fontWeight: '600',
  },
  arrow: {
    fontSize: 18,
    color: theme.color,
  },
  placeholderContainer: {
    padding: 40,
    alignItems: 'center',
  },
  placeholderEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.color,
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: theme.placeholderColor,
    textAlign: 'center',
    lineHeight: 22,
  },
  navigationInfo: {
    margin: 16,
    padding: 16,
    backgroundColor: theme.uiBackgroundColor,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.borderColorFocus,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colorFocus,
    marginBottom: 8,
  },
  infoPath: {
    fontSize: 13,
    fontFamily: 'monospace',
    color: theme.color,
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 12,
    color: theme.placeholderColor,
    lineHeight: 18,
  },
})
