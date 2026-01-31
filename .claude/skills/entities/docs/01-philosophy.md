# Filosofia del Sistema de Entidades

## Conceptos Fundamentales

### El Sistema como CMS

El sistema de entidades de Zukus funciona de manera similar a un CMS (Content Management System):

1. **Schemas = Content Types**: Los `EntitySchemaDefinition` definen tipos de contenido (spell, feat, class, weapon)
2. **Addons = Plugins**: Los addons componen comportamiento sin herencia (searchable, effectful, etc.)
3. **Instancias = Content Items**: Las entidades son instancias validadas de los schemas
4. **Compendium = CMS Backend**: Almacen de todas las entidades disponibles
5. **Character.entities = User Data**: Las entidades que el personaje ha adquirido

### Separacion Estatico vs Dinamico

```
ESTATICO (Compendium)              DINAMICO (Character)
===================                ==================
Definiciones inmutables            Estado del personaje
Solo lectura                       Lectura/escritura
Acceso en adquisicion              Acceso en calculo
```

El compendium contiene todas las definiciones (spells, feats, items). El personaje contiene las entidades que ha adquirido, ya resueltas.

### Personaje Auto-Contenido

**Principio fundamental**: El personaje debe funcionar sin acceso al compendium en runtime.

**Beneficios:**
- Portabilidad: El personaje puede exportarse y seguir funcionando
- Offline: No requiere acceso al compendium para calcular stats
- Versionado: Si una entidad cambia en el compendium, el personaje mantiene su version

**Implementacion:**
```typescript
// CORRECTO: Entidad completa almacenada
character.entities["spell"] = [
  {
    instanceId: "fireball@cge:sorcerer-spells",
    entity: { id: "fireball", name: "Fireball", level: 3, ... },
    applicable: true,
    origin: "cge:sorcerer-spells"
  }
]

// INCORRECTO: Solo referencia
character.knownSpells = ["fireball"]  // Requiere compendium para resolver
```

### Flujo de Adquisicion vs Calculo

```
ADQUISICION (una vez cuando se obtiene)
=======================================
1. Usuario selecciona entidad del compendium
2. Resolver entidad base
3. Resolver propiedades/children (keen, flaming, etc.)
4. Aplicar Effects de propiedades a la entidad
5. Guardar EntityInstance en character.entities
6. Persistir

CALCULO (cada vez que se necesita el sheet)
==========================================
1. Leer character.entities (ya resueltas)
2. Filtrar por applicable: true
3. Compilar changes de cada entidad
4. Calcular CharacterSheet
5. NO acceder al compendium
```

## Patrones Arquitectonicos

### Pool Central + Access Indices

El patron usado en todo el sistema:

```
character.entities (Pool Central)
    |
    +-- Record<entityType, EntityInstance[]>
    |
    +-- Contiene TODAS las entidades resueltas

character.cgeState.knownSelections (Access Index)
    |
    +-- Solo IDs organizados por nivel

character.inventoryState.items (Access Index)
    |
    +-- Solo IDs con instanceValues
```

El pool central almacena las entidades completas. Los indices de acceso permiten busquedas rapidas sin duplicar datos.

### EntityInstance como Wrapper

```typescript
type EntityInstance = {
  instanceId: string;     // Identificador unico con origen
  entity: StandardEntity; // Entidad completa
  applicable: boolean;    // Si esta activa
  origin: string;         // Trazabilidad
};
```

El `instanceId` codifica la ubicacion y origen:
- `"power-attack@feat-lvl-3"` - Dote tomada en nivel 3
- `"magic-missile@cge:sorcerer-spells"` - Spell de sorcerer
- `"longsword@inventory"` - Item del inventario

### Composicion sobre Herencia

No hay jerarquias de tipos. Se usa composicion con addons:

```typescript
// INCORRECTO: Herencia
class Spell extends Effect extends Searchable { ... }

// CORRECTO: Composicion
const spellSchema: EntitySchemaDefinition = {
  typeName: "spell",
  addons: ["searchable", "effectful", "imageable"],
  fields: [...]
}
```

Los addons inyectan campos y comportamiento sin crear jerarquias.

## Trade-offs Aceptados

1. **Mas datos persistidos**: Se guarda la entidad completa, no solo la referencia
2. **Entidades no se actualizan**: Cambios en compendium no afectan entidades ya adquiridas
3. **Duplicacion controlada**: El mismo "Longsword" aparece en cada personaje que lo tenga

Estos trade-offs son intencionales y valen el precio de la portabilidad y simplicidad.

## Archivos Clave

| Archivo | Proposito |
|---------|-----------|
| `character/baseData/character.ts` | Define `entities` pool |
| `levels/storage/types.ts` | Define `EntityInstance` |
| `character/calculation/entities/compileCharacterEntities.ts` | Compila entidades a changes |

## Siguiente

Ver `02-schemas.md` para entender como definir tipos de entidades.
