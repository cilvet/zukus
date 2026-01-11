# Fase 6: Migrar Componentes de UI

**Objetivo:** Migrar componentes complejos con lógica de estado desde zukusnextmicon a @zukus/ui.

**Prerequisitos:** Fase 5 completada (Tauri funcionando)

---

## ⚠️ Principio Fundamental: Solo Componentes Grandes

**NO migraremos átomos.** Los átomos (Button, Input, Select, Checkbox, etc.) se crean en la Fase 2 basándose en zukus-again.

**NO migraremos navegación.** El sistema de navegación se implementa en la Fase 3.5.

**SÍ migraremos:**
- Componentes con lógica de estado compleja
- Hooks que encapsulan lógica de negocio
- Sistemas completos (formularios de Changes, EntityProvider)

---

## Qué Migrar desde zukusnextmicon

### Prioridad Alta (Migrar)

| Componente/Hook | Ubicación en zukusnextmicon | Por qué migrarlo |
|-----------------|----------------------------|------------------|
| `useChangesManagement` | `src/components/Character/` | Lógica compleja de gestión de cambios |
| `useSpecialChangesManagement` | `src/components/Character/` | Variante para cambios especiales |
| `useBaseSourcesManagement` | `src/components/Character/` | Gestión de fuentes base |
| `EntityProvider` | `src/components/EntityProvider/` | Selección recursiva de entidades |
| `ContextualChangeForm` | `src/components/Character/` | Formulario contextual de cambios |

### Prioridad Baja (No Migrar)

| Componente | Por qué NO migrarlo |
|------------|---------------------|
| `Button`, `Input`, `Select` | Son átomos - crear nuevos basados en zukus-again |
| Componentes con MUI | Eliminar dependencia de MUI |
| Código legacy de Firebase | Deprecado |
| Componentes muy acoplados a Next.js | Refactorizar o reescribir |

---

## Proceso de Migración

Para cada componente/hook que migremos, seguiremos este proceso:

### Paso 1: Analizar

1. Leer el código original en zukusnextmicon
2. Identificar dependencias
3. Identificar qué partes dependen de átomos (habrá que adaptar)
4. Documentar la API pública

### Paso 2: Adaptar

1. Copiar el código a @zukus/ui
2. Eliminar dependencias de:
   - Next.js (`useRouter`, `useSearchParams`)
   - MUI
   - Átomos antiguos
3. Adaptar para usar:
   - Expo Router (si aplica)
   - Nuestros nuevos átomos (cuando existan)
   - Props genéricas para los componentes de UI

### Paso 3: Verificar

1. Typecheck pasa
2. El componente/hook es usable desde la app mobile
3. Funciona igual que el original (o mejor)

---

## Migración Detallada

### 6.1 Migrar hooks de formularios

```
📁 Crear packages/ui/src/hooks/useChangesManagement.ts
```

Pasos:
1. Copiar desde `zukusnextmicon/src/components/Character/CharacterChanges/useChangesManagement.ts`
2. Revisar y limpiar
3. Adaptar tipos para usar @zukus/core

```typescript
// packages/ui/src/hooks/useChangesManagement.ts
import type { Change } from '@zukus/core'

// ... código adaptado
```

```
✅ Verificar: cd packages/ui && bun run typecheck
```

Repetir para:
- `useSpecialChangesManagement`
- `useBaseSourcesManagement`

```
🔧 Actualizar packages/ui/src/hooks/index.ts
```

```typescript
export { useChangesManagement } from './useChangesManagement'
export { useSpecialChangesManagement } from './useSpecialChangesManagement'
export { useBaseSourcesManagement } from './useBaseSourcesManagement'
```

---

### 6.2 Migrar EntityProvider

El EntityProvider es un sistema completo que incluye:
- Tipos (`types.ts`)
- Hook de selección (`useProviderSelection.ts`)
- Vista principal (`ProviderView.tsx`)
- Selector de detalles (`EntitySelectorDetail.tsx`)

```
📁 Crear packages/ui/src/components/EntityProvider/
├── types.ts
├── useProviderSelection.ts
├── ProviderView.tsx
├── EntitySelectorDetail.tsx
└── index.ts
```

**Consideraciones de adaptación:**
- Los componentes de UI internos deberán usar nuestros átomos cuando existan
- Por ahora, pueden usar componentes básicos de React Native
- Marcar con `// TODO: usar átomo propio` donde corresponda

```
✅ Verificar: cd packages/ui && bun run typecheck
```

---

### 6.3 Migrar componentes de Changes

```
📁 Crear packages/ui/src/components/Changes/
├── ContextualChangeForm.tsx
├── ChangesList.tsx
└── index.ts
```

**Consideraciones:**
- Estos componentes usan muchos átomos (Input, Select, Button)
- Inicialmente pueden tener TODOs para cuando tengamos los átomos
- O pueden recibir los componentes como props (render props pattern)

```
✅ Verificar: cd packages/ui && bun run typecheck
```

---

### 6.4 Actualizar exports principales

```
🔧 Actualizar packages/ui/src/index.ts
```

```typescript
// Configuración de Tamagui
export * from './config'

// Hooks
export * from './hooks'

// Componentes
export { EntityProvider } from './components/EntityProvider'
export * from './components/Changes'

// Átomos (se añadirán cuando se creen)
// export * from './atoms'
```

```
✅ Verificar: cd packages/ui && bun run typecheck
```

---

### 6.5 Verificar uso desde mobile

Crear una pantalla de prueba en la app mobile que use los componentes migrados.

```
🔧 Crear apps/mobile/app/test-components.tsx
```

```typescript
import { View } from '@tamagui/core'
import { useChangesManagement } from '@zukus/ui'

export default function TestComponentsScreen() {
  // Verificar que el hook es importable y usable
  const changesManagement = useChangesManagement({
    // ... props necesarias
  })

  return (
    <View flex={1} justifyContent="center" alignItems="center">
      {/* Componente de prueba */}
    </View>
  )
}
```

```
✅ Verificar: cd apps/mobile && bun run typecheck
✅ Verificar: La app arranca sin errores
```

---

## Verificación Final de la Fase

Antes de considerar esta fase completa:

- [ ] Los hooks de formularios están migrados y exportados
- [ ] `EntityProvider` está migrado con todos sus archivos
- [ ] Los componentes de Changes están migrados
- [ ] Todos los exports están actualizados en `packages/ui/src/index.ts`
- [ ] El typecheck pasa en @zukus/ui
- [ ] El typecheck pasa en la app mobile
- [ ] La app mobile puede importar y usar los componentes migrados

---

## Próximos Pasos (Post-Fase 6)

Una vez completada esta fase, los siguientes pasos serían:

1. **Crear átomos propios** basándose en zukus-again
2. **Reemplazar TODOs** en componentes migrados con los nuevos átomos
3. **Testing de integración** (fase pospuesta)
4. **Abstracción de repositorios** (fase pospuesta)
5. **PowerSync** (fase pospuesta)

---

## Referencia: Archivos en zukusnextmicon

Para localizar los archivos a migrar:

```
zukusnextmicon/src/
├── components/
│   ├── Character/
│   │   ├── CharacterChanges/
│   │   │   ├── useChangesManagement.ts
│   │   │   ├── useSpecialChangesManagement.ts
│   │   │   ├── ContextualChangeForm.tsx
│   │   │   └── ...
│   │   └── ...
│   ├── EntityProvider/
│   │   ├── types.ts
│   │   ├── useProviderSelection.ts
│   │   ├── ProviderView.tsx
│   │   └── ...
│   └── ...
├── hooks/
│   └── ...
└── ...
```

---

## Siguiente Fase

→ [Fases Pospuestas](./fases-pospuestas.md)

