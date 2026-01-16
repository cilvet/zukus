# Fases Pospuestas

Este documento contiene las fases que hemos decidido posponer para más adelante en el desarrollo del monorepo.

---

## ⏸️ Testing de Integración

**Por qué está pospuesto:** Priorizamos avanzar con la funcionalidad. Los tests unitarios del core ya pasan, lo cual es suficiente para la primera iteración.

**Cuándo retomarlo:** Cuando tengamos componentes estables y queramos asegurar que no se rompen con futuros cambios.

### Qué incluirá

- Configuración de testing con Bun para todo el monorepo
- Tests de componentes de UI
- Tests de integración entre packages
- Posible uso de Testing Library para React Native

### Pasos cuando se retome

1. Configurar `turbo.json` para ejecutar tests en paralelo
2. Añadir tests de ejemplo en apps/zukus/ui/
3. Añadir tests de integración en apps/mobile
4. Configurar CI/CD para ejecutar tests automáticamente

---

## ⏸️ Setup de Supabase Local

**Por qué está pospuesto:** Trabajaremos directamente con la base de datos de desarrollo de Supabase, que es más realista. Usaremos el MCP de Supabase para gestión.

**Cuándo retomarlo:** Si en el futuro necesitamos:
- Desarrollo completamente offline
- Tests que requieran una BD local
- Múltiples desarrolladores con datos aislados

### Qué incluiría

- Docker Compose con Supabase local
- Migraciones versionadas
- Seed de datos de prueba
- Scripts para reset de BD

### Documentación de referencia

El plan original incluía:

```yaml
# services/supabase/docker-compose.yml
version: '3.8'

services:
  db:
    image: supabase/postgres:15.1.0.147
    ports:
      - "54322:5432"
    # ... resto de configuración
```

Este código se mantiene como referencia para cuando se necesite.

---

## ⏸️ @zukus/sync (Abstracción de Repositorios)

**Por qué está pospuesto:** Primero necesitamos tener la app funcionando. La abstracción de repositorios se implementará cuando tengamos un flujo de datos claro.

**Cuándo retomarlo:** Antes de implementar PowerSync, o cuando queramos desacoplar el acceso a datos de los componentes.

### Qué incluirá

```
packages/sync/
├── src/
│   ├── types/
│   │   └── repositories.ts   # Interfaces
│   ├── repositories/
│   │   ├── SupabaseCharacterRepository.ts
│   │   └── MockCharacterRepository.ts
│   └── hooks/
│       └── useCharacter.ts
└── package.json
```

### Interfaces propuestas

```typescript
// packages/sync/src/types/repositories.ts
import type { CharacterBaseData } from '@zukus/core'

export interface Character {
  id: string
  userId: string
  name: string
  characterData: CharacterBaseData
  imageUrl?: string
  createdAt: Date
  updatedAt: Date
}

export interface CharacterRepository {
  getCharacter(id: string): Promise<Character | null>
  listCharacters(): Promise<Character[]>
  saveCharacter(character: Character): Promise<void>
  deleteCharacter(id: string): Promise<void>
  subscribe(
    id: string,
    callback: (character: Character) => void
  ): () => void
}
```

### Beneficios de la abstracción

1. **Intercambiabilidad:** Cambiar de Supabase directo a PowerSync sin modificar componentes
2. **Testing:** Usar MockRepository para tests
3. **Offline-first:** Preparación para PowerSync
4. **Separación de concerns:** Los componentes no conocen detalles de infraestructura

---

## ⏸️ PowerSync (Offline-First)

**Por qué está pospuesto:** Es una feature avanzada que requiere la abstracción de repositorios primero. Además, queremos validar el flujo online antes de añadir complejidad offline.

**Cuándo retomarlo:** Cuando tengamos:
1. La abstracción de repositorios implementada
2. Un flujo de datos funcionando con Supabase
3. Necesidad real de funcionalidad offline

### Qué es PowerSync

PowerSync proporciona:
- SQLite local para datos
- Sincronización bidireccional con PostgreSQL
- Soporte offline-first
- Resolución de conflictos

### Plan de implementación

1. Añadir dependencias de PowerSync a @zukus/sync
2. Crear `PowerSyncCharacterRepository` que implemente `CharacterRepository`
3. Configurar sync rules en PowerSync
4. Integrar con la app mobile
5. Probar offline (modo avión)

### Código de referencia

```typescript
// packages/sync/src/repositories/PowerSyncCharacterRepository.ts
import { PowerSyncDatabase } from '@journeyapps/powersync-sdk-react-native'
import type { Character, CharacterRepository } from '../types/repositories'

export class PowerSyncCharacterRepository implements CharacterRepository {
  constructor(private db: PowerSyncDatabase) {}

  async getCharacter(id: string): Promise<Character | null> {
    const result = await this.db.get(
      'SELECT * FROM characters WHERE id = ?',
      [id]
    )
    return result ? this.mapToCharacter(result) : null
  }

  // ... resto de métodos
}
```

---

## Orden Sugerido de Retomar

Cuando sea momento de implementar estas fases:

1. **@zukus/sync** - Primero, para tener la abstracción
2. **PowerSync** - Después, implementando sobre la abstracción
3. **Testing de Integración** - En paralelo o después
4. **Supabase Local** - Solo si realmente se necesita

---

## Notas

Estas fases están **pospuestas, no canceladas**. Son parte importante del plan a largo plazo para tener:

- Una app robusta con tests
- Funcionalidad offline-first
- Arquitectura limpia y desacoplada

El orden actual (Fases 0-6) nos da una base funcional sobre la cual podemos iterar y añadir estas capacidades cuando sea el momento adecuado.

