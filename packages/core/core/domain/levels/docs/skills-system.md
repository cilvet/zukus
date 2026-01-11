# Sistema de Skills - Requisitos y Diseño

> **Estado**: Diseño conceptual  
> **Dependencias**: Requiere campos computados (futuro)  
> **Relacionado con**: Fase 8 (ClassDefinition), Sistema de Variables

---

## Objetivos del Sistema

El sistema de skills debe permitir:

1. **Expandibilidad**: Las skills disponibles deben poder ser modificadas por el usuario
2. **Configurabilidad**: Cada skill debe poder tener su atributo base modificable
3. **Asignación de rangos**: El usuario debe poder asignar rangos y medios rangos a cada skill
4. **Entidades como skills**: En el futuro, cada skill será una entidad que crea variables
5. **Templating avanzado**: Sistema de templating para referenciar variables de entidades dinámicamente

---

## Requisitos Funcionales

### 1. Sistema Expandible de Skills

**Requisito**: Las skills disponibles deben poder ser modificadas por el usuario.

**Ejemplos de modificaciones**:
- Añadir nuevas skills personalizadas
- Eliminar skills del sistema base
- Modificar nombres o descripciones de skills existentes

**Implicaciones**:
- Las skills no pueden estar hardcodeadas
- Debe existir un sistema de registro/catálogo de skills disponibles
- El sistema debe poder funcionar con cualquier conjunto de skills

---

### 2. Configurabilidad de Atributo Base

**Requisito**: Cada skill debe poder tener su atributo base modificable por el usuario.

**Ejemplo**: 
- Skill "Saltar" normalmente usa Fuerza como atributo base
- Usuario quiere cambiarlo a Destreza
- El sistema debe permitir esta modificación y recalcular automáticamente

**Implicaciones**:
- Cada skill debe tener un campo configurable para su atributo base
- Las fórmulas que usan skills deben referenciar el atributo base dinámicamente
- Los cambios de atributo base deben propagarse a todos los cálculos que usan esa skill

---

### 3. Sistema de Rangos y Medios Rangos

**Requisito**: Las skills deben tener un número de "rangos" y "medios rangos" que el usuario debe poder asignarles.

**Conceptos**:
- **Rangos**: Unidades completas de entrenamiento en una skill (1 rango = +1 bonus)
- **Medios rangos**: Mitades de rango (2 medios rangos = 1 rango completo)
- **Rangos disponibles**: Total de rangos que el personaje puede asignar (basado en nivel, clase, INT, etc.)

**Requisitos de UI (futuro)**:
- View para asignar rangos en la configuración de edición de un nivel
- Mostrar rangos disponibles vs rangos asignados
- Permitir asignar rangos completos o medios rangos
- Validar que no se excedan los rangos disponibles

**Implicaciones**:
- Cada skill necesita campos para almacenar rangos asignados
- El sistema debe calcular el bonus total basado en rangos + atributo + otros modificadores
- Los rangos disponibles deben calcularse dinámicamente según nivel y clase

---

### 4. Skills como Entidades

**Requisito**: En el futuro, las skills serán entidades, cada una de las cuales creará una variable.

**Estructura esperada**:
- Cada skill es una entidad con tipo `skill`
- Cada skill tiene propiedades configurables (atributo base, nombre, descripción, etc.)
- Cada skill genera variables automáticamente cuando se añade al personaje

**Variables generadas por cada skill**:
- `@customVariables.skills.<skillId>.totalBonus` - Bonus total de la skill
- `@customVariables.skills.<skillId>.ranks` - Rangos asignados
- `@customVariables.skills.<skillId>.abilityModifier` - Modificador del atributo base
- `@customVariables.skills.<skillId>.miscBonus` - Otros modificadores (items, feats, etc.)

**Ventajas**:
- Skills pueden tener conditions, effects, suppression como cualquier entidad
- Filtros pueden referenciar skills por ID o propiedades
- Sistema de addons puede aplicarse a skills
- Skills pueden ser otorgadas por clases, feats, items, etc.

---

### 5. Sistema de Templating para Variables de Entidades

**Requisito**: Sistema de templating que permita usar variables de las propias entidades dinámicamente.

**Sintaxis esperada**:
- `@customVariables.skills.${@entity.id}.totalBonus` - Referencia dinámica a variable de skill por ID de entidad
- `@customVariables.skills.${@entity.id}.ranks` - Rangos de la skill referenciada por entidad
- `@customVariables.skills.${skillId}.abilityModifier` - Modificador de atributo de skill específica

**Casos de uso**:
- Feat que da bonus igual a rangos en una skill específica
- Class feature que requiere X rangos en una skill
- Item que mejora todas las skills de un tipo (usando filtros de entidades)

**Requisitos técnicos**:
- El sistema de fórmulas debe soportar interpolación de variables dentro de expresiones
- Las variables deben resolverse en tiempo de cálculo
- Debe ser posible referenciar propiedades de entidades dinámicamente

---

## Class Skills en ClassDefinition

### Decisión: Array de IDs

**Formato**: `classSkills: string[]` - Array de IDs de skills

**Ejemplo**:
```typescript
classSkills: ['acrobatics', 'stealth', 'disable-device']
```

**Ventajas**:
- Simple y directo
- Fácil de validar
- Compatible con sistema futuro de skills como entidades (los IDs serán IDs de entidades)

**Relación con sistema futuro**:
- Cuando las skills sean entidades, estos IDs referenciarán directamente las entidades de tipo `skill`
- Los filtros podrán usar `entityType: 'skill'` y `id: 'acrobatics'` para referenciar skills

---

## Metadata de ClassDefinition para Skills

### Campos relacionados con skills en ClassDefinition

Basado en el sistema actual (`CharacterClass`), los campos relacionados con skills son:

1. **classSkills**: Array de IDs de skills que son class skills para esta clase
2. **skillPointsPerLevel**: Número de puntos de skill que otorga cada nivel de esta clase

**Campos adicionales que podrían necesitarse**:
- **skillPointsFormula**: Fórmula para calcular puntos de skill (permite variaciones por nivel)
- **maxRanksFormula**: Fórmula para calcular máximo de rangos permitidos (normalmente nivel + 3)

---

## Dependencias Técnicas

### Campos Computados

**Requisito crítico**: El sistema de skills requiere campos computados para funcionar completamente.

**Razones**:
- Las variables de skills (`@customVariables.skills.<id>.totalBonus`) deben calcularse dinámicamente
- El cálculo debe considerar: rangos + modificador de atributo + modificadores misceláneos
- Los rangos disponibles deben calcularse basándose en nivel, clase, INT, etc.
- Las referencias dinámicas (`${@entity.id}`) requieren evaluación en tiempo de cálculo

**Estado actual**: Los campos computados están en fase de exploración (ver `poc/deep-search/`)

**Bloqueo**: El sistema completo de skills no puede implementarse hasta que los campos computados estén disponibles.

---

## Fases de Implementación

### Fase 1: Estructura Básica (Actual)
- `classSkills` como array de strings en ClassDefinition
- Definición básica de skills como constantes o tipos simples
- Sin cálculo automático de bonuses

### Fase 2: Skills como Entidades (Futuro)
- Crear schema de entidad `skill`
- Migrar skills existentes a entidades
- Sistema de registro de skills disponibles

### Fase 3: Sistema de Rangos (Futuro)
- Campos para almacenar rangos asignados por skill
- Cálculo de rangos disponibles
- UI para asignar rangos en niveles

### Fase 4: Campos Computados y Variables (Futuro)
- Implementar campos computados
- Variables automáticas por skill (`@customVariables.skills.<id>.*`)
- Sistema de templating con interpolación dinámica

### Fase 5: Configurabilidad Avanzada (Futuro)
- Modificar atributo base de skills
- Añadir/eliminar skills del sistema
- Personalización completa de skills

---

## Notas de Diseño

### Separación de Concerns

- **ClassDefinition**: Define qué skills son class skills y cuántos puntos otorga
- **Skill Entities**: Definen las skills disponibles y sus propiedades
- **Character Data**: Almacena rangos asignados y configuración personalizada
- **Calculation System**: Calcula bonuses totales usando campos computados

### Extensibilidad

El diseño debe permitir:
- Añadir nuevos tipos de modificadores a skills (items, feats, buffs)
- Variaciones por sistema de juego (D&D 3.5, Pathfinder, etc.)
- Skills personalizadas con reglas especiales

### Performance

Consideraciones:
- Las skills pueden ser muchas (30+ en D&D 3.5)
- Los cálculos deben ser eficientes
- El sistema de campos computados debe cachear resultados cuando sea posible

---

## Referencias Relacionadas

- **Fase 8**: ClassDefinition - Define estructura de clases con classSkills
- **Sistema de Variables**: Variables personalizadas y templating
- **Campos Computados**: POC en `poc/deep-search/computed-fields.ts`
- **Sistema de Entidades**: Skills como entidades en el futuro

---

*Última actualización: 2025-12-28*


