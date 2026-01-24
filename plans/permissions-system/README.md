# Sistema de Permisos - Análisis y Futuro

Este documento analiza el sistema de permisos actual de Zukus y considera futuras extensiones como marketplace, colaboración avanzada y versionado.

## Documentos

| Documento | Contenido |
|-----------|-----------|
| [current-state.md](./current-state.md) | Estado actual del sistema (tablas, RLS, roles) |
| [powersync-constraints.md](./powersync-constraints.md) | Cómo PowerSync afecta las decisiones de diseño |
| [marketplace-considerations.md](./marketplace-considerations.md) | Opciones para un futuro marketplace de contenido |
| [versioning-system.md](./versioning-system.md) | Sistema de versionado/historial de personajes |
| [future-features.md](./future-features.md) | Funcionalidades futuras y sus implicaciones |

## Principio Guía

El sistema de permisos debe ser **compatible con PowerSync**. Esto significa:

1. Permisos derivables de datos que ya se sincronizan
2. Evitar tablas de grants/permisos con muchas filas
3. Queries de permisos evaluables en SQLite local
4. Contenido bajo demanda vs sincronización automática

## Estado Actual

El sistema actual es **simple y funcional**:
- `owner_id` en cada entidad
- `campaign_id` para contenido específico de campaña
- `is_private` para visibilidad
- RLS en Supabase, confianza total desde la app

Ver [current-state.md](./current-state.md) para detalles.
