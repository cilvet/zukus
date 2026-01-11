# Playground - Diseño del Sistema de Niveles

Esta carpeta contiene exploraciones de diseño de tipos para el sistema de niveles.

## ⚠️ ESTADO: POSPUESTO

**Fecha**: 2025-12-23

La exploración de un sistema de niveles **completamente genérico** (agnóstico de sistema de juego) 
ha sido pospuesta debido a la complejidad creciente. 

**Decisión**: Implementar primero un sistema ad-hoc para D&D 3.5, y en el futuro abstraer 
los patrones comunes si se necesita soportar otros sistemas.

## Propósito Original

Explorar diferentes aproximaciones al problema de crear un sistema de niveles **genérico** que:

1. No esté acoplado a D&D ni ningún sistema específico
2. Soporte conceptos como multiclase, progresión, supresión
3. Permita que cada sistema de juego defina sus propias reglas
4. Sea lo suficientemente flexible para diferentes TTRPGs

## Archivos

| Archivo | Descripción |
|---------|-------------|
| `design-v1-progression-based.ts` | Sistema basado en progresiones con estructura de niveles |

## Conceptos que SÍ se mantienen

Los siguientes conceptos explorados aquí **sí se usarán** en la implementación ad-hoc:

1. **EntityProvider** (granted + selector) ✓ — Ya implementado en Fase 4
2. **Tabla clave:valor** para niveles (Record<number, EntityProvider[]>) ✓
3. **Estado de selección en el Selector** ✓
4. **Concept de "table"** para lookups (similar a switch pero con == implícito)

## Conceptos POSPUESTOS

1. **GameSystemLevelRules** — El sistema de juego definiendo reglas genéricas
2. **perLevelFields** — Campos configurables por el sistema de juego
3. **Genericidad total** — Soporte para sistemas que no sean D&D 3.5

## Notas

- Estos archivos son **solo tipos y ejemplos**, no código ejecutable
- El objetivo es visualizar cómo quedarían los JSONs del personaje
- Sirven como referencia para futuras abstracciones

