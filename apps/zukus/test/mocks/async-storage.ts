/**
 * Minimal AsyncStorage mock.
 */
const store: Record<string, string> = {}

export default {
  getItem: async (key: string) => store[key] ?? null,
  setItem: async (key: string, value: string) => { store[key] = value },
  removeItem: async (key: string) => { delete store[key] },
  clear: async () => { for (const key of Object.keys(store)) delete store[key] },
  getAllKeys: async () => Object.keys(store),
}
