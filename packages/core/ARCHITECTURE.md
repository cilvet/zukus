# Arquitectura del Sistema D&D 3.5

Este documento describe la arquitectura completa del sistema de cálculo de personajes D&D 3.5, incluyendo modelos de datos, flujos de procesamiento y sistemas de modificación.

## **1. FLUJO PRINCIPAL DE DATOS**

```
CharacterBaseData → Changes Compilation → Calculation Pipeline → CharacterSheet
     (Input)      →   (Modifications)   →    (Processing)    →   (Output)
```

El sistema sigue un flujo unidireccional donde los datos base del personaje se transforman a través de un pipeline de cálculos ordenados para producir la hoja de personaje final calculada.

## **2. MODELOS DE DATOS BASE**

### **CharacterBaseData** (Input)
Estructura que contiene todos los datos de entrada del personaje:

```typescript
type CharacterBaseData = {
  name: string;
  baseAbilityData: BaseAbilitiesData;     // STR, DEX, CON, INT, WIS, CHA
  classes: CharacterClass[];              // Niveles de clase
  race?: Race;                            // Raza del personaje
  equipment: Equipment;                   // Items equipados/portados
  feats: Feat[];                         // Dotes seleccionados
  buffs: Buff[];                         // Efectos temporales activos
  sharedBuffs: Buff[];                   // Buffs compartidos
  specialFeatures?: SpecialFeature[];    // Habilidades especiales
  skills: Skills;                        // Habilidades disponibles
  skillData: CharacterSkillData;         // Rangos y modificadores
  level: CharacterLevel;                 // Datos de nivel
  resourceCurrentValues?: ResourceCurrentValues; // Estado actual de recursos
}
```

### **CharacterSheet** (Output)
Estructura que contiene todos los valores calculados del personaje:

```typescript
type CharacterSheet = {
  name: string;
  hitPoints: CalculatedHitPoints;
  abilityScores: CalculatedAbilities;
  savingThrows: CalculatedSavingThrows;
  armorClass: CalculatedArmorClass;
  baseAttackBonus: CalculatedBaseAttackBonus;
  speeds: CalculatedSpeeds;
  initiative: CalculatedInitiative;
  size: CalculatedSize;
  grapple: CalculatedGrapple;
  attackData: CalculatedAttackData;
  skills: CalculatedSkills;
  substitutionValues: Record<string, number>; // Variables disponibles
  equipment: Equipment;
  level: CharacterLevel;
  specialFeatures: SpecialFeature[];
}
```

## **3. SISTEMA DE CAMBIOS (CHANGES)**

Los "Changes" son la unidad fundamental de modificación en el sistema. Representan cualquier modificación a las estadísticas base del personaje.

### **Tipos de Changes**
```typescript
enum ChangeTypes {
  ABILITY_SCORE = "ABILITY_SCORE",       // Modificaciones a atributos
  AC = "AC",                             // Clase de Armadura
  SAVING_THROW = "SAVING_THROW",         // Tiradas de salvación
  SKILL = "SKILL",                       // Habilidades individuales
  BAB = "BAB",                           // Bonificador base de ataque
  INITIATIVE = "INITIATIVE",             // Iniciativa
  SPEED = "SPEED",                       // Velocidades
  ATTACK_ROLLS = "ATTACK_ROLLS",         // Bonos a ataques
  DAMAGE = "DAMAGE",                     // Bonos a daño
  SIZE = "SIZE",                         // Tamaño de criatura
  CUSTOM_VARIABLE = "CUSTOM_VARIABLE",   // Variables personalizadas
  RESOURCE_DEFINITION = "RESOURCE_DEFINITION" // Definición de recursos
}
```

### **Estructura Base de Change**
```typescript
type BaseChange = {
  formula: Formula;                      // Expresión matemática
  bonusTypeId: BonusTypes;              // Tipo de bonus (apilamiento)
  type: ChangeTypes;                    // Qué estadística afecta
  conditions?: Condition[];             // Cuándo aplica
}
```

### **Changes Contextualizados**
Durante la compilación, los changes se enriquecen con información de origen:

```typescript
type ContextualizedChange<T extends Change> = T & {
  originId: string;                     // ID del origen (feat, item, etc.)
  originType: string;                   // Tipo de origen
  name: string;                         // Nombre para mostrar
}
```

## **4. PROCESO DE COMPILACIÓN DE CAMBIOS**

### **Fuentes de Changes**
El sistema recopila changes de múltiples fuentes:

```typescript
function compileContextualizedChanges(baseData: CharacterBaseData) {
  const changes = [
    ...compileRaceChanges(baseData),      // Bonos raciales
    ...compileClassFeatureChanges(baseData), // Habilidades de clase
    ...compileFeatChanges(baseData),      // Dotes
    ...compileItemChanges(baseData),      // Equipamiento
    ...compileBuffChanges(baseData),      // Efectos temporales
  ];
  return changes;
}
```

### **Agrupación por Tipo**
Los changes se agrupan por categoría para facilitar el procesamiento:

```typescript
type CharacterChanges = {
  abilityChanges: ContextualizedChange<AbilityScoreChange>[];
  skillChanges: ContextualizedChange<SingleSkillChange>[];
  acChanges: ContextualizedChange<ArmorClassChange>[];
  initiativeChanges: ContextualizedChange<InitiativeChange>[];
  babChanges: ContextualizedChange<BaseAttackBonusChange>[];
  savingThrowChanges: ContextualizedChange<SavingThrowChange>[];
  attackChanges: ContextualizedChange<AttackChange>[];
  // ... más tipos
}
```

## **5. PIPELINE DE CÁLCULO ORDENADO**

El cálculo sigue un orden específico para asegurar que las dependencias se resuelvan correctamente:

```typescript
const calculationFunctions = [
  getCalculatedSize,           // 1. Tamaño (afecta muchas cosas)
  getCalculatedAbilityScores, // 2. Atributos (base para otros cálculos)
  getCalculatedInitiative,    // 3. Iniciativa
  getCalculatedHitPoints,     // 4. Puntos de golpe
  getCalculatedBaseAttackBonus, // 5. BAB
  getCalculatedSavingThrows,  // 6. Tiradas de salvación
  getCalculatedArmorClass,    // 7. Clase de Armadura
  getCalculatedSkills,        // 8. Habilidades
];
```

### **Patrón de Función de Cálculo**
Cada función sigue el mismo patrón:

1. Recibe `baseData`, `substitutionIndex`, `changes`
2. Calcula su parte específica del personaje
3. Actualiza el `substitutionIndex` con nuevos valores
4. Retorna campos calculados + index actualizado

## **6. SISTEMA DE FÓRMULAS**

### **Estructura de Formula**
```typescript
type Formula = {
  expression: string;                    // Expresión matemática
  substitutionData?: SubstitutionData;   // Variables para sustituir
  extraData?: Record<string, any>;       // Metadata adicional
}
```

### **Capacidades de Fórmulas**
- **Operaciones**: `+`, `-`, `*`, `/`, `()`, `min()`, `max()`, `floor()`, `ceil()`
- **Dados**: `1d6`, `3d8kh2`, `(@level)d4`
- **Variables**: `@ability.strength.modifier`, `@classes.bard.level`, `@customVariable`

### **Limitaciones Importantes**
- Sin lógica condicional (usar `conditions` en Changes)
- Sin comparaciones (usar `conditions`)
- Solo operaciones matemáticas, no strings

### **Ejemplos de Fórmulas**
```typescript
// Bonificador de fuerza
{ expression: '@ability.strength.modifier' }

// Usos de Canción bárdica por día
{ expression: '@classes.bard.level' }

// Daño de ataque furtivo
{ expression: 'ceil(@classes.rogue.level / 2) d6' }

// Máximo entre dos valores
{ expression: 'max(@ability.strength.modifier, 1)' }
```

## **7. SISTEMA DE VARIABLES Y SUBSTITUCIÓN**

### **SubstitutionIndex** (Variables Disponibles)
El sistema mantiene un índice de todas las variables disponibles para uso en fórmulas:

```typescript
type SubstitutionIndex = Record<string, number>

// Ejemplo:
{
  "ability.strength.modifier": 3,
  "classes.fighter.level": 5,
  "bab.total": 5,
  "customVariable.sneakAttackDice": 3
}
```

### **Proceso de Substitución**
```typescript
// Formula: "@ability.strength.modifier + @classes.fighter.level"
// Con index: { "ability.strength.modifier": 3, "classes.fighter.level": 5 }
// Resultado: "3 + 5" = 8
```

### **Variables Personalizadas**
El sistema permite definir variables personalizadas que se auto-crean:

```typescript
type CustomVariableChange = BaseChange & {
  type: 'CUSTOM_VARIABLE';
  variable: string;  // ej: "sneakAttackDiceAmount"
}

// Ejemplo de uso:
const sneakAttack: CustomVariableChange = {
  type: 'CUSTOM_VARIABLE',
  variable: 'sneakAttackDiceAmount',
  formula: { expression: 'ceil(@classes.rogue.level / 2)' }
}
```

## **8. BONUS STACKING Y SOURCE VALUES**

### **Tipos de Bonus**
El sistema implementa las reglas de apilamiento de D&D 3.5:

```typescript
type BonusType = {
  name: string;
  uniqueId: string;
  stacksWithSelf: boolean;  // Regla de apilamiento
}

// Ejemplos de comportamiento:
ENHANCEMENT: { stacksWithSelf: false },  // Solo el mayor se aplica
UNTYPED: { stacksWithSelf: true },       // Todos se apilan
DODGE: { stacksWithSelf: true },         // Todos se apilan
MORALE: { stacksWithSelf: false },       // Solo el mayor se aplica
```

### **Source Values** (Trazabilidad)
Cada valor calculado incluye información completa sobre su composición:

```typescript
type SourceValue = {
  value: number;
  bonusType: string;
  relevant: boolean;        // Si se aplicó o fue supersedido
  name: string;            // Nombre del origen
  // ... datos del change original preservados
}

// Ejemplo de AC = 18:
{
  total: 18,
  sourceValues: [
    { value: 10, bonusType: 'BASE', relevant: true, name: 'Base AC' },
    { value: 4, bonusType: 'ARMOR', relevant: true, name: 'Chain Mail' },
    { value: 2, bonusType: 'DEXTERITY', relevant: true, name: 'Dex Modifier' },
    { value: 2, bonusType: 'DEFLECTION', relevant: true, name: 'Ring of Protection' },
    { value: 1, bonusType: 'DEFLECTION', relevant: false, name: 'Lesser Ring' } // Supersedido
  ]
}
```

## **9. CHANGES CONTEXTUALES**

Para modificaciones situacionales que el usuario puede activar/desactivar:

### **Estructura Base**
```typescript
type AttackContextualChange = {
  type: 'attack';
  name: string;                         // "Flanking", "Power Attack"
  appliesTo: 'melee' | 'ranged' | 'both';
  available: boolean;                   // Prerequisites met
  optional: boolean;                    // Can be toggled
  variables: ContextualVariable[];      // User-configurable
  changes: Change[];                    // Changes to apply
}
```

### **Variables Contextuales**
Permiten modificaciones configurables por el usuario:

```typescript
type ContextualVariable = {
  name: string;          // "Power Attack Points"
  identifier: string;    // "powerAttackPoints" (for formulas)
  min: number;          // 1
  max: number;          // 5
}

// Ejemplo: Power Attack
const powerAttack: AttackContextualChange = {
  name: 'Power Attack',
  variables: [
    {
      name: 'Power Attack Points',
      identifier: 'powerAttackPoints',
      min: 1,
      max: 5
    }
  ],
  changes: [
    {
      type: 'ATTACK_ROLLS',
      formula: { expression: '-@powerAttackPoints' }
    },
    {
      type: 'DAMAGE',
      formula: { expression: '@powerAttackPoints * 2' }
    }
  ]
}
```

## **10. SISTEMA DE RECURSOS (EN DESARROLLO)**

### **Estructura Propuesta**
```typescript
type RechargeTimeConfig = {
  timeSpan: 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years';
  amount: number;  // típicamente 1, pero podría ser 3 días, 2 semanas, etc.
}

type ResourceDefinitionChange = BaseChange & {
  type: 'RESOURCE_DEFINITION';
  resourceId: string;                   // "kiPool", "bardSong"
  name: string;                         // "Ki Pool", "Bardic Music"
  maxValue: string;                     // Se convierte en variable automáticamente
  minValue?: string;                    // Se convierte en variable automáticamente
  rechargeTime?: RechargeTimeConfig;    // { timeSpan: "days", amount: 1 }
  autoRechargeOnEventIds?: string[];    // ["8_hour_rest", "combat_end"]
  // rechargeFormula es siempre "default" (recarga al máximo)
}
```

### **Eventos de Recarga**
```typescript
// Eventos básicos
"8_hour_rest"     // Descanso completo
"new_day"         // Cambio de día
"combat_start"    // Inicio de combate
"combat_end"      // Fin de combate
"turn_start"      // Inicio del turno
"turn_end"        // Fin del turno
"level_up"        // Subir de nivel

// Eventos situacionales (futuro)
"critical_hit"    // Hacer un golpe crítico
"saving_throw_success" // Éxito en tirada de salvación
"damage_taken"    // Recibir daño
```

## **11. FLUJO COMPLETO DE EJEMPLO**

```
1. CharacterBaseData tiene Fighter 5
   ↓
2. compileClassFeatureChanges() encuentra bonus BAB de Fighter
   ↓
3. Change creado: { 
     type: "BAB", 
     formula: "@classes.fighter.level", 
     bonusType: "BASE" 
   }
   ↓
4. getCalculatedBaseAttackBonus() procesa el change
   ↓
5. Substitución: "@classes.fighter.level" → "5"
   ↓
6. Resultado calculado: BAB = 5
   ↓
7. SubstitutionIndex actualizado: { "bab.total": 5 }
   ↓
8. La siguiente función puede usar "@bab.total" en sus fórmulas
```

## **12. PRINCIPIOS DE DISEÑO**

### **Sistema Emergente**
- Las funcionalidades emergen de la combinación de sistemas generales
- Evita lógica hardcodeada cuando es posible
- Permite flexibilidad para reglas de diseño variadas

### **Separación Funcional**
- **Base Data**: Datos de entrada del personaje
- **Calculated Sheet**: Datos derivados y calculados
- Estricta separación entre input y output

### **Trazabilidad Completa**
- Cada valor calculado incluye sus Source Values
- Muestra qué bonos se aplicaron y cuáles fueron ignorados
- Identifica el origen de cada modificador

### **Determinismo**
- El cálculo es determinista (excepto fórmulas con dados)
- Los resultados son consistentes y reproducibles
- Las dependencias se resuelven en orden correcto

Este sistema proporciona un motor de cálculo completo y auditable para personajes de D&D 3.5, con soporte completo para las reglas complejas de apilamiento de bonos y modificaciones condicionales del sistema. 