---
name: flashlist
description: Patrones para usar FlashList en el proyecto Zukus. Consultar cuando se necesite renderizar listas virtualizadas de entidades, skills, o cualquier coleccion grande.
user-invocable: true
disable-model-invocation: false
allowed-tools: Read, Grep, Glob
---

# FlashList en Zukus

## Dependencia

```json
"@shopify/flash-list": "^2.2.0"
```

Ya instalada en `apps/zukus/package.json`.

## Import

```typescript
import { FlashList } from '@shopify/flash-list'
```

## Patron basico

```typescript
<FlashList
  data={items}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => <ItemRow {...item} />}
  estimatedItemSize={ITEM_HEIGHT}
  ListHeaderComponent={<Header />}
  ListEmptyComponent={<EmptyState />}
  contentContainerStyle={{ paddingBottom: 32 }}
/>
```

## Optimizaciones obligatorias

### 1. Altura fija para items

Definir una constante de altura y usarla tanto en el item como en `estimatedItemSize`:

```typescript
export const ITEM_HEIGHT = 68

// En el componente del item:
<XStack height={ITEM_HEIGHT} alignItems="center" ...>
```

### 2. Props primitivas en items

Extraer valores primitivos antes de pasarlos al item. No pasar objetos enteros:

```typescript
// MAL
<ItemRow entity={entity} theme={themeInfo} />

// BIEN
<ItemRow
  id={entity.id}
  name={entity.name}
  description={entity.description}
  primaryColor={themeInfo.colors.primary}
/>
```

### 3. Elevar useTheme al padre

No llamar `useTheme()` dentro de cada item. Extraer colores como primitivos en el padre:

```typescript
// En el padre (componente con FlashList):
const { themeInfo, themeColors } = useTheme()
const primaryColor = themeInfo.colors.primary
const placeholderColor = themeColors.placeholderColor

// Pasar como props primitivas a cada item
```

### 4. useCallback para handlers

```typescript
const handlePress = useCallback((id: string) => {
  navigateToDetail('spell', id)
}, [navigateToDetail])
```

### 5. React Compiler se encarga de memo

No usar `React.memo()` manualmente. El React Compiler (activo en `.tsx`) se encarga. Si hay problemas de rendimiento con animaciones, usar `"use no memo"` en el item wrapper.

## Ejemplo completo (referencia real del proyecto)

Ver `apps/zukus/ui/components/character/SkillsSection.tsx`:

```typescript
import { FlashList } from '@shopify/flash-list'

export function SkillsSection() {
  const { themeInfo } = useTheme()

  const colors = useMemo(() => ({
    primary: themeInfo.colors.primary,
    accent: themeInfo.colors.accent,
    border: themeInfo.colors.border,
    background: themeInfo.colors.background,
  }), [themeInfo.colors.primary, themeInfo.colors.accent, themeInfo.colors.border, themeInfo.colors.background])

  const handlePress = useCallback((id: string) => {
    navigateToDetail('skill', id)
  }, [navigateToDetail])

  return (
    <FlashList
      data={processedSkills}
      keyExtractor={(item) => item.uniqueId}
      renderItem={({ item }) => (
        <SkillRow
          skillId={item.uniqueId}
          name={item.displayName}
          colors={colors}
          onPress={handlePress}
        />
      )}
      ListEmptyComponent={<EmptyState />}
    />
  )
}
```

## Archivos de referencia

| Archivo | Uso |
|---------|-----|
| `ui/components/character/SkillsSection.tsx` | Skills con filtros + FlashList |
| `screens/compendiums/EntityListScreen.tsx` | Lista de entidades del compendio |
| `components/compendiums/EntityListItem.tsx` | Item optimizado con altura fija |
| `screens/compendiums/CompendiumsScreenDesktop.tsx` | FlashList en desktop |

## Cuando NO usar FlashList

Segun `.cursor/rules/code/flatlist-anidado.mdc`:

- Si la lista esta **dentro de un ScrollView** con la misma orientacion, usar `.map()` en su lugar
- FlashList dentro de ScrollView causa warnings de listas virtualizadas anidadas

```typescript
// Dentro de ScrollView -> usar .map()
<ScrollView>
  <YStack>
    {items.map((item) => <ItemRow key={item.id} {...item} />)}
  </YStack>
</ScrollView>

// Componente con su propio scroll -> usar FlashList
<FlashList data={items} ... />
```
