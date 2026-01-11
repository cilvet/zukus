# Sistema de Entidades y Gestión de Entidades Accionables

## Arquitectura de Dos Capas

Este documento describe dos sistemas relacionados pero separados:

1. **Sistema de Entidades (genérico - PARTE I)**: Infraestructura reutilizable para gestionar cualquier tipo de entidad, completamente agnóstica del dominio D&D. Este sistema puede exportarse y usarse en otros proyectos.

2. **CGE - Configuración de Gestión de Entidades (PARTE II)**: Sistema específico para entidades accionables/consumibles (conjuros, maniobras, etc.) que se construye sobre el sistema genérico de entidades.

---

## PARTE I: Sistema de Entidades (Genérico)

### Objetivo

Proveer una infraestructura completa y reutilizable para:
- Definir tipos de entidades mediante schemas
- Crear y validar instancias de entidades
- Filtrar entidades con criterios complejos
- Gestionar relaciones entre entidades (supresión, requerimientos)
- Versionar entidades para permitir migraciones
- Seleccionar entidades mediante selectores configurables

Este sistema es completamente agnóstico del dominio y puede usarse fuera del contexto de D&D.

---

### 1) Schemas y Tipos de Entidades

#### 1.1 Schema Definition

> **Qué es**: Definición formal de la estructura de un tipo de entidad.

> **Debe**:
> - Declarar nombre del tipo (`typeName`)
> - Definir campos con tipos primitivos y compuestos
> - Soportar campos opcionales y obligatorios
> - Permitir valores permitidos (enums)
> - Soportar anidación mediante campos de tipo objeto
> - Declarar campos computados (ver sección 4)

#### 1.2 Tipos de Campo Soportados

> **Debe soportar**:
> - `string`: Cadenas de texto
> - `integer`: Números enteros
> - `boolean`: Valores booleanos
> - `string_array`: Arrays de strings
> - `integer_array`: Arrays de enteros
> - `object`: Objetos anidados con su propio schema
> - `object_array`: Arrays de objetos con schema

#### 1.3 Validación de Schema

> **Debe**:
> - Validar estructura del schema al definirlo
> - Prevenir ciclos infinitos en anidación
> - Validar coherencia de campos computados
> - Proveer mensajes de error claros

---

### 2) Instancias de Entidades

#### 2.1 Estructura Base de Instancia

> **Qué es**: Datos concretos que cumplen con un schema.

> **Debe incluir**:
> - `id`: Identificador único (string)
> - `name`: Nombre de la entidad
> - `type`: Tipo de entidad (debe corresponder a un schema existente)
> - `description`: Descripción opcional
> - `entity_version`: Versión de la entidad (integer, ver 2.4)
> - `suppressesIds`: Array de IDs de entidades suprimidas (ver 2.2)
> - `givesRequirements`: Array de identificadores de requerimientos que confiere (ver 2.3)
> - Campos específicos del schema

#### 2.2 Sistema de Supresión

> **Qué es**: Mecanismo para que una entidad suprima (deshabilite) otras entidades.

> **Debe**:
> - Permitir que cualquier entidad suprima cualquier otra (cross-type)
> - Definirse mediante campo `suppressesIds: string[]` en la instancia
> - Aplicarse durante el cálculo de entidades activas
> - Proveer función `calculateSuppressedEntities(allEntities, selectedEntities) -> Set<string>`
> - Ser consultable en tiempo real para preview en UI
> - No eliminar las entidades suprimidas, solo marcarlas como no activas

> **Casos de uso**:
> - Arquetipos que reemplazan aptitudes de clase
> - Variantes de clase que sustituyen características base
> - Dotes que reemplazan otras dotes

#### 2.3 Sistema de Requerimientos

> **Qué es**: Mecanismo para que entidades confieran requerimientos que otras entidades pueden necesitar.

> **Debe**:
> - Permitir que una entidad declare `givesRequirements: string[]`
> - Los identificadores de requerimientos son strings libres (ej: "sneak-attack", "divine-spellcasting")
> - **Pendiente**: ¿Necesitamos también `requiresRequirements`?
> - **Pendiente**: ¿Los requerimientos afectan a elegibilidad en filtros?

> **Casos de uso**:
> - Talentos que requieren características de clase específicas
> - Dotes de prestigio que requieren capacidades previas
> - Habilidades que se desbloquean con otras habilidades

#### 2.4 Versionado de Entidades

> **Qué es**: Sistema para gestionar evolución de schemas y migración de datos.

> **Debe**:
> - Cada instancia tiene `entity_version: number`
> - **Pendiente**: ¿El version es del schema o de cada instancia?
> - **Pendiente**: ¿Necesitamos funciones de migración en V0 o solo el campo?
> - Permitir detección de entidades desactualizadas
> - Facilitar migraciones futuras de datos

---

### 3) Sistema de Filtrado Avanzado

#### 3.1 Alcance del Sistema de Filtrado

> **Qué es**: Motor de consulta flexible para buscar y filtrar entidades con criterios complejos.

> **Debe soportar**:
> - Operadores lógicos (AND/OR/NOT)
> - Múltiples tipos de matchers por campo
> - Búsqueda en campos anidados
> - Queries complejas mediante jmespath
> - Composición de filtros

#### 3.2 Operadores Lógicos

> **Debe**:
> - `AND`: Todos los filtros deben cumplirse
> - `OR`: Al menos uno de los filtros debe cumplirse
> - `NOT`: Niega el resultado de un filtro
> - Permitir anidación arbitraria de operadores

#### 3.3 Matchers por Campo

> **Debe soportar**:
> - **Exact Match**: Igualdad exacta de valor
> - **Includes (string)**: Substring parcial en strings
> - **Includes (array)**: Elemento presente en array
> - **Jmespath Match**: Query jmespath para matching complejo

#### 3.4 Soporte para Anidación

> **Debe**:
> - Permitir acceso a campos anidados mediante dot notation
> - Funcionar con campos de tipo `object` y `object_array`
> - Testear exhaustivamente casos anidados (aunque serán menos comunes)

#### 3.5 Razones de Filtrado

> **Debe**:
> - Registrar por qué una entidad no cumple un filtro
> - Proveer mensajes comprensibles para UI
> - Diferenciar entre "no cumple" y "mostrada con aviso" según política

---

### 4) Campos Computados

#### 4.1 Definición

> **Qué es**: Campos que se calculan dinámicamente a partir de otros campos de la misma entidad.

> **Debe**:
> - Declararse en el schema con expresión jmespath
> - Solo acceder a campos de la propia entidad (no datos externos)
> - Evaluarse según política de cache/recálculo
> - Poder usarse en filtros como cualquier otro campo

> **Ejemplo**:
> ```json
> {
>   "name": "effectiveLevel",
>   "type": "integer",
>   "computed": true,
>   "expression": "classLevels[?className=='Wizard'].level | [0]"
> }
> ```

#### 4.2 Evaluación

> **Debe**:
> - Usar jmespath como motor de evaluación
> - **Pendiente**: ¿Cachear o recalcular en cada acceso?
> - **Pendiente**: ¿Pueden computed fields depender de otros computed fields?
> - Validar que la expresión sea válida al definir el schema
> - Proveer mensajes claros si la evaluación falla

---

### 5) Selectores

#### 5.1 Concepto de Selector

> **Qué es**: Mecanismo genérico para ofrecer selección de entidades.

> **Debe**:
> - Configurarse como single-selection o multi-selection
> - Aplicar filtros para determinar entidades elegibles
> - Validar que las selecciones cumplan restricciones
> - Ser reutilizable en diferentes contextos (nivel de clase, dotes, etc.)

#### 5.2 Características

> **Debe soportar**:
> - Límites de cantidad (min/max selecciones)
> - Filtros de elegibilidad
> - Opcionalidad del selector completo
> - Preview de efectos (ej: mostrar supresiones antes de confirmar)

> **Casos de uso**:
> - Selección de dotes al subir nivel
> - Elección de aptitudes alternativas de clase
> - Selección de conjuros conocidos
> - Elección de habilidades de arquetipo

---

### 6) Validación y Estado

#### 6.1 Validación de Instancias

> **Debe**:
> - Validar que cada instancia cumple con su schema
> - Validar tipos de campos
> - Validar valores permitidos (enums)
> - Validar campos obligatorios
> - Validar referencias (suppressesIds apunta a IDs válidos)

#### 6.2 Estado del Sistema

> **Debe**:
> - Mantener registro de todas las entidades disponibles
> - Mantener registro de entidades seleccionadas/activas
> - Calcular supresiones en tiempo real
> - Proveer snapshot de estado completo

---

## PARTE II: CGE (Configuración de Gestión de Entidades)

El objetivo de este sistema es encontrar una abstracción única y suficientemente flexible que permita gestionar de manera coherente cualquier tipo de entidad accionable dentro de la aplicación (conjuros, maniobras, invenciones, habilidades con usos limitados, etc.). Estas entidades, aunque diferentes en sabor y reglas narrativas, comparten patrones estructurales: se pueden preparar, conocer, usar un número limitado de veces al día, gastar slots de diferentes niveles, o incluso acceder a listas completas sin aprendizaje previo.

Lo que se busca no es implementar reglas específicas para cada tipo de entidad, sino diseñar un marco genérico y configurable que pueda acomodar todas esas casuísticas. El sistema debe permitir que, a través de una **Configuración de Gestión de Entidades (CGE)**, cada personaje tenga definido cómo interactúa con un tipo concreto de entidad. Esa configuración abarcará desde la fuente de acceso a las entidades (listas filtradas, libros, acceso total) hasta el modo de gestión (preparación, conocidos, slots, usos diarios, etc.), pasando por el manejo de variables expuestas que más adelante podrán ser modificadas por efectos contextuales como la metamagia o condiciones especiales.

El verdadero reto no está en programar cada detalle, sino en encontrar la abstracción correcta que dé cabida a todas las opciones sin sobredimensionar el modelo. El sistema debe ser neutral en cuanto al dominio, de forma que hoy pueda gestionar conjuros y mañana maniobras u otro recurso inventado por el usuario. Además, debe mantener la filosofía de la aplicación: flexibilidad máxima, evitando restricciones duras y optando por un modelo que informe al usuario cuando algo no es elegible, pero no bloquee la interacción.

En definitiva, este trabajo persigue sentar las bases de un marco unificado de gestión de entidades accionables, lo bastante sólido como para soportar todas las variantes presentes en los juegos de rol clásicos y, al mismo tiempo, abierto a extensiones futuras que puedan surgir de nuevas mecánicas o necesidades de los usuarios.

---

## PRD — Requisitos exhaustivos del CGE

**Estado**: exploratorio (in-memory).
**Objetivo**: definir qué debe poderse hacer, no cómo. Sin código.

**Nota**: El CGE se construye sobre el Sistema de Entidades de la PARTE I, utilizando sus capacidades de filtrado, supresión, requerimientos y selección.

### 1) Alcance

- Cubrir todas las casuísticas comentadas para cualquier tipo de entidad accionable (conjuros, maniobras, invenciones, etc.) bajo un único modelo configurable.
- Un CGE gestiona un único tipo de entidad. Un personaje puede tener múltiples CGE (no se consolida en V0).
- Trabajar con niveles numéricos (0-9) para slots en V0, dejando abierta la evolución futura a categorías.
- Filosofía por defecto: "avisar, no bloquear"; debe existir modo estricto opcional. Esto sirve para que, por ejemplo, un jugador pueda elegir un conjuro que no sea de mago si el master se lo permite.

### 2) Entidades del sistema y sus requisitos

#### 2.1 CGE (Configuración de Gestión de Entidades)

> **Qué es**: La unidad que define cómo se usan/gestionan las entidades de un tipo.

> **Debe**:
> - Asociarse a exactamente un tipo de entidad (del sistema genérico de la PARTE I)
> - Declarar un **Modo de Gestión (MG)** entre los soportados (ver 2.2).
> - Definir fuente de acceso a entidades (ver 2.4) usando el sistema de filtrado de PARTE I.
> - Definir política de visualización (si se avisa de que una entidad no es elegible o simplemente no se muestra) (ver 2.5).
> - Exponer listas (accesible, conocidos, preparados) y su semántica (ver 2.4 y 2.6).
> - Gestionar recursos diarios (slots, usos por entidad, preparados globales) y resets.
> - Exponer variables para efectos/contextos (ver 2.7).
> - Proveer estado de consumo y reporting consistente.
> - Soportar reconciliación cuando cambia el acceso (ver 2.8).
> - No asumir exclusividad: el sistema no puede depender de que haya un solo CGE del mismo tipo en el personaje.
> - Respetar las supresiones del sistema genérico de PARTE I.

#### 2.2 Modos de Gestión (MG)

> **Qué son**: Variantes operativas del CGE.

> **Debe(n)**: soportarse todos estos MG, de forma configurable por CGE:
>
> - **Usos por entidad (sin slots ni niveles)**
>   - Registrar X usos/día por entidad.
>   - Permitir (opcional) seleccionar un subconjunto "activo" si la accesible es grande.
>   - Reset diario de usos.
>
> - **Slots por nivel (numéricos)**
>   - Capacidad por nivel (0-9).
>   - Submodos:
>     - **Preparado**: asignar entidades concretas a slots por nivel ("preparados por nivel").
>     - **Espontáneo**: gastar slots del nivel para cualquier entidad conocida de ese nivel.
>     - **Overcast (upcast) configurable**: gastar slots de niveles superiores según reglas.
>   - Invariantes de capacidad por nivel.
>
> - **Conocidos + slots (modelo hechicero)**
>   - Limitar conocidos por nivel (si aplica).
>   - Lanzamiento/uso espontáneo consumiendo slots del nivel resuelto.
>   - Overcast según política.
>
> - **Preparados globales por día (modelo mago 5e)**
>   - Seleccionar diariamente N entidades (no ligadas a niveles) como "preparadas globales".
>   - El uso gasta slots por nivel; la eligibilidad viene de la lista preparada global.
>   - Compatible con "preparar conocidos para hoy" (ver 2.6.d).
>
> - **Acceso total por lista (sin aprendizaje)**
>   - La lista de elegibles equivale a la accesible completa.
>   - Permite gatear por usos/día o por slots (o ambos), según CGE.

**Requisito transversal MG**: coexistencia de reglas (p.ej., tener "conocidos" y además "preparar conocidos para hoy") según la configuración del CGE.

#### 2.3 Resolución de nivel

> **Qué es**: Mecanismo para asignar nivel numérico a una entidad en el contexto de un CGE.

> **Debe**:
> - Funcionar sin depender de que la entidad contenga un campo "nivel".
> - Permitir mapeos distintos para la misma entidad según clase/origen/CGE (p.ej., un mismo conjuro puede ser 5 para hechicero y 3 para clérigo).
> - Ser determinista para inputs iguales.
> - Ser consultable en cualquier flujo (selección, preparación, uso).
> - Ser estable durante el ciclo diario o disponer de reglas de actualización si cambia.

#### 2.4 Acceso a entidades (fuente) y listas

> **Qué es**: Cómo se determina el universo elegible.

> **Debe**:
> - Soportar tres fuentes:
>   - **Lista filtrada** (usando el sistema de filtrado avanzado de PARTE I: AND/OR/NOT, jmespath, etc.)
>   - **Libro** (listado explícito de entidades "aprendidas"/disponibles).
>   - **Acceso total** (toda la lista del tipo).
> - Exponer **Lista Accesible** (unión de la fuente aplicada) y su marcado (ver 2.5).
> - Exponer **Lista de Conocidos** cuando el MG lo requiera (y límites por nivel si aplica).
> - Exponer **Lista de Preparados** (por nivel o global) cuando el MG lo requiera.

#### 2.5 Filtro y política de visualización

> **Qué es**: Reglas para calificar entidades como permitidas o no, y cómo mostrarlas.

> **Debe**:
> - Aplicarse siempre que la fuente sea "lista filtrada" (usando sistema de PARTE I).
> - Producir, por entidad, un estado: "permitida" o "mostrada con aviso".
> - Registrar razones de no cumplimiento (para UX/mensajes).
> - Permitir dos políticas:
>   - **"Avisar, no bloquear"**: mostrar todo; impedir solo si el MG/estado lo imposibilita materialmente.
>   - **"Estricto"**: ocultar/impedir lo no permitido según configuración del CGE.
> - Operar antes de conocidos/preparados, afectando su elegibilidad.

#### 2.6 Listas operativas

> **Debe**:
> - **Accesible**: resultado de la fuente + filtro + política (2.4–2.5).
> - **Conocidos**:
>   - Requerido en MG que lo usen (conocidos+slots, espontáneo con catálogo grande, etc.).
>   - Soportar límites por nivel si existen.
>   - Debe validar su pertenencia a Accesible (con marcado si deja de pertenecer).
> - **Preparados por nivel** (cuando el MG lo requiera):
>   - Validar cupos por nivel; soportar despreparar y reemplazar.
> - **Preparados globales (N diario)**:
>   - Elegibilidad independiente del nivel; uso posterior gasta slot por nivel.
> - **"Preparar conocidos para hoy" (overlay)**:
>   - Permitir que, cuando exista "conocidos", la preparación diaria (por nivel o global) pueda restringirse a ese conjunto.
>   - Debe poder activarse/desactivarse por CGE.

#### 2.7 Variables expuestas para efectos/contextos

> **Qué es**: Superficie que puede ser modificada por efectos (metamagia, condiciones, bufos) en fases de preparación y/o uso.

> **Debe**:
> - Separar siempre:
>   - **Nivel efectivo** (para CDs/escalados).
>   - **Nivel de slot** (costo de recurso).
>   - **Valores base vs valores modificados** (CD, daño, descriptores, etc.).
> - Permitir que metamagia y overcast:
>   - Aumenten nivel de slot sin alterar automáticamente el nivel efectivo (salvo reglas explícitas del efecto).
>   - Puedan modificar outputs (p.ej., daño) según la configuración.
> - Ser consultables en "simulación" (sin gasto) y en "confirmación" (con gasto).

#### 2.8 Estado, consumo y reconciliación

El estado actual del CGE se almacena en una propiedad currentState, que contiene el estado de los recursos (slots, usos, preparados), y el estado de las entidades conocidas (si el CGE lo requiere).

#### 2.9 Uso / Casteo

> **Debe**:
> - Validar si una entidad es utilizable ahora con el MG y estado actual (sí/avisos/no).
> - Soportar simulación (cálculo sin gasto) y confirmación (con gasto y actualización).
> - Respetar upcast cuando esté permitido y disponible.
> - Registrar avisos de política ("mostrada con aviso", recursos insuficientes, etc.).
> - Mantener invariantes:
>   - Slots usados ≤ capacidad por nivel.
>   - Usos consumidos ≤ usos diarios por entidad.
>   - Preparados por nivel ≤ cupo del nivel.

### 3) Requisitos transversales

- **Neutralidad de dominio**: el sistema no presupone campos específicos (p.ej., "nivel" en la entidad); todo pasa por resolutores y filtros configurables.
- **Determinismo y pureza conceptual**: mismas entradas → mismo resultado.
- **Estados legibles**: debe poder emitirse un snapshot con: capacidades, consumos, listas (y marcados), políticas activas, y variables expuestas.
- **Compatibilidad con múltiples CGE**: nada en el diseño puede impedir tener más de uno del mismo tipo; los estados deben ser locales a cada CGE.
- **Evolución a categorías**: los puntos donde hoy se habla de "nivel numérico" deben estar identificados para poder cambiar a dominios categóricos sin romper el resto.
- **Política conmutables**: "avisar, no bloquear" vs "estricto", configurable por CGE.
- **Trazabilidad de razones**: todos los avisos/marcados deben incluir motivos comprensibles (para UX y depuración).

### 4) Casuísticas y bordes (deben cubrirse)

- **Entidad cambia de elegibilidad** (por filtro/libro): queda marcada; no se pierde estado sin notificación; propuesta de resolución.
- **Mismo EA con niveles distintos según CGE/clase**: resolución correcta en cada CGE.
- **Slots insuficientes con overcast permitido**: selección de nivel superior válida hasta límite de política; avisos claros.
- **"Preparados globales" + "conocidos" + "slots por nivel"**: elegibilidad controlada por preparación global; consumo por nivel correcto.
- **"Acceso total" + "usos/día"** (sin slots): consumo diario por entidad; reset correcto.
- **Conocidos por nivel con límites**: impedir (o avisar según política) superar cupos; indicar excedentes.
- **Cambio de política de visualización** (no restrictiva ↔ estricta): debe afectar a listados y validaciones inmediatamente y de forma coherente.
- **Reset diario con preparaciones por nivel**: debe vaciar/renovar lo que corresponda según MG; no borrar datos persistentes como "libro" o "conocidos".
- **Simular vs confirmar**: la simulación nunca altera estado; la confirmación siempre lo altera y valida invariantes.
- **Entidades suprimidas**: el CGE debe respetar las supresiones del sistema genérico de PARTE I.

### 5) Resultados observables mínimos (aceptación)

Para cada CGE:

- Se puede obtener su Lista Accesible completa con marcados y razones.
- Se puede definir (cuando aplique) Conocidos respetando límites.
- Se puede preparar (por nivel o global) y usar entidades según su MG.
- Se puede overcastear cuando esté permitido, consumiendo el recurso correcto.
- Se puede resetear el ciclo diario reponiendo recursos según MG.
- Se puede consultar un snapshot con capacidades, consumos, listas y variables expuestas.
- Al cambiar filtros/libro, el sistema marca y reporta inconsistencias sin pérdida silenciosa de estado.

### 6) Vista a futuro (no V0, pero condiciona diseño)

- **Niveles categóricos** (dominio no numérico) con resolutor equivalente.
- **Heurísticas declarativas de apertura de contexto** (mostrar solo cuando haya opciones relevantes).
- **Canal de efectos/contextos** (pipeline ordenado, stacking, scopes de preparación/uso).
- **Consolidación de múltiples CGE del mismo tipo** (reglas de fusión/prioridad).
- **Modo campaña estricta** (bloqueos duros, auditoría de decisiones).

---

**Cierre**: Este PRD cubre tanto el sistema genérico de entidades (PARTE I) como el CGE especializado (PARTE II). Las preguntas pendientes marcadas en el documento deberán resolverse durante la implementación según las necesidades concretas que surjan.