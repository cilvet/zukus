# Crear Nuevo Comando

## 📍 Ubicación

Crea un archivo `.md` en `.cursor/commands/` con un nombre descriptivo en kebab-case.

**Ejemplo:** `.cursor/commands/add-new-endpoint.md`

---

## 📝 Formato

Los comandos deben estar escritos en **Markdown** con una estructura imperativa y clara.

---

## 🎯 Naturaleza Imperativa

Los comandos son **instrucciones directas** que deben seguirse paso a paso.

**✅ Correcto (imperativo):**
- "Crea un nuevo servicio en `domain/services/`"
- "Implementa el repositorio mockeando el cliente API"
- "Añade tests unitarios para el mapper"

**❌ Evitar (explicativo):**
- "Podrías crear un servicio..."
- "Sería bueno implementar..."
- "Considera añadir tests..."

---

## 🏗️ Estructura Recomendada

```markdown
# [Nombre del Comando]

## 🎯 Objetivo
Descripción breve de qué hace el comando (1-2 líneas).

## 📋 Pasos

### 1. [Primer Paso]
Instrucciones claras y específicas.

**Ejemplo:**
```java
// código de ejemplo
```

### 2. [Segundo Paso]
Más instrucciones...

### 3. [Tercer Paso]
...

## ✅ Verificación

Lista de checks para validar que el comando se completó correctamente:
- [ ] Criterio 1
- [ ] Criterio 2
- [ ] Criterio 3

## 📁 Referencias

Enlaces a archivos o reglas relevantes:
- `ruta/al/archivo/ejemplo.java`
- [nombre-de-regla.mdc](mdc:.cursor/rules/nombre-de-regla.mdc)
```

---

## 📏 Características de un Buen Comando

### Claridad
- Instrucciones sin ambigüedad
- Pasos numerados y ordenados
- Ejemplos de código cuando sea necesario

### Completitud
- Incluye todos los pasos necesarios
- Menciona archivos a crear/modificar
- Referencias a reglas o patrones existentes

### Accionable
- Cada paso es ejecutable inmediatamente
- No requiere interpretación
- Proporciona valores concretos cuando sea posible

### Específico del Proyecto
- Adaptado a la arquitectura hexagonal
- Usa las convenciones del proyecto (nombres en inglés, clean code, etc.)
- Referencias a verticales existentes (contract, invoice, customer, etc.)

---

## 🚫 Qué NO Incluir

- ❌ Explicaciones genéricas de conceptos
- ❌ Tutoriales largos
- ❌ Múltiples formas de hacer lo mismo
- ❌ Código no relacionado con el proyecto
- ❌ Opiniones o preferencias personales

---

## 💡 Ejemplos de Buenos Comandos

### Comandos Técnicos
- `add-new-endpoint.md` - Crear un nuevo endpoint REST
- `add-new-mapper.md` - Crear y testear un mapper
- `add-pagination.md` - Añadir paginación a un endpoint
- `add-filter.md` - Añadir filtros a consultas

### Comandos de Mantenimiento
- `update-api-schema.md` - Actualizar esquema OpenAPI y regenerar cliente
- `add-mock-data.md` - Añadir datos de prueba al mock repository
- `fix-linter-errors.md` - Corregir errores de linter comunes

### Comandos de Testing
- `add-unit-tests-service.md` - Tests para servicios de dominio
- `add-integration-tests.md` - Tests de integración para controllers
- `verify-with-real-apis.md` - Verificar endpoint con APIs reales

---

## 🎯 Uso de los Comandos

Los comandos se pueden invocar directamente desde Cursor:
1. Abre el Command Palette (Cmd+Shift+P)
2. Busca el nombre del comando
3. El agente seguirá las instrucciones del comando automáticamente

O simplemente menciona el comando en el chat:
```
"Ejecuta el comando add-new-endpoint para crear /consumptions"
```

---

## 📖 Diferencia con Rules

| Rules | Commands |
|---|---|
| Principios y patrones generales | Instrucciones paso a paso específicas |
| Aplican siempre en segundo plano | Se ejecutan bajo demanda |
| Descriptivas y explicativas | Imperativas y accionables |
| Contexto para decisiones | Receta para ejecutar |

**Rules:** "Así es cómo hacemos las cosas"  
**Commands:** "Haz esto ahora"

