---
name: research
description: Investigación profunda de codebase. Usar al inicio de tareas no triviales, cuando no está claro qué archivos o flujos están involucrados, antes de modificar código desconocido, o cuando la tarea toca múltiples áreas del proyecto.
---

# Research

Skill de investigación orquestada. Usa subagentes para explorar el codebase en paralelo y devuelve un resumen destilado con solo la información relevante para la tarea.

## Proceso de orquestación

Copia este checklist para trackear progreso:

```
- [ ] Fase 1: Descomponer tarea en preguntas concretas
- [ ] Fase 1: Revisar skills disponibles en el proyecto
- [ ] Fase 2: Lanzar subagentes en paralelo
- [ ] Fase 3: Consolidar hallazgos
- [ ] Fase 3: Generar resumen final
```

### Fase 1: Comprensión de la tarea

Antes de lanzar subagentes, el orquestador debe:

1. **Descomponer la tarea** en preguntas concretas que necesitan respuesta:
   - ¿Qué partes del código implementan la funcionalidad afectada?
   - ¿Qué flujos de datos están involucrados?
   - ¿Qué dependencias existen entre los módulos relevantes?
   - ¿Hay tests, configuraciones o contratos que respetar?

2. **Descubrir skills disponibles** — Usar `LS` o `Glob` en `.cursor/skills/` y `~/.cursor/skills/` para identificar skills que podrían aportar contexto relevante a la investigación.

### Fase 2: Lanzamiento de subagentes

Lanzar subagentes **en paralelo**, cada uno con:
- **Un objetivo concreto y acotado** — No "investiga el proyecto", sino "encuentra cómo se maneja la autenticación en el middleware y qué endpoints la usan".
- **Un entregable definido** — Cada subagente debe devolver exclusivamente:
  - Referencias a archivos y líneas relevantes (`archivo:línea`)
  - Descripción breve de los flujos encontrados (solo las partes importantes)
  - Relaciones/dependencias con otros módulos
- **Contexto fresco** — Cada subagente trabaja con su propio contexto aislado. No hereda contexto de otros subagentes.

**Reglas para los subagentes:**
- Solo operaciones de lectura. Nunca modificar código.
- No devolver archivos completos ni bloques grandes de código. Solo las líneas relevantes con su referencia `archivo:línea`.
- Si un archivo es grande, indicar solo las funciones/clases/bloques relevantes, no el archivo entero.
- Si durante la exploración descubren que necesitan investigar un área adicional, reportarlo en su resumen (el orquestador decidirá si lanza otro subagente).

**Cuántos subagentes lanzar:**
- Tarea simple (un módulo, un flujo): 1-2 subagentes
- Tarea media (varios módulos, interacciones): 3-4 subagentes
- Tarea compleja (cross-cutting, arquitectura): 5+ subagentes

### Fase 3: Síntesis

Una vez completados todos los subagentes, el orquestador:

1. **Consolida los hallazgos** eliminando duplicados y contradicciones.
2. **Genera el resumen final** usando el formato abajo.
3. **No planifica ni ejecuta** — Solo entrega el contexto investigado.

## Formato del resumen final

Usa esta estructura (adapta las secciones según la tarea):

```
## Resumen de investigación: [nombre de la tarea]

### Archivos clave
- `archivo.ts:42` — descripción breve de qué hace
- `otro.ts:15-30` — descripción breve

### Flujos identificados
1. [Componente A] → [Componente B] → [Componente C]
   - Descripción del flujo relevante

### Dependencias y contratos
- [Módulo X] depende de [Interfaz Y]
- Tests en `tests/x.spec.ts` cubren este flujo

### Riesgos
- [Área que podría verse afectada]

### Sin explorar (requiere más investigación)
- [Área detectada pero no investigada]
```

**Lo que NO debe incluir el resumen:**
- Bloques completos de código (solo líneas clave con referencia)
- Información genérica o evidente sobre el framework/lenguaje
- Archivos que no tienen relación directa con la tarea
- Sugerencias de implementación (eso es para la fase de planificación)

## Investigación web (opcional)

Por defecto, la investigación se limita al codebase. Si se necesita información externa (API de terceros, comportamiento de una librería, bugs conocidos), lanzar un subagente adicional para buscar en:
- Documentación oficial de la librería/framework
- Issues de GitHub del proyecto o de dependencias
- Stack Overflow para problemas específicos

Solo cuando el codebase no contiene la respuesta.

## Ejemplo

**Tarea:** "Añadir validación de permisos al endpoint de eliminación de usuarios"

**Fase 1 — Descomposición:**
1. ¿Dónde está el endpoint de eliminación de usuarios? → Subagente 1
2. ¿Cómo funciona el sistema de permisos actual? → Subagente 2
3. ¿Hay otros endpoints que ya validen permisos como referencia? → Subagente 3

**Fase 3 — Resumen sintetizado:**

```
## Resumen de investigación: validación de permisos en DELETE /users

### Archivos clave
- `src/api/users.controller.ts:45` — endpoint DELETE /users/:id
- `src/guards/permissions.guard.ts:12` — guard de permisos actual
- `src/api/posts.controller.ts:78` — ejemplo de endpoint con validación

### Flujos identificados
1. Request → PermissionsGuard.canActivate() → RolesService.check() → Controller
   - El guard lee el decorador @RequirePermission y valida contra el usuario

### Dependencias y contratos
- PermissionsGuard depende de RolesService
- Tests en `tests/guards/permissions.spec.ts` cubren casos de acceso denegado

### Riesgos
- El endpoint actual no tiene ningún guard, añadirlo podría romper integraciones

### Patrón a seguir
Usar `@RequirePermission('users:delete')` como en `posts.controller.ts:78`
```
