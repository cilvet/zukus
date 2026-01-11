# ZUKUS: Plan de Unificación en Monorepo

> Documento de planificación para la migración y unificación de todos los proyectos Zukus en un único monorepo.

---

## ⚠️ PRINCIPIO FUNDAMENTAL

**Este proceso ha de hacerse PASO A PASO, verificando cada uno de los pasos de tal forma que trabajemos sobre seguro.**

Cada fase tiene verificaciones específicas que DEBEN cumplirse antes de pasar a la siguiente. No avanzaremos a una nueva fase sin haber completado y verificado la anterior. Esto nos permite:

- Detectar problemas temprano
- Tener siempre un estado funcional al que volver
- Evitar acumulación de errores
- Trabajar con confianza

---

## Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Principios Clave del Proyecto](#principios-clave-del-proyecto)
3. [Estado Actual](#estado-actual)
4. [Estado Objetivo](#estado-objetivo)
5. [Decisiones Técnicas](#decisiones-técnicas)
6. [Arquitectura](#arquitectura)
7. [Índice de Fases](#índice-de-fases)
8. [Estado del Proyecto](#estado-del-proyecto)

---

## Visión General

### ¿Qué es Zukus?

Zukus es una aplicación para gestionar personajes de D&D 3.5 (y potencialmente otros sistemas de rol). Permite:

- Crear y gestionar fichas de personaje con cálculos automáticos
- Aplicar buffs, equipo, y modificadores con trazabilidad completa
- Gestionar hechizos, habilidades especiales, y recursos
- Sincronizar datos entre dispositivos
- Funcionar en múltiples plataformas: iOS, Android, Web, y Desktop

### ¿Por qué un Monorepo?

Actualmente el código está disperso en múltiples repositorios:

- La lógica de dominio (cilvet-dice) está separada
- La app web (zukusnextmicon) usa Next.js
- La app móvil (zukus-again) es un PoC con Expo
- No hay infraestructura compartida

**Problemas actuales:**
- Duplicación de código entre proyectos
- Dificultad para mantener consistencia
- Compilar cilvet-dice y copiar manualmente a otros proyectos
- Mezcla de MUI y Tamagui en la web
- Código legacy de Firebase (deprecado)

**Solución:** Un monorepo que unifique todo con:
- Código compartido en packages
- Build system unificado (Turborepo)
- Una base de código → múltiples plataformas

---

## Principios Clave del Proyecto

### 1. Inicio Fresco, No Migración Directa

**NO vamos a copiar zukus-again ni zukusnextmicon directamente.** Queremos un inicio fresco y limpio. Estos proyectos sirven como **referencia** para:

- Componentes y animaciones
- Patrones de navegación
- Configuración de Tauri
- Lógica de formularios y estado

Pero todo se implementará de cero en el nuevo repositorio, bajo supervisión y sin vibe-coding.

### 2. Componentes Propios, No Tamagui por Defecto

**NO usaremos los componentes de Tamagui directamente.** Crearemos nuestros propios componentes basándonos en los que hemos desarrollado en zukus-again, que son:

- Eficientes y performant
- Estéticamente coherentes con nuestra visión
- Adaptados a nuestras necesidades específicas

### 3. Arquitectura Hexagonal y Desacoplada

Implementaremos una arquitectura limpia con:

- **Repositorios** como abstracción de acceso a datos
- **Interfaces** que permitan intercambiar implementaciones
- **Separación clara** entre dominio, aplicación e infraestructura

Esto nos permitirá en el futuro añadir capas como PowerSync para offline-first sin modificar el código de negocio.

### 4. Base de Datos de Desarrollo

**NO configuraremos Supabase local con Docker.** Trabajaremos directamente con una base de datos de desarrollo en Supabase, que es más realista. Usaremos el MCP de Supabase para conectarnos y editar dicha base de datos.

### 5. Testing Pragmático

- Los **tests unitarios del core** deben pasar desde el momento de la migración (Fase 1)
- La **infraestructura de testing de integración** se pospone hasta el final
- Priorizamos avanzar con verificaciones manuales en las primeras fases

### 6. Migración Selectiva de Componentes

De zukusnextmicon **solo migraremos**:

- Componentes grandes con lógica de estado (formularios, EntityProvider, etc.)
- Hooks complejos (useChangesManagement, useNavigationContext)

**NO migraremos** los átomos (Button, Input, etc.) ya que los crearemos de nuevo basándonos en zukus-again.

---

## Estado Actual

### Repositorios Existentes

```
/Users/cilveti/personal/
├── zukusnextmicon/      # App web actual (Next.js + Tamagui + MUI)
│   ├── 233 componentes
│   ├── Sistema de navegación complejo
│   ├── Formularios de Changes
│   ├── EntityProvider (selección recursiva)
│   └── Integración con Supabase
│
├── zukus-again/         # PoC React Native (Expo + Tamagui)
│   ├── Expo Router (file-based routing)
│   ├── 13 temas dinámicos
│   ├── Componentes propios bien diseñados
│   └── Buena configuración de Tauri
│
├── cilvet-dice/         # Librería de dominio D&D
│   ├── Sistema de cálculo de personajes
│   ├── Pipeline ordenado y determinista
│   ├── Tests unitarios con Bun
│   └── TypeScript strict
│
└── zukus-owlbear-plugin/ # Plugin para Owlbear (VTT)
```

### Lo Que Usaremos de Cada Proyecto

| Proyecto | Usaremos | No Usaremos |
|----------|----------|-------------|
| cilvet-dice | Todo (se migra como @zukus/core) | - |
| zukusnextmicon | Hooks de formularios, EntityProvider, lógica de navegación | Átomos, código legacy, dependencias de Next.js |
| zukus-again | Referencia para componentes, temas, animaciones, config Tauri | La app en sí (inicio fresco) |

---

## Estado Objetivo

### Estructura del Monorepo

```
zukus/
├── apps/
│   ├── mobile/              # Expo → iOS, Android, Web
│   │   ├── app/             # Expo Router (rutas)
│   │   └── package.json
│   │
│   └── desktop/             # Tauri (envuelve web build)
│       └── src-tauri/
│
├── packages/
│   ├── core/                # @zukus/core (ex cilvet-dice)
│   │   ├── core/domain/     # Lógica de dominio D&D
│   │   ├── srd/             # Contenido SRD
│   │   └── dist/            # Build output
│   │
│   └── ui/                  # @zukus/ui
│       ├── src/
│       │   ├── atoms/       # Componentes propios (no Tamagui)
│       │   ├── components/  # Componentes complejos migrados
│       │   ├── hooks/       # useNavigationContext, useChangesManagement
│       │   └── config/      # Tamagui config, themes, tokens
│       └── package.json
│
├── turbo.json               # Turborepo config
├── package.json             # Root workspace
└── bun.lockb                # Bun lockfile
```

### Plataformas Soportadas

| Plataforma | Tecnología | Prioridad |
|------------|------------|-----------|
| iOS | Expo (React Native) | Principal |
| Android | Expo (React Native) | Principal |
| Web | Expo Web | Principal |
| Desktop | Tauri + Web build | En paralelo |

---

## Decisiones Técnicas

### Package Manager: Bun

- Ya tienes tests escritos con Bun en cilvet-dice
- Bun es más rápido que pnpm
- Bun tiene testing built-in
- Soporta workspaces

### Build System: Turborepo

- Cachea builds entre ejecuciones
- Ejecuta tareas en paralelo
- Sabe qué packages rebuildar cuando hay cambios

### UI Framework: Tamagui (Config, no componentes)

- Usamos la **configuración** de Tamagui (temas, tokens, media queries)
- **NO usamos** los componentes de Tamagui directamente
- Creamos nuestros propios componentes

### Backend: Supabase (BD de Desarrollo)

- Usamos la instancia de desarrollo de Supabase directamente
- MCP de Supabase para gestión
- Sin Docker local (más realista)

### Desktop: Tauri

- Bundle pequeño (~10MB vs ~150MB de Electron)
- Usa WebView del sistema
- La app de Expo genera un build web que Tauri envuelve

---

## Arquitectura

### Dependencias entre Packages

```
apps/mobile
├── @zukus/ui
└── @zukus/core

apps/desktop
└── (usa el build web de apps/mobile)

@zukus/ui
├── @zukus/core (solo tipos)
└── tamagui (solo config)

@zukus/core
└── (standalone - sin deps internas)
```

### Flujo de Datos (Futuro con Repositorios)

```
Usuario interactúa con UI
        ↓
@zukus/ui (componentes React)
        ↓
Repositorio (interfaz abstracta)
        ↓
Implementación (Supabase directo / PowerSync futuro)
        ↓
Supabase (PostgreSQL)
```

---

## Índice de Fases

Cada fase tiene su archivo detallado en la carpeta `fases/`.

| Fase | Nombre | Descripción | Estado |
|------|--------|-------------|--------|
| 0 | [Estructura Base](./fases/fase-0-estructura-base.md) | Crear el monorepo con Bun + Turborepo | 🔄 Pendiente verificación |
| 1 | [Migrar Core](./fases/fase-1-migrar-core.md) | Migrar cilvet-dice como @zukus/core | ⬜ Pendiente |
| 2 | [Crear @zukus/ui](./fases/fase-2-crear-zukus-ui.md) | Estructura base del package de UI | ⬜ Pendiente |
| 3 | [Crear App Mobile](./fases/fase-3-crear-app-mobile.md) | Inicio fresco de la app Expo | ⬜ Pendiente |
| 4 | [Conectar Mobile con UI](./fases/fase-4-conectar-mobile-ui.md) | Integrar @zukus/ui en la app | ⬜ Pendiente |
| 5 | [Desktop con Tauri](./fases/fase-5-desktop-tauri.md) | App de escritorio (en paralelo) | ⬜ Pendiente |
| 6 | [Migrar Componentes](./fases/fase-6-migrar-componentes.md) | Componentes grandes desde zukusnextmicon | ⬜ Pendiente |

### Fases Pospuestas

Ver [fases-pospuestas.md](./fases/fases-pospuestas.md) para:

- Setup de Testing de Integración
- Setup de Supabase Local
- @zukus/sync (abstracción de repositorios)
- PowerSync (offline-first)

---

## Estado del Proyecto

### Leyenda

- ⬜ Pendiente
- 🔄 En progreso
- ✅ Completado
- ⏸️ Pospuesto

### Progreso Actual

```
Fase 0: 🔄 Estructura Base (pendiente verificación humano)
Fase 1: ⬜ Migrar Core
Fase 2: ⬜ Crear @zukus/ui
Fase 3: ⬜ Crear App Mobile
Fase 4: ⬜ Conectar Mobile con UI
Fase 5: ⬜ Desktop con Tauri
Fase 6: ⬜ Migrar Componentes
```

### Última Actualización

Fecha: 2026-01-11
Nota: Fase 0 ejecutada, pendiente de verificación y aprobación por el humano.

---

## Convenciones de los Archivos de Fase

Cada archivo de fase incluye:

```
✅ = Verificable automáticamente (comando/test)
👁️ = Requiere verificación manual
📁 = Crear archivo/carpeta
🔧 = Modificar configuración
```

**IMPORTANTE:** No avanzar a la siguiente fase hasta que TODAS las verificaciones de la fase actual estén completadas.

