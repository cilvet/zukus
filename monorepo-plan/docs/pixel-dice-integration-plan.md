# Plan de implementacion: Integracion Pixel Dice (web + React Native)

Este plan esta pensado para que otra IA lo ejecute sin contexto previo.
Incluye solo los enlaces oficiales y los pasos minimos.

## 1) Documentacion oficial a leer (obligatorio)

- Guia general de integracion:  
  https://github.com/GameWithPixels/.github/blob/main/doc/DevelopersGuide.md
- Monorepo JS/TS con paquetes oficiales:  
  https://github.com/GameWithPixels/pixels-js
- Paquete web BLE:  
  https://github.com/GameWithPixels/pixels-js/tree/main/packages/pixels-web-connect
- Paquete React Native BLE:  
  https://github.com/GameWithPixels/pixels-js/tree/main/packages/react-native-pixels-connect
- Hooks React:  
  https://github.com/GameWithPixels/pixels-js/tree/main/packages/pixels-react
- TypeDoc (referencias API):  
  https://gamewithpixels.github.io/pixels-js/index.html

## 2) Integracion tecnica minima

### 2.1 Web (Chromium)

Referencias:
- Package README:  
  https://github.com/GameWithPixels/pixels-js/tree/main/packages/pixels-web-connect
- API TypeDoc:  
  https://gamewithpixels.github.io/pixels-js/modules/_systemic_games_pixels_web_connect.html

Pasos:
1. Instalar `@systemic-games/pixels-web-connect`
2. Flujo:
   - `requestPixel()` -> `repeatConnect(pixel)`
   - `pixel.addEventListener("roll", ...)`
3. Estado:
   - `pixel.rollState`, `pixel.currentFace`, `pixel.batteryLevel`
4. Fallback:
   - Si no existe `navigator.bluetooth`, mostrar mensaje de no soporte.

### 2.2 React Native (iOS/Android)

Referencias:
- Package README:  
  https://github.com/GameWithPixels/pixels-js/tree/main/packages/react-native-pixels-connect
- API TypeDoc:  
  https://gamewithpixels.github.io/pixels-js/modules/_systemic_games_react_native_pixels_connect.html
- PixelScanner:  
  https://gamewithpixels.github.io/pixels-js/classes/_systemic_games_react_native_pixels_connect.PixelScanner.html
- Pixel:  
  https://gamewithpixels.github.io/pixels-js/classes/_systemic_games_react_native_pixels_connect.Pixel.html

Pasos:
1. Instalar `@systemic-games/react-native-pixels-connect`
2. Inicializar BLE en arranque:
   - `initBluetooth()`
3. Escanear:
   - `PixelScanner.startAsync()` o `useScannedPixels()`
4. Conectar:
   - `getPixel(id)` -> `pixel.connect()`
5. Escuchar rolls:
   - `pixel.addEventListener("roll", ...)` o `usePixelValue(pixel, "roll")`
6. Nota Android:
   - No reiniciar scans en bucles cortos (ver nota en `PixelScanner.startAsync()`).

### 2.3 Hooks React

Referencias:
- Package README:  
  https://github.com/GameWithPixels/pixels-js/tree/main/packages/pixels-react
- API TypeDoc:  
  https://gamewithpixels.github.io/pixels-js/modules/_systemic_games_pixels_react.html

Uso recomendado:
- `usePixelStatus`
- `usePixelValue`

## 3) Archivos a crear en Zukus

- Conectores multiplataforma:
  - `apps/zukus/ui/pixels/pixelDiceConnector.ts`
  - `apps/zukus/ui/pixels/pixelDiceConnector.web.ts`
  - `apps/zukus/ui/pixels/pixelDiceConnector.native.ts`
- Store Zustand:
  - `apps/zukus/ui/stores/pixelDiceStore.ts`
- Pantalla:
  - `apps/zukus/screens/pixels/PixelDiceScreen.tsx`
- Ruta minima:
  - `apps/zukus/app/(tabs)/(dice)/index.tsx`

## 4) UI baseline (pantalla)

1. Bloque de conexion (estado + conectar/desconectar)
2. Ultimo resultado grande (usar `useGlowOnChange`)
3. Historial de tiradas
4. Mensaje de no soporte en web si no hay Web Bluetooth

## 5) Navegacion

- Tab nueva en `apps/zukus/app/(tabs)/_layout.tsx`
  - Icono dado: `FontAwesome5` `dice-d20`
- Topbar desktop en `apps/zukus/components/layout/Topbar.tsx`

## 6) Validacion manual minima

1. Conectar un d20 real y verificar rolls y estado.
2. Probar fallback en navegador sin Web Bluetooth.

