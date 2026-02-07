import { create } from 'zustand';
import { useShallow } from 'zustand/shallow';
import type { TranslationPack } from '@zukus/core';
import { dnd35FeatsSpanishPack } from '@zukus/core';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCALE_STORAGE_KEY = '@zukus_locale';

/**
 * Translation store state.
 */
type TranslationStoreState = {
  activeLocale: string;
  loadedPacks: Map<string, TranslationPack>;
  activePackByCompendium: Record<string, string>;
  isInitialized: boolean;
};

/**
 * Translation store actions.
 */
type TranslationStoreActions = {
  initialize: (deviceLocale: string) => Promise<void>;
  setLocale: (locale: string) => void;
  loadPack: (pack: TranslationPack) => void;
  unloadPack: (packId: string) => void;
  setActivePackForCompendium: (compendiumId: string, packId: string) => void;
  clearActivePackForCompendium: (compendiumId: string) => void;
  getActivePackForCompendium: (compendiumId: string) => TranslationPack | undefined;
};

export type TranslationStore = TranslationStoreState & TranslationStoreActions;

// Pre-load the Spanish feats pack
const preloadedPacks = new Map<string, TranslationPack>();
preloadedPacks.set(dnd35FeatsSpanishPack.id, dnd35FeatsSpanishPack);

const initialState: TranslationStoreState = {
  activeLocale: 'es',
  loadedPacks: preloadedPacks,
  activePackByCompendium: {
    [dnd35FeatsSpanishPack.targetCompendiumId]: dnd35FeatsSpanishPack.id,
  },
  isInitialized: false,
};

/**
 * Store for translation packs and locale management.
 */
export const useTranslationStore = create<TranslationStore>((set, get) => ({
  ...initialState,

  initialize: async (deviceLocale: string) => {
    if (get().isInitialized) return;
    try {
      const savedLocale = await AsyncStorage.getItem(LOCALE_STORAGE_KEY);
      const locale = savedLocale ?? deviceLocale;
      set({ activeLocale: locale, isInitialized: true });
    } catch {
      set({ activeLocale: deviceLocale, isInitialized: true });
    }
  },

  setLocale: (locale: string) => {
    set({ activeLocale: locale });
    AsyncStorage.setItem(LOCALE_STORAGE_KEY, locale).catch(() => {});
  },

  loadPack: (pack: TranslationPack) => {
    set((state) => {
      const newPacks = new Map(state.loadedPacks);
      newPacks.set(pack.id, pack);
      return { loadedPacks: newPacks };
    });
  },

  unloadPack: (packId: string) => {
    set((state) => {
      const newPacks = new Map(state.loadedPacks);
      newPacks.delete(packId);

      // Remove any activePackByCompendium entries that reference this pack
      const newActiveByCompendium = { ...state.activePackByCompendium };
      for (const [compendiumId, activePackId] of Object.entries(newActiveByCompendium)) {
        if (activePackId === packId) {
          delete newActiveByCompendium[compendiumId];
        }
      }

      return {
        loadedPacks: newPacks,
        activePackByCompendium: newActiveByCompendium,
      };
    });
  },

  setActivePackForCompendium: (compendiumId: string, packId: string) => {
    set((state) => ({
      activePackByCompendium: {
        ...state.activePackByCompendium,
        [compendiumId]: packId,
      },
    }));
  },

  clearActivePackForCompendium: (compendiumId: string) => {
    set((state) => {
      const newActiveByCompendium = { ...state.activePackByCompendium };
      delete newActiveByCompendium[compendiumId];
      return { activePackByCompendium: newActiveByCompendium };
    });
  },

  getActivePackForCompendium: (compendiumId: string): TranslationPack | undefined => {
    const { activePackByCompendium, loadedPacks, activeLocale } = get();
    const packId = activePackByCompendium[compendiumId];
    if (!packId) return undefined;

    const pack = loadedPacks.get(packId);
    if (!pack) return undefined;

    // Only return the pack if it matches the current locale
    if (pack.locale !== activeLocale) return undefined;

    return pack;
  },
}));

// =============================================================================
// Selectors
// =============================================================================

export const useActiveLocale = () => useTranslationStore((s) => s.activeLocale);

export const useTranslationActions = () =>
  useTranslationStore(
    useShallow((s) => ({
      initialize: s.initialize,
      setLocale: s.setLocale,
      loadPack: s.loadPack,
      unloadPack: s.unloadPack,
      setActivePackForCompendium: s.setActivePackForCompendium,
      clearActivePackForCompendium: s.clearActivePackForCompendium,
      getActivePackForCompendium: s.getActivePackForCompendium,
    }))
  );
