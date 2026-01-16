# Fase 4: Conectar Mobile con UI (apps/zukus/ui/)

**Objetivo:** Que la app mobile use la configuración de Tamagui desde apps/zukus/ui/ y verificar que los packages del workspace funcionan correctamente integrados.

**Prerequisitos:** Fase 3 completada (app mobile arrancando)

---

## Pasos

### 4.1 Completar configuración de Tamagui en apps/zukus/ui/

Antes de conectar, necesitamos que la configuración de Tamagui esté funcional.

```
🔧 Completar packages/ui/src/config/tokens.ts
```

Usar zukus-again como **referencia** para definir tokens básicos:

```typescript
import { createTokens } from '@tamagui/core'

export const tokens = createTokens({
  size: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    // ... más según necesidad
  },
  space: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    // ... más según necesidad
  },
  radius: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
  },
  zIndex: {
    0: 0,
    1: 100,
    2: 200,
    3: 300,
    4: 400,
    5: 500,
  },
  color: {
    // Colores base - se expandirán con los temas
  },
})
```

```
✅ Verificar: El archivo tiene tokens definidos con createTokens
```

---

### 4.2 Definir tema básico

```
🔧 Completar packages/ui/src/config/themes.ts
```

```typescript
// Tema básico para empezar
// Se expandirá con los 13 temas de zukus-again

export const themes = {
  light: {
    background: '#ffffff',
    backgroundHover: '#f5f5f5',
    backgroundPress: '#e0e0e0',
    color: '#1a1a1a',
    colorHover: '#333333',
    borderColor: '#e0e0e0',
    // ... más propiedades según necesidad
  },
  dark: {
    background: '#1a1a1a',
    backgroundHover: '#2a2a2a',
    backgroundPress: '#3a3a3a',
    color: '#ffffff',
    colorHover: '#f0f0f0',
    borderColor: '#3a3a3a',
    // ... más propiedades según necesidad
  },
}
```

```
✅ Verificar: Hay al menos un tema light y uno dark
```

---

### 4.3 Actualizar configuración principal de Tamagui

```
🔧 Actualizar packages/ui/src/config/tamagui.config.ts
```

```typescript
import { createTamagui } from '@tamagui/core'
import { tokens } from './tokens'
import { themes } from './themes'

export const config = createTamagui({
  tokens,
  themes,
  defaultTheme: 'dark',
})

export type AppConfig = typeof config

declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends AppConfig {}
}
```

```
✅ Verificar: cd packages/ui && bun run typecheck (exit 0)
```

---

### 4.4 Crear TamaguiProvider en apps/zukus/ui/

```
📁 Crear packages/ui/src/config/TamaguiProvider.tsx
```

```typescript
import { TamaguiProvider as TamaguiProviderCore } from '@tamagui/core'
import { config } from './tamagui.config'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export function TamaguiProvider({ children }: Props) {
  return (
    <TamaguiProviderCore config={config}>
      {children}
    </TamaguiProviderCore>
  )
}
```

```
🔧 Actualizar packages/ui/src/config/index.ts
```

```typescript
export { config } from './tamagui.config'
export { tokens } from './tokens'
export { themes } from './themes'
export { TamaguiProvider } from './TamaguiProvider'
```

```
✅ Verificar: grep -q "TamaguiProvider" packages/ui/src/config/index.ts
```

---

### 4.5 Conectar en la app mobile

```
🔧 Modificar apps/mobile/app/_layout.tsx
```

```typescript
import { Stack } from 'expo-router'
import { TamaguiProvider } from 'apps/zukus/ui'

export default function RootLayout() {
  return (
    <TamaguiProvider>
      <Stack />
    </TamaguiProvider>
  )
}
```

```
✅ Verificar: # Verificación actualizada para nueva estructura
```

---

### 4.6 Crear un componente de prueba que use Tamagui

```
🔧 Modificar apps/mobile/app/index.tsx
```

```typescript
import { View } from '@tamagui/core'
import { Text } from 'react-native'

export default function HomeScreen() {
  return (
    <View
      flex={1}
      justifyContent="center"
      alignItems="center"
      backgroundColor="$background"
    >
      <Text style={{ color: 'white' }}>Zukus - Tamagui Conectado</Text>
    </View>
  )
}
```

```
✅ Verificar: grep -q "@tamagui/core" apps/mobile/app/index.tsx
```

---

### 4.7 Verificar importación de @zukus/core

Añadir una importación de prueba para verificar que el core también funciona.

```
🔧 Modificar apps/mobile/app/index.tsx (añadir al principio)
```

```typescript
import { View } from '@tamagui/core'
import { Text } from 'react-native'
// Importación de prueba del core
import type { Character } from '@zukus/core'

export default function HomeScreen() {
  // Solo para verificar que el tipo existe
  const _typeCheck: Character | null = null
  
  return (
    <View
      flex={1}
      justifyContent="center"
      alignItems="center"
      backgroundColor="$background"
    >
      <Text style={{ color: 'white' }}>Zukus - Packages Conectados</Text>
    </View>
  )
}
```

```
✅ Verificar: grep -q "@zukus/core" apps/mobile/app/index.tsx
```

---

### 4.8 Reinstalar dependencias y verificar

```bash
cd /ruta/al/monorepo/zukus
bun install
```

```
✅ Verificar: bun install (exit 0)
```

---

### 4.9 Verificar typecheck de toda la app

```bash
cd apps/mobile && bun run typecheck
```

```
✅ Verificar: typecheck (exit 0)
```

---

### 4.10 Verificar que arranca

```bash
cd apps/mobile && bun run web
```

```
✅ Verificar: El proceso arranca sin crash
👁️ Verificar: La app se ve con el fondo del tema (dark = fondo oscuro)
👁️ Verificar: No hay errores en la consola del navegador
```

---

## Verificación Final de la Fase

Antes de pasar a la Fase 5, asegúrate de que:

- [ ] La configuración de Tamagui en apps/zukus/ui/ está completa (tokens, themes, config)
- [ ] El TamaguiProvider está exportado desde apps/zukus/ui/
- [ ] La app mobile usa TamaguiProvider en _layout.tsx
- [ ] Los imports de apps/zukus/ui/ funcionan
- [ ] Los imports de @zukus/core funcionan (aunque sea solo tipos)
- [ ] El typecheck pasa en la app mobile
- [ ] La app arranca y se ve el tema aplicado

---

## Troubleshooting

### Error: Error de importación desde apps/zukus/ui/

Verificar que:
1. `bun install` se ejecutó desde el root del monorepo
2. El package.json de mobile tiene `# UI integrada en apps/zukus/ui/`
3. Existe el symlink en `la estructura apps/zukus/ui/`

### Error: TamaguiProvider not found

Verificar que:
1. `TamaguiProvider` está exportado en `packages/ui/src/config/index.ts`
2. `packages/ui/src/index.ts` re-exporta desde config

### El tema no se aplica

Verificar que:
1. `TamaguiProvider` envuelve toda la app en `_layout.tsx`
2. El componente usa props de Tamagui (`backgroundColor="$background"`)
3. Los temas tienen las propiedades usadas definidas

---

## Siguiente Fase

→ [Fase 5: Desktop con Tauri](./fase-5-desktop-tauri.md)

