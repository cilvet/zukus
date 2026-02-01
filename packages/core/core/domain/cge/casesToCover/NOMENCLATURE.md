# Nota sobre Nomenclatura

Los READMEs en esta carpeta usan nomenclatura de exploracion inicial que **NO corresponde** con los tipos finales implementados.

## Mapeo de terminos

| En estos READMEs | Tipo real en codigo |
|------------------|---------------------|
| GROWING_COLLECTION | `known: { type: 'UNLIMITED' }` |
| CURATED_SELECTION | `known: { type: 'LIMITED_*' }` |
| FULL_LIST_ACCESS | `known: undefined` |
| PREPARED_VANCIAN | `preparation: { type: 'BOUND' }` |
| SPONTANEOUS_KNOWN_LIMITED | `preparation: { type: 'NONE' }` + known limitado |
| DAILY_SLOTS | `preparation: { type: 'BOUND' }` |
| DAILY_LIST | `preparation: { type: 'LIST' }` |
| SLOTS_PER_ENTITY_LEVEL | `resource: { type: 'SLOTS' }` |
| UNIFIED_POOL | `resource: { type: 'POOL' }` |
| PER_PREPARED_ENTITY | **NO EXISTE** - error conceptual |

## Referencia correcta

Para la documentacion actualizada, consultar:
- `.claude/skills/cge/SKILL.md` - Resumen ejecutivo
- `.claude/skills/cge/docs/design.md` - Decisiones de diseno
- `.claude/skills/cge/docs/architecture.md` - Arquitectura detallada
- `packages/core/core/domain/cge/types.ts` - Tipos definitivos

## Estado de cada caso

| Caso | Estado |
|------|--------|
| wizard | RESUELTO - testClass existe |
| sorcerer | RESUELTO - fixture existe |
| cleric | RESUELTO - fixture existe |
| psion | CONFIG OK - falta POOL calculation |
| warlock | RESUELTO - testClass existe |
| tome-of-battle | CONFIG OK - falta LIST operations |
| spirit-shaman | CONFIG OK - falta LIST operations |
| arcanist | CONFIG OK - falta LIST operations |
| wizard5e | CONFIG OK - falta LIST operations |
| shadowcaster | FUERA DEL MODELO |
| truenamer | FUERA DEL MODELO |
| factotum | FUERA DEL MODELO |
| binder | FUERA DEL MODELO |
| dread-necromancer | RESUELTO |
