# Ejemplos de CGE (Configuración de Gestión de Entidades)

Este directorio contiene ejemplos reales de configuraciones de gestión de entidades para D&D 3.5 y sistemas similares. El objetivo es validar que el sistema CGE puede manejar todos los casos de uso que se dan en juegos de rol.

## Estructura

```
examples/
├── schemas/                    # Definiciones de tipos de entidades
│   └── spell.schema.ts         # Schema de conjuros D&D 3.5
│
├── entities/                   # Instancias de entidades de ejemplo
│   └── spells.ts               # Conjuros de ejemplo
│
├── configs/                    # Configuraciones de gestión (CGE)
│   ├── prepared/               # Lanzadores con preparación
│   │   ├── wizard.config.ts    # Mago: libro + preparación por nivel
│   │   └── cleric.config.ts    # Clérigo: acceso total + preparación
│   │
│   ├── spontaneous/            # Lanzadores espontáneos
│   │   ├── sorcerer.config.ts  # Hechicero: conocidos limitados + slots
│   │   └── bard.config.ts      # Bardo: conocidos + slots (menos)
│   │
│   └── special/                # Sistemas especiales
│       ├── warlock.config.ts   # Warlock: invocaciones at-will + usos/día
│       └── warmage.config.ts   # Mago de guerra: acceso total a lista
│
├── states/                     # Estados de ejemplo (datos de jugador)
│   ├── wizard-level5.state.ts
│   └── sorcerer-level7.state.ts
│
└── index.ts                    # Exports centralizados
```

## Modos de Gestión Cubiertos

### PREPARED_BY_LEVEL (Preparación por Nivel)
**Clases**: Mago, Clérigo, Druida, Paladín, Explorador

Características:
- El personaje prepara conjuros específicos en slots de cada nivel
- Cada slot preparado = un uso de ese conjuro
- Se re-prepara cada día (descanso largo)

```typescript
// Ejemplo: Mago nivel 5 prepara:
// Nivel 1: Magic Missile, Magic Missile, Shield
// Nivel 2: Invisibility, Mirror Image
// Nivel 3: Fireball
```

### SPONTANEOUS (Espontáneo)
**Clases**: Hechicero, Bardo, Alma Predilecta

Características:
- Conoce un número limitado de conjuros por nivel
- Puede lanzar cualquier conocido gastando un slot del nivel
- Los conocidos no cambian fácilmente (solo al subir nivel)

```typescript
// Ejemplo: Hechicero nivel 5 conoce:
// Nivel 0: 6 conjuros (elige libremente cuál lanzar)
// Nivel 1: 4 conjuros
// Nivel 2: 2 conjuros
// Tiene X slots de cada nivel, gasta uno por lanzamiento
```

### USES_PER_ENTITY (Usos por Entidad)
**Clases**: Warlock (invocaciones), algunas aptitudes de clase

Características:
- Cada entidad tiene sus propios usos/día
- No hay slots compartidos
- Algunas pueden ser at-will (usos ilimitados)

```typescript
// Ejemplo: Warlock con invocaciones:
// Eldritch Blast: at-will (sin límite)
// Darkness: 3/día
// Fly: 1/día
```

### ALL_ACCESS (Acceso Total)
**Clases**: Mago de Guerra, algunas variantes

Características:
- Acceso a toda la lista sin "aprender"
- Puede lanzar cualquier conjuro de la lista
- Sigue usando slots por nivel

```typescript
// Ejemplo: Mago de Guerra tiene acceso a todos los conjuros
// de evocación de la lista arcana, sin necesidad de libro
```

## Integración con el Sistema de Fórmulas

Todas las configuraciones usan el sistema de fórmulas del proyecto para:

### Variables de Referencia
```typescript
// Nivel efectivo de lanzador (incluye clases de prestigio)
"@customVariable.wizard.effectiveCasterLevel"

// Modificador de característica para slots bonus
"@ability.intelligence.modifier"

// Nivel de clase específico
"@class.wizard.level"
```

### Definición Tabular de Capacidades

El sistema permite definir tablas de capacidad de forma **idéntica a como aparecen en los manuales de RPG**. Esto facilita la verificación contra el libro original y mejora la legibilidad.

```typescript
import { tableDefinitionToCapacityTable, type CapacityTableDefinition } from './wizard.config';

// Definición tabular: igual que en el PHB
const wizardSpellTableDefinition: CapacityTableDefinition = {
  rowVariable: "@customVariable.wizard.effectiveCasterLevel",
  columns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], // Niveles de conjuro
  rows: [
    // Lvl   0  1  2  3  4  5  6  7  8  9
    [1,     3, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    [2,     4, 2, 0, 0, 0, 0, 0, 0, 0, 0],
    [3,     4, 2, 1, 0, 0, 0, 0, 0, 0, 0],
    [4,     4, 3, 2, 0, 0, 0, 0, 0, 0, 0],
    [5,     4, 3, 2, 1, 0, 0, 0, 0, 0, 0],
    // ... hasta nivel 20
  ]
};

// Conversión al formato interno (CapacityTable con SwitchFormulas)
const wizardSlotCapacities = tableDefinitionToCapacityTable(wizardSpellTableDefinition);
```

**Ventajas de la definición tabular:**
- 📖 **Verificable**: Comparación directa con el manual del juego
- 👁️ **Legible**: La progresión es obvia de un vistazo
- 🔧 **Mantenible**: Cambios simples sin tocar lógica
- 🎯 **Genérica**: Sirve para conjuros, habilidades, o cualquier sistema nivel→capacidad

El sistema convierte automáticamente esta tabla en `SwitchFormula` con casos `==` para cada nivel, lo que es:
- Explícito y claro
- No depende del orden de evaluación
- Semánticamente correcto

### Slots Bonus por Característica
```typescript
// D&D 3.5: slots bonus = (modificador - nivel_conjuro + 1) si es positivo
// Nivel 1 con INT 18 (+4): 4 - 1 + 1 = 4 slots bonus de nivel 1
bonusSlotsFormula: {
  expression: "max(0, @ability.intelligence.modifier - @spellLevel + 1)"
}
```

## Cómo Usar Estos Ejemplos

1. **Para validar tipos**: Importa los schemas y valida que tus datos son correctos
2. **Para entender el sistema**: Lee los configs y states como documentación viva
3. **Para crear nuevos CGE**: Usa estos como plantilla para otras clases/sistemas
4. **Para tests**: Importa estados predefinidos en tus tests

```typescript
import { wizardConfig, wizardLevel5State } from './examples';

// Usar en cálculos
const availableSlots = calculateSlots(wizardConfig, wizardLevel5State, characterSheet);
```

## Notas sobre D&D 3.5

### Slots Bonus por Característica
En D&D 3.5, los lanzadores obtienen slots bonus basados en su característica de lanzamiento:
- Mago/Hechicero: Inteligencia/Carisma
- Clérigo/Druida: Sabiduría
- Bardo: Carisma

Fórmula: Si `modificador >= nivel_conjuro`, obtiene `floor((modificador - nivel_conjuro) / 4) + 1` slots bonus.

### Conjuros de Nivel 0 (Cantrips/Orisons)
- No gastan slots en D&D 3.5 estándar (ilimitados)
- Pero hay un número limitado de "preparados" o "conocidos"

### Clases de Prestigio
Las clases de prestigio que avanzan lanzamiento (como Arcane Trickster) incrementan `effectiveCasterLevel` sin dar nuevos conjuros conocidos.



