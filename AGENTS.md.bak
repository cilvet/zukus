# AGENTS

## Always-apply rules

### `.cursor/rules/code/convenciones.mdc`

# Convenciones de Código

## Ternarios

- No usar ternarios anidados
- Preferir if/else para lógica compleja

```typescript
// ❌ MAL
const result = a ? (b ? x : y) : z;

// ✅ BIEN
if (a) {
  if (b) {
    result = x;
  } else {
    result = y;
  }
} else {
  result = z;
}
```

## Types vs Interfaces

Usar `type` en lugar de `interface`.

```typescript
// ❌ MAL
interface Character {
  name: string;
  level: number;
}

// ✅ BIEN
type Character = {
  name: string;
  level: number;
};
```

## Nombres Semánticos

Las funciones deben tener nombres que describan claramente lo que hacen.

```typescript
// ❌ MAL
function process(data) { ... }
function handle(x) { ... }
function doStuff() { ... }

// ✅ BIEN
function calculateTotalDamage(attack) { ... }
function applyBonusToAbilityScore(bonus, ability) { ... }
function compileCharacterChanges(character) { ... }
```

## Modularización

- Dividir código en módulos pequeños y enfocados
- Cada archivo debe tener una responsabilidad clara
- Evitar archivos de más de 200-300 líneas

## No Clases

Evitar la creación de clases de TypeScript. Usar funciones y tipos en su lugar.

```typescript
// ❌ MAL
class CharacterCalculator {
  private character: Character;
  
  constructor(character: Character) {
    this.character = character;
  }
  
  calculateAC(): number { ... }
}

// ✅ BIEN
type Character = { ... };

function calculateAC(character: Character): number { ... }
```

Excepciones: librerías externas que requieran clases.

## No Emojis

No añadir emojis en ningún sitio de la app.

```typescript
// ❌ MAL
const message = "¡Hola! 👋 Bienvenido";
const status = "✅ Completado";
const error = "❌ Error al procesar";

// ✅ BIEN
const message = "Hola! Bienvenido";
const status = "Completado";
const error = "Error al procesar";
```

Esta regla aplica a:
- Textos en la UI
- Mensajes de error
- Comentarios en el código
- Strings literales
- Cualquier texto visible o no visible en la aplicación

### `.cursor/rules/code/datos-dinamicos.mdc`

# Datos Dinamicos sobre Mapas Estaticos

Preferir usar la informacion que ya viene en los objetos en lugar de mantener mapas estaticos separados.

## Evitar

```typescript
// MAL - Mapa estatico duplicando informacion
const BUFF_DISPLAY_INFO = {
  'bulls-strength': { name: 'Fuerza de Toro' },
  'cats-grace': { name: 'Gracia Felina' },
}

// Uso
<Text>{BUFF_DISPLAY_INFO[buff.uniqueId].name}</Text>
```

## Preferir

```typescript
// BIEN - Usar datos del propio objeto
<Text>{buff.name}</Text>
```

## Por que

- Evita duplicacion de informacion
- Reduce mantenimiento (un solo lugar para actualizar)
- Los objetos del dominio ya contienen la informacion necesaria

### `.cursor/rules/code/estado-compartido.mdc`

# Estado Compartido: Zustand vs useState

## Regla

**useState**: Solo para estado local de UN componente
**Zustand**: Para estado que necesitan MÚLTIPLES componentes

## Problema Común

Hooks con `useState` que se usan en múltiples componentes crean instancias separadas:

```typescript
// MAL - Cada componente que llame a usePanel tiene su propio estado
function usePanel() {
  const [isOpen, setIsOpen] = useState(false)
  return { isOpen, open: () => setIsOpen(true) }
}

// ComponenteA llama usePanel() → instancia A
// ComponenteB llama usePanel() → instancia B (estado diferente!)
```

## Solución

```typescript
// BIEN - Store de Zustand, estado compartido
const usePanelStore = create((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
}))

// ComponenteA y ComponenteB ven el mismo estado
```

## Cuándo Usar Zustand

- Estado del Side Panel (navegación)
- Estado del personaje (ya existe characterStore)
- Cualquier estado que deba sincronizarse entre componentes no relacionados

## Cuándo Usar useState

- Estado local de un solo componente (toggle, input value, etc.)
- Estado que no necesita compartirse

### `.cursor/rules/code/flatlist-anidado.mdc`

# FlatList en Contextos Anidados

## Problema

React Native lanza warning cuando FlatList está dentro de ScrollView con la misma orientación:

```
VirtualizedLists should never be nested inside plain ScrollViews
```

## Solución

Usar `.map()` en lugar de FlatList cuando el componente estará dentro de un ScrollView:

```typescript
// MAL - FlatList dentro de ScrollView
<ScrollView>
  <FlatList data={items} renderItem={...} />
</ScrollView>

// BIEN - .map() para listas anidadas
<ScrollView>
  <YStack>
    {items.map((item) => <ItemRow key={item.id} {...item} />)}
  </YStack>
</ScrollView>
```

## Excepción

En desktop donde el componente tiene su propio scroll (no está dentro de ScrollView), FlatList es preferible para virtualización.

```typescript
// Patrón: detectar plataforma
{isDesktop ? (
  <FlatList data={items} ... />
) : (
  items.map((item) => <ItemRow key={item.id} {...item} />)
)}
```

### `.cursor/rules/code/glow-on-change.mdc`

# Efecto de Brillo Reactivo (useGlowOnChange)

Usar el hook `useGlowOnChange` en cualquier componente que muestre un valor que pueda cambiar y deba tener feedback visual.

## Ubicacion

```typescript
import { useGlowOnChange } from '../hooks'
```

## Uso

```typescript
function StatCard({ value }: { value: number }) {
  // Retorna un contador que se incrementa en cada cambio
  const glowTrigger = useGlowOnChange(value)

  useEffect(() => {
    if (glowTrigger > 0) {
      // Disparar animacion de brillo
    }
  }, [glowTrigger])

  return <Card>{value}</Card>
}
```

## Comportamiento

- Ignora el primer render (no brilla al montar)
- Detecta cada cambio del valor (incluso cambios repetidos)
- Retorna un contador, no un booleano (para que useEffect siempre se dispare)

## Donde aplicarlo

- AbilityCards (score)
- Stats de combate (AC, HP, Initiative, etc.)
- Cualquier valor numerico que pueda cambiar por buffs, items, o acciones

### `.cursor/rules/code/mobile-desktop-borders.mdc`

# Bordes en Secciones: Mobile vs Desktop

## Regla

Las secciones del character sheet deben seguir convenciones visuales diferentes según la plataforma.

## Mobile (Native y Web Mobile)

**Sin bordes** - Usar `YStack` directamente con `SectionHeader`:

```typescript
// ✅ CORRECTO - Mobile
<YStack gap={12}>
  <SectionHeader icon="#" title="Skills" />
  <SkillsSection />
</YStack>
```

```typescript
// ❌ INCORRECTO - Mobile
<SectionCard>
  <SectionHeader icon="#" title="Skills" />
  <SkillsSection />
</SectionCard>
```

## Desktop

**Con bordes** - Envolver en `SectionCard`:

```typescript
// ✅ CORRECTO - Desktop
<SectionCard>
  <SectionHeader icon="#" title="Skills" />
  <SkillsSection />
</SectionCard>
```

## Archivos Afectados

- Mobile: `components/character/sections/*.tsx`
- Desktop: `screens/character/CharacterScreenDesktop.tsx`

## Por Qué

Desktop tiene más espacio y las tarjetas con bordes ayudan a separar visualmente las columnas. Mobile es más compacto y los bordes añaden ruido visual innecesario.

### `.cursor/rules/code/navegacion.mdc`

# Navegacion a Detalles

## Como Navegar

Usar el hook unificado en lugar de `router.push` o `openPanel` directamente:

```typescript
import { useNavigateToDetail } from '../../navigation'

const navigateToDetail = useNavigateToDetail()

// Navegar a un detalle
navigateToDetail('ability', 'strength')
navigateToDetail('spell', 'fireball', 'Bola de Fuego')  // con nombre custom
```

El hook hace lo correcto segun la plataforma:
- Desktop web: abre SidePanel
- Mobile: navega con stack (Expo Router)

## Como Añadir un Nuevo Tipo de Detalle

1. **Añadir el tipo** en `navigation/detailRegistry.tsx`:

```typescript
export type DetailType = 'ability' | 'skill' | ... | 'nuevoTipo'

export const DETAIL_REGISTRY: Record<DetailType, DetailConfig> = {
  // ...existentes...
  nuevoTipo: {
    getTitle: (id) => /* logica para obtener titulo */,
  },
}
```

2. **Crear el componente** de detalle en `components/character/`:

```typescript
// NuevoTipoDetailPanel.tsx
export function NuevoTipoDetailPanel({ id }: { id: string }) {
  // ...
}
```

3. **Añadir al switch de mobile** en `screens/detail/DetailScreen.tsx`:

```typescript
switch (type) {
  case 'ability':
    return <AbilityDetail abilityKey={id} />
  case 'nuevoTipo':
    return <NuevoTipoDetail id={id} />
  // ...
}
```

4. **Añadir al SidePanel de desktop** en `screens/character/CharacterScreenDesktop.tsx`:

```typescript
{currentPanel?.type === 'nuevoTipo' && (
  <NuevoTipoDetailPanel id={currentPanel.id} />
)}
```

## Archivos Clave

| Archivo | Proposito |
|---------|-----------|
| `navigation/detailRegistry.tsx` | Tipos y titulos de detalle |
| `navigation/useNavigateToDetail.ts` | Hook unificado |
| `screens/detail/DetailScreen.tsx` | Renderiza detalles en mobile |
| `screens/character/CharacterScreenDesktop.tsx` | Renderiza detalles en SidePanel |

### `.cursor/rules/code/rutas-minimas.mdc`

# Archivos de Ruta Mínimos

Los archivos dentro de `app/` (Expo Router) deben ser wrappers mínimos que solo importan y renderizan.

```typescript
// ✅ BIEN - archivo de ruta mínimo
import { CharacterScreen } from '../../../screens'

export default CharacterScreen
```

```typescript
// ❌ MAL - lógica y UI directamente en el archivo de ruta
export default function CharacterScreen() {
  const [state, setState] = useState(...)
  // 200+ líneas de código...
}
```

**Estructura**:
- Pantallas en `screens/[feature]/`
- Lógica en `hooks/`
- Archivos de ruta solo importan y deciden qué renderizar

### `.cursor/rules/glosario.mdc`

Código elegante:
- En este proyecto es muy importante que creemos código de forma elegante. Esto no significa que busquemos las optimizaciones máximas o que busquemos las formas más cortas de solucionar los problemas. El objetivo de un código elegante es encontrar soluciones que mantengan la legibilidad del código.

### `.cursor/rules/multiplataforma.mdc`

# Desarrollo Multiplataforma

## Plataformas


Por defecto, levantaremos el proyecto con `bun run dev`, que levanta todas las apps. 
Se pueden levantar las apps por separado si es necesario. 

El usuario prueba habitualmente en **móvil y web**. No olvides ninguna plataforma.

## Objetivo: Máximo Código Compartido

Los componentes van en `apps/zukus/ui/`. Solo se separa código cuando hay diferencias irreconciliables entre plataformas.

```
apps/zukus/ui/components/
  MiComponente.tsx          # Compartido (preferido)
  MiComponente.native.tsx   # Solo si es necesario
  MiComponente.web.tsx      # Solo si es necesario
```

## Reglas de Decisión

**Compartir** cuando:
- La lógica es idéntica
- Las diferencias son solo de estilo (usar tokens de Tamagui)

**Separar** cuando:
- APIs nativas incompatibles (ej: navegación, gestos específicos)
- Rendimiento crítico requiere implementación distinta

## TypeScript y Extensiones de Plataforma

TypeScript no entiende `.native.ts` / `.web.ts`. Para que compile, crear un archivo base:

```
hooks/
  useMyHook.ts           # Base para TypeScript (re-exporta de .web.ts)
  useMyHook.native.ts    # Metro usa en nativo
  useMyHook.web.ts       # Metro usa en web
  useMyHook.types.ts     # Tipos compartidos (opcional)
```

```typescript
// useMyHook.ts
export { useMyHook } from './useMyHook.web'
export type { MyHookResult } from './useMyHook.types'
```

Metro resuelve automaticamente `.native.ts` o `.web.ts` en runtime.

### `.cursor/rules/proyecto-contexto.mdc`

# Contexto del Proyecto Zukus

Zukus es una aplicación para gestión de personajes de D&D 3.5.

## Estado del Proyecto

**Lee siempre `monorepo-plan/README.md`** para conocer el estado actual de las fases. Las fases individuales están en `monorepo-plan/fases/`.

Antes de trabajar en cualquier fase:
1. Verifica que la fase anterior está completada
2. Lee los pasos pendientes de la fase actual

## Estructura del Monorepo

```
apps/
  zukus/          # App Expo (iOS, Android, Web)
    ui/           # Componentes, config Tamagui, stores
    components/   # Componentes de pantallas
    screens/      # Wrappers de rutas
  desktop/        # Tauri (envuelve build web de zukus)

packages/
  core/           # @zukus/core - Lógica de dominio D&D
```

## Repositorios de Referencia

| Repo | Ruta | Uso |
|------|------|-----|
| **zukusnextmicon** | `/Users/cilveti/personal/zukusnextmicon` | Referencia para lógica de componentes y hooks |

## Principios

1. **Inicio fresco**: No copiar apps, reescribir bajo supervisión
2. **Componentes propios**: No usar componentes de Tamagui directamente
3. **Core con tests**: Los tests del core deben pasar siempre

### `.cursor/rules/testing/no-useless-tests.mdc`

# NO Tests Inútiles

## Regla Fundamental

**NUNCA crear tests que no ejecuten código funcional.**

## ❌ Tests Prohibidos

### 1. Verificación de Estructura de Datos
```typescript
// ❌ MAL - Solo verifica que los datos están como los pusiste
it("should preserve metadata", () => {
  const field = definition.fields.find(f => f.name === "foo");
  expect(field?.type).toBe("string");
  expect(field?.description).toBe("Some description");
});
```

### 2. Conteo de Elementos Sin Lógica
```typescript
// ❌ MAL - Solo cuenta arrays sin ejecutar ninguna función
it("should have correct number of fields", () => {
  const fields = definition.fields;
  expect(fields.length).toBe(3);
});
```

### 3. Verificación de Propiedades de Objetos
```typescript
// ❌ MAL - Solo lee propiedades que ya definiste
it("should have correct properties", () => {
  expect(config.enabled).toBe(true);
  expect(config.name).toBe("test");
});
```

## ✅ Tests Válidos

Los tests DEBEN ejecutar funciones reales del código:

```typescript
// ✅ BIEN - Ejecuta validación Zod
it("should validate entity with enum values", () => {
  const schema = createEntitySchema(definition);
  expect(() => schema.parse(entity)).not.toThrow();
});

// ✅ BIEN - Ejecuta función de creación
it("should create instance with defaults", () => {
  const instance = createEntityInstance(definition);
  expect(instance.field).toBe("expected");
});

// ✅ BIEN - Ejecuta función de generación
it("should generate facets", () => {
  const facets = generateFacets(definition, entities);
  expect(facets).toHaveLength(3);
});

// ✅ BIEN - Ejecuta type guard
it("should identify enum fields", () => {
  expect(isEnumField(field)).toBe(true);
});
```

## Regla Simple

**Si el test solo lee un objeto sin llamar a ninguna función → ELIMÍNALO**

Los tests existen para verificar que el **código funciona**, no para verificar que JavaScript puede leer propiedades de objetos.

### `.cursor/rules/testing/small-test-files.mdc`

# Archivos de Test Pequeños

## Regla

**No crear archivos de tests masivos.** Dividir los tests en múltiples archivos cuando sea necesario.

## Por qué

- Archivos pequeños son más fáciles de navegar y entender
- Facilita ejecutar solo los tests relevantes durante el desarrollo
- Reduce conflictos de merge
- Mejora la legibilidad y mantenibilidad

## Guía

- Un archivo de test debe cubrir **una unidad lógica** (función, clase, o feature específica)
- Si un archivo supera ~200-300 líneas, considerar dividirlo
- Agrupar tests relacionados en carpetas si hay muchos archivos

## Ejemplo

```
❌ MAL
__tests__/
  character.test.ts  # 2000 líneas con todo mezclado

✅ BIEN
__tests__/
  character/
    calculateAbilityScores.test.ts
    calculateSavingThrows.test.ts
    calculateArmorClass.test.ts
    calculateAttacks.test.ts
```

### `.cursor/rules/tooling/bun.mdc`

# Bun

Usamos **bun** para todo:

- Package manager (`bun install`, `bun add`)
- Test runner (`bun test`)
- Runtime (`bun run`)

```bash
# ✅ CORRECTO
bun install
bun add zod
bun test
bun run build

# ❌ INCORRECTO
npm install
yarn add zod
jest
npx tsc
```

### `.cursor/rules/tooling/monorepo-packages.mdc`

# Paquetes Internos del Monorepo

Los paquetes en `packages/` son internos y se consumen directamente desde los fuentes.

## Configuración del package.json

```json
{
  "main": "index.ts",
  "types": "index.ts",
  "exports": {
    ".": "./index.ts"
  }
}
```

## Reglas

- **NO** apuntar a `dist/` - no hay proceso de build para paquetes internos
- **NO** ejecutar `bun run build` en paquetes internos
- Los cambios en el código fuente se reflejan inmediatamente

## Por qué

En un monorepo, TypeScript y el bundler (Metro/Vite) resuelven los imports directamente desde los fuentes. Compilar a `dist/` añade friccion innecesaria.

### `.cursor/rules/tooling/react-19.mdc`

# React 19 y el Compilador

Este proyecto usa React 19 con el React Compiler activado.

## Como esta configurado

El compilador solo procesa archivos `.tsx` dentro de `apps/zukus/`. Esto significa:

- Componentes React (`.tsx`) → se compilan y optimizan
- Hooks y utilidades (`.ts`) → no se tocan

## Convencion de extensiones

| Contenido del archivo | Extension |
|---|-----|
| Tiene JSX | `.tsx` |
| No tiene JSX (hooks, utils, tipos, config) | `.ts` |

Esta convencion es importante porque determina que archivos procesa el compilador.

## No es necesario

- `useMemo` - El compilador optimiza automaticamente
- `useCallback` - El compilador optimiza automaticamente
- `React.memo` - El compilador decide cuando memorizar

Escribe codigo directo, el compilador hace el trabajo:

```typescript
// BIEN - Codigo directo
function MyComponent({ items }) {
  const filtered = items.filter(x => x.active)
  return <List items={filtered} />
}
```

## Casos que requieren "use no memo"

Algunos patrones no son compatibles con el compilador. Usar `"use no memo"` al inicio del cuerpo de la funcion:

```typescript
function MyAnimatedComponent() {
  "use no memo"
  
  // Codigo con Reanimated shared values, try/finally, etc.
}
```

**Cuando usarlo:**

- Componentes que mutan `sharedValue.value` de Reanimated
- Funciones con bloques `try/finally` (no soportado aun)
- Cualquier patron que cause "Invalid hook call" en runtime

## Hooks y efectos

`useRef`, `useState`, `useEffect` se usan normalmente.

### `.cursor/rules/verificacion-humano.mdc`

# ⚠️ VERIFICACIÓN OBLIGATORIA CON EL HUMANO

## Regla Fundamental

**NUNCA avances a la siguiente fase o paso importante sin verificar explícitamente con el humano que el paso actual está correctamente completado.**

## Por qué es importante

1. **Alineación mental**: El humano necesita comprender cada parte del proyecto
2. **Detección temprana de errores**: Es más fácil arreglar problemas antes de que se acumulen
3. **Control del proyecto**: El humano debe mantener el control sobre las decisiones
4. **Evitar trabajo innecesario**: Mejor verificar antes que rehacer después

## Qué hacer

### ✅ CORRECTO

```
"He completado el paso X. Antes de continuar con el paso Y, ¿puedes verificar que todo está correcto?"

"La Fase 0 está terminada. Aquí está el resumen de lo que se ha creado:
- [lista de archivos/cambios]
¿Confirmas que podemos pasar a la Fase 1?"
```

### ❌ INCORRECTO

```
"Fase 0 completada. Ahora paso a la Fase 1..."
[continúa trabajando sin esperar confirmación]
```

## Puntos de verificación obligatorios

1. **Al completar una fase del plan de migración**
2. **Al crear estructura de carpetas significativa**
3. **Al modificar configuraciones importantes (package.json, tsconfig, etc.)**
4. **Al migrar código de otros repositorios**
5. **Cuando algo no funcione como se esperaba**
6. **Antes de hacer commits importantes**

## Cómo pedir verificación

1. Resume qué se ha hecho
2. Lista los archivos creados/modificados
3. Indica qué verificaciones has realizado tú (tests, builds, etc.)
4. Pregunta explícitamente si se puede continuar
5. **ESPERA la respuesta antes de continuar**

## Integración de Componentes

**Un componente NO está completo hasta que esté integrado y sea visible/usable en la aplicación.**

### ✅ CORRECTO

1. Implementar componente
2. Integrarlo en las vistas donde se usará (mobile, desktop)
3. Verificar que se puede acceder y probar
4. ENTONCES pedir verificación al humano

### ❌ INCORRECTO

1. Implementar componente
2. Exportarlo en index.ts
3. Pedir verificación sin integrarlo → **El humano no puede probarlo**

### Ejemplo

Si implementas `SkillsSection`:
- ✅ Añadirlo a `AbilitiesSection.tsx` (mobile)
- ✅ Añadirlo a `CharacterScreenDesktop.tsx` (desktop)
- ✅ Asegurar que hay navegación para acceder
- ❌ Solo crearlo y exportarlo

**Razón**: "No sé cómo pretendes que lo pruebe si no está en la vista de personaje" - Usuario

### `.cursor/rules/workflow/user-decisions.mdc`

# Decisiones del Usuario

## Regla Fundamental

**El usuario toma las decisiones importantes de implementación.** Para decisiones menores o convencionales, el asistente puede proceder usando su criterio, siguiendo las convenciones del proyecto.

## Decisiones que REQUIEREN Consulta

Preguntar al usuario antes de actuar:

- **Arquitectura**: Nuevos patrones, estructuras de carpetas, organización del proyecto
- **Dependencias**: Añadir librerías nuevas al proyecto
- **Cambios de alcance**: Modificar algo distinto a lo solicitado
- **Múltiples enfoques válidos**: Cuando hay varias formas razonables de resolver algo
- **Nombres de dominio**: Nombres de entidades, conceptos de negocio, features
- **Cambios breaking**: Modificaciones que afectan otras partes del código

## Decisiones que el Asistente PUEDE Tomar

Proceder sin preguntar:

- **Nombres técnicos obvios**: Variables locales, parámetros con nombre claro por contexto
- **Ubicación obvia**: Archivo nuevo junto a archivos similares existentes
- **Convenciones del proyecto**: Seguir patrones ya establecidos en el código
- **Implementación directa**: Cuando solo hay una forma razonable de hacerlo
- **Refactors menores**: Extraer función, renombrar variable local

## Formato de Preguntas

Cuando sea necesario preguntar, usar formato estructurado:

```
**1. [Descripción de la decisión]:**
- A) Opción 1
- B) Opción 2
- C) Otra opción
```

El usuario responde con: "1. A" o similar.

## Optional rules (referencias)

- Proceso para memoizar componentes de listas cuando el React Compiler no es suficiente ([.cursor/rules/code/memoizacion-manual-listas.mdc](.cursor/rules/code/memoizacion-manual-listas.mdc))
- Patrón para sincronización bidireccional con Supabase Realtime. Leer cuando se toque algo al respecto de esto. ([.cursor/rules/code/supabase-sync.mdc](.cursor/rules/code/supabase-sync.mdc))
- Sistema de Conditions para evaluar prerequisitos y requerimientos ([.cursor/rules/core/conditions-system.mdc](.cursor/rules/core/conditions-system.mdc))
- Guía completa del sistema de cálculo de personajes D&D 3.5 ([.cursor/rules/core/dd35-library-guide.mdc](.cursor/rules/core/dd35-library-guide.mdc))
- Sistema de Entidades - Infraestructura genérica para definir y gestionar tipos de datos ([.cursor/rules/core/entity-system.mdc](.cursor/rules/core/entity-system.mdc))
- When you need to create a formula or work with formulas in some capacity ([.cursor/rules/core/formula-system.mdc](.cursor/rules/core/formula-system.mdc))
- Reglas para el desarrollo del Sistema de Niveles v2 ([.cursor/rules/core/levels-system.mdc](.cursor/rules/core/levels-system.mdc))
- Helpers para crear personajes de prueba en tests ([.cursor/rules/core/test-helpers.mdc](.cursor/rules/core/test-helpers.mdc))
- Referencias a la documentación de dominio del core ([.cursor/rules/dominio-core.mdc](.cursor/rules/dominio-core.mdc))
