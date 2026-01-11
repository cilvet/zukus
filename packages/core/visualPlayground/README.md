# Visual Playground

Entorno de desarrollo visual aislado para simular y probar flujos de la aplicación principal (cilvet-dice) usando React 19, Vite y shadcn/ui.

## 📍 Rutas Disponibles

| Ruta | Descripción |
|------|-------------|
| `/` | Hub principal con acceso a todos los ejemplos |
| `/spell-search` | Buscador de 2,792 conjuros D&D 3.5 con filtros |
| `/entity-selectors` | Ejemplos interactivos del sistema EntityProvider |
| `/entity-management` | Editor de tipos de entidades e instancias (estilo CMS) |

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
pnpm install

# Iniciar servidor API (puerto 3001) - necesario para Entity Management
bun run server

# Desarrollo local (en otra terminal)
pnpm dev

# O iniciar ambos a la vez
bun run dev:all

# Desarrollo con acceso desde red local (móvil, tablet)
pnpm dev:host

# Build de producción
pnpm build
```

**Importante**: La página de Entity Management (`/entity-management`) requiere que el servidor API esté corriendo. Usa `bun run server` antes de acceder a esa página.

**Acceso desde móvil**: Cuando uses `pnpm dev:host`, el servidor estará disponible en tu red local. Busca la URL de red en la consola (ej: `http://192.168.1.135:5173/`).

## Stack Tecnológico

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Vite | 7.3.0 | Build tool y dev server |
| React | 19.2.0 | Framework de UI con React Compiler |
| TypeScript | 5.9.3 | Tipado estático |
| Tailwind CSS | 3.4.17 | Estilos utilitarios |
| shadcn/ui | latest | Componentes de UI basados en Radix UI |
| React Router | 7.11.0 | Sistema de rutas |
| @tanstack/react-virtual | 3.13.13 | Virtualización de listas |
| Bun | latest | Runtime para servidor API |
| pnpm | - | Package manager (frontend) |

## 🖥️ Servidor API

El proyecto incluye un servidor HTTP con Bun para persistir entidades en archivos JSON.

### Iniciar el servidor

```bash
cd visualPlayground
bun run server
```

El servidor corre en `http://localhost:3001`.

### Endpoints disponibles

#### Entity Types (Schemas)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/entity-types` | Lista todos los tipos de entidad |
| POST | `/api/entity-types` | Crea un tipo de entidad |
| GET | `/api/entity-types/:typeName` | Obtiene un tipo de entidad |
| PUT | `/api/entity-types/:typeName` | Actualiza un tipo de entidad |
| DELETE | `/api/entity-types/:typeName` | Elimina un tipo de entidad |

#### Entidades

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/entities/:typeName` | Lista todas las entidades del tipo |
| POST | `/api/entities/:typeName` | Crea una entidad |
| GET | `/api/entities/:typeName/:id` | Obtiene una entidad |
| PUT | `/api/entities/:typeName/:id` | Actualiza una entidad |
| DELETE | `/api/entities/:typeName/:id` | Elimina una entidad |

### Estructura de datos

Los datos se persisten en archivos JSON:

```
visualPlayground/server/data/
├── schemas/           # Tipos de entidad (*.json)
│   ├── feat.json
│   └── skill.json
└── entities/          # Instancias por tipo
    ├── feat/
    │   ├── power-attack.json
    │   └── cleave.json
    └── skill/
        └── acrobatics.json
```

> **Nota**: La carpeta `server/data/` contiene los datos persistidos. Estos datos se guardan localmente y pueden ser versionados con git si lo deseas.

## Arquitectura de Importaciones

### Alias de Rutas

| Alias | Resuelve a | Uso |
|-------|------------|-----|
| `@/*` | `./src/*` | Archivos locales del playground |
| `@root/*` | `../*` | Archivos del proyecto principal (cilvet-dice) |

### Ejemplos de Importación

```typescript
// ✅ CORRECTO: Importar del proyecto principal
import { resolveProvider } from '@root/core/domain/levels/providers/resolveProvider'

// ✅ CORRECTO: Importar archivos locales
import { SpellBrowser } from '@/components/SpellBrowser'
import { Button } from '@/components/ui/button'

// ❌ INCORRECTO: No usar rutas relativas para el proyecto principal
import { Entity } from '../../../core/domain/entities' // NO HACER ESTO
```

## Estructura del Proyecto

```
visualPlayground/
├── scripts/
│   └── convertSpells.ts     # Conversión de conjuros del compendio
├── src/
│   ├── components/
│   │   ├── SpellBrowser.tsx
│   │   └── ui/              # Componentes shadcn/ui
│   ├── data/
│   │   ├── spellSchema.ts
│   │   ├── allSpells.ts     # 2,792 conjuros (auto-generado)
│   │   ├── spells.ts
│   │   └── testEntities.ts  # Entidades de prueba (feats, talents, spells)
│   ├── components/
│   │   ├── entity-editor/
│   │   │   ├── EntityTypeEditor.tsx    # Editor de schemas de entidades
│   │   │   ├── EntityInstanceEditor.tsx # Editor de instancias
│   │   │   └── index.ts
│   │   ├── SpellBrowser.tsx
│   │   └── ui/              # Componentes shadcn/ui
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── SpellSearchPage.tsx
│   │   ├── EntitySelectorsPage.tsx
│   │   └── EntityManagementPage.tsx    # Página principal del editor
│   ├── lib/
│   │   └── utils.ts
│   ├── App.tsx              # Router y rutas
│   └── main.tsx
└── vite.config.ts
```

## 🔮 Buscador de Conjuros D&D 3.5

**Ruta**: `/spell-search`

### Características

- **2,792 conjuros** del compendio D&D 3.5
- **Búsqueda inteligente** con scoring por relevancia
- **Filtros avanzados**: nivel, escuela, componentes, clases, descriptores
- **Paginación**: 30 conjuros por página
- **Performance metrics** en tiempo real
- **Grid responsivo**: 1/2/3 columnas según dispositivo

## 🎯 Selectores de Entidades

**Ruta**: `/entity-selectors`

Visualización interactiva del sistema **EntityProvider** con panel de navegación lateral y editor completo.

### Características Principales

- **Panel de navegación izquierdo**: Lista de todos los ejemplos de selectores
- **Vista interactiva**: Selección real de entidades con checkboxes
- **Editor completo**: Modo edición para configurar selectores y filtros
- **Virtualización**: Listas grandes con `@tanstack/react-virtual` (300px altura máxima)
- **Buscador automático**: Aparece cuando hay más de 20 resultados
- **Click en toda la fila**: Selección/deselección al hacer click en cualquier parte
- **Feedback visual**: Filas se oscurecen cuando se alcanza el máximo de selecciones
- **JSON desplegable**: Ver configuración completa del selector con estado actualizado
- **Resolución automática de Granted**: Las entidades granted se resuelven automáticamente y se muestran en el JSON
- **Validación en tiempo real**: Warnings y errores al seleccionar entidades
- **Persistencia de selecciones**: Las selecciones se guardan en `selectedEntities` del selector

### Tipos de Entidades

- **Feats**: 5 feats de ejemplo (combat, magic)
- **Rogue Talents**: 4 talentos de pícaro con niveles
- **Spells**: 2,792 conjuros completos del compendio

**Total: 2,801 entidades disponibles**

### Ejemplos Implementados

1. **Selector simple (single)**: Lista cerrada de IDs, max 1
2. **Selector múltiple**: Hasta 3 selecciones
3. **Filtro Strict**: Solo muestra elegibles
4. **Filtro Permissive**: Muestra todas, marca elegibles
5. **Con variables**: Filtro dinámico basado en nivel del personaje
6. **Solo Granted**: Entidades otorgadas automáticamente
7. **Granted + Selector**: Combinación de ambos
8. **Selector de conjuros**: Conjuros de nivel 1 (con virtualización)
9. **Conjuros por escuela**: Filtro por escuela de magia

### Funciones de Selección

El sistema implementa funciones core para gestionar selecciones de entidades:

- **`applySelection`**: Añade una entidad a la selección, validando elegibilidad y límites máximos
- **`removeSelection`**: Elimina una entidad de la selección
- **`validateSelector`**: Valida el estado actual del selector (min/max, filtros, existencia de entidades)

#### Validación y Warnings

Las funciones de selección proporcionan feedback detallado:

- **Errores**: Problemas críticos que impiden la selección (ej: máximo alcanzado, entidad no elegible)
- **Warnings**: Problemas no críticos que se muestran pero permiten continuar (ej: entidad no cumple filtros actuales)
- **Validación en tiempo real**: El selector se valida automáticamente al cambiar variables o selecciones

#### Entidades Granted

Las entidades granted se resuelven automáticamente usando `resolveProvider`:

- **Resolución automática**: Se calculan cuando cambian las variables o la configuración
- **Visualización**: Se muestran en la UI con badge de "✓ Otorgados automáticamente"
- **JSON enriquecido**: El JSON incluye un campo `_resolved.grantedEntities` con las entidades resueltas
- **Recálculo dinámico**: Se recalculan automáticamente al cambiar variables (ej: `@characterLevel`)

### Editor de Selectores

El modo edición permite configurar:

- **Granted**: Selector visual de entidades para otorgamiento automático
- **Selector**: ID, nombre, min/max, entityType, selector visual de entityIds
- **Filtros**: Tipo lógico (AND/OR/NOT), policy (strict/permissive), condiciones múltiples
- **Condiciones**: Campo, operador (==, !=, >, <, >=, <=, contains, in), valor con autocompletado de variables
- **Variables**: Editor completo para crear, editar y eliminar variables dinámicas

#### 🎯 Selector Visual de Entidades

Los campos de IDs ahora tienen un selector visual con búsqueda virtualizada:

- **Búsqueda inteligente**: Encuentra entidades por nombre rápidamente
- **Filtrado automático**: Respeta el `entityType` configurado globalmente
- **Tags visuales**: Muestra las entidades seleccionadas como badges
- **Virtualización**: Renderizado eficiente de miles de entidades con `@tanstack/react-virtual`
- **Performance óptima**: Maneja los 2,792 conjuros sin problemas
- **Información completa**: Muestra tipo, categoría y nivel de cada entidad
- **Click en todo el campo**: No solo en la lupa, sino en cualquier parte del campo
- **Contador de resultados**: Muestra cuántas entidades coinciden con tu búsqueda

#### ⚡ Autocompletado de Variables

Al editar valores de condiciones, escribe `@` para activar el autocompletado:

- **Activación automática**: Detecta el símbolo `@` mientras escribes
- **Filtrado inteligente**: Muestra solo variables que coinciden con tu búsqueda
- **Vista rápida**: Muestra el valor actual de cada variable
- **Inserción precisa**: Coloca el cursor después de la variable insertada
- **ESC para cerrar**: Cierra el menú de sugerencias con Escape

### Editor de Variables

El editor de variables permite definir valores dinámicos que se pueden usar en las condiciones del filtro:

- **Añadir variables**: Nombre + valor numérico inicial
- **Editar variables**: Modificar nombre o valor de variables existentes
- **Eliminar variables**: Quitar variables que ya no se necesitan
- **Uso en filtros**: Referencia con `@nombreVariable` en el campo valor de las condiciones

```typescript
// Ejemplo de uso de variable en filtro
conditions: [{ field: 'level', operator: '<=', value: '@characterLevel' }]
```

## 🗂️ Editor de Entidades (Entity Management)

**Ruta**: `/entity-management`

Sistema completo de gestión de entidades similar a un CMS (Contentful, Contentstack). Permite crear y editar tanto los **tipos de entidades** (schemas/content types) como las **instancias** de esas entidades.

### Características Principales

- **Editor de Tipos de Entidad**: Define schemas con campos personalizados, validaciones y tipos complejos
- **Editor de Instancias**: Crea y edita instancias basadas en los schemas definidos
- **Interfaz tipo CMS**: Panel lateral con lista de tipos, vista principal con instancias
- **Modales reutilizables**: Los editores pueden usarse dentro de modales desde otras páginas
- **Validación automática**: Campos requeridos, tipos de datos, valores permitidos
- **Soporte completo de tipos**: string, integer, boolean, arrays, referencias, objetos anidados

### Editor de Tipos de Entidad (EntityTypeEditor)

Define la estructura de un tipo de entidad con sus campos y validaciones:

#### Campos Base (automáticos)
- `id` (string, requerido): Identificador único
- `name` (string, requerido): Nombre de la entidad
- `description` (string, opcional): Descripción
- `tags` (string[], opcional): Tags para categorización

#### Campos Personalizados Soportados

| Tipo | Descripción | Características |
|------|-------------|-----------------|
| `string` | Texto simple | Valores permitidos opcionales (enum) |
| `integer` | Número entero | Valores permitidos opcionales (enum) |
| `boolean` | Verdadero/Falso | Switch toggle |
| `string_array` | Lista de textos | Multiselect o lista editable, puede requerir al menos 1 |
| `integer_array` | Lista de números | Lista editable, puede requerir al menos 1 |
| `reference` | Referencia a otra entidad | Lista de IDs, con selector visual opcional |
| `object` | Objeto anidado | Campos anidados con estructura propia |
| `object_array` | Lista de objetos | Array de objetos con estructura definida |

#### Características del Editor

- **Drag & Drop**: Reordenar campos con botones de movimiento
- **Valores permitidos**: Define enums para campos string/integer
- **Campos opcionales**: Marca campos como requeridos u opcionales
- **Arrays no vacíos**: Opción para requerir al menos un elemento en arrays
- **Objetos anidados**: Define estructuras complejas con campos anidados
- **Vista previa JSON**: Ver el schema completo en formato JSON
- **Validación en tiempo real**: Feedback visual de campos requeridos

### Editor de Instancias (EntityInstanceEditor)

Crea y edita instancias de entidades basadas en los schemas definidos:

#### Características

- **Generación automática de ID**: Opción para generar ID desde el nombre
- **Campos dinámicos**: Renderiza campos según el tipo definido en el schema
- **Selectores visuales**: Para campos con valores permitidos (enums)
- **Multiselect**: Checkboxes para arrays con valores permitidos
- **Referencias**: Selector de entidades disponibles para campos de referencia
- **Objetos anidados**: Editor completo para objetos y arrays de objetos
- **Vista previa JSON**: Ver la instancia completa antes de guardar

#### Tipos de Campos Renderizados

- **String/Integer con enum**: Dropdown select
- **String/Integer sin enum**: Input de texto/número
- **Boolean**: Switch toggle
- **Array con enum**: Checkboxes multiselect
- **Array sin enum**: Lista editable con botones añadir/eliminar
- **Reference**: Selector de entidades o input de IDs
- **Object**: Editor con campos anidados
- **Object Array**: Lista de editores de objetos

### Página Principal (EntityManagementPage)

Interfaz completa de gestión con:

- **Panel lateral**: Lista de todos los tipos de entidad con contador de instancias
- **Vista principal**: 
  - Edición/creación de tipos de entidad (navegación normal)
  - Lista de instancias del tipo seleccionado
  - Búsqueda y filtrado de instancias
- **Acciones rápidas**: Crear, editar, duplicar, eliminar
- **Modales**: Editor de instancias en diálogo
- **Selector de referencias**: Campos de referencia muestran tipos disponibles
- **Responsive**: Sidebar colapsable en móvil

### Uso en Modales

Los componentes están diseñados para usarse dentro de modales desde otras páginas:

```tsx
import { EntityTypeEditor, EntityInstanceEditor } from '@/components/entity-editor'
import { Dialog, DialogContent } from '@/components/ui/dialog'

function MyPage() {
  const [open, setOpen] = useState(false)
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <EntityTypeEditor
          onSave={(schema) => {
            // Guardar schema
            setOpen(false)
          }}
          onCancel={() => setOpen(false)}
          isModal
        />
      </DialogContent>
    </Dialog>
  )
}
```

### Ejemplo de Schema

```typescript
{
  typeName: 'feat',
  description: 'Una dote o habilidad especial',
  fields: [
    {
      name: 'category',
      type: 'string',
      allowedValues: ['combat', 'magic', 'general'],
      description: 'Categoría de la dote'
    },
    {
      name: 'prerequisites',
      type: 'string_array',
      optional: true,
      description: 'Prerequisitos'
    },
    {
      name: 'benefit',
      type: 'string',
      description: 'Beneficio de la dote'
    }
  ]
}
```

## React Compiler

Este proyecto usa el **React Compiler** de React 19:

- ✅ Memoización automática (no usar `useMemo`, `useCallback`, `memo()` manualmente)
- ✅ Optimización de re-renders automática
- ✅ Validación en ESLint

**Importante**: Evitar usar hooks de optimización manual. El compilador optimiza automáticamente.

## Configuración de shadcn/ui

### Agregar Componentes

```bash
pnpm dlx shadcn@latest add [nombre-componente]
```

### Componentes Instalados

- `accordion`, `badge`, `button`, `card`, `checkbox`, `dialog`, `input`, `label`, `scroll-area`, `select`, `separator`, `switch`, `tabs`, `textarea`, `tooltip`

### Problema Conocido: SelectItem vacío

Radix UI no permite `<SelectItem value="">`. Usar `value="__all__"` y manejarlo en el handler:

```tsx
<SelectItem value="__all__">Todos</SelectItem>
onValueChange={(value) => handleFilter(value === '__all__' ? undefined : value)}
```

## 📦 Aislamiento del Proyecto Principal

Este proyecto está completamente aislado del build principal:

- ✅ `tsconfig.json` principal excluye `visualPlayground`
- ✅ Dependencias separadas (`node_modules` propio)
- ✅ Puede importar del proyecto principal via `@root/*`
- ❌ El proyecto principal NO importa del playground

## 🛠️ Desarrollo

### Conversión de Conjuros

```bash
pnpm run scripts/convertSpells.ts
```

Convierte el JSON del compendio a `src/data/allSpells.ts`.

### Agregar Nuevas Páginas

1. Crear componente en `src/pages/TuPagina.tsx`
2. Añadir ruta en `src/App.tsx`:
```tsx
<Route path="/tu-ruta" element={<TuPagina />} />
```
3. Añadir link en `src/pages/Home.tsx`

## 📝 Changelog

### v4.2 - Mejoras de UX en Entity Management
- **Edición de tipos en vista principal**: Los tipos se editan en la página principal con header contextual
- **Selector de referencias**: Campos de referencia usan selector con tipos disponibles
- **Modales solo para instancias**: Las instancias mantienen el modal para edición rápida
- **Corrección de hooks**: Eliminadas funciones helper que causaban errores con React Compiler

### v4.1 - Correcciones de Scroll
- 🔧 **Scroll natural**: Eliminados contenedores con altura fija en editores
- 📜 **EntityTypeEditor**: Ahora usa scroll de página en lugar de scroll interno
- 📜 **EntityInstanceEditor**: Campos fluyen naturalmente con el scroll
- ✨ **Mejor UX**: Sin conflictos de scroll múltiple, navegación más fluida

### v4.0 - Editor de Entidades (Entity Management)
- 🗂️ **Sistema completo de gestión de entidades** estilo CMS
- 📝 **EntityTypeEditor**: Editor visual para crear/editar schemas de entidades
- ✏️ **EntityInstanceEditor**: Editor para crear/editar instancias con validación automática
- 🎨 **Interfaz tipo CMS**: Panel lateral con tipos, vista principal con instancias
- 🔧 **Soporte completo de tipos**: string, integer, boolean, arrays, referencias, objetos anidados
- 📋 **Valores permitidos**: Enums para campos string/integer
- 🔗 **Referencias**: Selector visual de entidades para campos de referencia
- 📦 **Objetos anidados**: Editor completo para estructuras complejas
- 🎯 **Modales reutilizables**: Componentes preparados para usar en modales
- 🔍 **Búsqueda y filtrado**: Encuentra instancias rápidamente
- 📄 **Vista previa JSON**: Ver schemas e instancias en formato JSON
- 🚀 **Responsive**: Sidebar colapsable, diseño adaptativo

### v3.5 - Funciones de Selección y Resolución de Granted
- ✅ **Funciones core de selección**: `applySelection`, `removeSelection`, `validateSelector`
- 🔄 **Resolución automática de Granted**: Las entidades granted se resuelven automáticamente
- 📋 **JSON enriquecido**: Incluye `_resolved.grantedEntities` con entidades granted resueltas
- ⚠️ **Validación en tiempo real**: Warnings y errores al seleccionar entidades
- 💾 **Persistencia de selecciones**: Las selecciones se guardan en `selectedEntities` del selector
- 🔁 **Recálculo dinámico**: Granted se recalcula automáticamente al cambiar variables

### v3.4 - Entity Type Global y Virtualización
- 🌐 **Entity Type global** al inicio del formulario
- 🎯 **Filtrado global** aplicado a Granted, Entity IDs y filtros
- 🚀 **Virtualización completa** de selectores de entidades
- 📊 **Contador de resultados** en selectores
- 🖱️ **Click en todo el campo** para abrir buscador
- ⚡ **Performance óptima** con miles de entidades

### v3.3 - UX Mejorada para el Editor
- 🎯 **Selector visual de entidades** con búsqueda en tiempo real
- 🏷️ **Tags de entidades seleccionadas** con eliminación rápida
- ⚡ **Autocompletado de variables** al escribir `@` en condiciones
- 🔍 **Filtrado inteligente** por entityType en el selector
- 📊 **Información contextual** de entidades (tipo, categoría, nivel)
- ⌨️ **Navegación por teclado** (ESC para cerrar autocompletado)
- 💡 **Hints visuales** sobre uso de variables y selectores

### v3.2 - Editor de Variables
- 🔧 **Editor de variables** integrado en el editor de selectores
- ➕ **Añadir variables** con nombre y valor numérico
- ✏️ **Editar nombre y valor** de variables existentes
- 🗑️ **Eliminar variables** del selector
- 📋 **Uso en filtros** con sintaxis `@nombreVariable`
- ⌨️ **Soporte Enter** para añadir variables rápidamente

### v3.1 - Entity Selectors Interactivos
- 🎯 **Panel de navegación lateral** con lista de ejemplos
- ✏️ **Editor completo** de selectores y filtros
- 🖱️ **Click en toda la fila** para seleccionar
- 📊 **Virtualización** con @tanstack/react-virtual
- 🔍 **Buscador automático** cuando hay >20 resultados
- 🎨 **Feedback visual** mejorado (filas oscurecidas al alcanzar máximo)
- 📋 **JSON desplegable** con configuración completa
- 🔮 **2,792 conjuros** añadidos como tipo de entidad

### v3.0 - Sistema de Rutas
- 🧭 React Router con múltiples rutas
- 🏠 Home como hub principal
- 📍 Rutas: `/`, `/spell-search`, `/entity-selectors`

### v2.0 - Compendio Completo
- 🔮 2,792 conjuros del compendio D&D 3.5
- 🚀 React Compiler habilitado
- 🎨 Tema morado oscuro personalizado
- 📄 Paginación y búsqueda inteligente
