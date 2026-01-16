import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { useLocalSearchParams, Stack } from 'expo-router'
import { themes } from '../../../../ui'

const CURRENT_THEME = 'zukus' as keyof typeof themes
const theme = themes[CURRENT_THEME]

// Mock data detallada
const ABILITY_DETAILS: Record<string, { description: string; skills: string[]; savingThrows: string }> = {
  str: {
    description: 'La Fuerza mide el poder físico bruto, el entrenamiento atlético y la medida en que puedes ejercer fuerza física.',
    skills: ['Atletismo'],
    savingThrows: 'Tiradas de salvación contra ser empujado, agarrado o derribado.',
  },
  dex: {
    description: 'La Destreza mide la agilidad, los reflejos y el equilibrio.',
    skills: ['Acrobacia', 'Juego de manos', 'Sigilo'],
    savingThrows: 'Tiradas de salvación contra efectos de área como aliento de dragón.',
  },
  con: {
    description: 'La Constitución mide la salud, la resistencia y la fuerza vital.',
    skills: [],
    savingThrows: 'Tiradas de salvación contra veneno, enfermedades y resistir la muerte.',
  },
  int: {
    description: 'La Inteligencia mide la agudeza mental, la memoria y la capacidad de razonamiento.',
    skills: ['Arcano', 'Historia', 'Investigación', 'Naturaleza', 'Religión'],
    savingThrows: 'Tiradas de salvación contra ilusiones y efectos mentales.',
  },
  wis: {
    description: 'La Sabiduría refleja tu percepción del mundo, tu intuición y tu perspicacia.',
    skills: ['Trato con animales', 'Perspicacia', 'Medicina', 'Percepción', 'Supervivencia'],
    savingThrows: 'Tiradas de salvación contra encantamientos y efectos de miedo.',
  },
  cha: {
    description: 'El Carisma mide tu capacidad de interactuar con otros, tu fuerza de personalidad y tu presencia.',
    skills: ['Engaño', 'Intimidación', 'Interpretación', 'Persuasión'],
    savingThrows: 'Tiradas de salvación contra destierro y posesión.',
  },
}

const ABILITY_NAMES: Record<string, string> = {
  str: 'Fuerza',
  dex: 'Destreza',
  con: 'Constitución',
  int: 'Inteligencia',
  wis: 'Sabiduría',
  cha: 'Carisma',
}

export default function AbilityDetailScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>()

  const abilityName = name ?? ABILITY_NAMES[id ?? ''] ?? 'Habilidad'
  const details = ABILITY_DETAILS[id ?? ''] ?? {
    description: 'Sin descripción disponible.',
    skills: [],
    savingThrows: 'N/A',
  }

  return (
    <>
      <Stack.Screen options={{ title: abilityName }} />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.abilityId}>{id?.toUpperCase()}</Text>
          <Text style={styles.title}>{abilityName}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.description}>{details.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Habilidades relacionadas</Text>
          {details.skills.length > 0 ? (
            <View style={styles.skillsContainer}>
              {details.skills.map((skill) => (
                <View key={skill} style={styles.skillChip}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noSkills}>Ninguna habilidad usa esta característica.</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tiradas de salvación</Text>
          <Text style={styles.description}>{details.savingThrows}</Text>
        </View>

        <View style={styles.navigationInfo}>
          <Text style={styles.infoTitle}>Navegación actual (3er nivel):</Text>
          <Text style={styles.infoPath}>
            (tabs) → (character) → [abilities] → ability/[{id}]
          </Text>
          <Text style={styles.infoDescription}>
            Este es el tercer nivel de navegación anidada.
            Estás viendo el detalle de una habilidad específica.
            Puedes volver atrás dos veces para llegar al index del tab.
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
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.borderColor,
  },
  abilityId: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colorFocus,
    letterSpacing: 2,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.color,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderColor,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colorFocus,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: theme.color,
    lineHeight: 24,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    backgroundColor: theme.backgroundHover,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.borderColor,
  },
  skillText: {
    fontSize: 14,
    color: theme.color,
  },
  noSkills: {
    fontSize: 14,
    color: theme.placeholderColor,
    fontStyle: 'italic',
  },
  navigationInfo: {
    margin: 16,
    padding: 16,
    backgroundColor: theme.uiBackgroundColor,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colorFocus,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colorFocus,
    marginBottom: 8,
  },
  infoPath: {
    fontSize: 12,
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
