# Restricciones de PowerSync en el Sistema de Permisos

PowerSync replica datos al cliente SQLite. Esto impone restricciones importantes en cómo diseñamos permisos.

## Cómo Funciona PowerSync

1. **Sync Rules** definen qué datos se replican a cada usuario
2. Los datos se almacenan en **SQLite local**
3. Las queries se ejecutan **localmente** (no en Postgres)
4. Cambios locales se sincronizan de vuelta al servidor

## Implicaciones para Permisos

### Lo que Funciona Bien

**Permisos derivables de datos existentes:**

```
Si tienes el personaje en SQLite → eres el dueño
Si tienes la campaña en SQLite → eres el DM
Si tienes campaign_characters → estás en esa campaña
```

El modelo actual es compatible porque:
- `owner_id` está en cada entidad
- `campaign_id` en sources → si tienes la campaña, tienes acceso
- `is_private` → filtrable en sync rules

**Sync rules simples:**

```yaml
# Ejemplo conceptual de sync rules
characters:
  - WHERE user_id = :user_id

campaigns:
  - WHERE dm_id = :user_id
  - WHERE id IN (SELECT campaign_id FROM campaign_characters
                 WHERE character_id IN (SELECT id FROM characters WHERE user_id = :user_id))

sources:
  - WHERE owner_id = :user_id
  - WHERE is_private = false
  - WHERE campaign_id IN (:user_campaigns)
```

### Lo que NO Funciona

**Tablas de grants con muchas filas:**

```sql
-- Problemático
content_grants (
  grantable_type, grantable_id,
  grantee_type, grantee_id,
  permission
)
```

Problemas:
- Miles de filas por usuario activo
- Sync rules complejas para filtrar solo las relevantes
- Joins pesados en SQLite
- Funciones de Postgres no disponibles localmente

**Permisos que requieren lógica compleja:**

```sql
-- Esto funciona en Postgres RLS
SELECT * FROM items
WHERE has_permission(auth.uid(), 'item', id, 'read')

-- Pero has_permission() NO EXISTE en SQLite del cliente
```

## Principios de Diseño

### 1. Permisos en Estructura, No en Tablas Separadas

```
Bien: owner_id, campaign_id, is_private en cada entidad
Mal:  Tabla separada de grants que hay que sincronizar y joinear
```

### 2. Sync Rules como Filtro Principal

Los permisos se aplican **al decidir qué sincronizar**, no después:

```
Servidor: "Este usuario tiene acceso a sources A, B, C" → sincroniza solo esos
Cliente:  Asume que todo lo que tiene en SQLite es accesible
```

### 3. Contenido Bajo Demanda vs Automático

Para contenido grande (compendios del marketplace):

```
Automático: Tus personajes, tus campañas, sources propios
Bajo demanda: Compendios comprados → usuario decide "descargar"
```

### 4. Validación en Servidor para Escrituras

```
Lectura: Confía en lo que hay en SQLite (ya filtrado por sync rules)
Escritura: Servidor valida con RLS antes de aceptar cambios
```

## Tabla de Compatibilidad

| Patrón | Compatible | Notas |
|--------|------------|-------|
| `owner_id = user` | Si | Directo |
| `is_private = false` | Si | Directo |
| `campaign_id IN user_campaigns` | Si | Subconsulta en sync rules |
| Tabla de grants separada | No | Demasiados datos, joins complejos |
| Funciones PL/pgSQL | No | No disponibles en SQLite |
| Permisos temporales (expires_at) | Parcial | Sync rules no re-evalúan automáticamente |
| Roles jerárquicos | Parcial | Mejor como columna que como tabla |

## Impacto en Futuras Features

### Marketplace
- Licencias deben traducirse a algo sincronizable
- Opción: "descargar" compendio = crear `user_sources` entry
- Ver [marketplace-considerations.md](./marketplace-considerations.md)

### Roles de Campaña
- Mejor como columna en `campaign_members.role`
- No como tabla separada de permisos

### Versionado
- Historial NO se sincroniza automáticamente
- Bajo demanda desde servidor
- Ver [versioning-system.md](./versioning-system.md)
