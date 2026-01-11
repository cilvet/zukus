# Plan del Sistema de Niveles

---

## Objetivo

Transformar clases y niveles de personaje de tipos hardcodeados a **entidades dinámicas** gestionadas por compendios.

---

## Fases Completadas

| Fase | Nombre | Ubicación |
|------|--------|-----------|
| 0 | Filtros con Variables | `filtering/` |
| 1 | Supresión Extendida | `suppression/` |
| 2 | Conditions en Entidades | `conditions/` |
| 3 | Sistema de Addons | `entities/` |
| 4 | EntityProvider | `providers/` |
| 6 | Funciones de Selección | `selection/` |
| 8 | Schemas de Clase (parcial) | `classSchemas/` |

---

## Decisión Clave: Almacenamiento In-Place

Se eliminó el sistema de keys compuestas (`buildEntityKey`). Las entidades se almacenan directamente en el `EntityProvider`:

```typescript
EntityProvider {
  granted?: GrantedConfig;
  selector?: Selector;
  entities?: {
    granted: T[];
    selected: T[];
  };
}
```

**Razones**:
1. Simplicidad — No hay índice central que mantener
2. Anidación natural — Cada entidad puede tener `providers` propios
3. JSON path como identificador — Durante compilación, el path ubica cada entidad

---

## Anidación de Providers

El addon `providable` permite que entidades contengan sus propios `providers`:

```
classFeature (Nivel 0)
└── provider → selector: specialization (Nivel 1)
    └── provider → selector: mastery (Nivel 2)
        └── provider → granted/selector: capstones (Nivel 3)
```

Anidación infinita soportada.

---

## Fases Pendientes

| Fase | Nombre | Dependencias |
|------|--------|--------------|
| 9 | Resolución de Niveles | 8 |
| 7 | Sistema de Requerimientos | — |
| 11 | CGE | 9, 7 |

---

## Documentación

| Archivo | Contenido |
|---------|-----------|
| `STATUS.md` | Estado actual del sistema |
| `phases/class-entities.md` | Detalle Fase 8 |
| `phases/level-resolution.md` | Detalle Fase 9 |
| `docs/CONTEXT.md` | Filosofía del sistema |
