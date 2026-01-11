# Entity Management System - Design Notes

Notas de diseño, decisiones arquitectónicas e ideas para el futuro del sistema de gestión de entidades.

---

## Decisiones Tomadas

### Capacity Table Definition

Sistema para definir tablas de capacidad de forma idéntica a los manuales de RPG (PHB, etc.).

```typescript
const wizardSpellTable: CapacityTableDefinition = {
  rowVariable: "@customVariable.wizard.effectiveCasterLevel",
  columns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  rows: [
    // Lvl   0  1  2  3  4  5  6  7  8  9
    [1,     3, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    [2,     4, 2, 0, 0, 0, 0, 0, 0, 0, 0],
    // ...
  ]
};
```

**Ventajas:**
- Verificable contra el manual original
- Legible y mantenible
- Se convierte automáticamente a `SwitchFormula` con casos `==`

**Implementación:** `tableDefinitionToCapacityTable()` en `wizard.config.ts`

### Modos de Gestión Cubiertos

| Modo | Clases Ejemplo | Descripción |
|------|----------------|-------------|
| `PREPARED_BY_LEVEL` | Mago, Clérigo | Prepara conjuros específicos en slots por nivel |
| `SPONTANEOUS` | Hechicero, Bardo | Conocidos limitados, slots compartidos por nivel |
| `USES_PER_ENTITY` | Warlock, SLAs | Cada entidad tiene sus propios usos/día |
| `ALL_ACCESS` | Mago de Guerra | Acceso total a lista, usa slots |
| `GLOBAL_PREPARED` | Variantes | Preparación con pool global (no por nivel) |

---

## Pendiente de Implementar

### Variables de Slots Modificables por Changes

**Estado:** Diseñado, no implementado

**Problema actual:** Las fórmulas de `CapacityTable` calculan valores finales directamente. No hay variables intermedias que puedan recibir Changes.

**Solución requerida:** El código que consuma `CapacityTable` debe:

1. Evaluar las fórmulas para obtener valores base
2. Registrar esos valores como variables (ej: `@spellSlots.wizard.level3.base`)
3. Permitir que Changes de tipo `SPELL_SLOTS` (o similar) las modifiquen
4. Producir resultado final con `SourceValues` como el resto del sistema

**Flujo objetivo:**
```
CapacityTable[3] → evaluar → @spellSlots.level3.base = 2
                                      ↓
                      Changes aplicables:
                      - Item: +1 slot nivel 3 (ENHANCEMENT)
                      - Feat: +1 slot nivel 3 (UNTYPED)
                                      ↓
                      @spellSlots.level3.total = 4 (con SourceValues)
```

---

## Ideas para el Futuro

### Contextos - Sistema de Encapsulación y Alcance

**Estado:** Conceptualizado, pendiente de desarrollo

**Motivación:** Los contextos representan el siguiente paso evolutivo después del CGE, actuando como puente hacia el sistema de acciones. Proporcionan un mecanismo para encapsular ejecución con variables locales sin afectar el scope global.

**Conceptos fundamentales:**

#### Naturaleza de los Contextos
- Un contexto es una **encapsulación** (scope) que permite trabajar con variables específicas
- Las variables dentro del contexto no afectan al scope anterior/exterior/contenedor
- Es un nuevo scope donde se pueden definir y usar variables locales

#### Origen de Contextos
- **Comúnmente provienen de entidades**: contexto de ataque (arma), contexto de lanzamiento de conjuro (conjuro)
- **Pero no es requisito fundamental**: algunos contextos pueden existir sin entidad iniciadora
- Ejemplos sin entidad: tiradas de habilidad, tiradas de salvación

#### Definición de Contextos
- Sistema genérico permite definir contextos propios para juegos de rol
- Cada contexto define qué tipos de entidades requiere para funcionar
- Ejemplos:
  - Contexto "tirada de ataque": requiere obligatoriamente entidad de tipo "arma"
  - Contexto "lanzamiento de conjuro": requiere obligatoriamente propiedad "conjuro"

#### Dependencias Múltiples
- **Caso complejo**: contextos que requieren más de una entidad
- Ejemplo hipotético: contexto de "ataque a criatura" podría necesitar:
  - Arma (entidad iniciadora)
  - Criatura atacante (personaje - normalmente implícita)
  - Criatura atacada (asociada posteriormente)
- Requiere mecanismo para asociar entidades adicionales al contexto después de iniciarlo

#### Propiedades de Contexto
- Define "entity type" identificador para tipos de entidad requeridos
- Si el entity type cambia, puede romper/afectar el contexto
- Variables contextuales se definen y resuelven dentro del scope del contexto

#### Ejemplos de Contextos
```typescript
// Contexto simple: tirada de ataque
const attackContext = {
  name: "Attack Roll",
  requiredEntityTypes: ["weapon"],
  variables: ["target", "attackBonus", "damageDice"]
};

// Contexto complejo: lanzamiento de conjuro
const spellCastContext = {
  name: "Spell Casting",
  requiredEntityTypes: ["spell"],
  variables: ["target", "spellLevel", "casterLevel", "saveDC"]
};

// Contexto sin entidad: tirada de habilidad
const skillCheckContext = {
  name: "Skill Check",
  requiredEntityTypes: [], // Sin requerimientos
  variables: ["skillName", "difficulty", "circumstanceModifiers"]
};
```

**Posición en el flujo general:**
```
Entidad → CGE → Contexto → [futuro: Acciones] → Eventos
```

**Notas de implementación:**
- Los contextos serán el puente entre gestión estática (CGE) y ejecución dinámica (acciones)
- Deben mantener compatibilidad con el sistema de variables existente (@formulas)
- Posible integración con el sistema de Changes/Effects para modificadores contextuales

---

### Effect Table Definition

**Motivación:** Muchas mecánicas de RPG usan tablas que correlacionan un valor de entrada con múltiples efectos. Escribir fórmulas para cada caso es tedioso y propenso a errores.

**Ejemplo:** Bonus Spells por Ability Score (D&D 3.5)

```
Score    Mod    1st  2nd  3rd  4th  5th  6th  7th  8th  9th
12-13    +1     1    —    —    —    —    —    —    —    —
14-15    +2     1    1    —    —    —    —    —    —    —
16-17    +3     1    1    1    —    —    —    —    —    —
...
```

**Propuesta de API:**

```typescript
type EffectTableDefinition = {
  rowVariable: string;              // Variable de entrada (ej: "@ability.wisdom.modifier")
  targetVariables: string[];        // Variables afectadas (ej: ["spellSlots.1", "spellSlots.2", ...])
  bonusType: BonusType;             // Tipo de bono para stacking
  rows: EffectTableRow[];           // [valor_entrada, ...efectos]
};

const bonusSpellsTable: EffectTableDefinition = {
  rowVariable: "@ability.wisdom.modifier",
  targetVariables: ["spellSlots.1", "spellSlots.2", "spellSlots.3", /* ... */],
  bonusType: "UNTYPED",
  rows: [
    // mod   1  2  3  4  5  6  7  8  9
    [1,     1, 0, 0, 0, 0, 0, 0, 0, 0],
    [2,     1, 1, 0, 0, 0, 0, 0, 0, 0],
    [3,     1, 1, 1, 0, 0, 0, 0, 0, 0],
    [4,     1, 1, 1, 1, 0, 0, 0, 0, 0],
    // ...
  ]
};
```

**El sistema auto-generaría Changes** para cada variable objetivo basándose en la tabla.

---

### Recuperación por Eventos

**Motivación:** Diferentes recursos se recuperan en diferentes momentos:
- Slots de conjuro: descanso largo
- Maniobras (Tome of Battle): durante el combate
- Algunas habilidades: descanso corto
- Channel Energy: descanso largo

**Propuesta:** Múltiples fórmulas de recuperación, cada una asociada a eventos.

```typescript
type RecoveryDefinition = {
  event: RecoveryEvent;           // "long_rest" | "short_rest" | "encounter_end" | "round_end"
  formula: Formula;               // Cuánto recuperar (puede ser "all", un número, o fórmula)
};

type ResourceConfig = {
  // ...
  recovery: RecoveryDefinition[];
};
```

**Ejemplo:**

```typescript
const maneuverRecovery: RecoveryDefinition[] = [
  { event: "encounter_end", formula: { expression: "all" } },
  { event: "round_end", formula: { expression: "1" } }  // Recupera 1 por ronda si toma acción
];
```

---

### Slots Restringidos por Tipo

**Casos de uso:**
- Mago especialista: +1 slot **solo para conjuros de su escuela**
- Clérigo: slots de dominio **solo para conjuros de dominio**

**Posibles soluciones:**

1. **CGE separado:** Un config adicional para los slots restringidos
2. **Extensión de slots:** Añadir campo `restriction` a la definición de slots
3. **Filtro en uso:** El slot normal existe, pero solo acepta entidades que cumplan filtro

```typescript
type RestrictedSlotCapacity = {
  capacity: Formula;
  restriction?: {
    type: "jmespath";
    expression: string;  // ej: "school == 'Evocation'"
  };
};
```

---

### Power Points (Psionics)

**Diferencia fundamental:** No son slots discretos por nivel, sino un pool compartido donde cada poder tiene un costo variable.

**Características:**
- Pool total de puntos (basado en nivel + ability)
- Cada poder tiene costo base
- Se puede "augmentar" gastando más puntos
- Límite de puntos por manifestación = nivel de manifestador

**Posible modo de gestión:**

```typescript
type ManagementModePointPool = {
  type: "POINT_POOL";
  poolFormula: Formula;                    // Total de puntos
  costResolution: string;                  // Cómo obtener el costo de la entidad
  maxPerUseFormula?: Formula;              // Límite por uso
  augmentable?: boolean;                   // Si permite gastar más del costo base
};
```

**Nota:** Este es un caso complejo. Evaluar si vale la pena implementar vs. tratarlo como caso especial.

---

## Notas Adicionales

### Renombre Futuro: Changes → Effects

Se ha discutido renombrar el sistema de "Changes" a "Effects" para mayor claridad semántica.

### Entidades que No Requieren Gestión

Las habilidades "siempre activas" (stances, auras, etc.) no necesitan el sistema de gestión de entidades porque:
- No consumen recursos
- No tienen usos limitados
- Están siempre disponibles

Estas se modelan mejor como Changes/Effects permanentes en el personaje.

