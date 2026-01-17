# 07: Skills

**Prioridad:** Media  
**Complejidad:** Media  
**Dependencias:** `SourceValuesView`

---

## ⚠️ DISCLAIMER IMPORTANTE PARA EL AGENTE

**ANTES de implementar CUALQUIER componente:**

1. **PREGUNTA AL USUARIO sobre el diseño visual del componente**
2. **NO asumas** que el diseño debe ser igual a zukusnextmicon
3. **La referencia de zukusnextmicon es VIEJA** - solo úsala para entender la funcionalidad, NO para el diseño
4. **Muestra propuestas** o mockups de cómo podría verse
5. **Espera confirmación** del usuario antes de escribir código

**NUNCA implementes sin preguntar primero sobre el diseño.**

---

## Contexto

Lista completa de skills del personaje con bonuses calculados. Potencialmente larga (35+ skills en D&D 3.5), necesita scroll eficiente y filtros.

### Estructura de un Skill
```typescript
type Skill = {
  uniqueId: string;
  name: string;
  abilityUsed: 'strength' | 'dexterity' | ... ;
  isClassSkill: boolean;
  isTrained: boolean;
  ranks: number;
  totalBonus: number;
  sourceValues: SourceValue[];
  // Para skills con sub-skills (ej: Craft, Profession)
  parentSkillId?: string;
  subSkills?: Skill[];
}
```

### Ejemplo: Acrobatics
```
Name: Acrobatics
Ability: Dexterity
Class Skill: ✓
Ranks: 5
Total Bonus: +13

Sources:
  - Ranks: +5
  - Dexterity: +4
  - Class Skill: +3
  - Skill Focus: +3
```

### Referencia en zukusnextmicon
- `src/components/Character/skills/SkillsSection.tsx`
- `src/components/Character/skills/Skills.tsx`
- `src/components/Character/detail/SkillDetail/SkillDetail.tsx`

---

## 1. Visualización

### Componentes a crear

#### `SkillRow.tsx`
**Ubicación:** `packages/ui/src/components/character/skills/SkillRow.tsx`

**Props:**
```typescript
type SkillRowProps = {
  skill: Skill;
  onPress: () => void;
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
}
```

**UI:**
```
┌─────────────────────────────────────┐
│ ■ Acrobatics                   +13  │
│ □ Appraise                      +0  │
│ ■ Bluff                        +12  │
└─────────────────────────────────────┘
```

- **■/□:** Indica si es class skill
- **Bold:** Si tiene ranks
- **+X:** Total bonus con signo

**Interactividad:**
- Click navega al detalle
- Star icon para bookmark (opcional)

---

#### `SkillsSection.tsx`
**Ubicación:** `packages/ui/src/components/character/skills/SkillsSection.tsx`

**Responsabilidad:**
- Header con búsqueda y filtros
- Lista scrolleable/virtualizada de skills
- Integración con store

**Features:**

### 1.1 Búsqueda
```
┌──────────────────────┐
│ Search: _________    │
└──────────────────────┘
```

Filtrar por nombre (con debounce).

### 1.2 Filtros
```
[All] [Class Skills] [Trained Only]
```

Botones toggle para filtrar:
- **All:** Todas las skills
- **Class Skills:** Solo las que son class skill
- **Trained Only:** Solo las que tienen ranks > 0

### 1.3 Bookmarks (Opcional)
```
★ Bookmarked:
- Stealth
- Perception

━━━━━━━━━━━━━━━

All Skills:
...
```

Los bookmarks se guardan en localStorage para acceso rápido a skills usadas frecuentemente.

### 1.4 Parent Skills

Algunos skills tienen sub-skills (Craft, Profession, Perform):

```
▼ Craft                        -
  ├─ Alchemy                  +5
  ├─ Weaponsmithing           +3
  └─ ...
```

Click en el parent expande/colapsa las sub-skills.

**Referencia:**
- `zukusnextmicon/src/components/Character/skills/SkillsSection.tsx`
- `zukusnextmicon/src/components/Character/skills/Skills.tsx`

---

## 2. Virtualización (Rendimiento)

### Por qué es necesaria

Con 35+ skills, scroll puede ser lento si se renderizan todas a la vez.

### Solución

Usar `FlashList` o `VirtualizedList` de React Native:

```typescript
import { FlashList } from '@shopify/flash-list'

<FlashList
  data={filteredSkills}
  renderItem={({ item }) => <SkillRow skill={item} onPress={...} />}
  estimatedItemSize={50}
/>
```

**Referencia:**
- [FlashList docs](https://shopify.github.io/flash-list/)

---

## 3. Navegación a Detalle

### Componente de detalle

#### `SkillDetailPage.tsx`
**Ubicación:** `packages/ui/src/components/character/detail/SkillDetailPage.tsx`

**Ruta:** `/character/[id]/skill/[skillId]`

**Contenido:**

### 3.1 Header
- Nombre de la skill
- Ability usada (ej: "Dexterity")

### 3.2 Valor Total
```
Total Bonus: +13
```

### 3.3 Class Skill Indicator
```
[✓] Class Skill
```

### 3.4 SourceValues
```
━━━━━━━━━━━━━━━━━━━━━
Ranks:              +5
Dexterity:          +4
Class Skill:        +3
Skill Focus (feat): +3
━━━━━━━━━━━━━━━━━━━━━
```

### 3.5 Parent/Sub-skills

Si es un **parent skill** (ej: Craft):
- Muestra lista de sub-skills
- No muestra sourceValues (cada sub-skill tiene los suyos)

Si es un **sub-skill**:
- Muestra el parent
- Muestra sourceValues normalmente

**Referencia:**
- `zukusnextmicon/src/components/Character/detail/SkillDetail/SkillDetail.tsx`

---

## 4. Edición de Ranks (Futuro)

**Nota:** La edición de ranks de skills NO está en esta fase. Pertenece al **Editor de Personaje** (fase futura).

Aquí solo mostramos los valores calculados.

Para referencia futura:

#### `SkillRanksEditor.tsx`
**Ubicación:** `packages/ui/src/components/character/editor/SkillRanksEditor.tsx`

**Responsabilidad:**
- Mostrar skills con inputs para ranks
- Validar que no excede el máximo permitido
- Validar que no gasta más skill points de los disponibles

**Estado:** Implementar en fase del Editor.

---

## 5. Integración en CharacterSheet

### Ubicación en el layout

**Desktop:**
- Columna 2 (junto con Abilities)
- Posición inferior (debajo de Abilities)

**Mobile:**
- Tab "Skills" (sección 2)
- Posición inferior

---

## 6. Dependencias

### Componentes compartidos
- [x] `SourceValuesView` - Para la página de detalle

### Librerías adicionales
```json
{
  "@shopify/flash-list": "^1.6.0"
}
```

### Datos del core
```typescript
import type { Skill, SkillData } from '@zukus/core'

// Verificar exportados:
const skills = characterSheet.skills
```

---

## 7. Flujo Completo

### Buscar una skill

1. User abre la sección de Skills
2. Escribe "Ste" en la búsqueda
3. Lista se filtra mostrando solo:
   - Stealth
   - (otras que contengan "ste")
4. User borra la búsqueda
5. Lista vuelve a mostrar todas

### Filtrar por Class Skills

1. User click en botón "Class Skills"
2. Lista se filtra mostrando solo skills con `isClassSkill: true`
3. User click de nuevo (toggle off)
4. Lista vuelve a mostrar todas

### Ver detalle de skill

1. User hace click en "Stealth +15"
2. Navega a `/character/[id]/skill/stealth`
3. Ve:
   - Total: +15
   - Class Skill: ✓
   - SourceValues con desglose
4. Botón back para volver

### Skills con sub-skills

1. User ve "Craft -" (parent skill)
2. Click para expandir
3. Se muestran:
   - Alchemy +5
   - Weaponsmithing +3
4. Click en "Alchemy"
5. Navega al detalle de ese sub-skill específico

---

## 8. Consideraciones Técnicas

### Búsqueda con debounce

No buscar en cada keystroke, añadir debounce:

```typescript
const [searchQuery, setSearchQuery] = useState('')
const debouncedSearch = useDebounce(searchQuery, 300)

const filteredSkills = useMemo(() => {
  return skills.filter(skill =>
    skill.name.toLowerCase().includes(debouncedSearch.toLowerCase())
  )
}, [skills, debouncedSearch])
```

### Persistencia de filtros

Guardar el filtro activo en el store local:

```typescript
const [activeFilter, setActiveFilter] = useState<'all' | 'class' | 'trained'>(
  () => localStorage.getItem('skillsFilter') ?? 'all'
)

useEffect(() => {
  localStorage.setItem('skillsFilter', activeFilter)
}, [activeFilter])
```

### Bookmarks persistentes

Guardar bookmarks en localStorage:

```typescript
const [bookmarkedSkills, setBookmarkedSkills] = useState<string[]>(
  () => JSON.parse(localStorage.getItem('bookmarkedSkills') ?? '[]')
)
```

### Parent/Sub-skills colapsables

Mantener estado de qué parents están expandidos:

```typescript
const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set())

const toggleParent = (parentId: string) => {
  setExpandedParents(prev => {
    const next = new Set(prev)
    if (next.has(parentId)) {
      next.delete(parentId)
    } else {
      next.add(parentId)
    }
    return next
  })
}
```

---

## 9. Verificación

Antes de considerar esta sección completa:

### Visualización
- [ ] La lista de skills se muestra correctamente
- [ ] El scroll es fluido (virtualización funciona)
- [ ] Los class skills se distinguen visualmente
- [ ] Los bonuses tienen el signo correcto

### Búsqueda
- [ ] La búsqueda filtra correctamente
- [ ] Hay debounce (no busca en cada keystroke)
- [ ] Buscar y borrar funciona suavemente

### Filtros
- [ ] "All" muestra todas las skills
- [ ] "Class Skills" muestra solo las que son class skill
- [ ] "Trained Only" muestra solo las que tienen ranks > 0
- [ ] Los filtros se pueden combinar con la búsqueda

### Bookmarks (si se implementa)
- [ ] Se pueden marcar/desmarcar skills como bookmarked
- [ ] Los bookmarks se guardan entre sesiones
- [ ] Aparecen en la parte superior de la lista

### Parent/Sub-skills
- [ ] Los parent skills se muestran con indicador de expandir
- [ ] Click expande/colapsa las sub-skills
- [ ] Las sub-skills se muestran indentadas
- [ ] Click en sub-skill navega a su detalle

### Navegación
- [ ] Click en skill navega a detalle
- [ ] El detalle muestra el nombre y ability usada
- [ ] El valor total es correcto
- [ ] SourceValues muestra el desglose correcto
- [ ] Botón back funciona

### Rendimiento
- [ ] El scroll es fluido incluso con 35+ skills
- [ ] No hay lag al buscar o filtrar
- [ ] La app no se siente lenta

---

## 10. Archivos Creados

Checklist de archivos:

```
packages/ui/src/components/character/
├── skills/
│   ├── SkillRow.tsx                     [ ]
│   ├── SkillsSection.tsx                [ ]
│   ├── SkillFilters.tsx                 [ ]
│   └── index.ts                         [ ]
├── detail/
│   ├── SkillDetailPage.tsx              [ ]
│   └── index.ts (actualizar)            [ ]
└── editor/
    └── SkillRanksEditor.tsx             [ ] (fase futura)

apps/zukus/app/character/[id]/
└── skill/
    └── [skillId].tsx                    [ ]
```

---

## Siguiente Paso

Skills es una sección importante pero relativamente independiente. Una vez completada, continuar con otras secciones como [09-equipment.md](./09-equipment.md) o [10-custom-entities.md](./10-custom-entities.md) que usan búsqueda similar.
