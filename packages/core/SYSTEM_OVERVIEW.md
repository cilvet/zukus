# Sistema de Cálculo y Gestión de Personajes D&D 3.5 — Visión General

Este documento proporciona una visión de alto nivel del sistema, su arquitectura, estado actual y referencias a la documentación detallada.

---

## Filosofía Central

> **Sistema emergente con abstracciones genéricas**: Las funcionalidades emergen de la combinación de primitivos genéricos, evitando lógica hardcodeada. Esto permite que el sistema se adapte a las variaciones de reglas que los diseñadores de TTRPG introducen.

El sistema está diseñado para ser:
- **Neutral al dominio**: Los primitivos son genéricos; D&D 3.5 es una implementación sobre ellos
- **Permisivo**: "Avisar, no bloquear" — el sistema informa pero no impide decisiones del usuario/DM
- **Trazable**: Todo valor calculado incluye su origen y composición completa
- **Incremental**: Implementación por fases con valor en cada paso

---

## Arquitectura de Capas

El sistema se organiza en tres capas que fluyen de lo estático a lo dinámico:

```
┌─────────────────────────────────────────────────────────────────┐
│  CAPA 1: CÁLCULO ESTÁTICO                                       │
│  CharacterBaseData → Changes → Pipeline → CharacterSheet        │
│  Estado: ✅ Implementado                                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  CAPA 2: GESTIÓN DE ENTIDADES                                   │
│  Entities (Parte I) → CGE (Parte II)                            │
│  Estado: 🔄 Parcialmente implementado / 📝 Diseñado             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  CAPA 3: EJECUCIÓN DINÁMICA                                     │
│  Entity → Context → Events → Triggers → Result                  │
│  Estado: 💡 Conceptualizado                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Capa 1: Sistema de Cálculo de Personaje

**Estado**: ✅ Implementado y funcional

**Documentación principal**: [ARCHITECTURE.md](./ARCHITECTURE.md)

### Flujo de datos
```
CharacterBaseData → Compilation → Calculation Pipeline → CharacterSheet
     (Input)      → (Changes)   →    (Ordenado)       →    (Output)
```

### Primitivos fundamentales

| Primitivo | Descripción |
|-----------|-------------|
| **Change** | Unidad de modificación: `Formula` + `BonusType` + `ChangeType` + `Conditions` |
| **Formula** | Expresión matemática con variables (`@ability.strength.modifier`) y dados (`1d6`) |
| **BonusType** | Reglas de stacking (ENHANCEMENT no apila, UNTYPED sí, etc.) |
| **SubstitutionIndex** | Diccionario de variables disponibles, crece con el pipeline |
| **SourceValues** | Trazabilidad: qué bonos se aplicaron, cuáles supersedidos, origen |

### Sistema de Fórmulas

**Documentación**: [.cursor/rules/formula-system.mdc](./.cursor/rules/formula-system.mdc)

Soporta dos tipos:
1. **NormalFormula**: Expresión matemática directa (`1d8 + @ability.strength.modifier`)
2. **SwitchFormula**: Lógica condicional por casos (`if level >= 5 then 3, else if level >= 3 then 2...`)

**Capacidades**: Operaciones básicas, dados, funciones (`min`, `max`, `floor`, `ceil`), variables con `@`

**Limitaciones importantes**: Sin lógica condicional en expresiones (usar Conditions en Changes), sin comparaciones directas, solo matemáticas.

---

## Capa 2: Sistema de Entidades y CGE

### Parte I: Sistema de Entidades (Genérico)

**Estado**: 🔄 Básico implementado, roadmap definido

**Documentación principal**: 
- [core/domain/entities/EntityManagement.prd.md](./core/domain/entities/EntityManagement.prd.md) — PARTE I
- [core/domain/entities/README.md](./core/domain/entities/README.md)
- [core/domain/entities/roadmap/README.md](./core/domain/entities/roadmap/README.md)

Sistema genérico y **agnóstico del dominio** para gestionar cualquier tipo de entidad (conjuros, dotes, habilidades, items, etc.).

#### Lo implementado:
- Schema Definition con tipos de campo
- SearchableEntity como estructura base
- Filtrado básico con operadores lógicos (AND/OR/NOT)
- Facets para generación de UI de búsqueda
- Validación con Zod

#### Lo diseñado pero pendiente (Fases 0-7):

| Fase | Feature | Descripción |
|------|---------|-------------|
| 4 | Supresión | Entidades que deshabilitan otras (arquetipos que reemplazan features) |
| 5 | Campos computados | Campos calculados con JMESPath |
| 6 | Anidación | Schemas con objetos anidados |
| 7 | Requerimientos, Versionado, Selectores | Features adicionales de gestión |

Ver: [core/domain/entities/roadmap/](./core/domain/entities/roadmap/)

---

### Parte II: CGE (Configuración de Gestión de Entidades)

**Estado**: 📝 Diseñado, ejemplos creados, sin implementación

**Documentación principal**:
- [core/domain/entities/EntityManagement.prd.md](./core/domain/entities/EntityManagement.prd.md) — PARTE II
- [core/domain/entities/DESIGN_NOTES.md](./core/domain/entities/DESIGN_NOTES.md)
- [core/domain/entities/examples/README.md](./core/domain/entities/examples/README.md)
- [core/domain/entities/roadmap/phase-8-cge.md](./core/domain/entities/roadmap/phase-8-cge.md)

#### Concepto
Un CGE define **cómo un personaje interactúa con un tipo de entidad**: cómo accede, conoce, prepara y usa entidades accionables/consumibles (conjuros, maniobras, invocaciones, etc.).

#### Modos de gestión

| Modo | Clases ejemplo | Descripción |
|------|----------------|-------------|
| `PREPARED_BY_LEVEL` | Mago, Clérigo | Prepara conjuros específicos en slots por nivel |
| `SPONTANEOUS` | Hechicero, Bardo | Conocidos limitados, slots compartidos por nivel |
| `USES_PER_ENTITY` | Warlock, SLAs | Cada entidad tiene sus propios usos/día |
| `ALL_ACCESS` | Mago de Guerra | Acceso total a lista, usa slots |
| `GLOBAL_PREPARED` | Variantes 5e | Preparación con pool global (no por nivel) |

#### Componentes de un CGE
- **Fuente de acceso**: Vista filtrada, libro, o acceso total
- **Resolución de nivel**: Cómo extraer el nivel de una entidad para este CGE
- **Capacity Tables**: Slots disponibles por nivel (definición tabular → SwitchFormula)
- **Política de visualización**: WARN (avisar) o STRICT (bloquear)

#### Decisiones de diseño documentadas

Ver [core/domain/entities/DESIGN_NOTES.md](./core/domain/entities/DESIGN_NOTES.md):
- Capacity Table Definition (formato tabular como en PHB)
- Variables de slots modificables por Changes (pendiente)
- Effect Table Definition (idea futura)
- Recuperación por eventos
- Slots restringidos por tipo (escuelas de mago)
- Power Points (psionics)

---

## Capa 3: Sistema de Acciones y Contextos

**Estado**: 💡 Conceptualizado

**Documentación**:
- [core/domain/character/actions/ACTION_SYSTEM_DESIGN.md](./core/domain/character/actions/ACTION_SYSTEM_DESIGN.md)
- [core/domain/entities/DESIGN_NOTES.md](./core/domain/entities/DESIGN_NOTES.md) — Sección "Contextos"

### Contextos

Encapsulación de scope para ejecución con variables locales que no afectan al scope global.

**Flujo**: `Entidad → CGE → Contexto → [Acciones] → Eventos`

**Características**:
- Origen típico en entidades (arma, conjuro), pero no obligatorio
- Variables contextuales locales al scope
- Pueden requerir tipos de entidad específicos para funcionar
- Puente entre gestión estática (CGE) y ejecución dinámica (Acciones)

### Acciones y Triggers

**Modelo**:
```
Entity → Context → Event → [Triggers] → Event → ... → Result
```

| Primitivo | Descripción |
|-----------|-------------|
| **Event** | Unidad atómica de ejecución (tirada de ataque, tirada de daño) |
| **Trigger** | Observa eventos, puede modificar contexto o encolar nuevos eventos |
| **Ciclo** | `onBefore → resolve → onAfter` |

**Casos de uso**: Confirmación de críticos, Sneak Attack, Espada Vorpal, Metamagia, reacciones automáticas.

---

## Estado Actual del Proyecto

| Sistema | Estado | Documentación |
|---------|--------|---------------|
| Cálculo de personaje | ✅ Funcional | [ARCHITECTURE.md](./ARCHITECTURE.md) |
| Sistema de Fórmulas | ✅ Funcional | [.cursor/rules/formula-system.mdc](./.cursor/rules/formula-system.mdc) |
| Entidades (Parte I) | 🔄 Básico | [EntityManagement.prd.md](./core/domain/entities/EntityManagement.prd.md) |
| CGE (Parte II) | 📝 Diseñado | [DESIGN_NOTES.md](./core/domain/entities/DESIGN_NOTES.md) |
| Contextos | 💡 Conceptualizado | [DESIGN_NOTES.md](./core/domain/entities/DESIGN_NOTES.md) |
| Acciones/Triggers | 💡 Conceptualizado | [ACTION_SYSTEM_DESIGN.md](./core/domain/character/actions/ACTION_SYSTEM_DESIGN.md) |

**Leyenda**: ✅ Funcional | 🔄 En progreso | 📝 Diseñado | 💡 Conceptualizado

---

## Índice de Documentación

### Arquitectura y Diseño General
- [ARCHITECTURE.md](./ARCHITECTURE.md) — Arquitectura del sistema de cálculo

### Sistema de Fórmulas
- [.cursor/rules/formula-system.mdc](./.cursor/rules/formula-system.mdc) — Referencia completa de fórmulas

### Sistema de Entidades y CGE
- [core/domain/entities/EntityManagement.prd.md](./core/domain/entities/EntityManagement.prd.md) — PRD completo (PARTE I + II)
- [core/domain/entities/DESIGN_NOTES.md](./core/domain/entities/DESIGN_NOTES.md) — Decisiones e ideas futuras
- [core/domain/entities/README.md](./core/domain/entities/README.md) — Guía rápida
- [core/domain/entities/examples/README.md](./core/domain/entities/examples/README.md) — Documentación de ejemplos

### Roadmap de Entidades
- [core/domain/entities/roadmap/README.md](./core/domain/entities/roadmap/README.md) — Estado y plan
- [core/domain/entities/roadmap/phase-0-foundation.md](./core/domain/entities/roadmap/phase-0-foundation.md) — Fase 0
- [core/domain/entities/roadmap/phase-8-cge.md](./core/domain/entities/roadmap/phase-8-cge.md) — Fase 8: CGE

### Sistema de Acciones
- [core/domain/character/actions/ACTION_SYSTEM_DESIGN.md](./core/domain/character/actions/ACTION_SYSTEM_DESIGN.md) — Diseño conceptual

### Guías de Cursor Rules
- [.cursor/rules/dd35-library-guide.mdc](./.cursor/rules/dd35-library-guide.mdc) — Guía principal de la librería
- [.cursor/rules/formula-system.mdc](./.cursor/rules/formula-system.mdc) — Sistema de fórmulas

---

*Última actualización: Diciembre 2024*

