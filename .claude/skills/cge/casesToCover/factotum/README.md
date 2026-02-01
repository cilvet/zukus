# Factotum - Arcane Dilettante

## Estado: PENDIENTE DE IMPLEMENTAR

Requiere implementar el patron `poolPath` para pools externos compartidos.

---

## Resumen del Problema

El Factotum tiene un recurso llamado **Inspiration Points (IP)** que es compartido entre:

1. **Arcane Dilettante** (CGE): Imita spells de wizard/sorcerer, cuesta IP segun nivel
2. **Cunning Insight** (no CGE): Bonus a tiradas, cuesta IP
3. **Cunning Knowledge** (no CGE): Bonus a knowledge checks, cuesta IP
4. **Cunning Surge** (no CGE): Accion extra, cuesta IP
5. Otras habilidades de clase

El CGE solo modela Arcane Dilettante, pero necesita leer/escribir del mismo pool de IP que usan las otras habilidades.

---

## Solucion Propuesta: Pool Externo con `poolPath`

En lugar de que el CGE maneje su propio pool interno, referencia un pool externo en el personaje:

```typescript
type CGETrackConfig = {
  // ... otros campos ...

  // Pool externo compartido (nuevo)
  poolPath?: string // Ej: '@factotum.inspirationPoints'
}
```

### Comportamiento

- Si `poolPath` esta definido, el CGE lee/escribe de esa variable del personaje
- Si no esta definido, el CGE usa su pool interno normal
- El pool externo es gestionado por el sistema de clase (refresh per-encounter, cantidad base, etc.)

### Ejemplo de Configuracion

```typescript
const arcaneDilettanteTrack: CGETrackConfig = {
  trackId: 'arcane-dilettante',
  name: 'Arcane Dilettante',

  // Referencia al pool externo
  poolPath: '@factotum.inspirationPoints',

  // El pool se define en la clase, no aqui
  // pool: undefined,

  slotCosts: [
    { level: 0, cost: 1 },
    { level: 1, cost: 1 },
    { level: 2, cost: 2 },
    { level: 3, cost: 3 },
    // ...
  ],

  // Selection stage: elige X spells por dia
  dailySelection: {
    source: 'wizard-sorcerer-list',
    maxSelections: '@factotumLevel / 3', // 1 por cada 3 niveles
  }
}
```

### Pool en la Clase

```typescript
const factotumClass = {
  // ...
  resources: {
    inspirationPoints: {
      base: '@factotumLevel + @intMod',
      refresh: 'per-encounter',
    }
  }
}
```

---

## Mecanica de Arcane Dilettante

### Pool Source

**Tipo**: Lista completa de wizard/sorcerer

- Accede a toda la lista de spells arcanos
- Similar a Spirit Shaman pero con lista arcana

### Selection Stage

**Tipo**: Seleccion diaria limitada

- Una vez por dia por cada 3 niveles de Factotum, puede preparar un spell
- Solo puede lanzar esos spells durante el dia

### Coste de Uso

| Nivel Spell | Coste IP |
|-------------|----------|
| 0           | 1        |
| 1           | 1        |
| 2           | 2        |
| 3           | 3        |
| 4           | 4        |
| 5           | 5        |
| 6           | 6        |

---

## Texto Original (Dungeonscape)

> **Inspiration**: A factotum's abilities are powered by inspiration points. You have a number of inspiration points per encounter equal to your class level + your Intelligence modifier.
>
> **Arcane Dilettante**: You can mimic the spellcasting abilities of a sorcerer or wizard. Once per day per three class levels, you can prepare a spell from the sorcerer/wizard spell list.

---

## Tareas Pendientes

1. [ ] Disenar e implementar `poolPath` en CGETrackConfig
2. [ ] Implementar lectura/escritura de pool externo en CGE
3. [ ] Definir como se representa el pool de IP en la clase Factotum
4. [ ] Crear tests para validar el comportamiento compartido
