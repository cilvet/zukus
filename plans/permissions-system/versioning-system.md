# Sistema de Versionado de Personajes

Sistema para mantener historial de cambios en personajes, permitiendo ver evolución y restaurar estados anteriores.

## Motivación

- Deshacer cambios accidentales
- Ver progresión del personaje en el tiempo
- DM puede ver "estado al inicio de sesión"
- Restaurar personaje a un punto específico
- Auditoría de cambios (quién cambió qué)

## Diseño Compatible con PowerSync

### Principio Clave

**El historial NO se sincroniza automáticamente al cliente.**

- Solo el estado actual del personaje se sincroniza
- Historial se consulta bajo demanda desde el servidor
- Opcionalmente, últimos N snapshots podrían sincronizarse

### Modelo de Datos

```sql
character_snapshots (
  id UUID PRIMARY KEY,
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,

  -- El snapshot completo
  character_data JSONB NOT NULL,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),  -- quién hizo el cambio

  -- Contexto del cambio
  reason TEXT,  -- 'manual', 'auto_save', 'session_start', 'session_end', 'level_up', 'restored'
  description TEXT,  -- descripción opcional del usuario

  -- Para diffing eficiente
  changes_summary JSONB,  -- { "level": [4, 5], "hp.current": [32, 28] }

  -- Tamaño para gestión de storage
  data_size_bytes INTEGER
)

-- Índices
CREATE INDEX idx_snapshots_character ON character_snapshots(character_id, created_at DESC);
CREATE INDEX idx_snapshots_reason ON character_snapshots(reason);
```

### Políticas RLS

```sql
-- Ver snapshots de personajes propios
CREATE POLICY select_own ON character_snapshots FOR SELECT
  USING (character_id IN (SELECT id FROM characters WHERE user_id = auth.uid()));

-- Ver snapshots de personajes en campañas que DMeas
CREATE POLICY select_dm ON character_snapshots FOR SELECT
  USING (character_id IN (
    SELECT cc.character_id FROM campaign_characters cc
    JOIN campaigns c ON cc.campaign_id = c.id
    WHERE c.dm_id = auth.uid()
  ));

-- Crear snapshots de personajes propios
CREATE POLICY insert_own ON character_snapshots FOR INSERT
  WITH CHECK (character_id IN (SELECT id FROM characters WHERE user_id = auth.uid()));

-- Solo el dueño puede eliminar snapshots
CREATE POLICY delete_own ON character_snapshots FOR DELETE
  USING (character_id IN (SELECT id FROM characters WHERE user_id = auth.uid()));
```

## Cuándo Crear Snapshots

### Automáticos

| Trigger | Reason | Descripción |
|---------|--------|-------------|
| Sync al servidor | `auto_save` | Cada N minutos o al cerrar app |
| Subir de nivel | `level_up` | Antes de aplicar el nivel |
| Inicio de sesión de campaña | `session_start` | DM inicia sesión |
| Fin de sesión | `session_end` | DM termina sesión |
| Restaurar snapshot | `restored` | Antes de restaurar |

### Manuales

- Usuario pulsa "Guardar punto de control"
- DM guarda estado de todos los PJs

## API

### Crear Snapshot Manual

```typescript
async function createSnapshot(
  characterId: string,
  description?: string
): Promise<Snapshot> {
  const character = await getCharacter(characterId)

  return supabase.from('character_snapshots').insert({
    character_id: characterId,
    character_data: character.character_data,
    created_by: currentUserId,
    reason: 'manual',
    description,
    data_size_bytes: JSON.stringify(character.character_data).length
  })
}
```

### Listar Historial

```typescript
async function getHistory(
  characterId: string,
  options?: { limit?: number; reason?: string }
): Promise<SnapshotSummary[]> {
  let query = supabase
    .from('character_snapshots')
    .select('id, created_at, created_by, reason, description, changes_summary')
    .eq('character_id', characterId)
    .order('created_at', { ascending: false })

  if (options?.limit) query = query.limit(options.limit)
  if (options?.reason) query = query.eq('reason', options.reason)

  return query
}
```

### Ver Snapshot Específico

```typescript
async function getSnapshot(snapshotId: string): Promise<Snapshot> {
  return supabase
    .from('character_snapshots')
    .select('*')
    .eq('id', snapshotId)
    .single()
}
```

### Restaurar Snapshot

```typescript
async function restoreSnapshot(snapshotId: string): Promise<void> {
  const snapshot = await getSnapshot(snapshotId)
  const character = await getCharacter(snapshot.character_id)

  // Crear snapshot del estado actual antes de restaurar
  await createSnapshot(snapshot.character_id, 'Estado antes de restaurar')

  // Restaurar
  await supabase
    .from('characters')
    .update({
      character_data: snapshot.character_data,
      modified: new Date().toISOString()
    })
    .eq('id', snapshot.character_id)
}
```

### Comparar Snapshots

```typescript
async function compareSnapshots(
  snapshotIdA: string,
  snapshotIdB: string
): Promise<Diff> {
  const [a, b] = await Promise.all([
    getSnapshot(snapshotIdA),
    getSnapshot(snapshotIdB)
  ])

  return computeDiff(a.character_data, b.character_data)
}
```

## Gestión de Storage

### Retención

```sql
-- Política de retención sugerida
-- Mantener:
--   - Últimos 30 días de auto_saves
--   - Todos los manuales
--   - Todos los level_up
--   - Últimos 10 session_start/session_end

CREATE OR REPLACE FUNCTION cleanup_old_snapshots()
RETURNS void AS $$
BEGIN
  DELETE FROM character_snapshots
  WHERE reason = 'auto_save'
    AND created_at < now() - interval '30 days';
END;
$$ LANGUAGE plpgsql;

-- Ejecutar semanalmente via pg_cron o similar
```

### Límites por Usuario

```sql
-- Función para contar storage usado
CREATE FUNCTION user_snapshot_storage(p_user_id UUID)
RETURNS BIGINT AS $$
  SELECT COALESCE(SUM(data_size_bytes), 0)
  FROM character_snapshots cs
  JOIN characters c ON cs.character_id = c.id
  WHERE c.user_id = p_user_id;
$$ LANGUAGE sql STABLE;

-- Podría limitarse por plan de usuario
-- Free: 50MB, Pro: 500MB, etc.
```

## UI Sugerida

### Lista de Historial

```
[Historial de Grondar]

Hoy
  14:32 - Auto-guardado
  14:15 - Subió a nivel 5 ⭐

Ayer
  22:45 - Fin de sesión "La Cripta Olvidada"
  19:00 - Inicio de sesión

Hace 3 días
  16:20 - Punto de control manual
          "Antes de entrar al dungeon"

[Ver más...]
```

### Comparación

```
[Comparar: Nivel 4 → Nivel 5]

Cambios:
  + Nivel: 4 → 5
  + HP máximo: 32 → 40
  + Ataque base: +3 → +4
  + Nueva dote: Poder Cleave
  + Nuevo hechizo: Bola de Fuego

[Restaurar a Nivel 4] [Cerrar]
```

## Integración con PowerSync

### Opción 1: Solo Servidor (Recomendado)

- Historial nunca se sincroniza
- UI hace fetch bajo demanda
- Requiere conexión para ver historial

### Opción 2: Últimos N Snapshots

```yaml
# Sync rules
character_snapshots:
  - WHERE character_id IN (SELECT id FROM characters WHERE user_id = :user_id)
    AND created_at > now() - interval '7 days'
    LIMIT 10
```

- Permite ver historial reciente offline
- Aumenta tamaño de SQLite

### Opción 3: Solo Metadata

Sincronizar solo la lista (sin `character_data`):

```yaml
character_snapshots:
  - SELECT id, character_id, created_at, reason, description, changes_summary
    WHERE character_id IN (...)
```

- Lista visible offline
- Contenido completo requiere fetch

## Preguntas Abiertas

1. **Granularidad de auto-save**: ¿Cada sync? ¿Cada N minutos? ¿Solo si hay cambios significativos?
2. **Diffing**: ¿Calcular `changes_summary` en cliente o servidor?
3. **Compresión**: ¿Comprimir `character_data` para ahorrar espacio?
4. **Branching**: ¿Permitir "forks" del personaje (versiones alternativas)?
5. **Colaborativo**: Si DM edita, ¿el snapshot muestra quién hizo el cambio?
