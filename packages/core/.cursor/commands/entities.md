# Modo: Trabajar sobre el Sistema de Entidades

## Contexto

Estamos desarrollando un **Sistema de Entidades genérico y reutilizable** que servirá como base para gestionar cualquier tipo de entidad en la aplicación (conjuros, dotes, aptitudes de clase, etc.). Este sistema es completamente agnóstico del dominio D&D y puede exportarse para otros proyectos.

El sistema se divide en dos partes:
- **PARTE I**: Sistema de Entidades (genérico) - Schemas, instancias, filtrado, supresión, requerimientos, selectores
- **PARTE II**: CGE - Configuración de Gestión de Entidades (especializado para entidades accionables/consumibles)

## Documentación de Referencia

**📋 PRD Completo**: `core/domain/entities/EntityManagement.prd.md`
- Define qué debe hacer el sistema (no cómo)
- Incluye requisitos exhaustivos de ambas partes

**🗺️ Roadmap de Implementación**: `core/domain/entities/roadmap/README.md`
- Plan incremental con baby steps
- Organizado en fases y pasos
- **ESTE ES EL DOCUMENTO PRINCIPAL PARA TRABAJAR**

---

## 🛑 REGLA ABSOLUTA: NO CONTINUAR AUTOMÁTICAMENTE

**NUNCA, BAJO NINGUNA CIRCUNSTANCIA, DEBES CONTINUAR AUTOMÁTICAMENTE CON EL SIGUIENTE PASO O FASE DEL PLAN.**

### Proceso Obligatorio al Entrar en Este Modo:

1. **ADQUIRIR CONTEXTO PRIMERO**:
   - Lee `core/domain/entities/roadmap/README.md` para ver el estado actual
   - Lee el archivo de fase correspondiente (ej: `phase-0-foundation.md`)
   - Revisa qué código ya existe relacionado con el paso actual
   - Entiende dónde estamos en el desarrollo

2. **INFORMAR AL USUARIO**:
   - Resume el estado actual del desarrollo
   - Indica qué paso está activo o qué se ha completado
   - Menciona cualquier observación relevante sobre el código existente

3. **PREGUNTAR AL USUARIO**:
   - **SIEMPRE pregunta qué quiere hacer el usuario**
   - No asumas que quieres continuar con el siguiente paso
   - El usuario puede querer:
     - Continuar con el paso actual
     - Empezar un paso nuevo
     - Revisar o refactorizar código existente
     - Cambiar de dirección
     - Hacer algo completamente diferente

### Ejemplo de Comportamiento Correcto:

```
He revisado el roadmap y veo que estamos en la Fase 0, Paso 1 (Schema Definition).
El estado indica que está "⬜ No iniciado".

He revisado el código y veo que ya existe algo de infraestructura en:
- core/domain/entities/schema/creation.ts
- core/domain/entities/types/schema.ts

¿Qué te gustaría hacer ahora?
- ¿Empezar con el Paso 1 desde cero?
- ¿Revisar el código existente primero?
- ¿Continuar con otro paso?
- ¿Algo diferente?
```

### ❌ Comportamiento INCORRECTO (NO HACER):

```
Veo que el Paso 1 está completado, voy a continuar con el Paso 2...
```

**NUNCA hagas esto. SIEMPRE pregunta primero.**

---

## ⚠️ REGLA CRÍTICA: Actualización del Estado

**CADA VEZ QUE AVANCES EN EL DESARROLLO, DEBES ACTUALIZAR EL ESTADO EN EL ROADMAP**

### Qué actualizar:

1. **En `roadmap/README.md`**:
   - Actualizar la sección "Estado Actual" con la fase y paso actuales
   - Cambiar el estado del paso (⬜ → 🔄 → ✅)

2. **En el archivo de fase correspondiente** (ej: `roadmap/phase-0-foundation.md`):
   - Cambiar el estado del paso específico (⬜ → 🔄 → ✅)
   - Añadir notas si es necesario (bloqueos, cambios de plan, etc.)

### Estados disponibles:
- ⬜ **No iniciado** - Paso aún no comenzado
- 🔄 **En progreso** - Paso en desarrollo activo
- ✅ **Completado** - Paso terminado y con tests pasando
- ⏸️ **En pausa** - Paso temporalmente detenido
- ❌ **Bloqueado** - Paso bloqueado por dependencias externas

### Ejemplo de actualización:

**Antes de empezar un paso:**
```markdown
#### Paso 1: Schema Definition y Validación Básica 🔄
```

**Al completar un paso:**
```markdown
#### Paso 1: Schema Definition y Validación Básica ✅
```

**Y en README.md:**
```markdown
**Fase actual**: Fase 0 - Foundation
**Paso actual**: Paso 2 - Instancias Básicas
**Estado**: 🔄 En progreso
```

## Metodología de Trabajo

1. **Lee el paso actual** en el archivo de fase correspondiente
2. **Marca el paso como 🔄 En progreso** antes de empezar
3. **Implementa** siguiendo los entregables del paso
4. **Escribe tests** que pasen
5. **Marca el paso como ✅ Completado** cuando los tests pasen
6. **Actualiza el estado** en `README.md` para el siguiente paso

## Principios a Seguir

- **Baby steps**: Cada paso debe ser completamente funcional antes de pasar al siguiente
- **Tests first**: Cada paso debe tener tests que pasen
- **Valor incremental**: Cada paso debe aportar valor, aunque sea mínimo
- **Sin refactors masivos**: Evitar trabajo que luego haya que rehacer completamente

## Estructura del Roadmap

El roadmap está en `core/domain/entities/roadmap/` con:
- `README.md` - Overview y estado actual
- `phase-X-*.md` - Archivos individuales por fase

**Siempre consulta el roadmap antes de empezar a trabajar.**

