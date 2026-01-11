# Custom Variables

Las variables personalizadas permiten definir valores que se auto-crean al usar y pueden ser referenciados desde fórmulas.

## **Cómo Funcionan**

- Se **auto-definen** al crear el primer change con ese `uniqueId`
- Múltiples sources se suman respetando reglas de stacking (`bonusTypeId`)
- Están disponibles en fórmulas como `@customVariable.{uniqueId}`
- Se calculan **antes** que otros sistemas para evitar dependencias

## **Estructura**

```typescript
type CustomVariableChange = BaseChange & {
  type: 'CUSTOM_VARIABLE';
  uniqueId: string;  // Nombre de la variable
}
```

## **Ejemplo: Ataque Furtivo**

```typescript
// Rogue levels
{
  type: 'CUSTOM_VARIABLE',
  uniqueId: 'sneakAttackDiceAmount',
  formula: { expression: 'ceil(@classes.rogue.level / 2)' },
  bonusTypeId: 'BASE'
}

// Assassin levels (se suma)
{
  type: 'CUSTOM_VARIABLE',
  uniqueId: 'sneakAttackDiceAmount',
  formula: { expression: 'ceil(@classes.assassin.level / 2)' },
  bonusTypeId: 'BASE'
}

// Uso en damage
{
  type: 'DAMAGE',
  formula: { expression: '@customVariable.sneakAttackDiceAmount d6' }
}
```

## **Stacking**

```typescript
// Estos se apilan
BASE: { stacksWithSelf: true }
UNTYPED: { stacksWithSelf: true }

// Solo el mayor aplica  
ENHANCEMENT: { stacksWithSelf: false }
MORALE: { stacksWithSelf: false }
```