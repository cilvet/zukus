# Image Search System

Sistema de biblioteca de iconos para Zukus con CDN y busqueda.

## Estado actual

**Fase**: Planificacion

## Documentos

| Documento | Descripcion |
|-----------|-------------|
| [requirements.md](./requirements.md) | Requerimientos finales acordados |
| [architecture.md](./architecture.md) | Arquitectura simplificada |
| [semantic-search-analysis.md](./semantic-search-analysis.md) | Analisis de opciones para busqueda semantica |
| [clip-current-implementation.md](./clip-current-implementation.md) | Documentacion del sistema CLIP existente |
| [migration-plan.md](./migration-plan.md) | Plan de migracion de imagenes |
| [future-considerations.md](./future-considerations.md) | Consideraciones para el futuro (offline, ZIP, etc.) |

## Resumen ejecutivo

### Que haremos ahora

1. Convertir 6293 PNGs a WebP (~70% reduccion de tamano)
2. Subir a Supabase Storage (CDN incluido)
3. Crear tabla `icons` con metadata + full-text search
4. Cache agresivo en la app (`expo-image` con `memory-disk`)

### Que NO haremos ahora

- Busqueda semantica (CLIP) - postponido
- Modo offline con ZIP - postponido
- Descarga de biblioteca completa - postponido

### Por que esta decision

- Simplicidad: menos infraestructura, menos costos
- El cache agresivo cubre el 90% del caso de uso
- La busqueda clasica (por nombre, categoria, tags) es suficiente para empezar
- La arquitectura permite anadir busqueda semantica despues sin rehacer nada
