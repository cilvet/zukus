import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'

const DEV_MODE_KEY = '@zukus_dev_mode'

type DevModeStore = {
  enabled: boolean
  isInitialized: boolean
  initialize: () => Promise<void>
  toggle: () => void
}

export const useDevModeStore = create<DevModeStore>((set, get) => ({
  enabled: false,
  isInitialized: false,

  initialize: async () => {
    if (get().isInitialized) return
    try {
      const saved = await AsyncStorage.getItem(DEV_MODE_KEY)
      set({ enabled: saved === 'true', isInitialized: true })
    } catch {
      set({ isInitialized: true })
    }
  },

  toggle: () => {
    const next = !get().enabled
    set({ enabled: next })
    AsyncStorage.setItem(DEV_MODE_KEY, String(next)).catch(() => {})
  },
}))

export const useDevMode = () => useDevModeStore((s) => s.enabled)
