# Componentes Compartidos

Componentes reutilizables del Visual Playground. Estos componentes están diseñados para ser usados en múltiples páginas y contextos.

## Componentes Disponibles

### EntitySelector

Selector de entidades con búsqueda virtualizada, soporte para múltiples selecciones y badges visuales.

#### Props

| Prop | Tipo | Requerido | Default | Descripción |
|------|------|-----------|---------|-------------|
| `selectedIds` | `string[]` | Sí | - | IDs de entidades seleccionadas |
| `onChange` | `(ids: string[]) => void` | Sí | - | Callback cuando cambia la selección |
| `entities` | `EntityOption[]` | Sí | - | Lista de entidades disponibles |
| `entityType` | `string` | No | - | Filtrar por tipo de entidad |
| `multiple` | `boolean` | No | `true` | Permitir múltiples selecciones |
| `placeholder` | `string` | No | `'Buscar entidades...'` | Texto placeholder |
| `maxHeight` | `number` | No | `320` | Altura máxima del dropdown (px) |

#### Tipo EntityOption

```typescript
type EntityOption = {
  id: string
  name: string
  entityType: string
  description?: string
  category?: string
  level?: number
  school?: string
}
```

#### Ejemplo de uso

```tsx
import { EntitySelector, type EntityOption } from '@/components/shared'

const entities: EntityOption[] = [
  { id: 'feat-1', name: 'Power Attack', entityType: 'feat', category: 'combat' },
  { id: 'feat-2', name: 'Cleave', entityType: 'feat', category: 'combat' },
]

function MyComponent() {
  const [selected, setSelected] = useState<string[]>([])

  return (
    <EntitySelector
      selectedIds={selected}
      onChange={setSelected}
      entities={entities}
      entityType="feat"
      placeholder="Buscar feats..."
    />
  )
}
```

#### Características

- Búsqueda en tiempo real por nombre
- Virtualización con `@tanstack/react-virtual` para listas grandes (2000+ items)
- Badges visuales para entidades seleccionadas con botón de eliminar
- Muestra metadata contextual (categoría, nivel, escuela)
- Filtrado automático por `entityType`
- Hover y cursor correctos
- Click en cualquier parte del campo para abrir
- Contador de resultados

## Uso en el Proyecto

### En EntityInstanceEditor

El `EntitySelector` se usa para campos de tipo `reference`:

```tsx
// Cuando un campo tiene type: 'reference' y referenceType: 'feat'
// se renderiza automáticamente con EntitySelector
<EntitySelector
  selectedIds={refs}
  onChange={(ids) => onChange(ids)}
  entities={availableEntities}
  entityType={field.referenceType}
/>
```

### En EntitySelectorsPage

Se crea un wrapper que pasa `testEntities` convertido al formato `EntityOption`:

```tsx
const testEntitiesAsOptions: EntityOption[] = testEntities.map(e => ({
  id: e.id,
  name: e.name,
  entityType: e.entityType,
  // ...
}))

function EntitySelector(props) {
  return (
    <SharedEntitySelector
      {...props}
      entities={testEntitiesAsOptions}
    />
  )
}
```

## Añadir Nuevos Componentes

1. Crear el componente en `/components/shared/NuevoComponente.tsx`
2. Exportar desde `/components/shared/index.ts`
3. Documentar en este README
4. Usar siempre tipos explícitos para props
5. No depender de datos globales (recibir todo por props)

## Principios de Diseño

1. **Props explícitas**: Recibir todos los datos necesarios por props, no acceder a estado global
2. **Tipos exportados**: Exportar tipos de props para que otros componentes puedan usarlos
3. **Sin dependencias de página**: Los componentes no deben importar nada específico de una página
4. **Estilos consistentes**: Usar clases de shadcn/ui y Tailwind consistentes con el resto del proyecto
5. **Accesibilidad**: Cursores, hover states, focus rings correctos

