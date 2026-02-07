import { getLocales } from 'expo-localization'
import { useActiveLocale, useTranslationActions, useTranslationStore } from '../stores/translationStore'
import { useShallow } from 'zustand/shallow'

export function getDeviceLocale(): string {
  const locales = getLocales()
  return locales[0]?.languageCode ?? 'es'
}

export function useLocale() {
  const locale = useActiveLocale()
  const { setLocale } = useTranslationActions()
  return { locale, setLocale }
}

export function useAvailableLocales(compendiumId: string): string[] {
  return useTranslationStore(
    useShallow((state) => {
      const locales = new Set<string>(['en']) // base locale always available
      for (const pack of state.loadedPacks.values()) {
        if (pack.targetCompendiumId === compendiumId) {
          locales.add(pack.locale)
        }
      }
      return Array.from(locales).sort()
    })
  )
}
