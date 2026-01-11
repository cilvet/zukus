# Fase 5: Desktop App con Tauri

**Objetivo:** Tener la app de escritorio funcionando con Tauri, envolviendo el build web de la app mobile.

**Prerequisitos:** Fase 4 completada (mobile conectada con UI)

---

## Contexto

Tauri nos permite crear una app de escritorio que:
- Envuelve el build web de Expo
- Tiene un bundle pequeño (~10MB vs ~150MB de Electron)
- Usa el WebView del sistema
- Comparte el mismo código que la web

**Esta fase se desarrolla en paralelo** con el resto del desarrollo. Una vez configurada, cada vez que hagamos cambios en la app mobile/web, Tauri los reflejará automáticamente.

---

## Pasos

### 5.1 Verificar prerequisitos de Tauri

Tauri requiere algunas herramientas del sistema. Consulta la [documentación oficial](https://tauri.app/v1/guides/getting-started/prerequisites) para tu sistema operativo.

En macOS:

```bash
# Verificar Xcode Command Line Tools
xcode-select --version

# Verificar Rust
rustc --version
cargo --version
```

```
✅ Verificar: rustc --version (muestra versión)
✅ Verificar: cargo --version (muestra versión)
```

---

### 5.2 Crear estructura de la app desktop

```bash
mkdir -p apps/desktop
cd apps/desktop
```

```
📁 Crear apps/desktop/package.json
```

```json
{
  "name": "@zukus/desktop",
  "version": "0.0.1",
  "scripts": {
    "dev": "tauri dev",
    "build": "tauri build",
    "tauri": "tauri"
  },
  "devDependencies": {
    "@tauri-apps/cli": "^1.5.0"
  }
}
```

```
✅ Verificar: cat apps/desktop/package.json
```

---

### 5.3 Inicializar Tauri

```bash
cd apps/desktop
bunx tauri init
```

Durante la inicialización, responder:
- **App name:** Zukus
- **Window title:** Zukus
- **Web assets location:** `../mobile/dist` (o donde Expo genere el build)
- **Dev server URL:** `http://localhost:8081` (donde corre Expo web)

```
✅ Verificar: ls apps/desktop/src-tauri/tauri.conf.json
✅ Verificar: ls apps/desktop/src-tauri/Cargo.toml
```

---

### 5.4 Configurar tauri.conf.json

```
🔧 Verificar/Modificar apps/desktop/src-tauri/tauri.conf.json
```

Asegurarse de que las rutas son correctas:

```json
{
  "build": {
    "distDir": "../mobile/dist",
    "devPath": "http://localhost:8081"
  },
  "package": {
    "productName": "Zukus",
    "version": "0.0.1"
  },
  "tauri": {
    "bundle": {
      "active": true,
      "icon": [
        "icons/32x32.png",
        "icons/128x128.png",
        "icons/128x128@2x.png",
        "icons/icon.icns",
        "icons/icon.ico"
      ],
      "identifier": "com.zukus.app"
    },
    "windows": [
      {
        "title": "Zukus",
        "width": 1200,
        "height": 800,
        "resizable": true,
        "fullscreen": false
      }
    ]
  }
}
```

```
✅ Verificar: grep -q "mobile/dist" apps/desktop/src-tauri/tauri.conf.json
✅ Verificar: grep -q "8081" apps/desktop/src-tauri/tauri.conf.json
```

---

### 5.5 Añadir script de build web a mobile

```
🔧 Modificar apps/mobile/package.json
```

Añadir script para generar el build web:

```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "build:web": "expo export --platform web",
    "typecheck": "tsc --noEmit"
  }
}
```

```
✅ Verificar: grep -q "build:web" apps/mobile/package.json
```

---

### 5.6 Instalar dependencias

```bash
cd /ruta/al/monorepo/zukus
bun install
```

```
✅ Verificar: bun install (exit 0)
```

---

### 5.7 Probar en modo desarrollo

Necesitas dos terminales:

**Terminal 1:** Arrancar el servidor de desarrollo de Expo

```bash
cd apps/mobile && bun run web
```

**Terminal 2:** Arrancar Tauri en modo dev

```bash
cd apps/desktop && bun run dev
```

```
✅ Verificar: Expo arranca en localhost:8081
✅ Verificar: Tauri abre una ventana de escritorio
👁️ Verificar: La app se ve igual que en el navegador
```

---

### 5.8 Probar build de producción

```bash
# Primero, generar el build web
cd apps/mobile && bun run build:web

# Verificar que se generó
ls apps/mobile/dist/index.html

# Luego, hacer build de Tauri
cd apps/desktop && bun run build
```

```
✅ Verificar: ls apps/mobile/dist/index.html (existe)
✅ Verificar: El build de Tauri completa sin errores
👁️ Verificar: Se genera el ejecutable en apps/desktop/src-tauri/target/release/
```

---

## Verificación Final de la Fase

Antes de pasar a la Fase 6, asegúrate de que:

- [ ] Tauri está inicializado en `apps/desktop/`
- [ ] El `tauri.conf.json` apunta a la carpeta correcta del build de mobile
- [ ] El script `build:web` existe en mobile
- [ ] El modo desarrollo funciona (dos terminales)
- [ ] El build de producción genera un ejecutable

---

## Notas

### Desarrollo Paralelo

A partir de ahora, puedes desarrollar con Tauri corriendo en paralelo:

1. Mantén Expo web corriendo (`bun run web` en apps/mobile)
2. Mantén Tauri dev corriendo (`bun run dev` en apps/desktop)
3. Los cambios en el código se reflejan en ambos automáticamente

### Iconos

Por defecto Tauri genera iconos placeholder. Para iconos personalizados:

```bash
cd apps/desktop
bunx tauri icon path/to/your/icon.png
```

Esto se puede hacer más adelante cuando tengamos los assets definitivos.

### Referencia: zukus-again

Si zukus-again tiene configuración de Tauri, úsala como **referencia** para:
- Configuración de ventana (tamaño, título)
- Plugins de Tauri si los hay
- Configuración de bundle

---

## Siguiente Fase

→ [Fase 6: Migrar Componentes](./fase-6-migrar-componentes.md)

