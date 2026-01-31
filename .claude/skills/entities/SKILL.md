---
name: entities
description: Sistema de Entidades completo - schemas, addons, almacenamiento en personaje, CGE, inventario, relaciones y filtros. Consultar cuando se trabaje con cualquier aspecto del sistema de entidades.
user-invocable: true
disable-model-invocation: false
allowed-tools: Read, Grep, Glob
---

# Sistema de Entidades de Zukus

Sistema generico similar a un CMS para definir, almacenar, relacionar y filtrar tipos de datos en el dominio D&D 3.5, pero expandible en un futuro a muchos tipos de juegos de rol. 

## Vision General

El sistema de entidades es la infraestructura central que permite definir tipos de datos (spells, feats, items, classes) mediante schemas declarativos, componer comportamiento con addons reutilizables, almacenar entidades en el personaje de forma auto-contenida, y filtrarlas con facetado automatico.

---

## 1. Filosofia y Principios

**Concepto central**: El personaje es auto-contenido. Las entidades se resuelven completamente en el momento de adquisicion (cuando el usuario añade un spell, equipa un item, etc.) y se almacenan ya resueltas en el personaje. Durante el calculo del character sheet, no se accede al compendium.

**Separacion estatico/dinamico**: El compendium contiene definiciones estaticas (todas las entidades disponibles). El personaje contiene entidades dinamicas (las que posee, ya resueltas con sus propiedades aplicadas).

**Trade-offs aceptados**: Mas datos persistidos por personaje, entidades no se actualizan automaticamente si cambia el compendium (esto es intencional para versionado).

> Profundizar: `docs/01-philosophy.md`

---

## 2. Schemas y Addons

**EntitySchemaDefinition**: Estructura declarativa que define un tipo de entidad. Contiene el nombre del tipo, descripcion, version, lista de campos y addons a aplicar.

**Tipos de campos**: El sistema soporta tipos primitivos (string, integer, boolean), arrays (string_array, integer_array), referencias a otras entidades (reference, reference_array), enums con valores predefinidos, y campos computados.

**Addons**: Modulos reutilizables que aportan campos y comportamiento. Un addon como `effectful` añade campos para effects que modifican el personaje. Un addon como `searchable` añade campos para busqueda. Los addons se declaran en el schema y se aplican automaticamente.

**Validacion**: A partir del schema se genera automaticamente un schema Zod para validar entidades en runtime.

> Profundizar: `docs/02-schemas.md`

---

## 3. Almacenamiento en Personaje

**Pool central**: Todas las entidades del personaje se almacenan en `character.entities`, un diccionario donde la clave es el tipo de entidad y el valor es un array de instancias.

**EntityInstance**: Wrapper que contiene la entidad resuelta junto con metadatos: un ID de instancia unico, la entidad completa, un flag de si esta activa, y el origen (de donde vino: CGE, inventario, etc.).

**Access indices**: Los subsistemas (CGE, inventario) mantienen estructuras de acceso rapido que referencian entidades por ID, pero la entidad real siempre esta en el pool central. Esto evita duplicacion y centraliza el almacenamiento.

**Persistencia**: El pool de entidades se serializa junto con el resto del personaje. Al cargar, las entidades ya estan resueltas y listas para usar.

> Profundizar: `docs/03-storage.md`

---

## 4. CGE (Configuracion de Gestion de Entidades)

**Proposito**: Sistema para configurar como los personajes interactuan con entidades accionables (conjuros, maniobras, poderes, invocaciones). Cada clase define su CGEConfig que describe las reglas de acceso, conocimiento, recursos y preparacion.

**Dimensiones de configuracion**: Un CGE se compone de varias dimensiones ortogonales que se combinan:

- **Known**: Como se adquieren entidades. Puede ser ilimitado (spellbook de Wizard), limitado por nivel de entidad (Sorcerer conoce X de cada nivel), o limitado en total (Warblade conoce X maniobras de cualquier nivel). Opcional: algunas clases acceden directamente a la lista filtrada sin pool de conocidos.

- **Resource**: Como se consumen. Puede ser por slots (Wizard tiene X slots de nivel N), por pool de puntos (Psion gasta power points), o sin coste (Warlock usa invocaciones at-will).

- **Preparation**: Como se preparan antes de usar. Puede ser sin preparacion (Sorcerer lanza lo que conoce), bound (Wizard prepara un spell por slot), o lista (Warblade prepara una lista de maniobras que puede usar).

- **Tracks**: Pistas independientes de uso. La mayoria de clases tienen una, pero Cleric tiene dos (base + dominios).

**CGEConfig**: Estructura que combina estas dimensiones para definir el comportamiento completo de una clase con sus entidades.

**Operaciones**: Añadir/quitar known, preparar en slots, consumir recursos, resetear por descanso. Todas las operaciones actualizan tanto el estado del CGE como el pool central de entidades.

> Profundizar: `docs/04-cge.md`

---

## 5. Sistema de Inventario

**InventoryItemInstance**: Representa un item en el inventario del personaje. Contiene ID de instancia, tipo de entidad, cantidad, valores de instancia editables por el usuario, y la entidad resuelta.

**Instance fields**: Campos que el usuario puede modificar por instancia, como equipped o wielded. Se definen en el schema del item y permiten estado mutable sin modificar la entidad base.

**Propiedades con Effects**: Los items pueden tener propiedades (como "Keen" en una espada). Estas propiedades son entidades hijas que contienen Effects. Al resolver el item, los Effects de las propiedades se aplican al item padre, modificando sus campos.

**Target @item.X**: Los Effects de propiedades usan un target especial que apunta a campos del item contenedor. Por ejemplo, un Effect con target `@item.critRange` modifica el rango de critico de la espada.

**Resolucion en adquisicion**: Cuando se añade un item al inventario, se resuelve completamente: se obtiene la entidad base, se resuelven sus propiedades, se aplican los Effects de las propiedades, y se guarda el resultado.

> Profundizar: `docs/05-inventory.md`

---

## 6. Relaciones entre Entidades

**RelationEntity**: Entidad especial que modela una relacion entre dos entidades. Por ejemplo, spell-class relaciona un conjuro con una clase y nivel.

**Metadatos de relacion**: Las relaciones pueden tener datos adicionales. Una relacion spell-class tiene el nivel al que la clase accede a ese spell.

**Extensibilidad via compendios**: Las relaciones permiten expandir el sistema sin modificar entidades existentes. Un nuevo compendio puede definir una clase homebrew y crear relaciones spell-class para que acceda a conjuros del compendio base. Los conjuros originales no se modifican; la relacion vive en el compendio nuevo.

**Compilacion**: Las relaciones se compilan en estructuras directamente filtrables. Una entidad termina con un campo como `classData.classLevels` que contiene un mapa de clase a niveles.

**Clave de filtrado**: La estructura compilada permite filtrar eficientemente. Buscar "spells de nivel 3 para wizard" es una consulta directa sobre el campo compilado.

> Profundizar: `docs/06-relations.md`

---

## 7. Facetado y Filtros

**Dos capas**: El sistema tiene facets (datos brutos generados del schema) y filterConfig (configuracion de UI manual).

**Facets**: Se generan automaticamente desde el schema y a partir de un listado de entidades. Cada campo produce un facet con tipo (text, select, multiselect, number, boolean) y opciones disponibles.

**FilterConfig**: Configuracion manual que define como mostrar filtros al usuario. Incluye labels, agrupacion visual, y filtros especiales como relation filters (clase + nivel como filtro dual dependiente).

**FilterState**: Estado actual de los filtros seleccionados. Un diccionario de fieldName a valor seleccionado.

**Filtrado**: Funcion que recibe entidades y filterState, retorna entidades que cumplen todos los criterios.

> Profundizar: `docs/07-facets-filters.md`

---

## Archivos Clave

| Area | Ubicacion |
|------|-----------|
| Tipos base | `entities/types/base.ts`, `fields.ts`, `schema.ts` |
| Schemas | `entities/schema/` |
| Addons | `levels/entities/addons/` |
| Storage | `levels/storage/types.ts` |
| CGE | `cge/types.ts`, `cge/knownOperations.ts` |
| Inventario | `inventory/types.ts`, `inventory/properties/` |
| Relaciones | `entities/relations/` |
| Filtros | `entities/filtering/` |
| Pool personaje | `character/baseData/character.ts` |

---

## Cuadro de Decision

| Necesitas... | Consulta... |
|--------------|-------------|
| Entender la arquitectura general | `docs/01-philosophy.md` |
| Definir nueva entidad o addon | `docs/02-schemas.md` |
| Saber donde se guardan entidades | `docs/03-storage.md` |
| Trabajar con spells/maniobras | `docs/04-cge.md` |
| Trabajar con items/propiedades | `docs/05-inventory.md` |
| Filtrar por clase+nivel | `docs/06-relations.md` |
| Construir UI de filtros | `docs/07-facets-filters.md` |
