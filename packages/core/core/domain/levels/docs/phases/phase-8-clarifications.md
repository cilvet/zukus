# Fase 8: ClassDefinition (D&D 3.5) - Aclaraciones

> Aclaraciones obtenidas durante el refinamiento de requisitos.

---

## Objetivo de la Fase

Definir la estructura de configuración de niveles de clase usando EntityProviders, con selectores que ya pueden contener selecciones del usuario.

---

## Aclaraciones Confirmadas

### Estructura de ClassLevelDefinition
**Decisión**: Un nivel de clase es simplemente una colección de EntityProviders.

```typescript
type ClassLevelDefinition = {
  classId: string;           // "fighter", "rogue", etc.
  level: number;             // 1, 2, 3... nivel en esa clase
  features: EntityProvider[];  // Todo lo que el nivel proporciona
}
```

**Razón**: Máxima configurabilidad. Todo (granted features, selecciones, features inyectadas) se modela como EntityProvider.

---

### Features inyectadas como EntityProvider
**Decisión**: Las features inyectadas por arquetipos NO son un campo especial hardcodeado.

**Implementación**: Son un EntityProvider de tipo `granted` con filtro que busca entidades con `addedAtClassLevel` apropiado.

**Ejemplo**:
```typescript
const rogueLevel3: ClassLevelDefinition = {
  classId: "rogue",
  level: 3,
  features: [
    // Feature fija
    { granted: { specificIds: ["uncanny-dodge"] } },
    
    // Selección de talento (CON selecciones del usuario guardadas)
    { 
      selector: { 
        id: "rogue-talent", 
        name: "Rogue Talent",
        min: 1,
        max: 1,
        selectedEntities: {  // Las selecciones viven aquí
          "fast-hands": { id: "fast-hands", ... }
        }
      } 
    },
    
    // Features inyectadas (arquetipos)
    { 
      granted: {
        filter: {
          type: "AND",
          conditions: [
            { field: "addedAtClassLevel", operator: "contains", value: "rogue.3" }
          ]
        }
      }
    }
  ]
}
```

**Ventaja**: No hay lógica especial para arquetipos; es solo configuración.

---

### Features inyectadas automáticamente en todos los niveles
**Decisión CRÍTICA**: TODAS las clases en TODOS sus niveles deben incluir automáticamente un EntityProvider granted con filtro para features inyectadas.

**Razón**: Permite que variantes de clase, arquetipos, y contenido de compendios se añadan a clases específicas sin modificar la definición de la clase.

**Implementación**:
```typescript
// Campo en entidades para declarar dónde se añaden
type InjectableEntity = {
  addedAtClassLevel?: string[];  // ["rogue.1", "rogue.3", "fighter.2"]
}

// TODOS los niveles de TODAS las clases incluyen automáticamente:
const autoInjectedProvider: EntityProvider = {
  granted: {
    filter: {
      type: 'AND',
      filterPolicy: 'strict',
      conditions: [
        { field: 'addedAtClassLevel', operator: 'contains', value: `${classId}.${level}` }
      ]
    }
  }
};
```

**Ejemplo completo**:
```typescript
// 1. Arquetipo Scout definido como entidad en un compendio
const scoutArchetype = {
  id: 'scout-archetype',
  entityType: 'archetype',
  name: 'Scout',
  compendiumId: 'advanced-players-guide',
  
  // Declara en qué niveles se añade
  addedAtClassLevel: ['rogue.1', 'rogue.3'],
  
  // Suprime aptitudes originales
  suppression: [{
    scope: 'applied',
    ids: ['trapfinding'],
    reason: 'Scout replaces trapfinding with enhanced mobility'
  }],
  
  // Proporciona sus propios cambios
  effects: [
    { type: 'SPEED', bonusTypeId: 'UNTYPED', formula: { expression: '10' } }
  ]
};

// 2. Definición de Rogue (SIN mencionar Scout)
const rogueLevel1: ClassLevelDefinition = {
  classId: 'rogue',
  level: 1,
  features: [
    { granted: { specificIds: ['trapfinding', 'sneak-attack-1d6'] } },
    
    // AÑADIDO AUTOMÁTICAMENTE por el sistema:
    {
      granted: {
        filter: {
          conditions: [
            { field: 'addedAtClassLevel', operator: 'contains', value: 'rogue.1' }
          ]
        }
      }
    }
  ]
};

// 3. Si el jugador selecciona Scout en nivel 1:
// - Scout se añade automáticamente (granted con filtro lo encuentra)
// - Scout suprime 'trapfinding'
// - Resultado final: Sneak Attack + Scout (sin trapfinding)
```

**Ventajas**:
- ✅ Las clases base no necesitan conocer variantes futuras
- ✅ Los compendios pueden añadir contenido a clases existentes
- ✅ El sistema de supresión maneja reemplazos automáticamente
- ✅ Contenido modular y desacoplado

**Capa de abstracción**:
Crear función helper que añada automáticamente este provider a cada nivel:
```typescript
function addAutoInjectionToClass(classDef: ClassDefinition): ClassDefinition {
  return {
    ...classDef,
    levels: classDef.levels.map(level => ({
      ...level,
      features: [
        ...level.features,
        {
          granted: {
            filter: {
              conditions: [
                { 
                  field: 'addedAtClassLevel', 
                  operator: 'contains', 
                  value: `${level.classId}.${level.level}` 
                }
              ]
            }
          }
        }
      ]
    }))
  };
}
```

---

### Capa de abstracción por sistema de juego
**Decisión**: Habrá una capa por encima que añada automáticamente ciertos EntityProviders.

**Ejemplo D&D 3.5**: Todos los niveles de todas las clases incluyen automáticamente el EntityProvider de features inyectadas. El usuario no tiene que configurarlo manualmente para cada clase.

**Esto no es parte de esta fase** — se implementará después como utilidad de configuración.

---

### Estructura de ClassDefinition (clase completa)
```typescript
type ClassDefinition = {
  id: string;
  name: string;
  description?: string;
  hitDie?: number;           // d8, d10, etc.
  skillPointsPerLevel?: number;
  babProgression?: 'full' | 'medium' | 'poor';
  saves?: {
    fort: 'good' | 'poor';
    ref: 'good' | 'poor';
    will: 'good' | 'poor';
  };
  levels: ClassLevelDefinition[];  // Array donde índice+1 = nivel
}
```

**Decisión sobre niveles**: Array donde el índice+1 = nivel. Es decir, `levels[0]` es nivel 1.

---

### Los selectores ya tienen selecciones
**Decisión**: Los selectores en los niveles de clase ya contienen las entidades seleccionadas por el usuario en `selectedEntities`.

**Razón**: Usa Fase A (Funciones de Selección).

---

## Preguntas Pendientes

### P1: ¿Qué metadata adicional incluir en ClassDefinition? ✅ DECIDIDO
**Decisión**: Incluir todas las metadata que existen actualmente en el sistema de clases (`CharacterClass`).

**Campos del sistema actual**:
- `name` - Nombre de la clase
- `uniqueId` / `id` - Identificador único
- `hitDie` - Tipo de dado de golpe
- `baseSavesProgression` / `saves` - Progresión de salvaciones
- `baseAttackBonusProgression` / `babProgression` - Progresión de BAB
- `description` - Descripción de la clase
- `sourceBook` - Libro fuente (opcional)
- `createdBy` - Creador (opcional)
- `spellCasting` - Si tiene lanzamiento de conjuros
- `spellCastingAbilityUniqueId` - Atributo para conjuros (opcional)
- `allSpellsKnown` - Si conoce todos los conjuros (opcional)
- `spellsPerDayProgression` - Progresión de conjuros por día (opcional)
- `spellsKnownProgression` - Progresión de conjuros conocidos (opcional)
- `spellCastingType` - Tipo de lanzamiento (opcional)
- `classSkills` - Lista de class skills (opcional)
- `skillPointsPerLevel` - Puntos de skill por nivel

**Nota**: Ver `core/domain/class/class.ts` para referencia completa del sistema actual.

---

### P2: ¿Cómo se manejan las class skills? ✅ DECIDIDO
**Decisión**: Array de IDs de strings: `classSkills: string[]`

**Ejemplo**:
```typescript
classSkills: ['acrobatics', 'stealth', 'disable-device']
```

**Razón**: 
- Simple y directo
- Compatible con sistema futuro donde skills serán entidades (los IDs referenciarán entidades)
- Fácil de validar y usar en filtros

**Nota**: Ver `core/domain/levels/docs/skills-system.md` para diseño completo del sistema de skills.

---

### P3: ¿Los niveles de clase se guardan en el personaje o se referencian? ✅ CONFIRMADO
**Decisión confirmada**: El personaje tiene copias de ClassLevelDefinition con los selectores que ya contienen las selecciones.

---

## Entregables

### C.1 - Tipo ClassLevelDefinition
```typescript
type ClassLevelDefinition = {
  classId: string;
  level: number;
  features: EntityProvider[];
}
```

### C.2 - Tipo ClassDefinition
```typescript
type ClassDefinition = {
  id: string;
  name: string;
  description?: string;
  hitDie?: number;
  skillPointsPerLevel?: number;
  babProgression?: 'full' | 'medium' | 'poor';
  saves?: {
    fort: 'good' | 'poor';
    ref: 'good' | 'poor';
    will: 'good' | 'poor';
  };
  classSkills?: string[];
  levels: ClassLevelDefinition[];
}
```

### C.3 - Ejemplos de clases
- Fighter con bonus feats
- Rogue con selección de talents

---

## Casos de Uso a Cubrir (Tests)

### Caso 1: Clase simple con granted features
```typescript
const fighter: ClassDefinition = {
  id: 'fighter',
  name: 'Fighter',
  hitDie: 10,
  babProgression: 'full',
  saves: { fort: 'good', ref: 'poor', will: 'poor' },
  levels: [
    {
      classId: 'fighter',
      level: 1,
      features: [
        { granted: { specificIds: ['weapon-proficiency-martial'] } }
      ]
    }
  ]
};
```

### Caso 2: Clase con selector (con selecciones)
```typescript
const rogue: ClassDefinition = {
  id: 'rogue',
  name: 'Rogue',
  hitDie: 6,
  levels: [
    {
      classId: 'rogue',
      level: 1,
      features: [
        { granted: { specificIds: ['sneak-attack-1d6'] } }
      ]
    },
    {
      classId: 'rogue',
      level: 2,
      features: [
        {
          selector: {
            id: 'rogue-talent-2',
            name: 'Rogue Talent',
            entityIds: ['fast-hands', 'quick-disable', 'trap-sense'],
            min: 1,
            max: 1,
            selectedEntities: {
              'fast-hands': { id: 'fast-hands', name: 'Fast Hands', ... }
            }
          }
        }
      ]
    }
  ]
};
```

### Caso 3: Features inyectadas por arquetipos
```typescript
const rogueLevel3: ClassLevelDefinition = {
  classId: 'rogue',
  level: 3,
  features: [
    { granted: { specificIds: ['uncanny-dodge'] } },
    {
      granted: {
        filter: {
          type: 'AND',
          conditions: [
            { field: 'addedAtClassLevel', operator: 'contains', value: 'rogue.3' }
          ]
        }
      }
    }
  ]
};
```

---

## Archivos a Crear

- `core/domain/levels/classes/types.ts`
- `core/domain/levels/classes/examples/fighter.ts`
- `core/domain/levels/classes/examples/rogue.ts`
- `core/domain/levels/classes/index.ts`
- `core/domain/levels/__tests__/classes/classDefinition.spec.ts`
- `core/domain/levels/__tests__/classes/examples.spec.ts`

---

## Criterios de Aceptación

- [ ] Se puede definir una clase completa con metadata
- [ ] Cada nivel tiene sus EntityProviders
- [ ] Los selectores pueden contener selecciones (usa Fase A)
- [ ] Ejemplos de Fighter y Rogue funcionan
- [ ] Tests validan estructura de classes
- [ ] Features inyectadas se modelan como granted con filtro

---

## Dependencias

**Requiere**:
- Fase A completada (Funciones de Selección con selectedEntities) ✅
- Fase 4 completada (EntityProvider) ✅

**Proporciona**:
- Tipos `ClassLevelDefinition` y `ClassDefinition` usados en Fase D (Resolución)

