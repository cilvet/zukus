# Sistema de Recursos

## Descripción General

El sistema de recursos permite definir y gestionar valores consumibles en los personajes (puntos de poder psiónico, usos de música de bardo, etc.) con soporte completo para bonuses, source tracking y persistencia.

## Definición de Recursos

Los recursos se definen usando `RESOURCE_DEFINITION` en `specialChanges`:

```typescript
{
  type: 'RESOURCE_DEFINITION',
  resourceId: 'bardic_music_uses',
  name: 'Bardic Music Uses',
  description: 'Daily uses of bardic music abilities',
  maxValueFormula: { expression: 'max(@class.bard.level, 1)' },
  minValueFormula: { expression: '0' },                    // Opcional, default: '0'
  initialValueFormula: { expression: '@class.bard.level' }, // Opcional, default: maxValue
  defaultChargesPerUseFormula: { expression: '1' },        // Opcional, default: '1'
  rechargeFormula: { expression: 'max(@class.bard.level, 1)' }
}
```

## Pipeline de Cálculo

1. **Extracción**: Se extraen todos los `RESOURCE_DEFINITION` de `specialFeatures`
2. **Cálculo de Propiedades**: Cada propiedad (max, min, etc.) se calcula como una `CUSTOM_VARIABLE`
3. **Bonuses**: Se buscan `CUSTOM_VARIABLE` con `uniqueId` = `{resourceId}.{property}` 
4. **Stacking**: Se aplican reglas de bonus stacking (Enhancement no stackea, Untyped sí, etc.)
5. **Current Value**: Se obtiene de `resourceCurrentValues` o se inicializa
6. **Exposición**: Se añaden variables `@resources.{resourceId}.{property}` al substitution index

## Modificación de Recursos

### Bonuses Temporales
```typescript
{
  type: 'CUSTOM_VARIABLE',
  uniqueId: 'bardic_music_uses.max',
  formula: { expression: '2' },
  bonusTypeId: 'ENHANCEMENT'
}
```

### Propiedades Modificables
- `{resourceId}.max` - Valor máximo
- `{resourceId}.min` - Valor mínimo
- `{resourceId}.defaultChargesPerUse` - Charges por uso por defecto
- `{resourceId}.rechargeAmount` - Cantidad de recarga

### Valores Persistentes
- `current` - Solo se modifica via `ICharacterUpdater` y persiste en `resourceCurrentValues`

## Variables Expuestas

Todas las propiedades se exponen como variables referenciables:

```typescript
@resources.{resourceId}.max
@resources.{resourceId}.min
@resources.{resourceId}.current
@resources.{resourceId}.defaultChargesPerUse
@resources.{resourceId}.rechargeAmount
```

## Estructura de Datos

### CalculatedResource
```typescript
{
  uniqueId: string;
  name: string;
  description?: string;
  maxValue: number;
  minValue: number;
  currentValue: number;
  defaultChargesPerUse: number;
  rechargeAmount: number;
  
  // Source tracking para cada propiedad
  maxValueSources: SourceValue[];
  minValueSources: SourceValue[];
  currentValueSources: SourceValue[];
  defaultChargesPerUseSources: SourceValue[];
  rechargeAmountSources: SourceValue[];
}
```

### ResourceCurrentValues (Persistente)
```typescript
{
  [resourceId: string]: {
    currentValue: number;
    lastUpdated: number;
  }
}
```

## Source Tracking

Cada propiedad incluye sources detalladas:
```typescript
{
  sourceUniqueId: string;    // ID del origen
  sourceName: string;        // Nombre humano-legible
  value: number;             // Valor que aporta
  bonusTypeId: string;       // Tipo de bonus
  relevant: boolean;         // Si se aplica (stacking rules)
}
```

## Gestión en Runtime

### Consumo
```typescript
// Via ICharacterUpdater
characterUpdater.consumeResource('bardic_music_uses', 2);
```

### Recarga
```typescript
characterUpdater.rechargeResource('bardic_music_uses');
characterUpdater.rechargeAllResources();
```

## Integración

- **Pipeline**: Se ejecuta último en `calculateCharacterSheet`
- **Dependencies**: Usa custom variables existentes para bonuses
- **Changes**: Se compilan desde `specialFeatures` via `compileSpecialFeatureChanges`
- **Formulas**: Soporta todas las referencias del sistema (@class.X.level, @ability.Y.modifier, etc.)


## Casos de Uso

- **Class Features**: Recursos que escalan con nivel
- **Feats**: Bonuses fijos a máximos de recursos
- **Items**: Bonuses de enhancement a recursos
- **Buffs**: Modificaciones temporales
- **Racial Features**: Bonuses raciales a tipos específicos de recursos