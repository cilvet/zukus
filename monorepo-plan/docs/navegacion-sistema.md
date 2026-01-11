# Sistema de Navegacion - Zukus

Este documento describe el sistema de navegacion de la aplicacion Zukus, que debe funcionar en multiples plataformas con comportamientos diferenciados segun el contexto.

---

## Contexto del Problema

Zukus es una aplicacion multiplataforma que debe funcionar en:
- iOS (nativo via React Native)
- Android (nativo via React Native)
- Web desktop (navegador en pantalla grande)
- Web mobile (navegador en pantalla pequena)

Cada plataforma tiene convenciones de navegacion diferentes que los usuarios esperan:
- En mobile, los usuarios esperan tabs, gestos de swipe, y stack navigation
- En desktop web, los usuarios esperan una topbar con links, paneles laterales, y que el historial del navegador funcione correctamente

El reto es crear un sistema que respete estas convenciones sin duplicar demasiado codigo.

---

## Plataformas y Layouts

### Mobile Nativo (iOS/Android)

**Layout:**
- Tabs en la parte inferior para navegacion principal (Personaje, Conjuros, Ajustes, etc.)
- ViewPager (swipe horizontal) para sub-secciones dentro de cada tab
- Stack navigation para ir a pantallas de detalle

**Navegacion:**
- Tap en tab cambia de seccion principal
- Swipe horizontal navega entre sub-secciones del ViewPager
- Tap en elemento abre detalle via stack (push)
- Gesto de swipe back o boton back cierra detalle (pop)
- Header nativo con boton back cuando hay pantallas en el stack

**Comportamiento del ViewPager:**
- El indice de seccion se mantiene al cambiar de tab y volver
- El indice de seccion se mantiene al abrir un detalle y volver

### Web Mobile (navegador en movil)

**Layout:**
- NO hay tabs (igual que desktop)
- Menu hamburguesa para navegacion principal
- ViewPager para sub-secciones (con swipe web-compatible)
- Stack navigation para detalles

**Navegacion:**
- Menu hamburguesa abre drawer/overlay con links a secciones principales
- Swipe horizontal navega entre sub-secciones del ViewPager
- Tap en elemento abre detalle via stack
- Boton back cierra detalle

**Diferencias con mobile nativo:**
- Sin tabs, con menu hamburguesa
- Libreria de swipe diferente (web-compatible)

**Diferencias con web desktop:**
- Sin columnas, contenido en scroll vertical
- Sin Side Panel, usa stack navigation para detalles

### Web Desktop (navegador en pantalla grande)

**Layout:**
- NO hay tabs en la parte inferior (inapropiado para desktop)
- Topbar de web normal con logo y links de navegacion
- Layout de columnas para el contenido principal
- Side Panel flotante a la derecha para mostrar detalles

**Navegacion principal:**
- Links en la topbar para navegar entre secciones (Personaje, Conjuros, Ajustes)

**Side Panel:**
- Se abre al hacer click en un elemento del contenido principal
- Muestra el detalle del elemento seleccionado
- Tiene su propia navegacion interna (flecha back DENTRO del panel, no en la topbar)
- Se puede cerrar con boton X

---

## Side Panel - Comportamiento Detallado

El Side Panel es exclusivo de Web Desktop y tiene comportamiento especifico:

### Navegacion interna

El panel tiene su propio historial interno. Si estoy viendo el panel A y hago click en algo que abre el panel B:
- El panel B se muestra
- Aparece una flecha back en el header del panel
- Hacer click en la flecha vuelve al panel A

### Sincronizacion con URL

El estado del panel se refleja en la URL mediante query parameters:
```
/character?panel=strength&type=ability
/character?panel=equipment-1&type=item&name=Staff%20of%20Power
```

Esto permite:
- Compartir enlaces directos a un panel especifico
- Que el boton back del navegador funcione correctamente
- Que al recargar la pagina, el panel se restaure

### Comportamiento del historial del navegador

**Escenario 1: Navegacion entre paneles**
1. Estoy en `/character` (sin panel)
2. Abro panel A -> URL: `/character?panel=A`
3. Abro panel B -> URL: `/character?panel=B`
4. Hago click en back del navegador -> URL: `/character?panel=A` (panel A visible)
5. Hago click en back del navegador -> URL: `/character` (panel cerrado)

**Escenario 2: Cerrar con X**
1. Estoy en `/character?panel=A`
2. Hago click en X para cerrar -> URL: `/character` (panel cerrado)
3. Hago click en back del navegador -> URL: `/character?panel=A` (panel A reaparece)

### Flecha back dentro del panel

La flecha back aparece en el header del panel cuando hay historial de navegacion dentro del panel (es decir, cuando se ha abierto un panel desde otro panel).

- Si es el primer panel abierto: NO hay flecha (solo X para cerrar)
- Si se abrio desde otro panel: SI hay flecha (para volver al anterior)

---

## ViewPager - Comportamiento Detallado

El ViewPager se usa en mobile y web mobile para navegar entre sub-secciones dentro de un tab.

### Sub-secciones por tab

Cada tab principal (Personaje, Conjuros, etc.) puede tener multiples sub-secciones. Por ejemplo, el tab de Personaje podria tener:
- Seccion 0: Stats basicos
- Seccion 1: Habilidades
- Seccion 2: Equipo
- Seccion 3: Conjuros

El usuario navega entre secciones con swipe horizontal.

### Persistencia del indice

**Al cambiar de tab y volver:**
- Estoy en Personaje, seccion 3
- Voy a Conjuros
- Vuelvo a Personaje
- Resultado: sigo en seccion 3

**Al abrir detalle y volver:**
- Estoy en Personaje, seccion 2
- Abro detalle de un item
- Vuelvo atras
- Resultado: sigo en seccion 2

### Implementacion

El indice de seccion actual se mantiene como estado por cada tab. Puede ser un simple numero (indice 0, 1, 2, 3).

---

## Deep Linking

La aplicacion debe soportar deep linking, permitiendo abrir la app desde URLs externas que lleven directamente a un panel o seccion especifica.

**Ejemplos:**
- `https://app.zukus.com/character?panel=strength` -> Abre el panel de Fuerza
- `zukus://character?panel=equipment-1` -> Abre el panel del primer item de equipo

Esto requiere:
- Parsear la URL al cargar la app
- Restaurar el estado de navegacion correspondiente

---

## Diferencias de Implementacion por Plataforma

### Archivo .web.tsx

Expo/Metro permite tener archivos con extension `.web.tsx` que solo se usan en web. Esto permite:
- `index.tsx` -> Mobile nativo (iOS/Android)
- `index.web.tsx` -> Web (desktop y mobile)

Dentro de `index.web.tsx` se puede detectar el ancho de pantalla para decidir entre layout desktop (columnas + panel) y layout mobile (tabs + stack).

### Deteccion de layout

```typescript
const DESKTOP_BREAKPOINT = 768

// En web
const isDesktop = width >= DESKTOP_BREAKPOINT
```

En mobile nativo, siempre se usa el layout mobile (el archivo `.web.tsx` no se usa).

### Gestion del historial

**Mobile nativo:**
- El stack navigation de React Navigation/Expo Router maneja el historial automaticamente
- Gestos nativos y boton back hardware funcionan out-of-the-box

**Web desktop:**
- El Side Panel usa `window.history.pushState` y `window.history.replaceState` directamente
- Se escucha el evento `popstate` para sincronizar el estado React con el historial del navegador
- NO se usa el router de Expo/Next para el panel (evita interferencias)

**Web mobile:**
- Comportamiento similar a mobile nativo
- Stack navigation via Expo Router

---

## Referencia: zukusnextmicon

El proyecto zukusnextmicon tiene una implementacion funcional de este sistema de navegacion en `src/components/Character/CharacterSheet/hooks/useNavigationContext.ts`.

### Conceptos clave de esa implementacion:

1. **panelHistory**: Array que mantiene el historial de paneles visitados
2. **currentPanel**: El panel actualmente visible
3. **addToHistory()**: Anade panel al array + `window.history.pushState()`
4. **goBack()**: Si hay historial -> `window.history.back()`, sino -> cierra panel
5. **canGoBack**: `panelHistory.length > 1`
6. **handlePopState**: Listener de `popstate` que sincroniza React con el navegador
7. **parseUrlParams()**: Lee la URL al cargar para restaurar el estado
8. **createPanelUrl()**: Genera URL con query params desde el panel

### Documentacion relacionada:
- `projectDocs/DetailPageNavigationGuide.md` - Guia para anadir nuevas paginas de detalle

### Nota importante:
Esta implementacion es una referencia, no necesariamente la solucion perfecta. Hay oportunidad de simplificar la logica manteniendo la funcionalidad.

---

## Estado Actual del PoC

### Lo que existe:

1. **Estructura de rutas con Expo Router:**
   - `(tabs)/_layout.tsx` - Layout de tabs
   - `(tabs)/(character)/_layout.tsx` - Stack para el tab de personaje
   - `(tabs)/(character)/index.tsx` - Pantalla mobile
   - `(tabs)/(character)/index.web.tsx` - Pantalla web

2. **Componentes de layout:**
   - `SidePanel` - Panel flotante (solo web)
   - `SidePanelContainer` - Wrapper con position relative
   - `ColumnsContainer` - Layout de columnas (desktop) o scroll vertical (mobile)
   - `VerticalSection` - Columna individual con scroll

3. **Hook useSidePanel:**
   - Estado basico del panel (isOpen, currentContent)
   - Funciones open/close/toggle

### Problemas identificados:

1. **El Side Panel aparece en web mobile** - Deberia usar navegacion stack en web mobile, no panel
2. **El boton back aparece en el header de Expo** - Se uso `router.push` que anade al stack de Expo en lugar de usar `window.history` directamente
3. **No hay topbar para desktop** - Actualmente usa el header de Expo Router que es inapropiado
4. **Los tabs no funcionan correctamente en web desktop** - Deberian ser links en topbar
5. **No hay ViewPager implementado** - Pendiente
6. **Emojis en el codigo** - Violan las convenciones del proyecto

---

## Proximos Pasos

### Fase 1: Corregir el Side Panel
- Usar `window.history` directamente en lugar de Expo Router para el panel
- Implementar historial interno del panel
- Anadir flecha back dentro del panel
- Sincronizar con URL y evento popstate

### Fase 2: Separar web desktop de web mobile
- Dentro de `index.web.tsx`, detectar ancho de pantalla
- Si es mobile: usar layout stack (similar a mobile nativo)
- Si es desktop: usar layout columnas + panel

### Fase 3: Topbar para desktop
- Crear componente de topbar con logo y links
- Reemplazar el header de Expo Router en desktop
- Links para navegar entre secciones principales

### Fase 4: ViewPager para mobile
- Implementar ViewPager con swipe horizontal
- Mantener indice de seccion por tab
- Persistir indice al cambiar de tab o abrir detalle

### Fase 5: Deep linking
- Parsear URL al cargar
- Restaurar estado de navegacion

---

## Decisiones Tomadas

Esta seccion documenta las decisiones tomadas durante el diseno del sistema:

| Pregunta | Decision |
|----------|----------|
| Links en topbar para navegacion principal en desktop? | Si |
| Panel puede tener navegacion anidada? | Si |
| Historial del panel usa el del navegador? | Si |
| Web mobile igual que mobile nativo? | No exactamente: usa menu hamburguesa en lugar de tabs, pero misma funcionalidad de ViewPager y stack |
| Tablets soportados con layout desktop? | No por ahora, ignoramos tablets |
| URL refleja seccion principal + estado del panel? | Si |
| Panel A -> Panel B -> back -> vuelve a Panel A? | Si |
| Panel abierto -> X -> back navegador -> reabre panel? | Si |
| ViewPager: volver de detalle mantiene seccion? | Si |
| ViewPager: cambiar tab y volver mantiene seccion? | Si |
| Deep linking soportado? | Si |
| Web mobile usa tabs? | No, usa menu hamburguesa |

---

## Glosario

- **Tab**: Seccion principal de la app (Personaje, Conjuros, Ajustes)
- **ViewPager**: Componente con swipe horizontal para navegar entre sub-secciones
- **Stack Navigation**: Navegacion donde las pantallas se apilan (push/pop)
- **Side Panel**: Panel flotante en desktop para mostrar detalles
- **Deep Linking**: Abrir la app desde una URL externa a una pantalla especifica
- **Topbar**: Barra superior en web desktop con logo y links de navegacion
- **Menu Hamburguesa**: Icono de tres lineas horizontales que abre un drawer/overlay con links de navegacion (usado en web mobile)
