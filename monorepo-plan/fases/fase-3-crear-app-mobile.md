# Fase 3: Crear App Mobile (Expo)

**Objetivo:** Tener una app de Expo funcionando dentro del monorepo con pantallas sencillas. **Inicio fresco**, no copiar zukus-again.

**Prerequisitos:** Fase 2 completada

---

## ⚠️ Principio Fundamental: Inicio Fresco

**NO vamos a copiar zukus-again.** Queremos:

- Una base limpia sin código de vibe-coding
- Control total sobre cada archivo que añadimos
- Entender cada configuración que ponemos

**zukus-again sirve como REFERENCIA** para:
- Cómo configurar Expo Router
- Cómo integrar Tamagui con Expo
- Estructura de carpetas

Pero todo se escribe de nuevo, bajo supervisión.

## ⚠️ Alcance de esta Fase

Esta fase se limita a **crear la app funcionando con pantallas sencillas**. La navegación compleja (paneles, historial, detección de layout) se implementa en la **Fase 3.5**.

---

## Pasos

### 3.1 Crear app de Expo

```bash
cd apps
bunx create-expo-app@latest mobile --template blank-typescript
```

**Nota:** Usamos el template más básico para tener control total.

```
✅ Verificar: ls apps/mobile/package.json
✅ Verificar: ls apps/mobile/app.json
✅ Verificar: ls apps/mobile/tsconfig.json
```

---

### 3.2 Limpiar y actualizar package.json

```
🔧 Modificar apps/mobile/package.json
```

Cambios:
- Cambiar nombre a `@zukus/mobile`
- Añadir dependencias del workspace
- Añadir dependencias necesarias para Tamagui

```json
{
  "name": "@zukus/mobile",
  "version": "0.0.1",
  "main": "expo-router/entry",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@zukus/core": "workspace:*",
    "@zukus/ui": "workspace:*",
    "expo": "~50.0.0",
    "expo-router": "~3.4.0",
    "react": "18.2.0",
    "react-native": "0.73.0",
    "@tamagui/core": "^1.144.0",
    "react-native-reanimated": "~3.6.0"
  },
  "devDependencies": {
    "@types/react": "~18.2.0",
    "typescript": "^5.0.0"
  }
}
```

**Nota:** Las versiones exactas pueden variar. Consultar zukus-again para versiones compatibles probadas.

```
✅ Verificar: grep -q "@zukus/mobile" apps/mobile/package.json
✅ Verificar: grep -q "workspace:" apps/mobile/package.json
```

---

### 3.3 Configurar Expo Router

```
📁 Crear apps/mobile/app/_layout.tsx
```

```typescript
import { Stack } from 'expo-router'

export default function RootLayout() {
  return <Stack />
}
```

```
📁 Crear apps/mobile/app/index.tsx
```

```typescript
import { View, Text } from 'react-native'

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Zukus - Inicio Fresco</Text>
    </View>
  )
}
```

```
✅ Verificar: ls apps/mobile/app/_layout.tsx
✅ Verificar: ls apps/mobile/app/index.tsx
```

---

### 3.4 Actualizar app.json para Expo Router

```
🔧 Modificar apps/mobile/app.json
```

```json
{
  "expo": {
    "name": "Zukus",
    "slug": "zukus",
    "version": "1.0.0",
    "scheme": "zukus",
    "web": {
      "bundler": "metro",
      "output": "single",
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-router"
    ],
    "experiments": {
      "typedRoutes": true
    }
  }
}
```

```
✅ Verificar: grep -q "expo-router" apps/mobile/app.json
```

---

### 3.5 Eliminar archivos innecesarios del template

```bash
rm -rf apps/mobile/App.tsx  # Si existe, ya usamos app/ directory
```

```
✅ Verificar: No existe apps/mobile/App.tsx (usamos app/ directory)
```

---

### 3.6 Instalar dependencias desde el root

```bash
cd /ruta/al/monorepo/zukus
bun install
```

```
✅ Verificar: bun install (exit 0)
✅ Verificar: ls apps/mobile/node_modules/@zukus/core (symlink existe)
✅ Verificar: ls apps/mobile/node_modules/@zukus/ui (symlink existe)
```

---

### 3.7 Verificar que arranca

```bash
cd apps/mobile && bun run web
```

```
✅ Verificar: El proceso arranca sin crash
👁️ Verificar: Abrir en el navegador - se ve "Zukus - Inicio Fresco"
```

Después de verificar, Ctrl+C para parar.

---

### 3.8 Verificar typecheck

```bash
cd apps/mobile && bun run typecheck
```

```
✅ Verificar: typecheck (exit 0)
```

---

## Verificación Final de la Fase

Antes de pasar a la Fase 4, asegúrate de que:

- [ ] La app está en `apps/mobile/`
- [ ] El nombre en package.json es `@zukus/mobile`
- [ ] Las dependencias del workspace están configuradas
- [ ] Expo Router está configurado con `app/` directory
- [ ] Los symlinks a @zukus/core y @zukus/ui existen
- [ ] La app arranca en web sin errores
- [ ] El typecheck pasa

---

## Referencia: zukus-again

Para los siguientes pasos, consulta zukus-again para:

| Qué buscar | Dónde está en zukus-again |
|------------|---------------------------|
| Integración Tamagui | `tamagui.config.ts`, `app/_layout.tsx` |
| Temas | `constants/Colors.ts` o similar |
| Componentes | `components/` |
| Navegación | `app/` structure |

**Recuerda:** Solo usar como referencia, escribir todo de nuevo.

---

## Siguiente Fase

→ [Fase 3.5: Sistema de Navegación](./fase-3-5-navegacion.md)

