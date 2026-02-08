# Directrices del proyecto

## React 19 — NO memoización manual
BAJO NINGUNA CIRCUNSTANCIA uses memoización manual.
El compilador de React se encarga automáticamente.
- PROHIBIDO: `useMemo`, `useCallback`, `React.memo`
- Los componentes usan la directiva `'use no memo'`

## Safe Area Bottom — OBLIGATORIO en toda pantalla mobile
Toda pantalla mobile DEBE tener `<SafeAreaBottomSpacer />` al final.
Es un spacer negro que evita que el contenido quede tapado por la barra de navegación de Android.

### Patrón correcto
```tsx
import { SafeAreaBottomSpacer } from '../components/layout'

// Spacer como HERMANO del ScrollView, nunca dentro
<View style={{ flex: 1 }}>
  <ScrollView style={{ flex: 1 }}>
    {contenido}
  </ScrollView>
  <SafeAreaBottomSpacer />
</View>
```

### Reglas
- SIEMPRE como último hijo del contenedor principal (hermano del scroll, no dentro)
- En desktop (`isDesktop`), NO se añade: `{!isDesktop && <SafeAreaBottomSpacer />}`
- Los componentes internos (CounterBar, SelectionBar, etc.) NO deben usar `useSafeAreaInsets` — el spacer del padre lo gestiona
- Excepciones (NO añadir spacer):
  - Pantallas con teclado+input flotante (ChatScreen)
  - Bottom sheets (ya gestionan insets internamente)
- Import desde: `'../components/layout'` o ruta relativa equivalente

## Estilos y UI
- Tamagui para componentes de UI (`YStack`, `XStack`, `Text`, etc.)
- FlashList para listas virtualizadas (nunca FlatList)
- Tema oscuro por defecto, colores vía `useTheme()`
