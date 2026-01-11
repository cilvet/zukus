# Fase 0: Crear Estructura Base del Monorepo

**Objetivo:** Tener el repositorio base con Bun + Turborepo configurado y listo para recibir los packages.

**Prerequisitos:** Ninguno (es la primera fase)

---

## Pasos

### 0.1 Crear carpeta del proyecto

```bash
mkdir zukus
cd zukus
```

```
📁 Crear carpeta zukus/
✅ Verificar: ls zukus/ existe
```

---

### 0.2 Crear .gitignore

```
📁 Crear .gitignore
```

```gitignore
# Dependencies
node_modules/
.pnp
.pnp.js

# Build
dist/
.next/
.expo/
.turbo/
*.tsbuildinfo

# Bun
bun.lockb

# Local env
.env
.env.local
.env.*.local

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Testing
coverage/

# Tauri
apps/desktop/src-tauri/target/
```

```
✅ Verificar: cat .gitignore muestra contenido esperado
```

---

### 0.3 Crear package.json raíz

```
📁 Crear package.json
```

```json
{
  "name": "zukus",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "test": "turbo test",
    "typecheck": "turbo typecheck",
    "lint": "turbo lint",
    "clean": "turbo clean && rm -rf node_modules"
  },
  "devDependencies": {
    "turbo": "^2.3.0",
    "typescript": "^5.0.0"
  },
  "packageManager": "bun@1.0.0"
}
```

```
✅ Verificar: cat package.json es JSON válido
✅ Verificar: grep -q "workspaces" package.json
```

---

### 0.4 Crear turbo.json

```
📁 Crear turbo.json
```

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", ".expo/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "typecheck": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "lint": {
      "outputs": []
    }
  }
}
```

```
✅ Verificar: cat turbo.json es JSON válido
```

---

### 0.5 Crear estructura de carpetas

```bash
mkdir -p apps packages
```

```
📁 apps/
📁 packages/
✅ Verificar: ls -la (muestra las 2 carpetas)
```

---

### 0.6 Crear tsconfig.json base

```
📁 Crear tsconfig.json
```

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true
  },
  "exclude": ["node_modules"]
}
```

```
✅ Verificar: cat tsconfig.json es JSON válido
```

---

### 0.7 Instalar dependencias base

```bash
bun install
```

```
✅ Verificar: bun install (exit 0)
✅ Verificar: bunx turbo --version (muestra versión)
```

---

## Verificación Final de la Fase

Antes de pasar a la Fase 1, asegúrate de que:

- [ ] La carpeta `zukus/` existe
- [ ] El `.gitignore` está creado con el contenido correcto
- [ ] El `package.json` tiene workspaces configurados
- [ ] El `turbo.json` tiene el pipeline definido
- [ ] Las carpetas `apps/` y `packages/` existen
- [ ] El `tsconfig.json` base está creado
- [ ] `bun install` ejecuta sin errores
- [ ] `bunx turbo --version` funciona

---

## Siguiente Fase

→ [Fase 1: Migrar Core](./fase-1-migrar-core.md)

