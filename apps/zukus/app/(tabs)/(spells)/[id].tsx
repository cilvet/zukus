import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native'
import { useLocalSearchParams, useRouter, Stack } from 'expo-router'
import { themes, type SpellDetailParams } from '../../../ui'

const CURRENT_THEME = 'zukus' as keyof typeof themes
const theme = themes[CURRENT_THEME]

// Mock data detallada de conjuros
const SPELL_DETAILS: Record<string, {
  description: string
  range: string
  duration: string
  castingTime: string
  components: Array<{ type: 'verbal' | 'somatic' | 'material'; name: string; detail?: string }>
}> = {
  fireball: {
    description: 'Un brillante destello sale de tu dedo hacia un punto que elijas dentro del alcance y luego florece con un rugido bajo en una explosión de llamas.',
    range: '150 pies',
    duration: 'Instantánea',
    castingTime: '1 acción',
    components: [
      { type: 'verbal', name: 'Verbal', detail: 'Palabras de poder arcano' },
      { type: 'somatic', name: 'Somático', detail: 'Un gesto con la mano' },
      { type: 'material', name: 'Material', detail: 'Una pequeña bola de guano de murciélago y azufre' },
    ],
  },
  'magic-missile': {
    description: 'Creas tres dardos brillantes de fuerza mágica. Cada dardo golpea a una criatura de tu elección que puedas ver dentro del alcance.',
    range: '120 pies',
    duration: 'Instantánea',
    castingTime: '1 acción',
    components: [
      { type: 'verbal', name: 'Verbal', detail: 'Una palabra de activación' },
      { type: 'somatic', name: 'Somático', detail: 'Apuntar con el dedo' },
    ],
  },
  shield: {
    description: 'Una barrera invisible de fuerza mágica aparece y te protege. Hasta el comienzo de tu siguiente turno, tienes +5 de bonificación a la CA.',
    range: 'Personal',
    duration: '1 ronda',
    castingTime: '1 reacción',
    components: [
      { type: 'verbal', name: 'Verbal', detail: 'Una exclamación de protección' },
      { type: 'somatic', name: 'Somático', detail: 'Levantar la mano' },
    ],
  },
  counterspell: {
    description: 'Intentas interrumpir a una criatura en el proceso de lanzar un conjuro.',
    range: '60 pies',
    duration: 'Instantánea',
    castingTime: '1 reacción',
    components: [
      { type: 'somatic', name: 'Somático', detail: 'Un gesto de negación' },
    ],
  },
  fly: {
    description: 'Tocas a una criatura voluntaria. El objetivo gana una velocidad de vuelo de 60 pies durante la duración.',
    range: 'Toque',
    duration: 'Concentración, hasta 10 minutos',
    castingTime: '1 acción',
    components: [
      { type: 'verbal', name: 'Verbal', detail: 'Palabras de levitación' },
      { type: 'somatic', name: 'Somático', detail: 'Mover los brazos como alas' },
      { type: 'material', name: 'Material', detail: 'Una pluma de ala de cualquier ave' },
    ],
  },
}

export default function SpellDetailScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>()
  const router = useRouter()

  const spellName = name ?? id ?? 'Conjuro'
  const details = SPELL_DETAILS[id ?? ''] ?? {
    description: 'Sin descripción disponible.',
    range: 'N/A',
    duration: 'N/A',
    castingTime: 'N/A',
    components: [],
  }

  const handleComponentPress = (component: { type: string; name: string; detail?: string }) => {
    router.push({
      pathname: '/(tabs)/(spells)/component/[id]',
      params: {
        id: component.type,
        spellId: id ?? '',
        spellName: spellName,
        componentName: component.name,
        componentDetail: component.detail ?? '',
      },
    })
  }

  return (
    <>
      <Stack.Screen options={{ title: spellName }} />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{spellName}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Tiempo</Text>
            <Text style={styles.statValue}>{details.castingTime}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Alcance</Text>
            <Text style={styles.statValue}>{details.range}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Duración</Text>
            <Text style={styles.statValue}>{details.duration}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.description}>{details.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Componentes (pulsa para ver detalle)</Text>
          <View style={styles.componentsContainer}>
            {details.components.map((component, index) => (
              <Pressable
                key={index}
                style={({ pressed }) => [
                  styles.componentCard,
                  pressed && styles.componentCardPressed,
                ]}
                onPress={() => handleComponentPress(component)}
              >
                <Text style={styles.componentIcon}>
                  {component.type === 'verbal' ? '🗣️' : component.type === 'somatic' ? '🤚' : '💎'}
                </Text>
                <View style={styles.componentInfo}>
                  <Text style={styles.componentName}>{component.name}</Text>
                  <Text style={styles.componentDetail} numberOfLines={1}>
                    {component.detail}
                  </Text>
                </View>
                <Text style={styles.arrow}>→</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.navigationInfo}>
          <Text style={styles.infoTitle}>Navegación actual (2do nivel):</Text>
          <Text style={styles.infoPath}>
            (tabs) → (spells) → [{id}]
          </Text>
          <Text style={styles.infoDescription}>
            Pulsa un componente para navegar al tercer nivel de detalle.
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
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.borderColor,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.color,
  },
  statsRow: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderColor,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: theme.placeholderColor,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.color,
    textAlign: 'center',
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
  componentsContainer: {
    gap: 10,
  },
  componentCard: {
    backgroundColor: theme.backgroundHover,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.borderColor,
    flexDirection: 'row',
    alignItems: 'center',
  },
  componentCardPressed: {
    backgroundColor: theme.backgroundPress,
  },
  componentIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  componentInfo: {
    flex: 1,
  },
  componentName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.color,
  },
  componentDetail: {
    fontSize: 12,
    color: theme.placeholderColor,
    marginTop: 2,
  },
  arrow: {
    fontSize: 18,
    color: theme.color,
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
