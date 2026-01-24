# Estado Actual del Sistema de Permisos

## Modelo de Datos

```
auth.users (Supabase Auth)
├── profiles (1:1)
├── characters (1:N) - owner: user_id
│   └── campaign_characters (N:N)
│
├── campaigns (1:N) - owner: dm_id
│   ├── campaign_characters
│   ├── campaign_invites
│   ├── campaign_messages
│   └── sources (campaign-specific)
│
└── sources (1:N) - owner: owner_id
    └── compendium_items
```

## Roles Implícitos

Solo hay 2 roles, determinados por relaciones:

| Rol | Condición |
|-----|-----------|
| **DM** | `campaigns.dm_id = auth.uid()` |
| **Jugador** | Tiene personaje en `campaign_characters` |

No hay tabla de roles explícita.

## Tablas Clave

### characters
```sql
characters (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),  -- dueño
  character_data JSONB,
  name TEXT,
  created_at TIMESTAMPTZ,
  modified TIMESTAMPTZ,
  _deleted BOOLEAN
)
```

### campaigns
```sql
campaigns (
  id UUID PRIMARY KEY,
  name TEXT,
  description TEXT,
  dm_id UUID REFERENCES auth.users(id),  -- DM/propietario
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

### campaign_characters
```sql
campaign_characters (
  id UUID PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id),
  character_id UUID REFERENCES characters(id),
  joined_at TIMESTAMPTZ,
  dm_write_access BOOLEAN  -- Si el DM puede modificar el personaje
)
```

### sources (compendios)
```sql
sources (
  id UUID PRIMARY KEY,
  name TEXT,
  description TEXT,
  publisher TEXT,
  owner_id UUID REFERENCES auth.users(id),  -- creador
  campaign_id UUID REFERENCES campaigns(id), -- si es específico de campaña
  is_private BOOLEAN,  -- visible solo para dueño/campaña
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

### compendium_items
```sql
compendium_items (
  id UUID PRIMARY KEY,
  name TEXT,
  item_type TEXT,  -- 'spell', 'feat', 'class', etc.
  data JSONB,
  owner_id UUID REFERENCES auth.users(id),
  source_book_id UUID REFERENCES sources(id),
  embedding vector(1536),  -- para búsqueda vectorial
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

## Políticas RLS

### Patrón General

```sql
-- Dueño tiene acceso completo
SELECT/UPDATE/DELETE: owner_id = auth.uid()

-- Contenido público visible para todos
SELECT: is_private = false

-- Miembros de campaña ven contenido de su campaña
SELECT: campaign_id IN (
  SELECT campaign_id FROM campaign_characters
  WHERE character_id IN (
    SELECT id FROM characters WHERE user_id = auth.uid()
  )
)
```

### Funciones Helper

```sql
-- ¿Usuario puede acceder a esta campaña?
can_access_campaign(p_campaign_id UUID, acting_user_id UUID) RETURNS BOOLEAN
  1. Es el DM → true
  2. Tiene personaje en la campaña → true
  3. Else → false

-- ¿Usuario puede acceder a este personaje?
can_access_character(p_character_id UUID, acting_user_id UUID) RETURNS BOOLEAN
  1. Es el dueño → true
  2. Es DM de una campaña con este personaje → true
  3. Else → false
```

## Limitaciones Conocidas

### 1. Roles Hardcodeados
No hay forma de expresar co-DM, observador, o roles custom.

### 2. Permisos Binarios
`dm_write_access` es todo o nada. No hay permisos por sección (stats, inventario, notas).

### 3. Propiedad Simple
Un solo `owner_id` por entidad. No hay co-autores ni transferencia de propiedad.

### 4. Sin Licencias
No hay concepto de "comprado", "suscripción" o "trial". Solo `is_private` boolean.

### 5. Sin Versionado
No hay historial de cambios ni snapshots.

## Archivos de Referencia

| Archivo | Ubicación |
|---------|-----------|
| Schema completo | `zukusnextmicon/.cursor/rules/infrastructure/database-schema.mdc` |
| Guía RLS | `zukusnextmicon/.cursor/rules/infrastructure/supabase-rls-policies.mdc` |
| Repository | `apps/zukus/services/characterRepository.ts` |
