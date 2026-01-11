# Contexto General del Sistema de Niveles v2

> Este documento contiene las decisiones y aclaraciones generales que aplican a todo el proyecto.
> Fue generado a partir de la sesión de refinamiento de requisitos.

---

## Metodología de Desarrollo

> **CRÍTICO**: Estos principios son obligatorios en todo el desarrollo.

### Test First
- **Siempre escribir tests ANTES de implementar**
- Los tests definen el comportamiento esperado
- No se considera completo un entregable sin sus tests pasando

### Baby Steps
- Cada cambio debe ser pequeño y verificable
- No hacer cambios grandes de una vez
- Cada paso debe ser completamente funcional antes de pasar al siguiente

### Valor Incremental
- Cada paso debe aportar valor, aunque sea mínimo
- Evitar trabajo que no sea inmediatamente verificable

### Sin Refactors Masivos
- Evitar trabajo que luego haya que rehacer completamente
- Diseñar bien antes de implementar
- Consultar con el humano si hay dudas de diseño

### Control del Humano
- **El humano supervisor debe confirmar CADA decisión de dominio**
- Este es un dominio crítico; el humano tiene la última palabra
- Presentar opciones y esperar confirmación antes de implementar
- No asumir; preguntar

---

## Filosofía del Sistema

### Sistema emergente con abstracciones genéricas
Las funcionalidades emergen de la combinación de primitivos genéricos, evitando lógica hardcodeada. Esto permite que el sistema se adapte a las variaciones de reglas que los diseñadores de TTRPG introducen.

### Principios clave
- **Neutral al dominio**: Los primitivos son genéricos; D&D 3.5 es una implementación sobre ellos
- **Permisivo**: "Avisar, no bloquear" — el sistema informa pero no impide decisiones del usuario/DM
- **Trazable**: Todo valor calculado incluye su origen y composición completa
- **Configurable**: Evitar hardcodear; preferir estructuras genéricas que luego se especialicen por sistema de juego

---

## Decisiones Arquitectónicas Globales

### Estructura de entidades
Todas las entidades tendrán:
- Campos base comunes: `id`, `name`, `type`, `description`
- Campo `effects` (sustituye a `changes`) para modificaciones
- Campo `specialEffects` (sustituye a `specialChanges`)
- Campo `props: Record<string, unknown>` para propiedades específicas del schema

### Variables booleanas
De momento, los booleanos se representan como variables numéricas con valor 1 o 0:
```
@character.features.enabled.powerAttack == 1
```

No se implementará un sistema de "flags" en esta iteración. Se mantiene la consistencia con el sistema de fórmulas existente.

### Terminología
- Se usa `operator` (no `matcher`) para coherencia con código existente
- Operadores disponibles: `'==' | '!=' | '>' | '<' | '>=' | '<=' | 'contains' | 'in'`

---

## Relación con Sistemas Existentes

### Sistema de Entidades (PARTE I)
Este sistema extiende el sistema de entidades genérico existente en `core/domain/entities/`.
Se reutilizarán:
- Schemas y validación
- Sistema de filtrado (extendiéndolo)

### Sistema de Cálculo de Personaje
El sistema de niveles expondrá variables que el sistema de cálculo puede consumir.
No hay dependencia directa; la comunicación es a través de variables.

### CGE (Configuración de Gestión de Entidades)
Van separados. El CGE interactuará con el sistema de niveles a través de variables expuestas (ej: nivel de clase).

---

## Desarrollo en Paralelo

Este sistema se desarrolla en `core/domain/levels/` de forma aislada.
Eventualmente reemplazará la gestión de `CharacterClass[]` en `CharacterBaseData`, pero durante el desarrollo coexisten.

---

## Convenciones de Código

- Runtime: Bun
- Package manager: Bun
- Tests: Bun test
- Tipos: TypeScript estricto
- Validación: Zod donde aplique
- Sin ternarios (preferir if/else)
- Código elegante: legibilidad sobre optimización

---

## Referencias

- Sistema de entidades: `core/domain/entities/`
- Sistema de fórmulas: `core/domain/formulae/`
- Sistema de conditions: `core/domain/character/baseData/conditions.ts`
- Sistema de changes: `core/domain/character/baseData/changes.ts`
- Sistema de filtros: `core/domain/entities/filtering/`

