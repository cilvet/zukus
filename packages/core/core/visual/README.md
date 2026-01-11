# Sistema Visual para Variables Customizadas

Este sistema proporciona una forma declarativa de definir interfaces visuales que referencian custom variables, manteniendo una separación completa de la lógica de cálculo.

## Conceptos Clave

### 🎯 Separación de Responsabilidades
- **Las interfaces visuales NO son propiedades** de las variables ni elementos internos del core
- **Son elementos custom independientes** que referencian variables por identificador
- **Completamente declarativas** - no contienen lógica de cálculo

### 📐 Sistema de Layouts
Proporciona primitivas para organizar elementos visuales:

- **Section**: Contenedor con título que agrupa elementos relacionados
- **Row**: Organiza elementos horizontalmente 
- **Column**: Organiza elementos verticalmente

### 👁️ Sistema de Views
Componentes visuales específicos para mostrar datos:

- **AttributeView**: Muestra un atributo D&D con valor principal y secundario
- *(Más tipos se pueden agregar: SkillView, SavingThrowView, etc.)*

### 🔗 Sistema de Referencias
- **Simplificado**: Referencias directas por string ID a custom variables
- **Desacoplado**: Sin objetos wrapper, solo identificadores de texto

## Estructura de Archivos

```
core/visual/
├── layouts/           # Sistema de layouts
│   ├── types.ts      # Tipos base
│   ├── section.ts    # Secciones con título
│   ├── column.ts     # Columnas verticales
│   └── row.ts        # Filas horizontales
├── views/             # Componentes visuales
│   ├── types.ts      # Tipos base para views
│   ├── attribute.ts  # View para atributos D&D
│   └── index.ts      # Exports
├── examples/          # Ejemplos de uso
│   └── layouts.ts    # Layouts de ejemplo
└── index.ts          # Export principal
```

## Ejemplos de Uso

### Atributo Simple
```typescript
import { createAttributeView } from '@core/visual';

const strengthView = createAttributeView(
  'strength-view',
  'Strength',
  'strength.score',     // Valor principal (18)
  'strength.modifier'   // Valor secundario (+4)
);
```

### Sección de Atributos (6 atributos)
```typescript
import { createSection, createRow, createColumn } from '@core/visual';

const attributesSection = createSection(
  'attributes-section',
  'Attributes',
  [
    // Fila 1: STR, DEX, CON
    createRow('row-1', [
      createColumn('str-col', [strengthView]),
      createColumn('dex-col', [dexterityView]),
      createColumn('con-col', [constitutionView])
    ]),
    // Fila 2: INT, WIS, CHA  
    createRow('row-2', [
      createColumn('int-col', [intelligenceView]),
      createColumn('wis-col', [wisdomView]),
      createColumn('cha-col', [charismaView])
    ])
  ]
);
```

### Layout Completo
```typescript
const characterSheetLayout = createSection(
  'character-sheet',
  'Character Overview',
  [
    attributesSection,        // Sección de atributos
    combatStatsSection,       // Sección de combate
    savingThrowsSection       // Sección de tiradas de salvación
  ]
);
```

## Flujo de Datos

1. **Definición**: Se define el layout usando las funciones helper
2. **Referenciación**: Los views referencian custom variables directamente por string ID
3. **Renderizado**: El sistema de UI lee el layout y resuelve las referencias de string
4. **Actualización**: Cuando las custom variables cambian, la UI se actualiza automáticamente

## Extensibilidad

### Nuevos View Types
```typescript
// Ejemplo: View para skills
export type SkillView = BaseView & {
  type: 'skill';
  skillValue: string;     // Custom variable ID
  ranks: string;          // Custom variable ID
  label: string;
};
```

### Nuevos Layout Types
```typescript
// Ejemplo: Grid layout
export type GridLayout = ContainerLayout & {
  type: 'grid';
  columns: number;
  rows: number;
};
```

Este sistema proporciona la base para construir interfaces de usuario flexibles y mantenibles para hojas de personaje de D&D 3.5.