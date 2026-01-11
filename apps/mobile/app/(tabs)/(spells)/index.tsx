import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { themes } from '@zukus/ui'

const CURRENT_THEME = 'zukus' as keyof typeof themes
const theme = themes[CURRENT_THEME]

// Mock data de conjuros
const MOCK_SPELLS = [
  { id: 'fireball', name: 'Bola de Fuego', level: 3, school: 'Evocación' },
  { id: 'magic-missile', name: 'Proyectil Mágico', level: 1, school: 'Evocación' },
  { id: 'shield', name: 'Escudo', level: 1, school: 'Abjuración' },
  { id: 'counterspell', name: 'Contrahechizo', level: 3, school: 'Abjuración' },
  { id: 'fly', name: 'Volar', level: 3, school: 'Transmutación' },
]

export default function SpellsScreen() {
  const router = useRouter()

  const handleSpellPress = (spellId: string, spellName: string) => {
    router.push({
      pathname: '/(tabs)/(spells)/[id]',
      params: { id: spellId, name: spellName },
    })
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Libro de Conjuros</Text>
        <Text style={styles.subtitle}>{MOCK_SPELLS.length} conjuros preparados</Text>
      </View>

      <View style={styles.spellsContainer}>
        {MOCK_SPELLS.map((spell) => (
          <Pressable
            key={spell.id}
            style={({ pressed }) => [
              styles.spellCard,
              pressed && styles.spellCardPressed,
            ]}
            onPress={() => handleSpellPress(spell.id, spell.name)}
          >
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>{spell.level}</Text>
            </View>
            <View style={styles.spellInfo}>
              <Text style={styles.spellName}>{spell.name}</Text>
              <Text style={styles.spellSchool}>{spell.school}</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          Pulsa un conjuro para ver su detalle.
          Desde el detalle podrás navegar a los componentes del conjuro (V, S, M).
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
    borderBottomWidth: 1,
    borderBottomColor: theme.borderColor,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.color,
  },
  subtitle: {
    fontSize: 14,
    color: theme.placeholderColor,
    marginTop: 4,
  },
  spellsContainer: {
    padding: 16,
  },
  spellCard: {
    backgroundColor: theme.backgroundHover,
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.borderColor,
    flexDirection: 'row',
    alignItems: 'center',
  },
  spellCardPressed: {
    backgroundColor: theme.backgroundPress,
  },
  levelBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.actionButton,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  levelText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  spellInfo: {
    flex: 1,
  },
  spellName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.color,
  },
  spellSchool: {
    fontSize: 12,
    color: theme.placeholderColor,
    marginTop: 2,
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
