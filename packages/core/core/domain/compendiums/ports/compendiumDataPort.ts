import type { CompendiumReference, Compendium } from '../types';
import type { StandardEntity } from '../../entities/types/base';
import type { EntitySchemaDefinition } from '../../entities/types/schema';

/**
 * Informacion de un tipo de entidad dentro de un compendio.
 */
export type EntityTypeInfo = {
  /** Nombre tecnico del tipo (ej: 'spell', 'feat') */
  typeName: string;
  /** Nombre para mostrar (ej: 'Conjuros', 'Dotes') */
  displayName: string;
  /** Numero de entidades de este tipo */
  count: number;
  /** Descripcion opcional del tipo */
  description?: string;
};

/**
 * Resultado de obtener entidades con paginacion.
 */
export type EntityListResult = {
  entities: StandardEntity[];
  total: number;
  hasMore: boolean;
};

/**
 * Opciones para obtener entidades.
 */
export type GetEntitiesOptions = {
  /** Busqueda por texto */
  search?: string;
  /** Filtros por campo */
  filters?: Record<string, unknown>;
  /** Offset para paginacion */
  offset?: number;
  /** Limite de resultados */
  limit?: number;
};

/**
 * Puerto de acceso a datos de compendios.
 *
 * Define el contrato que deben cumplir los adaptadores (local, remoto, etc).
 * Sigue arquitectura hexagonal para permitir cambiar la fuente de datos.
 */
export type CompendiumDataPort = {
  /**
   * Obtiene la lista de compendios disponibles.
   */
  getAvailableCompendiums: () => Promise<CompendiumReference[]>;

  /**
   * Carga un compendio completo por su ID.
   */
  loadCompendium: (id: string) => Promise<Compendium | null>;

  /**
   * Obtiene los tipos de entidad de un compendio con conteo.
   */
  getEntityTypes: (compendiumId: string) => Promise<EntityTypeInfo[]>;

  /**
   * Obtiene las entidades de un tipo especifico.
   */
  getEntities: (
    compendiumId: string,
    entityType: string,
    options?: GetEntitiesOptions
  ) => Promise<EntityListResult>;

  /**
   * Obtiene una entidad por ID.
   */
  getEntityById: (
    compendiumId: string,
    entityType: string,
    entityId: string
  ) => Promise<StandardEntity | null>;

  /**
   * Obtiene el schema de un tipo de entidad.
   */
  getEntitySchema: (
    compendiumId: string,
    entityType: string
  ) => Promise<EntitySchemaDefinition | null>;
};
