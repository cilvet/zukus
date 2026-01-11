import { createTamagui } from '@tamagui/core'
import { shorthands } from '@tamagui/shorthands'
import { themes as defaultThemes } from '@tamagui/config/v3'
import { tokens } from './tokens'
import { themes } from './themes'
import { fonts } from './fonts'

export const config = createTamagui({
  shouldAddPrefersColorThemes: false,
  themeClassNameOnRoot: false,
  shorthands,
  fonts,
  themes: {
    ...defaultThemes,
    ...themes,
  },
  tokens,
  defaultFont: 'body',
})

export type AppConfig = typeof config

declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends AppConfig {}
}
