# Sistema de Acciones y Triggers - Diseño Conceptual

## Modelo General

Una **acción** no es una unidad monolítica. Es una **composición de eventos** que se ejecutan en secuencia, donde cada evento puede desencadenar otros a través de **triggers**.

```
Entity → Context → Event → [Triggers] → Event → [Triggers] → ... → Result
```

## Capas del Sistema

### 1. Entity (Entidad)

La entidad es el origen de la acción. Puede ser un conjuro, un arma, una habilidad, etc.

La entidad **crea un contexto** cuando se activa.

### 2. Context (Contexto)

El contexto contiene:
- Referencia a los datos del personaje (CharacterSheet)
- Referencia a la entidad que lo originó
- Variables contextuales (target, slotLevel, etc.)
- Configuración de la acción

El contexto **crea y ejecuta eventos**.

### 3. Event (Evento)

El evento es la **unidad atómica de ejecución**. Ejemplos: tirada de ataque, tirada de daño, confirmación de crítico.

Cada evento tiene su propio ciclo:

```
onBefore(eventId, triggers)  → Ejecutar triggers con timing 'before'
resolve(eventId)             → Ejecutar la lógica del evento, generar resultado
onAfter(eventId, triggers)   → Ejecutar triggers con timing 'after'
```

### 4. Trigger

Un trigger **observa eventos** y puede:
- Modificar el contexto antes de que el evento se resuelva
- Encolar nuevos eventos después de que el evento se resuelva
- Aplicar efectos basados en el resultado del evento

Los triggers tienen **condiciones** que determinan si se activan o no.

## Datos Disponibles

En cada fase del sistema se tiene acceso a diferentes datos:

| Capa | Datos disponibles |
|------|-------------------|
| CharacterSheet | Datos calculados del personaje (siempre disponibles) |
| Entity | Datos propios de la entidad que origina la acción |
| Context | Variables del contexto de ejecución |
| Event Result | Resultados del evento actual (solo en `onAfter`) |

## Flujo de Ejecución

```
1. Entity se activa
2. Se crea un Context con los datos necesarios
3. Se encola el primer Event
4. Para cada evento en la cola:
   a. onBefore: ejecutar triggers, pueden modificar contexto o cancelar
   b. resolve: ejecutar lógica del evento, generar resultado
   c. onAfter: ejecutar triggers, pueden encolar nuevos eventos
5. Repetir hasta que la cola esté vacía
6. Retornar Result con todo lo ocurrido
```

## Encadenamiento de Eventos

Los triggers en `onAfter` pueden **encolar nuevos eventos** que se procesarán después. Esto permite modelar flujos condicionales como:

- Tirada de ataque → [si amenaza crítico] → Confirmación de crítico
- Confirmación de crítico → [si confirma] → Tirada de daño crítico
- Confirmación de crítico → [si natural 20 + vorpal] → Efecto especial

Cada nuevo evento tiene su propio ciclo `onBefore → resolve → onAfter`, permitiendo que otros triggers reaccionen a él.

## Triggers y Condiciones

Un trigger define:
- **Qué evento escucha**: el tipo de evento que lo activa
- **Timing**: si se ejecuta antes (`before`) o después (`after`) del evento
- **Condición**: fórmula que debe evaluar a verdadero para que se active
- **Acción**: qué hace cuando se activa (encolar evento, modificar contexto, etc.)

Las condiciones pueden referenciar:
- Datos del personaje
- Datos de la entidad
- Variables del contexto
- Resultados del evento (solo en `onAfter`)

## Casos de Uso

Este modelo permite implementar:
- Confirmación de críticos (trigger que observa la tirada de ataque)
- Sneak Attack (trigger que observa el daño y añade dados extra)
- Espada Vorpal (trigger que observa la confirmación de crítico)
- Metamagia (triggers que modifican el contexto antes de lanzar el conjuro)
- Reacciones automáticas basadas en condiciones

## Notas de Diseño

1. **Separación de concerns**: El sistema de acciones es runtime, el CharacterSheet es cálculo estático
2. **Inmutabilidad**: Las acciones no modifican el CharacterSheet directamente, generan "deltas"
3. **Trazabilidad**: Todo el flujo debe ser loggeable para debugging y para el journal del jugador
4. **Extensibilidad**: Nuevos tipos de eventos y triggers deben ser fáciles de añadir
5. **Simplicidad**: Para casos simples donde no hace falta contexto elaborado, se puede ir directo de Entity a Event
