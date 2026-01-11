# /next-phase

Cuando el usuario ejecute este comando, sigue estos pasos:

## 1. Leer el Estado Actual

Lee el archivo `monorepo-plan/README.md` para identificar:
- Cuál es la fase actual (la primera que esté pendiente o en progreso)
- Cuáles son las fases completadas

## 2. Leer los Detalles de la Fase

Lee el archivo de la fase correspondiente en `monorepo-plan/fases/` para entender:
- Los objetivos de la fase
- Los pasos específicos
- Las verificaciones necesarias

## 3. Presentar Resumen

Presenta al usuario:
- Resumen del estado actual del proyecto
- Qué fase toca abordar
- Objetivos principales de la fase

## 4. Identificar Dudas y Decisiones Pendientes

Analiza la fase y presenta las decisiones que necesitan input del usuario.

**IMPORTANTE:** Usa el formato de preguntas numeradas con opciones con letras:

```
**1. [Decisión a tomar]:**
- A) Opción 1
- B) Opción 2
- C) Otra opción

**2. [Otra decisión]:**
- A) Opción 1
- B) Opción 2
```

## 5. Esperar Respuesta

**NO procedas a implementar nada hasta que el usuario haya respondido a todas las preguntas.**

El usuario responderá en formato "1. A, 2. B" o similar.
