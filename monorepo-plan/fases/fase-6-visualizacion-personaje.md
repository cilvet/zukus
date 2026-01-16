# Fase 6: Visualización de Personaje

**Objetivo:** Mostrar datos reales de un personaje usando el core, sin base de datos.

**Prerequisitos:** Fase 5 completada (Tauri funcionando)

---

## Principio Fundamental

**Paso a paso.** Cada sub-fase se verifica antes de continuar. No avanzamos hasta que lo anterior funcione.

**Sin base de datos.** Usamos `buildCharacter()` del core para crear datos de prueba. La persistencia queda fuera del scope.

**Migración selectiva.** Solo traemos de zukusnextmicon lo que necesitamos, adaptándolo a nuestros átomos.

---

## Estructura de la Fase

| Sub-fase | Nombre | Descripción |
|----------|--------|-------------|
| 6.1 | CharacterContext | Crear contexto y mostrar datos básicos |
| 6.2 | Abilities | Sección de las 6 habilidades |
| 6.3 | Combat Basics | Iniciativa, BAB, AC |
| 6.4 | Saving Throws | Tiros de salvación |
| 6.5 | Skills | Lista de habilidades |
| 6.6 | Attacks | Lista de ataques |
| 6.7+ | Resto de secciones | (se definirán según avancemos) |

---

## Sub-fase 6.1: CharacterContext

**Objetivo:** Crear el contexto de personaje y verificar que los datos del core llegan a la UI.

### 6.1.1 Crear CharacterContext en apps/zukus/ui/

```
📁 Crear packages/ui/src/contexts/CharacterContext.tsx
```

```typescript
import { createContext, useContext, ReactNode } from 'react';
import type { CharacterSheet } from '@zukus/core/core/domain/character/calculatedSheet/sheet';
import type { CharacterBaseData } from '@zukus/core/core/domain/character/baseData/character';

type CharacterContextType = {
  characterSheet: CharacterSheet;
  baseData: CharacterBaseData;
};

const CharacterContext = createContext<CharacterContextType | null>(null);

type CharacterProviderProps = {
  children: ReactNode;
  characterSheet: CharacterSheet;
  baseData: CharacterBaseData;
};

export function CharacterProvider({ 
  children, 
  characterSheet, 
  baseData 
}: CharacterProviderProps) {
  return (
    <CharacterContext.Provider value={{ characterSheet, baseData }}>
      {children}
    </CharacterContext.Provider>
  );
}

export function useCharacterContext() {
  const context = useContext(CharacterContext);
  if (!context) {
    throw new Error('useCharacterContext must be used within CharacterProvider');
  }
  return context;
}
```

```
🔧 Actualizar packages/ui/src/contexts/index.ts
```

```typescript
export { ThemeProvider, useTheme } from './ThemeContext';
export { CharacterProvider, useCharacterContext } from './CharacterContext';
```

```
✅ Verificar: cd packages/ui && bun run typecheck
```

### 6.1.2 Exportar tipos necesarios desde @zukus/core

Verificar que `CharacterSheet` y `CharacterBaseData` están exportados. Si no, añadirlos al index.

```
🔧 Actualizar packages/core/index.ts (si es necesario)
```

```
✅ Verificar: Los tipos son importables desde @zukus/core
```

### 6.1.3 Crear personaje de prueba en la app

```
📁 Crear apps/zukus/data/testCharacter.ts
```

```typescript
import { buildCharacter } from '@zukus/core';
// Importar clases/items del SRD si están disponibles

export const testCharacterSheet = buildCharacter()
  .withName("Gorwin el Arquero")
  .withBaseAbilityScores({
    strength: 14,
    dexterity: 18,
    constitution: 14,
    intelligence: 10,
    wisdom: 12,
    charisma: 8
  })
  // .withClassLevels(fighter, 5) // cuando tengamos clases
  .buildCharacterSheet();

export const testBaseData = buildCharacter()
  .withName("Gorwin el Arquero")
  .withBaseAbilityScores({
    strength: 14,
    dexterity: 18,
    constitution: 14,
    intelligence: 10,
    wisdom: 12,
    charisma: 8
  })
  .build();
```

```
✅ Verificar: cd apps/zukus && bun run typecheck
```

### 6.1.4 Integrar contexto en la pantalla de personaje

```
🔧 Modificar apps/zukus/screens/character/CharacterScreen.native.tsx (o equivalente)
```

Envolver el contenido con `CharacterProvider` pasando los datos de prueba.

```
✅ Verificar: La app arranca sin errores
```

### 6.1.5 Mostrar datos básicos

Crear un componente simple que muestre:
- Nombre del personaje
- Las 6 habilidades con sus valores

```
👁️ Verificar: Se ven los datos correctos en pantalla
```

### Verificación de Sub-fase 6.1

- [x] `CharacterStore` (Zustand) creado y exportado desde `apps/zukus/ui/` ✅
- [x] Tipos del core son importables ✅
- [x] Personaje de prueba creado con `buildCharacter()` ✅
- [x] Store integrado en la app (native + desktop) ✅
- [x] Se muestran datos básicos (nombre + abilities) ✅
- [x] Typecheck pasa en todos los packages ✅

**Nota:** Se implementó con Zustand en lugar de Context para mejor gestión de estado y re-renders granulares.

---

## Sub-fase 6.2: Abilities Section

**Objetivo:** Crear la sección de habilidades con el estilo visual adecuado.

### 6.2.1 Crear componente AbilityCard

```
📁 Crear packages/ui/src/components/character/AbilityCard.tsx
```

Mostrar:
- Nombre de la habilidad (STR, DEX, etc.)
- Valor total
- Modificador

### 6.2.2 Crear componente AbilitiesSection

```
📁 Crear packages/ui/src/components/character/AbilitiesSection.tsx
```

Grid 3x2 con las 6 habilidades.

### 6.2.3 Integrar en la app

Reemplazar el mock actual por el componente real.

### Verificación de Sub-fase 6.2

- [ ] `AbilityCard` muestra datos correctamente
- [ ] `AbilitiesSection` muestra las 6 habilidades
- [ ] El estilo es coherente con el resto de la app
- [ ] Los datos vienen del `CharacterContext`

---

## Sub-fase 6.3: Combat Basics

**Objetivo:** Mostrar stats básicos de combate.

### Componentes a crear

- `InitiativeCard` - Valor de iniciativa
- `BABCard` - Base Attack Bonus
- `ArmorClassCard` - AC (total, touch, flat-footed)
- `CombatSection` - Contenedor de los anteriores

### Verificación de Sub-fase 6.3

- [ ] Se muestra iniciativa correctamente
- [ ] Se muestra BAB correctamente
- [ ] Se muestra AC con sus variantes
- [ ] Los valores coinciden con el cálculo del core

---

## Sub-fase 6.4: Saving Throws

**Objetivo:** Mostrar los tres tiros de salvación.

### Componentes a crear

- `SavingThrowCard` - Muestra un saving throw
- `SavingThrowsSection` - FOR, REF, WIL

### Verificación de Sub-fase 6.4

- [ ] Se muestran los 3 saving throws
- [ ] Los valores son correctos según el core

---

## Sub-fase 6.5: Skills

**Objetivo:** Mostrar la lista de habilidades.

### Componentes a crear

- `SkillRow` - Una habilidad individual
- `SkillsSection` - Lista completa con scroll

### Consideraciones

- Lista larga, necesita scroll/virtualización
- Mostrar: nombre, bonus total, si es class skill
- Opcional: filtros (all/class/trained)

### Verificación de Sub-fase 6.5

- [ ] Lista de skills visible y scrolleable
- [ ] Valores correctos según el core
- [ ] Buen rendimiento con la lista completa

---

## Sub-fase 6.6: Attacks

**Objetivo:** Mostrar la lista de ataques del personaje.

### Componentes a crear

- `AttackCard` - Un ataque individual
- `AttacksSection` - Lista de ataques

### Consideraciones

- Mostrar: nombre, bonus de ataque, daño
- Los ataques vienen de `characterSheet.attackData`

### Verificación de Sub-fase 6.6

- [ ] Lista de ataques visible
- [ ] Datos de ataque correctos
- [ ] Datos de daño correctos

---

## Sub-fases Posteriores (6.7+)

Se definirán según avancemos. Candidatos:

- HitPointsSection (barra de HP)
- BuffsSection (lista de buffs)
- EquipmentSection (inventario)
- SpellsSection (hechizos)
- ResourcesSection (recursos)
- SpecialFeaturesSection (características especiales)

---

## Referencia: Componentes de zukusnextmicon

Para consultar la implementación original:

```
zukusnextmicon/src/components/Character/
├── abilities/
│   ├── AbilitiesSection.tsx
│   ├── Abilities.tsx
│   └── AbilityScoreCard.tsx
├── armorClass/
│   ├── ArmorClassSection.tsx
│   └── ArmorClass.tsx
├── combat/
│   ├── Combat.tsx
│   ├── initiative/Initiative.tsx
│   ├── bab/Bab.tsx
│   └── attacks/
├── savingThrows/
│   ├── SavingThrowsSection.tsx
│   └── SavingThrows.tsx
├── skills/
│   ├── SkillsSection.tsx
│   └── Skills.tsx
└── context/
    └── CharacterContext.tsx
```

---

## Notas Importantes

1. **No copiar directamente** - Adaptar a nuestros átomos y estilo
2. **Sin base de datos** - Solo `buildCharacter()` por ahora
3. **Verificar cada paso** - No avanzar sin confirmar que funciona
4. **Tipos del core** - Asegurar que están exportados antes de usarlos

---

## Siguiente Fase

Una vez completada la visualización básica, las siguientes fases podrían ser:

- Fase 7: Edición de personaje (formularios, Changes)
- Fase 8: Integración con base de datos (Supabase)
- Fase 9: Sincronización offline (PowerSync)

Estas se definirán cuando llegue el momento.
