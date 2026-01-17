---
description: "Learn from the conversation and propose new rules or improvements to existing ones"
---

# learn

Reflect deeply on this conversation to identify knowledge that should be captured in rules. The goal is: **"If it had to be explained once, it shouldn't need to be explained again"**.

## 1. Instrucciones Explícitas del Usuario
- ¿Qué explicaciones dio el usuario sobre **cómo hacer las cosas**?
- ¿Qué preferencias, decisiones o criterios expresó?
- ¿Te corrigió o guió en alguna implementación?
- ¿Hubo preguntas del agente que el usuario tuvo que responder con contexto?
- ¿El usuario mostró frustración al tener que explicar algo?

## 2. Aprendizajes del Agente
- ¿Qué patrones descubriste al implementar?
- ¿Tomaste decisiones repetidamente que podrían documentarse?
- ¿Encontraste soluciones a problemas que podrían evitarse con una regla?
- ¿Detectaste inconsistencias en el código existente que sugieren una regla implícita?
- ¿Hubo algo que te habría ahorrado tiempo si lo hubieras sabido al inicio?
- ¿Cometiste errores que una regla clara habría prevenido?

## 3. Validación contra Reglas Existentes
- Revisa las reglas existentes del workspace
- ¿Esta información **ya existe** en las reglas actuales?
- Si existe, ¿está lo suficientemente clara o necesita ampliarse?
- Si NO existe, ¿es conocimiento que debería estar documentado?
- ¿Hay contradicciones entre lo aprendido y reglas existentes?

## 4. Criterio de Valor
Evaluar cada potencial regla con estos criterios:

✅ **SÍ documentar si**:
- Es un patrón repetible que se usará en el futuro
- Previene errores significativos o ahorra tiempo considerable
- Es una preferencia de implementación no obvia
- Es una decisión arquitectónica o de diseño
- Clarifica ambigüedades comunes

❌ **NO documentar si**:
- Es un caso único o muy específico del momento
- Es una decisión trivial u obvia
- Ya está claramente documentado en reglas existentes
- Es conocimiento demasiado general (no específico del proyecto)

## 5. Propuestas de Reglas
Para cada regla que consideres valiosa, presenta:

### Propuesta [N]: [Titulo Descriptivo]

**Fuente**: Usuario | Agente | Ambos

**Accion**: Nueva regla | Editar regla existente: `[nombre-archivo.mdc]`

**Justificacion**:
[Explica por que esto mejora el contexto y previene tener que explicarlo de nuevo]

**Ubicacion**: `.cursor/rules/[carpeta]/[nombre].mdc`
- Decidir la carpeta segun el tipo de regla (code/, tooling/, testing/, workflow/, core/, etc.)
- Revisar las carpetas existentes en `.cursor/rules/` para mantener coherencia

**alwaysApply**: true | false
- `true`: Regla que siempre debe aplicarse (convenciones generales, tooling, etc.)
- `false`: Regla que solo aplica en contextos especificos

**Contenido Propuesto**:
```markdown
---
description: [Descripcion corta de la regla]
globs: 
alwaysApply: [true|false]
---

# [Titulo]

[Contenido de la regla]
- Incluir principios clave
- Incluir 1-2 ejemplos (correcto vs evitar)
- Ser conciso y accionable
```

**IMPORTANTE sobre el formato .mdc**:
- Siempre incluir el frontmatter YAML con `description`, `globs`, y `alwaysApply`
- Dejar `globs:` vacio (sin valor) - NO usamos globs porque no funcionan bien
- El contenido va despues del frontmatter

---

**Importante**:
- Sé selectivo: proponer solo reglas de alto valor
- Sé específico: las reglas deben ser accionables, no teoría general
- Sé conciso: reglas cortas y directas
- **NO implementes cambios**, solo propón para que el usuario revise

Después de tu análisis, presenta tus propuestas al usuario para que decida cuáles implementar.
