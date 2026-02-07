---
name: agent-teams
description: Equipos de agentes para coordinar multiples instancias de Claude Code en paralelo. Consultar cuando se necesite planificar trabajo paralelo, dividir tareas complejas, o coordinar implementacion entre multiples capas del proyecto.
user-invocable: true
disable-model-invocation: false
allowed-tools: Read, Grep, Glob, Bash, Task, TaskCreate, TaskUpdate, TaskList
---

# Agent Teams - Guia para Zukus

> Feature experimental. Habilitado via `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` en `.claude/settings.json`.

## Que son

Multiples instancias de Claude Code trabajando en paralelo, coordinadas por un lider con una lista de tareas compartida. Cada teammate tiene su propia ventana de contexto y puede comunicarse con los demas.

## Cuando usar Agent Teams vs Subagents

| Situacion | Usar |
|-----------|------|
| Tareas independientes sin comunicacion | **Subagents** (menos tokens) |
| Research rapido o verificacion | **Subagents** |
| Trabajo paralelo que requiere coordinacion | **Agent Teams** |
| Implementacion en multiples capas (core + app + tests) | **Agent Teams** |
| Debugging con hipotesis competidoras | **Agent Teams** |
| Code review desde multiples perspectivas | **Agent Teams** |

## Estructura del Monorepo Zukus

Estas son las areas naturales de division para teammates:

| Area | Ruta | Responsabilidad |
|------|------|-----------------|
| Core domain | `packages/core/core/domain/` | Logica de negocio, operaciones, tipos |
| Core calculation | `packages/core/core/calculation/` | Pipeline de calculo de character sheet |
| App screens | `apps/zukus/screens/` | Pantallas y componentes de UI |
| App components | `apps/zukus/components/` | Componentes reutilizables |
| Server | `apps/server/` | Backend API |
| Data/SRD | `packages/core/data/`, `packages/core/srd/` | Datos estaticos y compendio |
| Tests | `packages/core/core/**/__tests__/` | Tests unitarios del core |

## Modos de Display

- **In-process** (default): todos en el mismo terminal. Shift+Up/Down para navegar entre teammates.
- **Split panes**: cada teammate en su propio panel. Requiere tmux o iTerm2.

Para forzar un modo:
```bash
claude --teammate-mode in-process
claude --teammate-mode tmux
```

O en settings.json:
```json
{ "teammateMode": "in-process" }
```

## Composiciones de Equipo Recomendadas

### Feature nueva cross-layer
```
Crea un equipo de 3 teammates:
- "core": implementa la logica de dominio en packages/core
- "ui": implementa la pantalla y componentes en apps/zukus
- "tests": escribe tests unitarios para el core
Usa Sonnet para cada teammate. El de core debe terminar antes de que
tests empiece. El de ui puede trabajar en paralelo con core.
```

### Refactor de sistema existente
```
Crea un equipo de 2 teammates para refactorizar [sistema]:
- "architect": analiza el codigo actual, propone plan, requiere aprobacion
- "implementer": ejecuta el plan aprobado
Requiere plan approval para architect antes de que haga cambios.
```

### Debugging con hipotesis competidoras
```
El bug es: [descripcion].
Crea un equipo de 3 teammates para investigar hipotesis diferentes:
- "hypothesis-a": investiga si el problema es [X]
- "hypothesis-b": investiga si el problema es [Y]
- "hypothesis-c": investiga si el problema es [Z]
Que se comuniquen entre si para descartar teorias.
```

### Code review exhaustivo
```
Crea un equipo de 3 reviewers para revisar [PR/cambios]:
- Uno enfocado en correctitud de la logica de dominio
- Uno enfocado en rendimiento y manejo de estado en React Native
- Uno validando cobertura de tests y edge cases
Que reporten hallazgos al final.
```

### Implementacion CGE nueva clase
```
Crea un equipo de 3 teammates para implementar [clase] en el CGE:
- "config": define el CGEConfig en testClasses/ siguiendo los patrones existentes
- "operations": implementa las operaciones necesarias en packages/core/core/domain/character/cge/
- "tests": escribe tests basados en los existentes
Consultar la skill /cge para entender los tipos. El de config debe
terminar primero.
```

## Reglas para Evitar Conflictos

1. **Nunca asignar el mismo archivo a 2 teammates** - cada teammate debe trabajar en archivos distintos
2. **Dividir por capa, no por funcion** - un teammate para core, otro para UI, otro para tests
3. **Establecer dependencias claras** - si "tests" necesita que "core" termine, declararlo
4. **Usar delegate mode** (Shift+Tab) cuando el lider no deba escribir codigo

## Control del Equipo

| Accion | Como |
|--------|------|
| Ver teammates | Shift+Up/Down (in-process) |
| Hablar a teammate | Seleccionarlo y escribir |
| Ver tareas | Ctrl+T |
| Modo delegacion | Shift+Tab |
| Aprobacion de plan | El lider aprueba/rechaza automaticamente |
| Cerrar teammate | "Pide a [nombre] que se cierre" |
| Limpiar equipo | "Limpia el equipo" (cerrar teammates primero) |

## Quality Gates con Hooks

Puedes usar hooks para enforcement automatico:

- **TeammateIdle**: cuando un teammate va a quedar idle, verifica que su trabajo esta completo
- **TaskCompleted**: cuando una tarea se marca completa, valida calidad

Ejemplo en `.claude/settings.json`:
```json
{
  "hooks": {
    "TaskCompleted": [
      {
        "matcher": "",
        "command": "echo 'Task completed - verify tests pass'"
      }
    ]
  }
}
```

## Limitaciones Actuales

- No se pueden resumir sesiones con `/resume` (teammates se pierden)
- Un solo equipo por sesion
- No hay equipos anidados (teammates no crean sub-equipos)
- El lider es fijo durante toda la sesion
- Los permisos se heredan del lider al crear teammates
- Split panes no funciona en VS Code terminal ni Windows Terminal

## Tips

- **Empieza con research/review** antes de intentar implementacion paralela
- **5-6 tareas por teammate** mantiene productividad alta
- **Monitorea progreso** - no dejes al equipo corriendo sin supervision prolongada
- **Usa Sonnet para teammates** si quieres optimizar coste sin sacrificar mucha calidad
- Si el lider empieza a implementar en vez de delegar: "Espera a que tus teammates terminen"
