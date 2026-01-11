import type { z } from 'zod';
import type { EntitySchemaDefinition } from '../entities/types/schema';
import type { StandardEntity } from '../entities/types/base';

/**
 * Un compendio es un pack de contenido modular.
 */
export type Compendium = {
  /** Identificador único */
  id: string;
  
  /** Nombre para mostrar */
  name: string;
  
  /** Versión del compendio (semver) */
  version: string;
  
  /** Descripción opcional */
  description?: string;
  
  /** IDs de compendios requeridos */
  dependencies: string[];
  
  /** Schemas de entityTypes que define */
  schemas: EntitySchemaDefinition[];
  
  /** Instancias organizadas por entityType */
  entities: Record<string, StandardEntity[]>;
};

/**
 * Referencia ligera a un compendio.
 */
export type CompendiumReference = {
  id: string;
  name: string;
};

/**
 * Registro de compendios disponibles y activos.
 */
export type CompendiumRegistry = {
  available: CompendiumReference[];
  active: string[];
};

/**
 * EntityType resuelto con schema y validador.
 */
export type ResolvedEntityType = {
  schema: EntitySchemaDefinition;
  validator: z.ZodSchema;
  sourceCompendiumId: string;
};

/**
 * Tipos de warning durante resolución de compendios.
 */
export type CompendiumWarningType = 
  | 'missing_dependency' 
  | 'schema_conflict' 
  | 'unknown_entity_type' 
  | 'invalid_entity'
  | 'no_context';

/**
 * Warning durante resolución de compendios.
 */
export type CompendiumWarning = {
  type: CompendiumWarningType;
  message: string;
  context?: Record<string, unknown>;
};

/**
 * Contexto de compendios completamente resuelto.
 */
export type ResolvedCompendiumContext = {
  /** EntityTypes disponibles, indexados por typeName */
  entityTypes: Map<string, ResolvedEntityType>;
  
  /** Lista de typeNames disponibles */
  availableTypeNames: string[];
  
  /** Compendios activos (referencias) */
  activeCompendiums: CompendiumReference[];
  
  /** Warnings de resolución */
  warnings: CompendiumWarning[];
};

/**
 * Context for character calculation.
 * Contains the resolved compendium context if available.
 */
export type CalculationContext = {
  /** Resolved compendium context with entityTypes and validators */
  compendiumContext?: ResolvedCompendiumContext;
};

