# Fase B: Campos de Ficha Completos + Placeholder Imagen

## Objetivo

Completar la Columna 1 con todos los campos de ficha de personaje D&D 3.5 y un placeholder para la imagen.

## Entregables

1. Seccion de datos fisicos (edad, genero, altura, peso, ojos, cabello, piel)
2. Seccion de trasfondo (deidad, historia/background)
3. Placeholder de imagen del personaje
4. Organizacion visual coherente de la Columna 1

## Prerequisitos

- Fase A completada (estructura ViewPager + campos basicos)

## Pasos de Implementacion

### Paso 1: Crear CharacterFieldsSection

**Archivo:** `components/character/editor/CharacterFieldsSection.tsx`

Componente que agrupa los campos fisicos:

```typescript
type CharacterFieldsSectionProps = {
  age: string;
  gender: string;
  height: string;
  weight: string;
  eyes: string;
  hair: string;
  skin: string;
  onFieldChange: (field: string, value: string) => void;
};
```

**Layout sugerido:**

```
Datos Fisicos
---------------------------------
Edad:     [__________]  Genero: [__________]
Altura:   [__________]  Peso:   [__________]
Ojos:     [__________]
Cabello:  [__________]
Piel:     [__________]
```

- Inputs de texto simple
- Labels a la izquierda
- 2 columnas para ahorrar espacio vertical
- Campos opcionales (pueden estar vacios)

### Paso 2: Crear BackgroundSection

**Archivo:** `components/character/editor/BackgroundSection.tsx`

Componente para deidad e historia:

```typescript
type BackgroundSectionProps = {
  deity: string;
  background: string;
  onDeityChange: (deity: string) => void;
  onBackgroundChange: (background: string) => void;
};
```

**Layout:**

```
Trasfondo
---------------------------------
Deidad:   [__________]

Historia:
[                              ]
[     TextArea multilinea      ]
[                              ]
```

- Deidad: input simple
- Historia: TextArea con altura minima de 4-6 lineas
- Expandible si el contenido es largo

### Paso 3: Crear ImagePlaceholder

**Archivo:** `components/character/editor/ImagePlaceholder.tsx`

Placeholder visual para la futura funcionalidad de imagen:

```typescript
type ImagePlaceholderProps = {
  imageUrl?: string;  // Para futuro uso
};
```

**Layout:**

```
+-------------------+
|                   |
|    [Icono de      |
|     camara]       |
|                   |
|  Imagen (pronto)  |
+-------------------+
```

- Cuadrado o rectangulo con aspect ratio fijo
- Borde discontinuo (dashed)
- Icono de camara o imagen centrado
- Texto "Imagen (proximamente)" o similar
- No hace nada al hacer click (por ahora)

### Paso 4: Organizar CharacterInfoSection

**Archivo:** `components/character/editor/CharacterInfoSection.tsx` (modificar)

Integrar todas las secciones en orden:

```
Columna 1
=========

[ImagePlaceholder]  <- Arriba del todo, centrado

Identidad
---------
Nombre:      [__________]
Descripcion: [TextArea multilinea]

[AlignmentGrid 3x3]

Datos Fisicos
-------------
[CharacterFieldsSection]

Trasfondo
---------
[BackgroundSection]

Abilities
---------
[AbilityScoresEditor]
```

### Paso 5: Crear SectionDivider (opcional)

**Archivo:** `components/character/editor/SectionDivider.tsx`

Separador visual entre secciones:

```typescript
type SectionDividerProps = {
  title: string;
};

// Renderiza:
// ---- Titulo ----
// o simplemente un titulo con padding
```

### Paso 6: Ajustar estilos para scroll

Asegurar que la Columna 1 tiene scroll interno correcto:
- Mobile: Scroll vertical dentro del ViewPager page
- Desktop: Scroll vertical dentro de VerticalSection

## Verificacion

- [ ] Todos los campos de datos fisicos funcionan
- [ ] Deidad se guarda correctamente
- [ ] Historia (multilinea) se guarda correctamente
- [ ] Placeholder de imagen visible
- [ ] Scroll funciona correctamente en mobile y desktop
- [ ] Layout coherente y no se ve "apretado"

## Archivos Afectados

### Nuevos
- `components/character/editor/CharacterFieldsSection.tsx`
- `components/character/editor/BackgroundSection.tsx`
- `components/character/editor/ImagePlaceholder.tsx`
- `components/character/editor/SectionDivider.tsx` (opcional)

### Modificados
- `components/character/editor/CharacterInfoSection.tsx`

## Notas de Diseno

### Campos de Texto
- Todos son texto libre (string)
- No hay validacion especial
- Placeholder descriptivo en cada campo

### Responsividad
- En mobile, campos en 1 columna si no caben 2
- En desktop, 2 columnas para datos fisicos

### Accesibilidad
- Labels asociados a inputs
- Tab order logico
- Campos opcionales claramente marcados (o todos opcionales)

## Estimacion de Complejidad

- Baja-Media: Principalmente componentes de formulario estandar
