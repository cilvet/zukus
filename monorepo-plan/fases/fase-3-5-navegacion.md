# Fase 3.5: Sistema de Navegación

**Objetivo:** Montar un sistema de navegación unificado (o coordinado) que funcione en todas las plataformas, con pantallas de prueba para validar antes de implementar funcionalidad real.

**Prerequisitos:** Fase 3 completada (app mobile arrancando con pantallas sencillas)

---

## ⚠️ Contexto del Problema

Tenemos requisitos de navegación diferentes según la plataforma:

| Plataforma | Comportamiento |
|------------|----------------|
| **Web Desktop** | Panel lateral con contenido, historial de navegación |
| **Web Mobile** | Pantallas individuales con navegación back |
| **RN Mobile** | Igual que web mobile |
| **RN Tablet** | Panel lateral como desktop |

### Estado Actual

- **zukusnextmicon**: Sistema de rutas funcionando para web (desktop y mobile web)
- **zukus-again**: Navegación separada para RN y web

### Objetivo Ideal

Un único sistema de rutas que funcione en todas las plataformas. Si no es posible, crear sistemas coordinados que compartan la lógica donde sea posible.

---

## ⚠️ Enfoque: Pruebas de Concepto Primero

**ANTES de implementar pantallas reales**, vamos a:

1. Crear 2-3 pantallas de prueba sin contenido relevante
2. Montar el sistema de navegación completo
3. Validar que funciona en todas las plataformas
4. Preguntar al humano cómo proceder antes de seguir

---

## Pasos

### 3.5.1 Analizar navegación actual

Revisar cómo funciona la navegación en:

1. **zukusnextmicon** - Sistema de rutas para web
   - Ubicación del código
   - Cómo maneja desktop vs mobile web
   - Sistema de historial

2. **zukus-again** - Navegación en RN
   - Cómo está configurado Expo Router
   - Diferencias con la versión web

```
📋 Documentar hallazgos antes de implementar
👤 Preguntar al humano: ¿unificar o coordinar?
```

---

### 3.5.2 Decidir arquitectura

Opciones a considerar:

**Opción A: Sistema unificado**
- Un único sistema de rutas/navegación
- Detecta plataforma y renderiza layout apropiado
- Pros: Una fuente de verdad
- Cons: Puede ser complejo

**Opción B: Sistemas coordinados**
- Sistema para web (basado en zukusnextmicon)
- Sistema para RN (basado en Expo Router)
- Lógica compartida donde sea posible
- Pros: Más simple por plataforma
- Cons: Posible duplicación

```
👤 Preguntar al humano qué opción prefiere después de analizar
```

---

### 3.5.3 Crear pantallas de prueba

Crear pantallas simples para validar la navegación:

```
📁 apps/mobile/app/
├── (tabs)/
│   ├── _layout.tsx      # Layout de tabs (si aplica)
│   ├── index.tsx        # Pantalla Home
│   └── settings.tsx     # Pantalla Settings
├── detail/
│   └── [id].tsx         # Pantalla de detalle (para probar navegación con parámetros)
└── _layout.tsx          # Root layout
```

Cada pantalla tendrá:
- Un título identificativo
- Botones de navegación para ir a otras pantallas
- Información de debug (plataforma, dimensiones, etc.)

```
✅ Verificar: Las pantallas se renderizan
✅ Verificar: La navegación entre pantallas funciona
```

---

### 3.5.4 Implementar detección de layout

Implementar lógica para detectar si mostrar:
- Layout de panel (desktop/tablet)
- Layout de stack (mobile)

```typescript
// packages/ui/src/hooks/useLayoutMode.ts

type LayoutMode = 'panel' | 'stack'

export function useLayoutMode(): LayoutMode {
  // Detectar basándose en:
  // - Ancho de pantalla
  // - Plataforma (web vs native)
  // - Orientación (tablet landscape vs portrait)
}
```

```
✅ Verificar: El hook devuelve el modo correcto en cada plataforma
```

---

### 3.5.5 Probar en todas las plataformas

Verificar que la navegación funciona en:

1. **Web Desktop** (Chrome/Safari)
   - Panel lateral visible
   - Navegación no cambia la URL (o sí, según decidamos)
   - Historial funciona

2. **Web Mobile** (Chrome DevTools responsive)
   - Pantallas individuales
   - Botón back funciona
   - Transiciones suaves

3. **iOS Simulator** (si está disponible)
   - Navegación nativa
   - Gestos de swipe back

4. **Android Emulator** (si está disponible)
   - Navegación nativa
   - Botón hardware de back

```
👁️ Verificar visualmente cada plataforma
📋 Documentar comportamientos inesperados
```

---

### 3.5.6 Checkpoint con humano

**ANTES de continuar, preguntar al humano:**

1. ¿El comportamiento de navegación es el esperado?
2. ¿Hay ajustes necesarios?
3. ¿Procedemos a implementar pantallas reales o iteramos más?

```
⚠️ NO CONTINUAR sin confirmación explícita
```

---

### 3.5.7 Commit

```bash
git add -A
git commit -m "feat: add navigation system with proof of concept screens"
```

---

## Verificación Final de la Fase

Antes de pasar a la Fase 4:

- [ ] Se ha analizado la navegación de zukusnextmicon y zukus-again
- [ ] Se ha decidido la arquitectura (unificada o coordinada)
- [ ] Las pantallas de prueba existen y funcionan
- [ ] El hook `useLayoutMode` detecta correctamente el modo
- [ ] La navegación funciona en web desktop
- [ ] La navegación funciona en web mobile
- [ ] La navegación funciona en RN (al menos en simulador)
- [ ] El humano ha validado el comportamiento
- [ ] Commit hecho

---

## Referencias

### zukusnextmicon

| Qué buscar | Dónde |
|------------|-------|
| Sistema de rutas | `src/components/useNavigationContext` |
| Detección de layout | `src/hooks/` o similar |
| Estructura de páginas | `src/app/` |

### zukus-again

| Qué buscar | Dónde |
|------------|-------|
| Configuración Expo Router | `app/` |
| Layouts | `app/_layout.tsx` |
| Navegación entre pantallas | Componentes varios |

---

## Siguiente Fase

→ [Fase 4: Conectar Mobile con UI](./fase-4-conectar-mobile-ui.md)
