# Comando: Completar Fase y Preparar Siguiente

## Contexto

Estás trabajando en el **Sistema de Niveles v2** ubicado en `core/domain/levels/`.

Has completado una fase y necesitas:
1. Documentar lo implementado
2. Marcar la fase como completada
3. Informar al humano

---

## Tu Tarea: Completar Fase Actual

### Paso 1: Verificar Completitud

Antes de marcar como completada, verifica:

1. **Tests pasan**: Ejecuta `bun test core/domain/levels/` y confirma que todos pasan
2. **Criterios de aceptación**: Revisa en el archivo `phase-{X}-clarifications.md` que se cumplen todos
3. **Código creado**: Lista los archivos creados/modificados
4. **Preguntas respondidas**: Todas las preguntas pendientes fueron respondidas por el humano

### Paso 2: Documentar Decisiones

Añade al archivo `phase-{X}-clarifications.md` una sección al final:

```markdown
---

## Decisiones Tomadas (Implementación)

**Fecha**: YYYY-MM-DD

### Respuestas a Preguntas Pendientes
- **P1**: [Pregunta] → **Decisión**: [Opción elegida y razón]
- **P2**: [Pregunta] → **Decisión**: [Opción elegida y razón]

### Archivos Creados
- `path/to/file1.ts` (X líneas) - [Descripción breve]
- `path/to/file2.ts` (Y líneas) - [Descripción breve]

### Archivos Modificados
- `path/to/existing.ts` - [Qué se modificó]

### Tests
- X tests escritos
- Todos pasando ✅

### Notas de Implementación
- [Cualquier observación relevante]
- [Decisiones tomadas durante la implementación]
```

### Paso 3: Actualizar UNIFIED_ROADMAP.md

Actualiza el roadmap para marcar la fase como completada:

```markdown
| # | Fase | Prioridad | Estado | Última actualización |
|---|------|-----------|--------|---------------------|
| **A** | **Funciones de Selección** | 🔴 ALTA | ✅ COMPLETADA | 2025-MM-DD |
```

### Paso 4: Presentar Resumen al Humano

Presenta un resumen de cierre:

```
## ✅ Fase {X} Completada: {Nombre}

### Lo implementado
- [Lista de funcionalidades con bullets]

### Archivos creados
- path/to/file1.ts (X líneas) - [Descripción]
- path/to/file2.ts (Y líneas) - [Descripción]

### Archivos modificados
- path/to/existing.ts - [Qué se cambió]

### Tests
- X tests escritos
- Todos pasando ✅
- Cobertura: [si aplica]

### Decisiones documentadas
- [Lista de decisiones tomadas]

### Criterios de aceptación
- [x] Criterio 1 cumplido
- [x] Criterio 2 cumplido
- [x] ...

---

## 📋 Siguiente Fase Sugerida: {X+1} - {Nombre}

### Por qué esta fase
[Breve explicación de por qué es la siguiente lógica]

### Dependencias satisfechas
- ✅ Fase {X} completada (proporciona...)
- ✅ [Otras dependencias]

### Archivos actualizados
- ✅ phase-{X}-clarifications.md con decisiones
- ✅ UNIFIED_ROADMAP.md actualizado

**¿Quieres iniciar la Fase {X+1} ahora o prefieres hacer otra cosa?**
```

---

## 🛑 REGLAS CRÍTICAS

1. **NO marques como completada** si hay tests fallando
2. **NO avances a la siguiente fase** sin confirmación del humano
3. **SIEMPRE documenta** las decisiones tomadas en phase-{X}-clarifications.md
4. **SIEMPRE presenta** opciones de qué hacer después

---

## Archivos a Actualizar

| Archivo | Qué actualizar |
|---------|----------------|
| `phase-{X}-clarifications.md` | Añadir sección "Decisiones Tomadas" al final |
| `UNIFIED_ROADMAP.md` | Marcar fase como ✅ COMPLETADA con fecha |

---

## Plantilla para Decisiones Tomadas

```markdown
---

## Decisiones Tomadas (Implementación)

**Fecha**: YYYY-MM-DD

### Respuestas a Preguntas Pendientes

#### P1: [Título de pregunta]
**Pregunta**: [Pregunta completa]
**Decisión**: Opción [A/B/C] - [Breve razón]
**Detalles**: [Si necesita más explicación]

#### P2: [Título de pregunta]
...

### Archivos Creados
- `path/to/file1.ts` (X líneas)
  - [Descripción de qué hace]
  - [Funciones principales exportadas]

### Archivos Modificados
- `path/to/existing.ts`
  - [Qué se modificó]
  - [Por qué]

### Tests Escritos
- X tests en total
- [Descripción de qué cubren]
- Todos passing ✅

### Notas de Implementación
- [Cualquier desviación del plan original]
- [Problemas encontrados y cómo se resolvieron]
- [Mejoras futuras identificadas]
```
