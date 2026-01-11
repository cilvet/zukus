# Diseño del Sistema de Clases y Variantes

> **Estado**: En desarrollo  
> **Fecha**: 2026-01-04  
> **Última actualización**: 2026-01-04

---

## Decisiones de Diseño

### Arquitectura elegida

1. **Niveles como entidades separadas**: Cada nivel de clase (`classLevel`) es una entidad independiente, referenciada desde la clase mediante IDs.

2. **Nuevo tipo de campo `dataTable`**: Para definir progresiones tabulares (niveles, slots, etc.). Ver [dataTable-field.prd.md](./dataTable-field.prd.md).

3. **Variantes con propiedades opcionales**: Las variantes tienen las mismas propiedades que las clases, pero opcionales. Las que existen **reemplazan** las de la clase base.

4. **Referencias resueltas al elegir clase**: Las referencias se resuelven y almacenan en el personaje para soportar exportación.

---

## Tipos de Modificaciones de Variantes

Basado en el análisis de variantes del Fighter (SRD + suplementos):

| Tipo de Modificación | Descripción | Ejemplos |
|---------------------|-------------|----------|
| **Proficiencias** | Cambia armas/armaduras conocidas | Corsair, Fencer, Kensai |
| **Class Skills** | Modifica lista de habilidades de clase | Survivalist |
| **Rasgos de clase** | Añade/elimina/reemplaza features por nivel | Dirty Fighter, Alternative Class Features |
| **Bonus Feats** | Cambia qué feats son elegibles o cómo se obtienen | Corsair (lista diferente) |
| **Beneficios únicos** | Habilidades nuevas con efectos concretos | Planar Study, Darksong Knight |

---

## Entidades Propuestas

### 1. `class`

```typescript
type ClassEntity = StandardEntity & {
  // Estadísticas base
  hitDie: 4 | 6 | 8 | 10 | 12;
  babProgression: 'full' | 'medium' | 'poor';
  saves: {
    fortitude: 'good' | 'poor';
    reflex: 'good' | 'poor';
    will: 'good' | 'poor';
  };
  skillPointsPerLevel: number;
  classSkillIds: string[];
  proficiencyIds?: string[];
  
  // Niveles (dataTable con referencias a classLevel)
  levelsData: {
    [level: number]: {
      classLevelIds: string[];
    };
  };
};
```

### 2. `classLevel`

Entidad separada que define lo que ocurre en un nivel específico:

```typescript
type ClassLevelEntity = StandardEntity & {
  classId: string;
  level: number;
  providers: EntityProvider[];
};
```

### 3. `classVariant`

Todas las propiedades de `class` pero opcionales. Las que existen **reemplazan** las de la clase base:

```typescript
type ClassVariantEntity = StandardEntity & {
  // Qué clase modifica
  baseClassId: string;
  
  // Tipo de variante (para UI/filtrado)
  variantType: 'archetype' | 'alternativeFeature' | 'substitutionLevel';
  
  // Propiedades opcionales que REEMPLAZAN las de la clase base
  hitDie?: 4 | 6 | 8 | 10 | 12;
  babProgression?: 'full' | 'medium' | 'poor';
  saves?: {
    fortitude: 'good' | 'poor';
    reflex: 'good' | 'poor';
    will: 'good' | 'poor';
  };
  skillPointsPerLevel?: number;
  classSkillIds?: string[];
  proficiencyIds?: string[];
  
  // Niveles modificados (reemplazan los de la clase base)
  levelsData?: {
    [level: number]: {
      classLevelIds: string[];
    };
  };
};
```

### 4. `proficiency` (Nueva)

Entidad para competencias:

```typescript
type ProficiencyEntity = StandardEntity & {
  proficiencyType: 'weapon' | 'armor' | 'shield' | 'tool';
  
  // Para armas
  weaponCategory?: 'simple' | 'martial' | 'exotic';
  specificWeaponId?: string;
  
  // Para armaduras
  armorCategory?: 'light' | 'medium' | 'heavy';
};
```

---

## Flujo de Resolución

### Cuando el personaje sube de nivel en una clase:

1. **Obtener la clase base** por ID
2. **Obtener variantes activas** del personaje para esa clase
3. **Construir la clase efectiva**:
   - Para cada propiedad: usar la de la variante si existe, sino la de la clase base
   - Para `levelsData`: usar el del nivel de la variante si existe, sino el de la clase base
4. **Resolver los providers** del nivel efectivo
5. **Almacenar entidades resueltas** en el personaje (para exportación)

### Diagrama:

```
┌─────────────────┐     ┌─────────────────┐
│   ClassEntity   │     │ ClassVariant(s) │
│   (base)        │     │   (activas)     │
└────────┬────────┘     └────────┬────────┘
         │                       │
         └───────────┬───────────┘
                     ▼
         ┌───────────────────────┐
         │   Merge properties    │
         │   (variant overrides) │
         └───────────┬───────────┘
                     ▼
         ┌───────────────────────┐
         │   Clase Efectiva      │
         │   para nivel N        │
         └───────────┬───────────┘
                     ▼
         ┌───────────────────────┐
         │   Resolver providers  │
         │   de classLevelIds[N] │
         └───────────────────────┘
```

---

## Ejemplo: Fighter con variante Corsair

### Clase base (Fighter):

```typescript
const fighterClass: ClassEntity = {
  id: 'fighter',
  entityType: 'class',
  name: 'Fighter',
  hitDie: 10,
  babProgression: 'full',
  saves: { fortitude: 'good', reflex: 'poor', will: 'poor' },
  skillPointsPerLevel: 2,
  classSkillIds: ['climb', 'craft', 'handle-animal', 'intimidate', 'jump', 'ride', 'swim'],
  proficiencyIds: ['simple-weapons', 'martial-weapons', 'all-armor', 'shields'],
  
  levelsData: {
    1: { classLevelIds: ['fighter-1'] },
    2: { classLevelIds: ['fighter-2'] },
    // ...
  }
};
```

### Variante Corsair:

```typescript
const corsairVariant: ClassVariantEntity = {
  id: 'corsair',
  entityType: 'classVariant',
  name: 'Corsair',
  baseClassId: 'fighter',
  variantType: 'archetype',
  
  // Solo reemplaza lo que cambia
  classSkillIds: ['balance', 'climb', 'craft', 'intimidate', 'jump', 'profession-sailor', 'swim', 'tumble', 'use-rope'],
  proficiencyIds: ['simple-weapons', 'martial-weapons', 'light-armor', 'medium-armor', 'shields'],
  
  levelsData: {
    1: { classLevelIds: ['corsair-1'] }, // Reemplaza nivel 1 completo
    // Niveles no especificados: heredan de Fighter
  }
};
```

### ClassLevel del Corsair nivel 1:

```typescript
const corsairLevel1: ClassLevelEntity = {
  id: 'corsair-1',
  entityType: 'classLevel',
  name: 'Corsair Level 1',
  classId: 'fighter',
  level: 1,
  providers: [
    {
      selector: {
        id: 'corsair-bonus-feat',
        name: 'Corsair Bonus Feat',
        entityType: 'feat',
        filter: {
          type: 'AND',
          filterPolicy: 'strict',
          conditions: [
            { field: 'tags', operator: 'contains', value: 'corsairBonusFeat' }
          ]
        },
        min: 1,
        max: 1
      }
    }
  ]
};
```

---

## Trabajo Futuro

### Patrón `'...previous'` para añadir sin reemplazar

En el futuro, se implementará un patrón para **añadir** a un nivel sin reemplazarlo completamente:

```typescript
// Ejemplo futuro
levelsData: {
  3: { classLevelIds: ['...previous', 'extra-ability'] } // Añade al nivel 3
}
```

Por ahora, las variantes solo pueden **reemplazar** niveles completos.

---

## Preguntas Abiertas

1. **¿Cómo se activa una variante?**
   - ¿Selección al tomar el primer nivel de la clase?
   - ¿Puede cambiarse después?

2. **¿Pueden combinarse múltiples variantes?**
   - ¿Cómo se indica exclusión mutua?

3. **¿Dónde viven las entidades de variante?**
   - ¿Mismo compendio que la clase o separados?

---

## Próximos Pasos

1. [x] Definir tipo de campo `dataTable` - Ver PRD
2. [ ] Implementar `dataTable` en el sistema de entidades
3. [ ] Crear schemas para `class`, `classLevel`, `classVariant`
4. [ ] Implementar función de resolución (clase + variantes → clase efectiva)
5. [ ] Tests con Fighter + Corsair

