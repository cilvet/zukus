# Fase 1: Migrar @zukus/core

**Objetivo:** Tener cilvet-dice funcionando como @zukus/core dentro del monorepo, con todos los tests pasando.

**Prerequisitos:** Fase 0 completada

---

## ⚠️ Criterio de Éxito Crítico

**Esta fase NO está completa hasta que TODOS los tests unitarios del core pasen.**

Los tests de cilvet-dice son rápidos, independientes y la prueba definitiva de que la migración fue exitosa. Si algún test falla, hay que investigar y arreglarlo antes de continuar.

---

## Pasos

### 1.1 Copiar cilvet-dice

```bash
cp -R /Users/cilveti/personal/cilvet-dice packages/core
rm -rf packages/core/node_modules
rm -f packages/core/bun.lockb
```

```
✅ Verificar: ls packages/core/package.json
✅ Verificar: ls packages/core/core/
✅ Verificar: ls packages/core/srd/
```

---

### 1.2 Actualizar package.json de core

```
🔧 Modificar packages/core/package.json
```

Cambios necesarios:
- `"name": "cilvet-dice"` → `"name": "@zukus/core"`
- Eliminar scripts de copia a zukusnextmicon
- Simplificar para el monorepo

```json
{
  "name": "@zukus/core",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": "./dist/index.js",
    "./core/*": "./dist/core/*.js",
    "./srd/*": "./dist/srd/*.js"
  },
  "scripts": {
    "build": "tsc",
    "test": "bun test",
    "typecheck": "tsc --noEmit"
  }
}
```

```
✅ Verificar: grep -q "@zukus/core" packages/core/package.json
✅ Verificar: grep -v "zukusnextmicon" packages/core/package.json (no debe haber referencias)
```

---

### 1.3 Actualizar tsconfig de core

```
🔧 Modificar packages/core/tsconfig.json
```

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": ".",
    "declaration": true,
    "declarationMap": true,
    "noEmit": false
  },
  "include": ["index.ts", "core/**/*", "srd/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.spec.ts"]
}
```

```
✅ Verificar: grep -q "extends" packages/core/tsconfig.json
```

---

### 1.4 Instalar dependencias desde el root

```bash
cd /ruta/al/monorepo/zukus
bun install
```

```
✅ Verificar: bun install (exit 0)
✅ Verificar: ls packages/core/node_modules (si tiene dependencias)
```

---

### 1.5 Ejecutar tests del core

**⚠️ PASO CRÍTICO**

```bash
cd packages/core && bun test
```

```
✅ Verificar: bun test (exit 0)
✅ Verificar: TODOS los tests pasan
```

**Si algún test falla:**
1. NO continuar a la siguiente fase
2. Investigar el error
3. Puede ser un problema de rutas, imports, o configuración
4. Arreglar y volver a ejecutar tests

---

### 1.6 Build de core

```bash
cd packages/core && bun run build
```

```
✅ Verificar: ls packages/core/dist/index.js
✅ Verificar: ls packages/core/dist/index.d.ts
✅ Verificar: bun run build (exit 0, sin errores de TypeScript)
```

---

### 1.7 Verificar typecheck

```bash
cd packages/core && bun run typecheck
```

```
✅ Verificar: bun run typecheck (exit 0)
```

---

## Verificación Final de la Fase

Antes de pasar a la Fase 2, asegúrate de que:

- [ ] El package está en `packages/core/`
- [ ] El nombre en package.json es `@zukus/core`
- [ ] No hay referencias a zukusnextmicon
- [ ] `bun install` desde el root funciona
- [ ] **TODOS los tests pasan** (`bun test` exit 0)
- [ ] El build genera `dist/index.js` y `dist/index.d.ts`
- [ ] El typecheck pasa sin errores

---

## Troubleshooting

### Los tests fallan con errores de import

Revisar que los paths relativos en los imports sean correctos. Puede que haya que ajustar algunos si la estructura de carpetas cambió.

### Error de tipos en el build

Asegurarse de que el tsconfig extiende del base y tiene las opciones correctas. El `noEmit: false` es importante para que genere los archivos.

### bun test no encuentra los tests

Verificar que los archivos de test siguen el patrón `*.test.ts` o `*.spec.ts` y que no están en la carpeta `dist/`.

---

## Siguiente Fase

→ [Fase 2: Crear @zukus/ui](./fase-2-crear-zukus-ui.md)

