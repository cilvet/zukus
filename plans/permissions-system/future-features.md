# Funcionalidades Futuras y sus Implicaciones

Análisis de features futuras relacionadas con permisos y cómo encajarían en el sistema.

## 1. Campañas Avanzadas

### Roles Granulares

**Actual:** Solo DM (implícito por `dm_id`) y Jugador (implícito por tener personaje).

**Futuro posible:**

```sql
campaign_members (
  id UUID PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id),
  user_id UUID REFERENCES auth.users(id),

  role TEXT,  -- 'dm', 'co_dm', 'player', 'observer', 'invited'

  -- Permisos específicos (override del rol)
  can_edit_npcs BOOLEAN DEFAULT false,
  can_view_dm_notes BOOLEAN DEFAULT false,
  can_manage_invites BOOLEAN DEFAULT false,

  joined_at TIMESTAMPTZ
)
```

**Compatibilidad PowerSync:** Buena. Es una tabla pequeña que se sincroniza al usuario.

**Sync rules:**
```yaml
campaign_members:
  - WHERE user_id = :user_id
  - WHERE campaign_id IN (SELECT id FROM campaigns WHERE dm_id = :user_id)
```

### Permisos Parciales en Personajes

**Caso:** "Jugador A puede ver stats de Jugador B pero no su inventario"

**Opción 1: Flags en campaign_characters**
```sql
ALTER TABLE campaign_characters ADD COLUMN visibility_to_party JSONB;
-- { "stats": true, "inventory": false, "spells": true }
```

**Opción 2: Tabla de permisos entre jugadores**
```sql
character_visibility (
  character_id UUID,
  viewer_user_id UUID,
  can_view_stats BOOLEAN,
  can_view_inventory BOOLEAN,
  ...
)
```

**Recomendación:** Opción 1. Menos tablas, datos en entidad existente.

### Notas Privadas del DM

```sql
dm_character_notes (
  id UUID PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id),
  character_id UUID REFERENCES characters(id),

  content TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- RLS: Solo el DM de la campaña puede ver/editar
```

**Sync:** Solo al DM, nunca a jugadores.

---

## 2. Colaboración en Compendios

### Co-autores

**Caso:** Grupo de amigos crea homebrew juntos.

```sql
source_collaborators (
  id UUID PRIMARY KEY,
  source_id UUID REFERENCES sources(id),
  user_id UUID REFERENCES auth.users(id),

  role TEXT,  -- 'owner', 'editor', 'viewer'
  added_at TIMESTAMPTZ,
  added_by UUID REFERENCES auth.users(id)
)
```

**Sync rules actualizadas:**
```yaml
sources:
  - WHERE owner_id = :user_id
  - WHERE id IN (SELECT source_id FROM source_collaborators WHERE user_id = :user_id)
```

### Fork de Contenido

**Caso:** Usuario quiere modificar un compendio público sin afectar el original.

```sql
-- Al forkear:
INSERT INTO sources (name, owner_id, forked_from_id, ...)
VALUES ('PHB - Mi versión', :user_id, :original_source_id, ...);

-- Copiar items
INSERT INTO compendium_items (source_book_id, owner_id, ...)
SELECT :new_source_id, :user_id, name, item_type, data
FROM compendium_items WHERE source_book_id = :original_source_id;
```

**Consideración:** Duplica datos, pero es la forma más simple y compatible con PowerSync.

---

## 3. Organizaciones / Grupos

### Caso de Uso

Grupo de jugadores que:
- Comparten biblioteca de compendios
- Tienen múltiples campañas
- Quieren suscripción compartida al marketplace

### Modelo

```sql
organizations (
  id UUID PRIMARY KEY,
  name TEXT,
  created_at TIMESTAMPTZ
)

organization_members (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES auth.users(id),
  role TEXT,  -- 'owner', 'admin', 'member'
  joined_at TIMESTAMPTZ
)

-- Sources pueden pertenecer a organización
ALTER TABLE sources ADD COLUMN organization_id UUID REFERENCES organizations(id);

-- Licencias pueden ser de organización
ALTER TABLE user_licenses ADD COLUMN organization_id UUID REFERENCES organizations(id);
```

**Sync rules:**
```yaml
sources:
  - WHERE organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = :user_id
    )
```

**Compatibilidad PowerSync:** Buena si las organizaciones son pequeñas (típico grupo de amigos).

---

## 4. Personajes Compartidos

### Caso de Uso

- Dos jugadores controlan un personaje (turnos, o diferentes aspectos)
- "Personaje de la comunidad" que cualquiera puede usar como template

### Opción A: Co-propietarios

```sql
character_owners (
  character_id UUID REFERENCES characters(id),
  user_id UUID REFERENCES auth.users(id),
  role TEXT,  -- 'owner', 'controller'
  PRIMARY KEY (character_id, user_id)
)
```

### Opción B: Templates Públicos

```sql
ALTER TABLE characters ADD COLUMN is_template BOOLEAN DEFAULT false;
ALTER TABLE characters ADD COLUMN template_source_id UUID REFERENCES characters(id);

-- Cualquiera puede clonar un template
-- El clon tiene su propio owner_id
```

**Recomendación:** Opción B para templates, Opción A solo si hay demanda real de co-control.

---

## 5. Auditoría de Cambios

### Caso de Uso

- Saber quién cambió qué en un personaje de campaña
- Detectar trampas (jugador se añadió oro)
- Debugging

### Modelo

```sql
audit_log (
  id UUID PRIMARY KEY,

  -- Qué cambió
  entity_type TEXT,  -- 'character', 'campaign', 'source'
  entity_id UUID,

  -- Quién
  user_id UUID REFERENCES auth.users(id),

  -- Cuándo
  created_at TIMESTAMPTZ DEFAULT now(),

  -- Qué tipo de cambio
  action TEXT,  -- 'create', 'update', 'delete'

  -- Detalle (opcional, puede ser pesado)
  changes JSONB,  -- { "field": { "old": x, "new": y } }

  -- Contexto
  ip_address INET,
  user_agent TEXT
)
```

**Sync:** NUNCA al cliente. Solo consulta desde servidor/dashboard admin.

---

## 6. Control de Acceso Temporal

### Caso de Uso

- "Prueba este compendio por 7 días"
- "Acceso a la campaña expira en 30 días si no confirmas"

### Ya soportado parcialmente

```sql
user_licenses.expires_at TIMESTAMPTZ
campaign_invites.status + created_at (para expirar invites)
```

### Problema con PowerSync

Las sync rules no re-evalúan automáticamente cuando algo expira.

**Soluciones:**
1. Job en servidor que revoca acceso y fuerza re-sync
2. Cliente verifica `expires_at` localmente antes de mostrar contenido
3. Sync rules con `WHERE expires_at > now()` (se actualiza en cada sync)

---

## Resumen de Compatibilidad

| Feature | Complejidad | PowerSync Compatible | Prioridad Sugerida |
|---------|-------------|---------------------|-------------------|
| Roles de campaña | Baja | Si | Media |
| Permisos parciales en PJ | Media | Si | Baja |
| Notas privadas DM | Baja | Si | Media |
| Co-autores compendios | Media | Si | Baja |
| Fork de contenido | Media | Si | Media |
| Organizaciones | Alta | Parcial | Baja |
| Personajes compartidos | Media | Si | Baja |
| Auditoría | Baja | N/A (servidor) | Media |
| Acceso temporal | Baja | Parcial | Alta (marketplace) |

## Principios para Evolución

1. **Añadir columnas antes que tablas** cuando sea posible
2. **Tablas pequeñas** que se sincronizan completas al usuario
3. **Contenido grande bajo demanda** (no sync automático)
4. **Validación en servidor** para escrituras, confianza en cliente para lecturas
5. **Evitar lógica compleja** en sync rules (mejor simple y predecible)
