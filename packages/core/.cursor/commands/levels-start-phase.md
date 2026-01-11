# Comando: Iniciar Fase del Sistema de Niveles

## Para el Usuario (LÉEME PRIMERO)

**La forma más eficiente de iniciar una fase es adjuntar directamente el archivo de clarifications:**

```
core/domain/levels/docs/phases/phase-{X}-clarifications.md
```

Donde `{X}` puede ser: `0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `11`

Ese archivo contiene las aclaraciones confirmadas y preguntas pendientes. Si lo adjuntas, el LLM puede empezar inmediatamente.

**Ejemplo de prompt**:
> "Vamos a trabajar en la Fase A del sistema de niveles. Lee el archivo adjunto y preséntame las preguntas pendientes para confirmación."

---

## Fases Disponibles

### Fases Completadas (0-5)
- Fase 0: Extensión de Filtros ✅
- Fase 1: Supresión Extendida ✅
- Fase 2: Conditions en Entidades ✅
- Fase 3: Sistema de Addons ✅
- Fase 4: EntityProvider ✅
- Fase 5: ClassDefinition (en progreso)

### Nuevas Fases (6-11) - Roadmap Unificado
- **Fase 6**: Funciones de Selección
- **Fase 7**: Sistema de Requerimientos
- **Fase 8**: ClassDefinition (D&D 3.5) - Usa Fase 6
- **Fase 9**: Resolución de Niveles
- **Fase 10**: Sistema de Fuentes y Compendios
- **Fase 11**: CGE (Configuración de Gestión de Entidades)

---

## Para el LLM

### Si el usuario NO adjuntó el archivo de clarifications

Lee estos archivos en este orden:

1. `UNIFIED_ROADMAP.md` o `ROADMAP_SUMMARY.md` (estado general)
2. `core/domain/levels/docs/phases/phase-{X}-clarifications.md` (aclaraciones de la fase)
3. El código existente que la fase necesita extender

### Si el usuario SÍ adjuntó el archivo de clarifications

Lee solo:
1. El archivo adjunto (contiene objetivo, aclaraciones confirmadas, preguntas pendientes, casos de uso)
2. `UNIFIED_ROADMAP.md` si necesitas contexto de dependencias entre fases

---

## Tu Tarea: Iniciar la Fase

### Paso 1: Verificar Estado

Lee `UNIFIED_ROADMAP.md` para verificar:
1. Que las dependencias de la fase están completadas
2. Que esta fase está pendiente

### Paso 2: Confirmar con el Humano

**NO actualices ningún archivo todavía**. Primero presenta el resumen al humano (ver Paso 3)

### Paso 3: Presentar al Humano

Presenta un resumen al humano con:

```
## Iniciando Fase {X}: {Nombre}

### Dependencias
- [Lista de fases completadas que esta fase necesita]

### Objetivo de esta fase
[Resumen del objetivo del archivo de clarifications]

### Aclaraciones ya confirmadas
[Resumen de las decisiones tomadas]

### Preguntas pendientes (requieren tu confirmación)
- [ ] P1: [Pregunta]
  **Opciones**: A, B, C
  **Recomendación**: [Tu recomendación]
- [ ] P2: [Pregunta]
  ...

### Entregables
- [Lista de funciones/tipos a implementar]

### Archivos que crearé
- path/to/file1.ts
- path/to/file2.ts
- ...

### Criterios de aceptación
- [ ] Criterio 1
- [ ] Criterio 2
- [ ] ...

**Por favor, confirma las preguntas pendientes antes de que empiece a escribir código.**
```

---

## 🛑 REGLAS CRÍTICAS

1. **NO escribas código** hasta que el humano confirme las preguntas pendientes
2. **NO asumas** respuestas a las preguntas
3. **Tests PRIMERO** — cuando empieces a implementar, escribe tests antes del código
4. **Baby steps** — cambios pequeños y verificables
5. **Preguntas con opciones** — Siempre presenta opciones A, B, C y tu recomendación

---

## Archivos de Referencia

| Archivo | Propósito |
|---------|-----------|
| `UNIFIED_ROADMAP.md` | Roadmap completo con todas las fases |
| `ROADMAP_SUMMARY.md` | Resumen ejecutivo |
| `core/domain/levels/docs/CONTEXT.md` | Metodología y filosofía |
| `core/domain/levels/docs/phases/phase-{X}-clarifications.md` | Aclaraciones de fase específica |
