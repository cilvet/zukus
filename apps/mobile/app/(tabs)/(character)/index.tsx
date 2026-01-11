import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { themes } from '@zukus/ui'

const CURRENT_THEME = 'zukus' as keyof typeof themes
const theme = themes[CURRENT_THEME]

// Mock data para demostrar navegación
const MOCK_SECTIONS = [
  { id: 'abilities', name: 'Habilidades', description: 'STR, DEX, CON, INT, WIS, CHA' },
  { id: 'skills', name: 'Competencias', description: 'Acrobatics, Athletics, etc.' },
  { id: 'inventory', name: 'Inventario', description: 'Armas, armaduras, objetos' },
  { id: 'spells', name: 'Conjuros', description: 'Spellbook del personaje' },
]

export default function CharacterScreen() {
  const router = useRouter()

  const handleSectionPress = (sectionId: string) => {
    router.push({
      pathname: '/(tabs)/(character)/[id]',
      params: { id: sectionId },
    })
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.characterName}>Gandalf el Gris</Text>
        <Text style={styles.characterInfo}>Mago Nivel 15 · Humano</Text>
      </View>

      <View style={styles.sectionsContainer}>
        <Text style={styles.sectionTitle}>Secciones</Text>
        {MOCK_SECTIONS.map((section) => (
          <Pressable
            key={section.id}
            style={({ pressed }) => [
              styles.sectionCard,
              pressed && styles.sectionCardPressed,
            ]}
            onPress={() => handleSectionPress(section.id)}
          >
            <Text style={styles.sectionName}>{section.name}</Text>
            <Text style={styles.sectionDescription}>{section.description}</Text>
            <Text style={styles.arrow}>→</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          Pulsa en cualquier sección para ver la navegación stack.
          Desde el detalle podrás navegar a un sub-detalle (habilidad específica).
        </Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.borderColor,
  },
  characterName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.color,
  },
  characterInfo: {
    fontSize: 14,
    color: theme.placeholderColor,
    marginTop: 4,
  },
  sectionsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.color,
    marginBottom: 12,
  },
  sectionCard: {
    backgroundColor: theme.backgroundHover,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.borderColor,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionCardPressed: {
    backgroundColor: theme.backgroundPress,
  },
  sectionName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.color,
    flex: 1,
  },
  sectionDescription: {
    fontSize: 12,
    color: theme.placeholderColor,
    flex: 2,
  },
  arrow: {
    fontSize: 18,
    color: theme.color,
  },
  infoBox: {
    margin: 16,
    padding: 16,
    backgroundColor: theme.uiBackgroundColor,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.borderColor,
  },
  infoText: {
    fontSize: 13,
    color: theme.placeholderColor,
    lineHeight: 20,
  },
})
