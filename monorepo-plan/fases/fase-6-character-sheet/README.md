# Fase 6: Character Sheet Completo

**Objetivo:** Implementar todas las secciones del CharacterSheet con visualización, navegación a detalles y edición donde corresponda.

---

## ⚠️ DISCLAIMER IMPORTANTE PARA EL AGENTE

**ANTES de implementar CUALQUIER componente de esta fase:**

1. **PREGUNTA AL USUARIO sobre el diseño visual del componente**
2. **NO asumas** que el diseño debe ser igual a zukusnextmicon
3. **La referencia de zukusnextmicon es VIEJA** - solo úsala para entender la funcionalidad, NO para el diseño
4. **Muestra propuestas** o mockups de cómo podría verse el componente
5. **Espera confirmación** del usuario antes de escribir código

**Ejemplo de cómo preguntar:**
```
"Voy a implementar AbilityCard. He visto que en zukusnextmicon se muestra así:
[descripción]. ¿Quieres que lo hagamos igual o prefieres un diseño diferente?
Puedo proponer: [alternativas]"
```

**NUNCA implementes sin preguntar primero sobre el diseño.**

---

## Principios

1. **Cada sección es completa:** Incluye visualización + navegación + edición
2. **Componentes reutilizables:** Los editores de changes, búsquedas, etc. se comparten
3. **Paso a paso:** Cada sección se verifica antes de la siguiente
4. **Referencias a zukusnextmicon:** Documentadas pero adaptadas a nuestra arquitectura

---

## Estructura de la Fase

### Componentes Compartidos (Fundacionales)

Estos se crean primero porque muchas secciones los necesitan:

| Componente | Descripción | Usado por |
|------------|-------------|-----------|
| `SourceValuesView` | Desglose de fuentes de un valor | Todas las páginas de detalle |
| `ChangeForm` | Editor de changes normales | Buffs, Items, Special Features |
| `ContextualChangeForm` | Editor de contextual changes | Buffs, Ataques |
| `SpecialChangeForm` | Editor de special changes | Buffs |
| `EntitySearchModal` | Búsqueda en el compendio | Custom Entities, Equipment |
| `EntityProvider` | Selección con validación | Niveles, Custom Entities |

Ver: [00-componentes-compartidos.md](./00-componentes-compartidos.md)

---

### Secciones del Character Sheet

| # | Sección | Complejidad | Prioridad | Archivo |
|---|---------|-------------|-----------|---------|
| 1 | Abilities | Baja | Alta | [01-abilities.md](./01-abilities.md) |
| 2 | Saving Throws | Baja | Alta | [02-saving-throws.md](./02-saving-throws.md) |
| 3 | Armor Class | Baja | Alta | [03-armor-class.md](./03-armor-class.md) |
| 4 | Hit Points | Media | Alta | [04-hit-points.md](./04-hit-points.md) |
| 5 | Combat (Init + BAB) | Baja | Alta | [05-combat-basics.md](./05-combat-basics.md) |
| 6 | Attacks | Media | Alta | [06-attacks.md](./06-attacks.md) |
| 7 | Skills | Media | Media | [07-skills.md](./07-skills.md) |
| 8 | Buffs | Alta | Alta | [08-buffs.md](./08-buffs.md) |
| 9 | Equipment | Alta | Media | [09-equipment.md](./09-equipment.md) |
| 10 | Custom Entities | Media | Media | [10-custom-entities.md](./10-custom-entities.md) |
| 11 | Special Features | Media | Media | [11-special-features.md](./11-special-features.md) |
| 12 | Resources | Baja | Baja | [12-resources.md](./12-resources.md) |
| 13 | Custom Variables | Baja | Baja | [13-custom-variables.md](./13-custom-variables.md) |

---

## Orden de Implementación Recomendado

### Fase 1: Fundamentos (hacer primero)
1. **Componentes Compartidos** - Especialmente `SourceValuesView`
2. **Abilities** - Simple, valida el flujo completo
3. **Saving Throws** - Similar a Abilities
4. **Armor Class** - Introduce múltiples valores (Total/Touch/Flat-Footed)

### Fase 2: Combate
5. **Combat Basics** (Initiative + BAB)
6. **Attacks** - Más complejo, usa contextual changes

### Fase 3: Modificadores (más complejo)
7. **Buffs** - Sistema completo de modificadores, fundamental para todo
8. **Hit Points** - Usa buffs para temporal HP

### Fase 4: Exploración
9. **Skills** - Lista larga, necesita virtualización
10. **Equipment** - Búsqueda + modificadores
11. **Custom Entities** - Búsqueda + selección

### Fase 5: Avanzado
12. **Special Features**
13. **Resources**
14. **Custom Variables**

---

## Formato de Cada Sección

Cada markdown de sección incluye:

### 1. Contexto
- Qué datos se muestran
- Referencia a zukusnextmicon

### 2. Componentes a Crear
- Lista con ubicación en `@zukus/ui`
- Props esperados
- Responsabilidades

### 3. Navegación
- Flujo desde lista → detalle
- Qué se muestra en el detalle
- SourceValues

### 4. Edición
- Qué se puede editar
- Formularios necesarios
- Validaciones

### 5. Dependencias
- Componentes compartidos que necesita
- Otras secciones de las que depende

### 6. Verificación
- Checklist de funcionalidad
- Tests visuales
- Edge cases

---

## Componentes Reutilizables: Estrategia

### Cambios en múltiples lugares

Los **Changes** se editan en varios contextos:
- Buffs (changes + contextualChanges + specialChanges)
- Items de equipamiento (changes + specialChanges)
- Special Features (changes)

**Solución:** Los editores de changes son componentes standalone que reciben callbacks:

```typescript
// Ejemplo de uso en BuffForm
<ChangeForm
  changes={buff.changes}
  onChange={(newChanges) => updateBuff({ ...buff, changes: newChanges })}
/>
```

### Búsqueda de entidades

La búsqueda en el compendio se necesita en:
- Equipment (buscar armas, armaduras)
- Custom Entities (buscar hechizos, dotes)

**Solución:** `EntitySearchModal` genérico que acepta el schema a buscar:

```typescript
<EntitySearchModal
  entityType="item"
  onSelect={(item) => addToInventory(item)}
/>
```

---

## Estado Actual

- **6.1:** CharacterStore (Zustand) ✅ Completado
- **Resto:** Pendiente de implementar siguiendo esta estructura

---

## Siguiente Paso

Empezar por [00-componentes-compartidos.md](./00-componentes-compartidos.md) para tener las piezas fundamentales antes de construir las secciones.
