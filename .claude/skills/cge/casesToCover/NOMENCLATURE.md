# Nota sobre Nomenclatura

Los READMEs en esta carpeta han sido **actualizados** para usar la nomenclatura correcta del sistema CGE.

## Tipos Reales del Codigo

### Known (como accede a entidades)
| Tipo | Descripcion |
|------|-------------|
| `UNLIMITED` | Sin limite (libro de conjuros) |
| `LIMITED_PER_ENTITY_LEVEL` | X por nivel de entidad |
| `LIMITED_TOTAL` | X totales de cualquier nivel |
| `undefined` | Acceso directo a toda la lista |

### Resource (que consume al usar)
| Tipo | Descripcion |
|------|-------------|
| `SLOTS` | Slots por nivel de entidad |
| `POOL` | Pool de puntos compartido |
| `NONE` | Sin coste (at-will) |

### Preparation (como prepara)
| Tipo | Descripcion |
|------|-------------|
| `NONE` | Sin preparacion (espontaneo) |
| `BOUND` | Cada slot ligado a una entidad |
| `LIST GLOBAL` | Lista unica de preparados |
| `LIST PER_LEVEL` | Preparados separados por nivel |

---

## Estado de cada caso

| Caso | Known | Resource | Preparation | Estado |
|------|-------|----------|-------------|--------|
| wizard | UNLIMITED | SLOTS | BOUND | Implementado |
| sorcerer | LIMITED_PER_ENTITY_LEVEL | SLOTS | NONE | Implementado |
| cleric | undefined | SLOTS | BOUND | Implementado (2 tracks) |
| warlock | LIMITED_TOTAL | NONE | NONE | Implementado |
| dread-necromancer | LIMITED_PER_ENTITY_LEVEL | SLOTS | NONE | Config lista |
| psion | LIMITED_TOTAL | POOL | NONE | Pendiente POOL |
| tome-of-battle | LIMITED_TOTAL | NONE | LIST GLOBAL | Pendiente LIST ops |
| spirit-shaman | undefined | SLOTS | LIST PER_LEVEL | Pendiente LIST ops |
| arcanist | UNLIMITED | SLOTS | LIST PER_LEVEL | Pendiente LIST ops |
| wizard5e | UNLIMITED | SLOTS | LIST GLOBAL | Pendiente LIST ops |
| shadowcaster | - | - | - | Fuera del modelo |
| truenamer | - | - | - | Fuera del modelo |
| factotum | - | POOL externo | - | Fuera del modelo |
| binder | - | - | - | Fuera del modelo |

---

## Referencia

- `../SKILL.md` - Resumen ejecutivo
- `../docs/design.md` - Decisiones de diseno
- `../docs/architecture.md` - Arquitectura detallada
- `packages/core/core/domain/cge/types.ts` - Tipos definitivos (codigo)
