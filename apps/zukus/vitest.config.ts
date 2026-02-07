import { defineConfig } from 'vitest/config'
import path from 'path'

const mock = (name: string) => path.resolve(__dirname, `test/mocks/${name}`)

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
  },
  define: {
    __DEV__: 'true',
    'process.env.EXPO_PUBLIC_SUPABASE_URL': '"https://test.supabase.co"',
    'process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY': '"test-anon-key"',
  },
  test: {
    environment: 'happy-dom',
    setupFiles: ['./test/setup.ts'],
    include: ['**/__tests__/**/*.test.{ts,tsx}', '**/*.test.{ts,tsx}'],
  },
  resolve: {
    alias: [
      // React Native -> Web
      { find: 'react-native', replacement: 'react-native-web' },

      // Tamagui
      { find: '@tamagui/core', replacement: mock('tamagui.tsx') },
      { find: 'tamagui', replacement: mock('tamagui.tsx') },
      { find: /^@tamagui\/config(\/.*)?$/, replacement: mock('tamagui-config.ts') },
      { find: '@tamagui/shorthands', replacement: mock('tamagui-config.ts') },
      { find: '@tamagui/popover', replacement: mock('expo-noop.ts') },

      // Expo (match subpath imports too)
      { find: /^@expo\/vector-icons(\/.*)?$/, replacement: mock('expo-vector-icons.tsx') },
      { find: 'expo-router', replacement: mock('expo-router.tsx') },
      { find: 'expo-haptics', replacement: mock('expo-noop.ts') },
      { find: 'expo-audio', replacement: mock('expo-noop.ts') },
      { find: 'expo-font', replacement: mock('expo-noop.ts') },
      { find: 'expo-linear-gradient', replacement: mock('expo-linear-gradient.tsx') },
      { find: 'expo-constants', replacement: mock('expo-noop.ts') },
      { find: 'expo-linking', replacement: mock('expo-noop.ts') },
      { find: 'expo-navigation-bar', replacement: mock('expo-noop.ts') },
      { find: 'expo-status-bar', replacement: mock('expo-noop.ts') },
      { find: 'expo-localization', replacement: mock('expo-localization.ts') },

      // React Native libraries
      { find: 'react-native-reanimated', replacement: mock('react-native-reanimated.ts') },
      { find: 'react-native-worklets', replacement: mock('react-native-worklets.ts') },
      { find: 'react-native-gesture-handler', replacement: mock('react-native-gesture-handler.tsx') },
      { find: 'react-native-screens', replacement: mock('expo-noop.ts') },
      { find: 'react-native-safe-area-context', replacement: mock('safe-area-context.tsx') },
      { find: 'react-native-keyboard-controller', replacement: mock('expo-noop.ts') },
      { find: 'react-native-pager-view', replacement: mock('expo-noop.ts') },
      { find: 'react-native-svg', replacement: mock('expo-noop.ts') },
      { find: 'react-native-controlled-mentions', replacement: mock('expo-noop.ts') },
      { find: 'react-native-markdown-display', replacement: mock('expo-noop.ts') },
      { find: /^react-native-url-polyfill(\/.*)?$/, replacement: mock('expo-noop.ts') },

      // Third-party
      { find: '@gorhom/bottom-sheet', replacement: mock('bottom-sheet.tsx') },
      { find: '@shopify/flash-list', replacement: mock('flash-list.tsx') },
      { find: '@react-native-async-storage/async-storage', replacement: mock('async-storage.ts') },
      { find: '@react-native-picker/picker', replacement: mock('expo-noop.ts') },
      { find: '@react-native-community/slider', replacement: mock('expo-noop.ts') },
      { find: /^@react-navigation\/.*$/, replacement: mock('expo-noop.ts') },
      { find: /^@systemic-games\/.*$/, replacement: mock('expo-noop.ts') },
      { find: /^@fortawesome\/.*$/, replacement: mock('expo-noop.ts') },
      { find: '@supabase/supabase-js', replacement: mock('supabase.ts') },
      { find: 'react-markdown', replacement: mock('expo-noop.ts') },
      { find: 'react-swipeable-views', replacement: mock('expo-noop.ts') },
    ],
  },
})
