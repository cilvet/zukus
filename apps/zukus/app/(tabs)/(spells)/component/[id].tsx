import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { useLocalSearchParams, Stack } from 'expo-router'
import { themes } from '../../../../ui'

const CURRENT_THEME = 'zukus' as keyof typeof themes
const theme = themes[CURRENT_THEME]

const COMPONENT_INFO: Record<string, { icon: string; fullName: string; description: string }> = {
  verbal: {
    icon: '🗣️',
    fullName: 'Componente Verbal',
    description: 'La mayoría de los conjuros requieren la recitación de palabras místicas. Las palabras en sí no son la fuente del poder del conjuro; más bien, la combinación particular de sonidos, con tono y resonancia específicos, pone en marcha las hebras de la magia.',
  },
  somatic: {
    icon: '🤚',
    fullName: 'Componente Somático',
    description: 'Los gestos de lanzamiento de conjuros pueden incluir una gesticulación enérgica o un conjunto intrincado de gestos. Si un conjuro requiere un componente somático, el lanzador debe tener libre uso de al menos una mano para realizar estos gestos.',
  },
  material: {
    icon: '💎',
    fullName: 'Componente Material',
    description: 'Lanzar algunos conjuros requiere objetos particulares, especificados entre paréntesis en la entrada del componente. Un personaje puede usar una bolsa de componentes o un foco de lanzamiento de conjuros en lugar de los componentes especificados para un conjuro.',
  },
}

export default function SpellComponentScreen() {
  const { id, spellId, spellName, componentName, componentDetail } = useLocalSearchParams<{
    id: string
    spellId: string
    spellName: string
    componentName: string
    componentDetail: string
  }>()

  const componentType = id ?? 'verbal'
  const info = COMPONENT_INFO[componentType] ?? COMPONENT_INFO.verbal

  return (
    <>
      <Stack.Screen options={{ title: info.fullName }} />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.icon}>{info.icon}</Text>
          <Text style={styles.title}>{info.fullName}</Text>
          <Text style={styles.subtitle}>Para: {spellName}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalle específico</Text>
          <View style={styles.detailBox}>
            <Text style={styles.detailText}>
              {componentDetail || 'Sin detalle específico.'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reglas generales</Text>
          <Text style={styles.description}>{info.description}</Text>
        </View>

        <View style={styles.navigationInfo}>
          <Text style={styles.infoTitle}>Navegación actual (3er nivel):</Text>
          <Text style={styles.infoPath}>
            (tabs) → (spells) → [{spellId}] → component/[{id}]
          </Text>
          <Text style={styles.infoDescription}>
            Este es el tercer nivel de navegación anidada.{'\n'}
            Estás viendo el detalle de un componente de conjuro.{'\n\n'}
            Puedes volver atrás dos veces para llegar a la lista de conjuros,
            o tres veces para cambiar de tab.
          </Text>
        </View>

        <View style={styles.successBox}>
          <Text style={styles.successTitle}>✅ Navegación funcionando</Text>
          <Text style={styles.successText}>
            Has llegado al nivel más profundo de navegación anidada.
            Esto demuestra que el stack navigation funciona correctamente
            tanto en iOS/Android nativo como en web.
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
  icon: {
    fontSize: 48,
    marginBottom: 12,
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
  detailBox: {
    backgroundColor: theme.backgroundHover,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.borderColor,
  },
  detailText: {
    fontSize: 16,
    color: theme.color,
    fontStyle: 'italic',
  },
  description: {
    fontSize: 15,
    color: theme.color,
    lineHeight: 24,
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
  successBox: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.4)',
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 8,
  },
  successText: {
    fontSize: 13,
    color: theme.color,
    lineHeight: 20,
  },
})
