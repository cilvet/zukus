import {
  dnd35ExampleCompendium,
  type CompendiumDataPort,
  type EntityTypeInfo,
  type EntityListResult,
  type GetEntitiesOptions,
  type Compendium,
  type CompendiumReference,
  type StandardEntity,
  type EntitySchemaDefinition,
} from '@zukus/core';

/**
 * Mapa de nombres de tipo a nombres para mostrar.
 * Esto se puede extender o mover a configuracion.
 */
const ENTITY_TYPE_DISPLAY_NAMES: Record<string, string> = {
  spell: 'Spells',
  feat: 'Feats',
  buff: 'Buffs',
  class: 'Classes',
  classFeature: 'Class Features',
  system_levels: 'System Levels',
  character_ability_increase: 'Ability Increases',
};

/**
 * Cache local de compendios cargados.
 */
const compendiumCache = new Map<string, Compendium>();

/**
 * Obtiene un compendio del cache o lo carga.
 */
function getCompendiumById(id: string): Compendium | null {
  if (compendiumCache.has(id)) {
    return compendiumCache.get(id)!;
  }

  // De momento solo tenemos el compendio de ejemplo
  if (id === 'dnd35-example') {
    compendiumCache.set(id, dnd35ExampleCompendium);
    return dnd35ExampleCompendium;
  }

  return null;
}

/**
 * Filtra entidades por texto de busqueda.
 */
function filterBySearch(entities: StandardEntity[], search: string): StandardEntity[] {
  if (!search.trim()) return entities;

  const lowerSearch = search.toLowerCase().trim();
  return entities.filter((entity) => {
    const nameMatch = entity.name.toLowerCase().includes(lowerSearch);
    const descMatch = entity.description?.toLowerCase().includes(lowerSearch);
    const tagsMatch = entity.tags?.some((tag) => tag.toLowerCase().includes(lowerSearch));
    return nameMatch || descMatch || tagsMatch;
  });
}

/**
 * Filtra entidades por filtros de campo.
 */
function filterByFields(
  entities: StandardEntity[],
  filters: Record<string, unknown>
): StandardEntity[] {
  if (!filters || Object.keys(filters).length === 0) return entities;

  return entities.filter((entity) => {
    return Object.entries(filters).every(([field, value]) => {
      if (value === undefined || value === null || value === '') return true;

      const entityValue = (entity as Record<string, unknown>)[field];

      // Para arrays (multiselect)
      if (Array.isArray(value)) {
        if (value.length === 0) return true;
        if (Array.isArray(entityValue)) {
          return value.some((v) => entityValue.includes(v));
        }
        return value.includes(entityValue);
      }

      // Para valores simples
      return entityValue === value;
    });
  });
}

/**
 * Adaptador local que implementa CompendiumDataPort.
 * Usa los compendios bundled en la aplicacion.
 */
export const localCompendiumAdapter: CompendiumDataPort = {
  async getAvailableCompendiums(): Promise<CompendiumReference[]> {
    // De momento solo el compendio de ejemplo
    return [
      {
        id: dnd35ExampleCompendium.id,
        name: dnd35ExampleCompendium.name,
      },
    ];
  },

  async loadCompendium(id: string): Promise<Compendium | null> {
    return getCompendiumById(id);
  },

  async getEntityTypes(compendiumId: string): Promise<EntityTypeInfo[]> {
    const compendium = getCompendiumById(compendiumId);
    if (!compendium) return [];

    const entityTypes: EntityTypeInfo[] = [];

    for (const [typeName, entities] of Object.entries(compendium.entities)) {
      const schema = compendium.schemas.find((s) => s.typeName === typeName);
      entityTypes.push({
        typeName,
        displayName: ENTITY_TYPE_DISPLAY_NAMES[typeName] || schema?.description || typeName,
        count: entities.length,
        description: schema?.description,
      });
    }

    // Ordenar por nombre para mostrar
    return entityTypes.sort((a, b) => a.displayName.localeCompare(b.displayName));
  },

  async getEntities(
    compendiumId: string,
    entityType: string,
    options?: GetEntitiesOptions
  ): Promise<EntityListResult> {
    const compendium = getCompendiumById(compendiumId);
    if (!compendium) {
      return { entities: [], total: 0, hasMore: false };
    }

    let entities = compendium.entities[entityType] || [];

    // Aplicar busqueda
    if (options?.search) {
      entities = filterBySearch(entities, options.search);
    }

    // Aplicar filtros
    if (options?.filters) {
      entities = filterByFields(entities, options.filters);
    }

    const total = entities.length;

    // Aplicar paginacion
    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? entities.length;
    const paginatedEntities = entities.slice(offset, offset + limit);

    return {
      entities: paginatedEntities,
      total,
      hasMore: offset + paginatedEntities.length < total,
    };
  },

  async getEntityById(
    compendiumId: string,
    entityType: string,
    entityId: string
  ): Promise<StandardEntity | null> {
    const compendium = getCompendiumById(compendiumId);
    if (!compendium) return null;

    const entities = compendium.entities[entityType] || [];
    return entities.find((e) => e.id === entityId) || null;
  },

  async getEntitySchema(
    compendiumId: string,
    entityType: string
  ): Promise<EntitySchemaDefinition | null> {
    const compendium = getCompendiumById(compendiumId);
    if (!compendium) return null;

    return compendium.schemas.find((s) => s.typeName === entityType) || null;
  },
};
