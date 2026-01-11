import { View, Text, ScrollView, StyleSheet, Platform } from 'react-native'
import { themes, themeNames } from '@zukus/ui'

const CURRENT_THEME = 'zukus' as keyof typeof themes
const theme = themes[CURRENT_THEME]

export default function SettingsScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ajustes</Text>
        <Text style={styles.subtitle}>Configuración de la aplicación</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Plataforma actual</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Sistema</Text>
          <Text style={styles.infoValue}>{Platform.OS}</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Versión</Text>
          <Text style={styles.infoValue}>{Platform.Version}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tema actual</Text>
        <View style={styles.themeCard}>
          <View style={[styles.colorSwatch, { backgroundColor: theme.background }]}>
            <View style={[styles.colorDot, { backgroundColor: theme.color }]} />
          </View>
          <View style={styles.themeInfo}>
            <Text style={styles.themeName}>Zukus</Text>
            <Text style={styles.themeDescription}>Tema púrpura y dorado</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Temas disponibles ({themeNames.length})</Text>
        <View style={styles.themesGrid}>
          {themeNames.map((themeName) => {
            const t = themes[themeName]
            return (
              <View key={themeName} style={styles.themePreview}>
                <View style={[styles.miniSwatch, { backgroundColor: t.background }]}>
                  <View style={[styles.miniDot, { backgroundColor: t.color }]} />
                </View>
                <Text style={styles.themePreviewName}>{themeName}</Text>
              </View>
            )
          })}
        </View>
      </View>

      <View style={styles.navigationInfo}>
        <Text style={styles.infoTitle}>Navegación</Text>
        <Text style={styles.navDescription}>
          Este tab no tiene navegación anidada.{'\n'}
          Solo contiene esta pantalla de configuración.{'\n\n'}
          Esto demuestra que cada tab puede tener su propia
          estructura de navegación independiente.
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Zukus v0.0.1</Text>
        <Text style={styles.footerSubtext}>Monorepo Demo</Text>
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
  infoCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderColor,
  },
  infoLabel: {
    fontSize: 15,
    color: theme.placeholderColor,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.color,
  },
  themeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.backgroundHover,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.borderColor,
  },
  colorSwatch: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.borderColor,
  },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  themeInfo: {
    marginLeft: 16,
  },
  themeName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.color,
  },
  themeDescription: {
    fontSize: 13,
    color: theme.placeholderColor,
    marginTop: 2,
  },
  themesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  themePreview: {
    alignItems: 'center',
    width: 70,
  },
  miniSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.borderColor,
  },
  miniDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  themePreviewName: {
    fontSize: 10,
    color: theme.placeholderColor,
    marginTop: 4,
    textAlign: 'center',
  },
  navigationInfo: {
    margin: 16,
    padding: 16,
    backgroundColor: theme.uiBackgroundColor,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.borderColor,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colorFocus,
    marginBottom: 8,
  },
  navDescription: {
    fontSize: 13,
    color: theme.placeholderColor,
    lineHeight: 20,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: theme.placeholderColor,
  },
  footerSubtext: {
    fontSize: 12,
    color: theme.placeholderColor,
    opacity: 0.6,
    marginTop: 4,
  },
})
