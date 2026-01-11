# COMANDO: ANÁLISIS COMPLETO DE CONTEXTO

## 🎯 Propósito

**TRANSPARENCIA ABSOLUTA DEL CONTEXTO DEL AGENTE**

Este comando existe para proporcionar al usuario visibilidad total y sin filtros del contexto que el agente está utilizando. El usuario necesita entender:

- ¿Qué información tiene el agente disponible?
- ¿Cuánto espacio ocupa cada parte?
- ¿Es el contexto adecuado para la tarea actual?
- ¿Hay información irrelevante que diluya el foco?
- ¿Está el agente trabajando con información óptima?

El agente debe ser COMPLETAMENTE TRANSPARENTE y revelar TODO el contenido de su contexto actual sin omisiones.

---

## ⚠️ INSTRUCCIÓN CRÍTICA ANTES DE EMPEZAR

**ESTE COMANDO REQUIERE SEGUIR EL FORMATO AL PIE DE LA LETRA.**

🚨 **PRIORIDAD MÁXIMA:** El formato descrito a continuación NO ES UNA SUGERENCIA, es un CONTRATO ESTRICTO que DEBE cumplirse EXACTAMENTE.

- ❌ NO resumir el formato
- ❌ NO simplificar las secciones
- ❌ NO omitir las barras visuales
- ❌ NO cambiar la estructura
- ✅ SEGUIR el formato EXACTAMENTE como se describe

---

## 📋 FORMATO OBLIGATORIO

**NO DESVIARSE del formato bajo NINGUNA circunstancia.**

El análisis SIEMPRE debe seguir EXACTAMENTE este formato:

```
═══════════════════════════════════════════════════════════════
  ANÁLISIS COMPLETO DEL CONTEXTO DEL AGENTE
═══════════════════════════════════════════════════════════════

📊 SECCIONES DEL CONTEXTO (orden de aparición):

[ENUMERAR TODAS LAS SECCIONES EN EL ORDEN EXACTO QUE APARECEN]

Para cada sección:
1. NOMBRE DE LA SECCIÓN
   X%
   - Descripción breve del contenido
   - Datos clave relevantes

**⚠️ IMPORTANTE:** El porcentaje SIEMPRE debe ir en una línea nueva debajo del nombre de la sección, nunca en la misma línea.

Para rules:
- nombre-de-la-rule: Descripción de una línea o menos

═══════════════════════════════════════════════════════════════
  OCUPACIÓN VISUAL POR SECCIÓN
═══════════════════════════════════════════════════════════════

[Nombre sección]       ████████████░░░░░░░░░░░░░░░░░░░░  XX%
[Nombre sección]       ████████░░░░░░░░░░░░░░░░░░░░░░░░  XX%

[ORDENAR DE MAYOR A MENOR PORCENTAJE]
[Usar █ para parte llena, ░ para parte vacía]
[Total de 32 caracteres para la barra = 100%]

═══════════════════════════════════════════════════════════════
  ANÁLISIS CRÍTICO: OVERHEAD vs CONTENIDO ÚTIL
═══════════════════════════════════════════════════════════════

**🚨 SECCIÓN OBLIGATORIA - NUNCA OMITIR**

OVERHEAD FIJO (infraestructura siempre presente):
- tool_definitions: X%
- system_prompt: X%
- guidelines (citing, communication, tool_calling, etc.): X%
**TOTAL OVERHEAD: X%**

CONTENIDO ÚTIL (específico de la tarea):
- Código/archivos del proyecto: X%
- Reglas del workspace: X%
- Conversación relevante: X%
- Datos adicionales: X%
**TOTAL ÚTIL: X%**

DESPERDICIO DETECTADO:
- Duplicación de datos: X%
- Tool results innecesarios: X%
- Secciones sobredimensionadas: X%
**TOTAL DESPERDICIO: X%**

📊 RESUMEN:
- Espacio disponible efectivo: X% (100% - overhead)
- Espacio utilizado eficientemente: X%
- Espacio desperdiciado: X%
- **Eficiencia del contexto: X%** (útil / disponible)

═══════════════════════════════════════════════════════════════
  EVALUACIÓN DEL CONTEXTO
═══════════════════════════════════════════════════════════════

[INDICADOR] OVERHEAD FIJO
   [Cuantificar tool_definitions + system_prompt + guidelines]
   [Evaluar si el overhead es razonable para la tarea]
   [Identificar MCP tools no utilizados que ocupan espacio]
   [Calcular porcentaje de overhead vs espacio disponible]

[INDICADOR] DUPLICACIÓN DE DATOS **🚨 CRÍTICO**
   [Detectar el mismo diff apareciendo múltiples veces]
   [Identificar archivos leídos repetidamente]
   [Verificar tool results duplicados]
   [Cuantificar impacto: X% del contexto es duplicado]
   [SIEMPRE reportar si hay duplicación, aunque sea pequeña]

[INDICADOR] ADECUACIÓN DEL CONTEXTO
   [Análisis detallado]
   [Identificar secciones demasiado largas o escuetas]
   [Verificar si hay demasiados ejemplos o muy pocos]
   [Evaluar si el contexto es apropiado para la tarea actual]

[INDICADOR] REDUNDANCIA
   [Análisis detallado]
   [Identificar rules o conceptos que se repiten]
   [Verificar si hay explicaciones múltiples del mismo concepto]
   [Detectar solapamiento entre secciones]

[INDICADOR] COLISIÓN SEMÁNTICA
   [Análisis detallado]
   [Identificar rules de conceptos diferentes pero similares]
   [Detectar contradicciones o ambigüedades]
   [Evaluar prioridad de reglas en conflicto]

[INDICADOR] LLAMADAS A HERRAMIENTAS (si las hay)
   [Análisis detallado de tool calls presentes en el contexto]
   [Evaluar si el tamaño de las respuestas es adecuado]
   [Identificar si traen más información de la necesaria]
   [Verificar si hay tool calls redundantes o duplicados]
   [Comprobar eficiencia en la obtención de información]
   [Detectar archivos grandes leídos completos innecesariamente]

[INDICADOR] SECCIONES INESPERADAS **🚨 SORPRESAS**
   [Identificar secciones que ocupan más espacio del esperado]
   [Detectar datos inesperados en el contexto]
   [Reportar cualquier anomalía que pueda sorprender al usuario]
   [Ejemplos: project_layout excesivo, conversation inflada, etc.]

═══════════════════════════════════════════════════════════════
```

⚠️ **RECORDATORIO: Este formato es OBLIGATORIO. No simplificar, no resumir, no cambiar la estructura.**

## 🚦 Sistema de Semáforo

Usar EXACTAMENTE estos indicadores:

- 🟢 Verde: Correcto, sin problemas
- 🟡 Amarillo: Atención, puede mejorarse
- 🔴 Rojo: Problema crítico, requiere corrección

## 📏 Cálculo de Porcentajes

Los porcentajes deben ser **aproximados** pero reflejar la proporción real de tokens que ocupa cada sección respecto al total del contexto.

## 🔍 Nivel de Detalle

### Para cada sección del contexto:
- **Nombre exacto** de la sección
- **Porcentaje aproximado** de ocupación (SIEMPRE en una línea nueva debajo del nombre)
- **Contenido clave**: resumen de lo que contiene

**🚨 FORMATO OBLIGATORIO para porcentajes:**
El porcentaje SIEMPRE debe aparecer en una línea nueva debajo del nombre del concepto, nunca en la misma línea.

**Ejemplo CORRECTO:**
```
1. **rules - always_applied**
   45%
   - Descripción breve del contenido
```

**Ejemplo INCORRECTO:**
```
❌ 1. **rules - always_applied (45%)** - Descripción breve
```

### Para workspace rules (ALWAYS APPLIED) específicamente:

**🚨 REGLA CRÍTICA de descripción:**

Para cada regla activa, proporciona:
- **Título/concepto** en negrita que debe expresar en una frase el concepto general de la regla
- **NO listar sus detalles internos**
- **NO enumerar sus contenidos**
- **Descripción condensada**: resumen MUY CORTO en una sola frase general de qué trata la regla

**Ejemplo correcto:**
```
**Composición de clases CSS:**
45%
Uso obligatorio de createClassName, prohibición de funciones auxiliares.

**Patrones de código limpio:**
12%
Mantener baja anidación y alta legibilidad mediante extracción de lógica.
```

**⚠️ IMPORTANTE:** El porcentaje SIEMPRE debe ir en una línea nueva debajo del título del concepto en negrita.

**Ejemplo INCORRECTO:**
```
❌ **Patrones de CSS:** Regla que contiene: rotaciones con transforms, naming conventions (.active, .highlight), tokens vs hardcoded, CSS modules patterns, responsive design mobile first, breakpoints disponibles, patrón estándar.
```

### Para workspace rules (REQUESTABLE):

Para cada regla disponible bajo demanda, muestra ruta absoluta y descripción breve.

**Ejemplo:**
```
component-patterns: /Users/user/project/.cursor/rules/patterns.mdc - Patrones de arquitectura de componentes
testing-guidelines: /Users/user/project/.cursor/rules/testing.mdc - Guías para escribir tests unitarios
```

### Para archivos adjuntos:
- Ruta del archivo
- Número de líneas
- Tipo de contenido

### Para conversación actual:
- Número de mensajes intercambiados
- Resumen del flujo de la conversación
- Temas principales tratados

### Para llamadas a herramientas (tool calls):
- Número total de llamadas realizadas
- Tipos de herramientas utilizadas
- Tamaño aproximado de las respuestas
- Eficiencia de las llamadas (si traen info necesaria o excesiva)

## ⚙️ Barras de Progreso CLI

Usar caracteres estándar de CLI:
- `█` (U+2588) para porción llena
- `░` (U+2591) para porción vacía
- Total: 32 caracteres = 100%
- Calcular: `caracteres_llenos = round(porcentaje * 32 / 100)`

## 🎯 Orden de Ejecución OBLIGATORIO

**SEGUIR ESTE ORDEN EXACTAMENTE - SIN EXCEPCIONES:**

### Fase 1: Inventario Completo
1. **Analizar TODO el contexto** línea por línea
2. **Identificar TODAS las secciones** presentes:
   - ✅ tool_definitions (NUNCA omitir)
   - ✅ system_prompt (NUNCA omitir)
   - ✅ guidelines (communication, tool_calling, citing_code, etc.)
   - ✅ user_info, rules, project_layout, git_status
   - ✅ additional_data (DETECTAR DUPLICACIÓN)
   - ✅ current_conversation (incluye tool_results)
   - ✅ Cualquier otra sección inesperada

3. **Calcular porcentaje aproximado** de cada sección
4. **Detectar duplicaciones**:
   - ¿El mismo diff aparece múltiples veces?
   - ¿Archivos leídos repetidamente?
   - ¿Tool results redundantes?

### Fase 2: Clasificación
5. **Clasificar cada sección** en:
   - **OVERHEAD FIJO**: tool_definitions, system_prompt, guidelines
   - **CONTENIDO ÚTIL**: código, reglas, conversación relevante
   - **DESPERDICIO**: duplicaciones, datos innecesarios

6. **Calcular métricas**:
   - % Overhead fijo
   - % Contenido útil
   - % Desperdicio
   - Eficiencia del contexto (útil / disponible)

### Fase 3: Reporte Estructurado
7. **Listar secciones** en orden de aparición con:
   - Nombre exacto
   - Porcentaje (en línea nueva)
   - Descripción breve
   - Datos clave

8. **Crear visualización con barras** (ordenadas por tamaño) - **NO OMITIR**

9. **Análisis crítico overhead vs útil** - **SECCIÓN OBLIGATORIA**

10. **Evaluar con sistema de semáforo** - **TODAS las categorías:**
    - ✅ Overhead fijo
    - ✅ Duplicación de datos (CRÍTICO)
    - ✅ Adecuación del contexto
    - ✅ Redundancia
    - ✅ Colisión semántica
    - ✅ Llamadas a herramientas (si las hay)
    - ✅ Secciones inesperadas (SORPRESAS)

### 🚨 Validación Final
- [ ] ¿Se identificaron tool_definitions?
- [ ] ¿Se identificó system_prompt?
- [ ] ¿Se detectaron duplicaciones?
- [ ] ¿Se calculó overhead vs útil?
- [ ] ¿Se reportaron todas las secciones?
- [ ] ¿Se crearon las barras visuales?
- [ ] ¿Se evaluaron TODAS las categorías del semáforo?

**Si falta CUALQUIER elemento de la checklist, el análisis está INCOMPLETO.**

## 📊 Ejemplos Detallados de Análisis de Calidad

**IMPORTANTE:** Antes de completar la evaluación, usa tus tokens de razonamiento para **ULTRATHINK** profundamente sobre cada aspecto. Este análisis es crítico para debugging y requiere reflexión exhaustiva.

### 🔴 OVERHEAD FIJO - Ejemplo de análisis crítico esperado

**Ejemplo de formato esperado:**
> **Overhead fijo detectado: 38% del contexto**
> - tool_definitions: 18% (incluye ~50 tools, de los cuales Figma/Chrome DevTools (~12%) nunca se usan en este proyecto)
> - system_prompt: 7%
> - guidelines: 13% (citing_code: 5%, communication: 2%, tool_calling: 3%, task_management: 2%, making_code_changes: 1%)
> 
> **Análisis:** El proyecto es un monorepo React/TypeScript sin Figma ni browser testing. Las definiciones de Figma (8 tools) y Chrome DevTools (30 tools) ocupan ~12% del contexto sin aportar valor. **Recomendación:** Este overhead es inevitable en Cursor pero el usuario debe ser consciente de que solo ~62% del contexto está disponible para su proyecto.

### 🔴 DUPLICACIÓN CRÍTICA - Ejemplo de análisis esperado

**Ejemplo de formato esperado:**
> **Duplicación masiva detectada: 28% del contexto es duplicado**
> - El diff del branch `add-reading` aparece 3 veces en el contexto:
>   1. En el mensaje inicial del usuario (9%)
>   2. En el segundo mensaje del usuario (9%)
>   3. En el tercer mensaje del usuario (10%)
> - Total desperdicio: 18% del contexto (2 copias redundantes del mismo diff)
> 
> **Archivos leídos múltiples veces:**
> - `component-architecture.mdc`: Leído en tool_result #1 (3%) y nuevamente en tool_result #4 (3%)
> - Total desperdicio adicional: 3%
> 
> **IMPACTO TOTAL: 21% del contexto es duplicación pura.** Esto reduce el espacio efectivo de ~62% a ~41%. **Severidad: CRÍTICA - casi la mitad del contexto útil se pierde por duplicación.**

### 🔴 COLISIÓN SEMÁNTICA - Ejemplo de análisis esperado

**Ejemplo de formato esperado:**
> **Contradicción detectada:** User Rules establece "Don't use ternaries" (prohibición total) mientras Workspace Rules indica "NUNCA usar ternarios anidados" (solo prohibe anidados). Esta contradicción afecta cada condicional simple requiriendo interpretación. 
> 
> **Resolución:** User Rules tiene prioridad jerárquica → prohibición total de ternarios. Pero Workspace Rules es más específica y razonada → sugiere que la intención real es solo evitar anidación.
> 
> **Severidad: MEDIA** - Genera fricción en decisiones de código. El agente debe asumir prohibición total pero reconocer que puede ser excesiva para casos simples.

### 🟡 REDUNDANCIA - Ejemplo de análisis esperado

**Ejemplo de formato esperado:**
> **Duplicación identificada en rules:**
> - "Traducciones i18n" y "Traducciones dinámicas": ~40% de solapamiento
>   - Ambas cubren: useTranslation, namespaces, pluralización con _one/_other
>   - Ambas reiteran: "SIEMPRE usar i18n", "NUNCA hardcodear strings"
>   - Diferencia: "Traducciones dinámicas" añade énfasis en parámetros vs valores fijos
>   - Podrían consolidarse en "Traducciones i18n completas"
> 
> - "Patrones de código limpio" y "Estructura de componentes React": ~25% de solapamiento
>   - Ambas tratan: organización de código, legibilidad, extracción de lógica
>   - Diferencia: Una es genérica, otra específica de React
>   - Solapamiento aceptable pero podría optimizarse
> 
> **Impacto total:** ~4.5% del contexto es redundancia en rules. Consolidar "Traducciones" ahorraría ~3% → espacio útil de ~65% a ~68%.

### 🟢 ADECUACIÓN - Ejemplo de análisis esperado

**Ejemplo de formato esperado:**
> **Excesivamente detalladas:**
> - "Estructura del repositorio": 7% del contexto con explicación exhaustiva de monorepo, cada paquete, mise.toml, flujos de trabajo. Incluye 8 ejemplos de comandos cuando 2-3 serían suficientes. **Reducible ~40%** (de 7% a ~4%).
> - "Mixins disponibles": Lista todos los mixins con ejemplos. Podría ser referencia externa. **Reducible ~30%** (de 2% a ~1.5%).
> 
> **Insuficientemente detalladas:**
> - "Navigation": Solo muestra useNavigate vs href. No cubre routing complejo, params, state passing. **Requiere +50%** de contenido con ejemplos de casos comunes.
> 
> **Balance general:** Workspace rules ocupan 38% del contexto con distribución: 55% útil, 20% redundante, 15% ejemplos excesivos, 10% insuficiente. **Optimización posible: reducir de 38% a ~28%** consolidando redundancias y balanceando ejemplos.

### 🟡 SECCIONES INESPERADAS - Ejemplo de análisis esperado

**Ejemplo de formato esperado:**
> **Sorpresas detectadas que el usuario debe conocer:**
> 
> 1. **project_layout ocupa 18%** - En un monorepo con 3 paquetes, el layout es muy detallado incluyendo conteos de archivos por tipo en cada subdirectorio. En proyectos grandes esto puede crecer hasta 25-30%. **Advertencia:** Considerar si este nivel de detalle es necesario o si un layout resumido sería suficiente.
> 
> 2. **Tool definitions incluyen 30 tools de Chrome DevTools** (~8% del contexto) que nunca se usan en desarrollo React backend. **Advertencia:** Este es overhead fijo inevitable pero el usuario debe saber que ~8% de su contexto está ocupado por herramientas que no necesita.
> 
> 3. **current_conversation incluye 4 tool_results completos** (~8%) de lecturas de archivos .mdc que ahora están en always_applied rules. **Advertencia:** Posible duplicación - las reglas leídas en tool_results están consumiendo espacio cuando ya están aplicadas automáticamente.

## ⚠️ IMPORTANTE - CUMPLIMIENTO OBLIGATORIO DEL FORMATO

🔴 **ESTAS REGLAS SON ABSOLUTAMENTE OBLIGATORIAS Y NO NEGOCIABLES** 🔴

- ✅ El análisis SIEMPRE debe usar el formato EXACTO especificado arriba
- ✅ NUNCA inventar un formato alternativo
- ✅ NUNCA omitir secciones del formato (barras visuales, evaluaciones, etc)
- ✅ NUNCA cambiar el orden de las secciones de la plantilla
- ✅ NUNCA omitir ninguna sección del contexto
- ✅ Las secciones deben aparecer en el orden EXACTO que tienen en el contexto real
- ✅ Los porcentajes deben sumar aproximadamente 100%
- ✅ El idioma del análisis es CASTELLANO
- ✅ Para rules, usar rutas absolutas en links:
  - Formato: `[/ruta/absoluta/archivo.mdc](/ruta/absoluta/archivo.mdc)`
  - Construir: `{workspace_path}/{ruta_relativa}`

**El formato descrito es SAGRADO. Seguirlo al dedillo es la MÁXIMA PRIORIDAD.**

## 💡 Secciones del Contexto - LISTA EXHAUSTIVA OBLIGATORIA

### 🚨 CRÍTICO: NO OMITIR NINGUNA SECCIÓN

El agente DEBE identificar y reportar TODAS las secciones presentes en el contexto, incluyendo aquellas que puedan sorprender al usuario por su tamaño o presencia inesperada.

### 📋 Secciones SIEMPRE Presentes (Overhead Fijo)

Estas secciones están SIEMPRE en el contexto y deben ser reportadas OBLIGATORIAMENTE:

#### 1. **tool_definitions** (~15-20%)
**🚨 NUNCA OMITIR - Es la sección más grande del overhead fijo**

Definiciones JSON completas de TODAS las herramientas disponibles:
- **Standard tools** (~8 tools): `codebase_search`, `grep`, `read_file`, `write`, `search_replace`, `run_terminal_cmd`, `delete_file`, `web_search`, `read_lints`, `edit_notebook`, `todo_write`, `list_dir`, `glob_file_search`
- **MCP tools** (variable según instalación):
  - **Figma** (~8 tools): `get_design_context`, `get_variable_defs`, `get_code_connect_map`, `get_screenshot`, `get_metadata`, `create_design_system_rules`, `get_figjam`
  - **Context7** (~2 tools): `resolve-library-id`, `get-library-docs`
  - **Chrome DevTools** (~30 tools): `click`, `navigate_page`, `take_screenshot`, `evaluate_script`, `fill`, `hover`, etc.
  - **Next DevTools** (~6 tools): `init`, `nextjs_docs`, `nextjs_runtime`, `browser_eval`, `upgrade_nextjs_16`, `enable_cache_components`

Cada tool incluye:
- Descripción detallada completa
- Schema JSON con todos los parámetros
- Enums de valores posibles
- Ejemplos de uso
- Restricciones y validaciones

**⚠️ IMPORTANTE:** Aunque nunca uses Figma o Chrome DevTools, sus definiciones ocupan contexto. Esto es overhead fijo que reduce el espacio disponible para código y datos del proyecto.

#### 2. **system_prompt** (~5-8%)
**Instrucciones base del agente:**
- Identidad: "AI coding assistant powered by Claude Sonnet 4.5"
- Rol: "Pair programming with a USER"
- Capabilities: acceso a 1M tokens con fresh context windows automáticos
- Instrucciones sobre ambición de tareas
- Budget de tokens

#### 3. **communication_guidelines** (~2-3%)
- Uso de markdown y backticks
- Formato de matemáticas
- Política de emojis
- Inline line numbers explanation

#### 4. **tool_calling_guidelines** (~2-3%)
- Reglas sobre cuándo/cómo usar herramientas
- Maximize parallel tool calls
- No referirse a nombres de herramientas
- Implementar cambios en lugar de solo sugerirlos

#### 5. **making_code_changes_guidelines** (~1-2%)
- Crear archivos de dependencias
- UX/UI best practices
- Evitar hashes largos
- Corregir errores de linter

#### 6. **citing_code_guidelines** (~4-6%)
- Formato CODE REFERENCES para código existente
- Formato MARKDOWN CODE BLOCKS para código nuevo
- Reglas críticas de formato
- Ejemplos y contraejemplos

#### 7. **task_management_guidelines** (~1-2%)
- Cuándo usar todo_write
- Gestión de estados de tareas
- Ejemplos de uso correcto

**📊 OVERHEAD FIJO TOTAL: ~30-40% del contexto**

Este overhead es FIJO y SIEMPRE presente. Solo queda ~60-70% para:
- Código/archivos del proyecto
- Conversación
- Reglas específicas
- Datos adicionales

### 📋 Secciones Variables (Contenido del Proyecto)

Estas secciones dependen del proyecto y conversación actual:

#### 8. **user_info** (~1-2%)
- OS, shell, workspace path
- Fecha actual
- Preferencias de rutas

#### 9. **rules - agent_requestable** (~2-3%)
- Lista de reglas disponibles bajo demanda
- Rutas y descripciones
- Solo referencias, NO contenido completo

#### 10. **rules - always_applied** (~10-30%)
**🚨 VARIABLE - Puede ser ENORME**
- Reglas que se aplican automáticamente
- Puede incluir 10-20+ reglas
- Cada regla puede ocupar ~1-3% del contexto

#### 11. **user_rules** (~0.5-1%)
- Reglas personalizadas del usuario
- Preferencias específicas

#### 12. **project_layout** (~5-15%)
**Estructura de archivos del workspace**
- Puede ser muy grande en monorepos
- Incluye conteos de archivos por tipo

#### 13. **git_status** (~1-3%)
- Branch actual
- Archivos modificados
- Commits pendientes

#### 14. **additional_data** (VARIABLE: 0-50%)
**🚨 CRÍTICO: Puede incluir datos DUPLICADOS**
- Diffs del branch actual
- Archivos adjuntos
- **DETECTAR DUPLICACIÓN:** El mismo diff puede aparecer múltiples veces si el usuario lo incluye en varios mensajes

#### 15. **current_conversation** (~5-20%)
**🚨 CRECE CON CADA MENSAJE**
- Incluye mensajes del usuario
- Respuestas del agente
- **Tool calls y sus resultados completos**
- Puede crecer masivamente en conversaciones largas

#### 16. **tool_results** (VARIABLE: 0-30%)
**Resultados de tool calls ejecutados:**
- Contenido completo de archivos leídos
- Resultados de búsquedas
- **DETECTAR DUPLICACIÓN:** Si se lee el mismo archivo múltiples veces

#### 17. **websearch_results** (si aplicable: 0-10%)
- Resultados de búsquedas web
- Snippets y URLs

#### 18. **linter_errors** (si aplicable: 0-5%)
- Errores de linting activos
- Warnings del proyecto

### 🚨 Secciones INESPERADAS que Pueden Sorprender

El agente DEBE detectar y reportar con ÉNFASIS especial:

1. **Duplicación de datos** (~0-50%)
   - **CRÍTICO:** El mismo diff apareciendo múltiples veces
   - Archivos leídos repetidamente
   - Resultados de tool calls duplicados
   - **Impacto:** Puede desperdiciar hasta 50% del contexto

2. **Tool results desproporcionados** (~0-40%)
   - Archivos muy grandes leídos completos
   - Reglas requestables cargadas en conversación anterior y ahora en tool_results
   - Búsquedas con resultados excesivos
   - **Impacto:** Pueden diluir el foco del agente

3. **Conversación inflada** (~10-30%)
   - Conversaciones muy largas con contexto acumulado
   - Respuestas previas del agente ocupando mucho espacio
   - **Impacto:** Reduce espacio para nuevos datos

4. **MCP tools no utilizados** (~10-15%)
   - Definiciones de Figma si nunca se usa
   - Chrome DevTools completo si no se necesita
   - **Impacto:** Overhead fijo que no aporta valor

5. **Project layout desproporcionado** (~15-25%)
   - En monorepos muy grandes
   - Con muchos node_modules listados
   - **Impacto:** Puede ser más detallado de lo necesario

## 🔓 Transparencia Absoluta

**El agente NO debe ocultar NADA del contexto.**

Este comando existe para que el usuario pueda:
- Auditar completamente qué información tiene el agente
- Entender las decisiones del agente basándose en su contexto
- Optimizar el contexto para mejorar el rendimiento
- Detectar problemas de context rot o dilución de foco
- Identificar oportunidades de mejora en la ingeniería del contexto

El agente debe proporcionar:
- **Conteo exacto** de tokens por sección (aproximado)
- **Descripción completa** de cada sección sin omitir detalles
- **Análisis crítico** sin sesgo positivo artificial
- **Identificación honesta** de problemas o ineficiencias
- **Recomendaciones concretas** de optimización cuando aplique

---

## 🚨 CHECKLIST FINAL DE VALIDACIÓN

Antes de completar el análisis, el agente DEBE verificar:

### ✅ Secciones Obligatorias Reportadas
- [ ] tool_definitions identificado y cuantificado (~15-20%)
- [ ] system_prompt identificado y cuantificado (~5-8%)
- [ ] guidelines identificadas (citing, communication, tool_calling) (~5-8%)
- [ ] Overhead fijo total calculado (~30-40%)

### ✅ Análisis Crítico Completado
- [ ] Overhead vs contenido útil calculado y reportado
- [ ] Duplicación de datos detectada y cuantificada
- [ ] Eficiencia del contexto calculada (útil / disponible)
- [ ] Todas las secciones listadas en orden de aparición
- [ ] Barras visuales creadas (ordenadas por tamaño)

### ✅ Evaluación con Semáforo
- [ ] 🔴/🟡/🟢 Overhead fijo
- [ ] 🔴/🟡/🟢 Duplicación de datos (CRÍTICO)
- [ ] 🔴/🟡/🟢 Adecuación del contexto
- [ ] 🔴/🟡/🟢 Redundancia
- [ ] 🔴/🟡/🟢 Colisión semántica
- [ ] 🔴/🟡/🟢 Llamadas a herramientas (si aplicable)
- [ ] 🔴/🟡/🟢 Secciones inesperadas

### ✅ Sorpresas y Anomalías
- [ ] Secciones desproporcionadas identificadas
- [ ] Datos inesperados reportados
- [ ] MCP tools no utilizados detectados
- [ ] Project layout excesivo evaluado
- [ ] Conversación inflada analizada

### 🚨 Si falta CUALQUIER checkmark, el análisis está INCOMPLETO

**El usuario espera transparencia TOTAL. No omitir nada por "simplificación".**

---

## 💡 Notas Finales para el Agente

### Mentalidad Crítica Requerida

Este comando NO es para validar que todo está bien. Es para:
1. **Detectar ineficiencias** que el usuario no puede ver
2. **Cuantificar desperdicio** de contexto
3. **Identificar sorpresas** que afectan el rendimiento
4. **Proporcionar datos** para optimización

### Sesgo Cero

- ❌ NO minimizar problemas encontrados
- ❌ NO asumir que el contexto es "razonable por defecto"
- ❌ NO omitir secciones por ser "esperadas"
- ✅ REPORTAR todo, especialmente lo inesperado
- ✅ SER CRÍTICO con duplicaciones y desperdicio
- ✅ CUANTIFICAR impacto real de cada problema

### Prioridades

1. **NUNCA omitir tool_definitions** - Es la sección más grande del overhead
2. **SIEMPRE detectar duplicación** - Puede consumir 20-50% del contexto
3. **REPORTAR overhead fijo completo** - El usuario debe saber cuánto espacio tiene realmente
4. **IDENTIFICAR sorpresas** - Secciones inesperadamente grandes o pequeñas

**Este comando es una herramienta de debugging del contexto. Tratarlo con la misma seriedad que debugging de código.**
