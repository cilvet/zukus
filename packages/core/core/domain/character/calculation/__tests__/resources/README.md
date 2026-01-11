# Resource Tests

Esta carpeta contiene tests organizados para el sistema de recursos de personajes.

## Estructura

### Archivos de Soporte

- **fixtures.ts**: Definiciones reutilizables de recursos de ejemplo (bardic music, ki pool, psionic power points, etc.) y builders comunes.
- **helpers.ts**: Funciones de verificación y validación compartidas para reducir la verbosidad de los tests.

### Archivos de Tests

- **basicCalculations.spec.ts**: Tests de cálculos básicos de recursos
  - Cálculo de valores máximos desde niveles de clase
  - Exposición de variables en el índice de sustitución
  - Manejo de múltiples recursos
  - Valores persistentes y valores iniciales personalizados

- **resourceUpdates.spec.ts**: Tests de actualización y gestión de recursos
  - Consumo de recursos (con cantidades por defecto y personalizadas)
  - Recarga de recursos (completa y parcial)
  - Manejo de valores negativos y "overheal"
  - Gestión independiente de múltiples recursos
  - Comportamiento al subir de nivel

- **sourceTracking.spec.ts**: Tests de rastreo de fuentes (source tracking)
  - Rastreo detallado de fuentes para valores de recursos
  - Verificación de reglas de apilamiento de bonos
  - Múltiples bonos de diferentes tipos
  - Identificación de fuentes relevantes vs irrelevantes

- **customVariables.spec.ts**: Tests de integración con variables personalizadas
  - Bonos a valores máximos/mínimos a través de custom variables
  - Exposición de propiedades de recursos como custom variables
  - Sincronización entre recursos y custom variables
  - Nomenclatura y descripción de variables generadas

## Uso

Para ejecutar todos los tests de recursos:

```bash
bun test core/domain/character/calculation/__tests__/resources/
```

Para ejecutar un archivo específico:

```bash
bun test core/domain/character/calculation/__tests__/resources/basicCalculations.spec.ts
```

## Helpers Disponibles

### expectResourceExists
Verifica que un recurso existe con el nombre correcto.

```typescript
expectResourceExists(sheet.resources, "bardic_music_uses", "Bardic Music Uses");
```

### expectResourceValues
Verifica los valores de un recurso (max, current, min, etc.).

```typescript
expectResourceValues(resource, {
    maxValue: 5,
    currentValue: 5,
    minValue: 0,
    defaultChargesPerUse: 1,
    rechargeAmount: 5
});
```

### expectResourceSubstitutionValues
Verifica que los valores del recurso están correctamente expuestos en el índice de sustitución.

```typescript
expectResourceSubstitutionValues(sheet.substitutionValues, "bardic_music_uses", {
    max: 5,
    current: 5,
    min: 0
});
```

### expectSourceTracking
Verifica el rastreo de fuentes para un bonus específico.

```typescript
expectSourceTracking(resource.maxValueSources, 'feat_bonus', {
    value: 2,
    bonusTypeId: 'UNTYPED',
    relevant: true,
    sourceName: 'Extra Performance Feat'
});
```

## Fixtures Disponibles

- `bardicMusicResource`: Recurso de usos de música bárdica
- `psionicPowerPointsResource`: Puntos de poder psiónico
- `kiPoolResource`: Pool de ki para monk
- `draconicBreathResource`: Arma de aliento dracónico
- `simplifiedKiPool`: Versión simplificada del ki pool para testing
- `standardAbilityScores`: Puntuaciones de habilidad estándar para testing
- `createBaseBard(level)`: Builder de personaje bardo con música bárdica
