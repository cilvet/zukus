# Fase 2: Crear estructura UI en apps/zukus/ui/ (Estructura Base)

**Objetivo:** Tener el package de UI con la configuración de Tamagui lista y la estructura preparada para nuestros componentes propios.

**Prerequisitos:** Fase 1 completada (tests del core pasando)

---

## ⚠️ Principio Importante

**NO usaremos los componentes de Tamagui directamente.** Este package contendrá:

- La **configuración** de Tamagui (temas, tokens, media queries)
- Nuestros **componentes propios** (creados desde cero, basándonos en zukus-again como referencia)
- **Hooks** migrados de zukusnextmicon (los complejos, no los simples)

---

## Pasos

### 2.1 Crear estructura de carpetas

```bash
mkdir -p packages/ui/src/{atoms,components,hooks,config}
```

```
✅ Verificar: ls packages/ui/src/ (muestra 4 carpetas: atoms, components, hooks, config)
```

---

### 2.2 Crear package.json

```
📁 Crear packages/ui/package.json
```

```json
{
  # UI integrada en apps/zukus (no es package separado),
  "version": "0.0.1",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "scripts": {
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@tamagui/core": "^1.144.0"
  },
  "peerDependencies": {
    "react": ">=18",
    "react-native": ">=0.70"
  },
  "devDependencies": {
    "@types/react": "^18.0.0"
  }
}
```

**Nota:** Solo incluimos `@tamagui/core` para la configuración. NO incluimos `tamagui` completo porque no usaremos sus componentes.

```
✅ Verificar: cat packages/ui/package.json es JSON válido
✅ Verificar: grep -q "@tamagui/core" packages/ui/package.json
```

---

### 2.3 Crear tsconfig.json

```
📁 Crear packages/ui/tsconfig.json
```

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "lib": ["ESNext"],
    "types": ["react", "bun"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

```
✅ Verificar: cat packages/ui/tsconfig.json es JSON válido
```

---

### 2.4 Crear configuración de Tamagui

Usaremos zukus-again como **referencia** para crear nuestra configuración, pero la escribiremos desde cero.

```
📁 Crear packages/ui/src/config/tokens.ts
```

```typescript
// Tokens base para el sistema de diseño
// Referencia: zukus-again/tamagui.config.ts

export const tokens = {
  // Definir aquí los tokens de espaciado, tamaños, etc.
  // Se completará basándose en zukus-again
}
```

```
📁 Crear packages/ui/src/config/themes.ts
```

```typescript
// Temas de la aplicación
// Referencia: zukus-again tiene 13 temas dinámicos

export const themes = {
  // Se completará basándose en zukus-again
}
```

```
📁 Crear packages/ui/src/config/tamagui.config.ts
```

```typescript
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
```

```
📁 Crear packages/ui/src/config/index.ts
```

```typescript
export { config } from './tamagui.config'
export { tokens } from './tokens'
export { themes } from './themes'
```

```
✅ Verificar: ls packages/ui/src/config/*.ts (muestra 4 archivos)
```

---

### 2.5 Crear archivos index para cada carpeta

```
📁 Crear packages/ui/src/atoms/index.ts
```

```typescript
// Aquí exportaremos nuestros componentes atómicos propios
// Se crearán basándose en zukus-again como referencia
```

```
📁 Crear packages/ui/src/components/index.ts
```

```typescript
// Aquí exportaremos componentes más complejos
// Algunos migrados de zukusnextmicon (con lógica de estado)
```

```
📁 Crear packages/ui/src/hooks/index.ts
```

```typescript
// Aquí exportaremos hooks
// Migrados de zukusnextmicon (useChangesManagement, etc.)
```

```
✅ Verificar: ls packages/ui/src/*/index.ts (muestra los 4 index)
```

---

### 2.6 Crear index.ts principal

```
📁 Crear packages/ui/src/index.ts
```

```typescript
// Configuración de Tamagui
export * from './config'

// Átomos (componentes propios - se añadirán)
// export * from './atoms'

// Componentes (más complejos - se añadirán)
// export * from './components'

// Hooks (se añadirán)
// export * from './hooks'
```

```
✅ Verificar: cat packages/ui/src/index.ts
```

---

### 2.7 Instalar dependencias

```bash
cd /ruta/al/monorepo/zukus
bun install
```

```
✅ Verificar: bun install (exit 0)
```

---

### 2.8 Verificar que compila

```bash
cd packages/ui && bun run typecheck
```

```
✅ Verificar: typecheck (exit 0, sin errores)
```

---

## Verificación Final de la Fase

Antes de pasar a la Fase 3, asegúrate de que:

- [ ] La estructura de carpetas está creada (`atoms/`, `components/`, `hooks/`, `config/`)
- [ ] El package.json tiene solo `@tamagui/core` (no el paquete completo)
- [ ] La configuración base de Tamagui existe (aunque esté incompleta)
- [ ] Los archivos index.ts existen en cada carpeta
- [ ] `bun install` funciona sin errores
- [ ] El typecheck pasa

---

## Notas para Desarrollo Futuro

### Sobre los Átomos

Los átomos (Button, Input, etc.) se crearán **de nuevo** basándose en zukus-again como referencia. No se copiarán directamente. Esto permite:

- Revisar y mejorar cada componente
- Asegurar consistencia
- Evitar código de vibe-coding

### Sobre los Componentes Complejos

Se migrarán desde zukusnextmicon solo aquellos con lógica de estado significativa:

- EntityProvider
- Formularios de Changes
- Sistema de navegación (useNavigationContext)

### Sobre la Configuración de Tamagui

La configuración se completará iterativamente. Por ahora solo necesitamos la estructura. Los tokens y temas específicos se definirán cuando empecemos a crear componentes.

---

## Siguiente Fase

→ [Fase 3: Crear App Mobile](./fase-3-crear-app-mobile.md)

