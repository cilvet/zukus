import { createTamagui } from '@tamagui/core'
import { tokens } from './tokens'
import { themes } from './themes'

export const config = createTamagui({
  tokens,
  themes,
  // Otras opciones de configuración
})

export type AppConfig = typeof config

declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends AppConfig {}
}
