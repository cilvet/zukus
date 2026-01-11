# Estado del Sistema de Niveles

> **Última actualización**: 2026-01-04

---

## Resumen

El sistema de niveles permite definir clases, niveles de clase y aptitudes como **entidades** del sistema de compendios, en lugar de tipos hardcodeados.

---

## Sistemas Completados

### Sistema de Compendios
`core/domain/compendiums/` — Organiza entidades en packs con dependencias.

### Filtros con Variables (Fase 0)
`core/domain/levels/filtering/` — Políticas strict/permissive para condiciones dinámicas.

### Supresión Extendida (Fase 1)
`core/domain/levels/suppression/` — Entidades suprimen a otras por ID o filtro.

### Conditions en Entidades (Fase 2)
`core/domain/levels/conditions/` — Condiciones evaluadas con variables del personaje.

### Sistema de Addons (Fase 3)
`core/domain/levels/entities/` — Composición de schemas. Addons: `searchable`, `effectful`, `suppressing`, `providable`.

### EntityProvider (Fase 4)
`core/domain/levels/providers/` — Unifica granted + selector.

### Funciones de Selección (Fase 6)
`core/domain/levels/selection/` — `applySelection`, `removeSelection`, `validateSelector`.

### Schemas de Clase (Fase 8 parcial)
`core/domain/levels/classSchemas/` — Schemas para `class`, `classLevel`, `classFeature`.

---

## Decisión: Almacenamiento de Entidades

Las entidades seleccionadas/otorgadas se almacenan **in-place** dentro del `EntityProvider`:

```typescript
type EntityProvider<T> = {
  granted?: GrantedConfig;
  selector?: Selector;
  entities?: {
    granted: T[];   // Entidades otorgadas
    selected: T[];  // Entidades seleccionadas
  };
};
```

- **Sin índice central de keys** — Eliminado `buildEntityKey`
- **JSON path como key implícita** — Durante compilación, el path del provider identifica cada entidad
- **Anidación infinita** — Las entidades pueden tener sus propios `providers` (addon `providable`)

---

## En Desarrollo

### Fase 9: Resolución de Niveles
Función que recorre niveles, acumula variables, resuelve providers, aplica supresión.

---

## Pendiente

- **Fase 7**: Sistema de Requerimientos
- **Fase 11**: CGE (Configuración de Gestión de Entidades)

---

## Tests

~100 tests en `__tests__/`, todos pasando.
