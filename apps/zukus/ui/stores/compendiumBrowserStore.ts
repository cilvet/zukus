import { create } from 'zustand';
import { useShallow } from 'zustand/shallow';
import type {
  CompendiumReference,
  StandardEntity,
  EntitySchemaDefinition,
  EntityTypeInfo,
  CompendiumDataPort,
} from '@zukus/core';
import { localCompendiumAdapter } from '../../infrastructure/compendiums';

/**
 * Criterios de filtrado activos.
 */
export type FilterCriteria = Record<string, unknown>;

/**
 * Estado del navegador de compendios.
 */
type CompendiumBrowserState = {
  // Datos
  compendiums: CompendiumReference[];
  currentCompendiumId: string | null;
  currentCompendiumName: string | null;
  entityTypes: EntityTypeInfo[];
  currentEntityType: string | null;
  currentEntityTypeName: string | null;
  entities: StandardEntity[];
  schema: EntitySchemaDefinition | null;

  // Entidad seleccionada (para vista de detalle)
  selectedEntityId: string | null;
  selectedEntityName: string | null;

  // Filtros
  searchQuery: string;
  activeFilters: FilterCriteria;

  // Layout
  viewMode: 'grid' | 'list';

  // Estado de carga
  isLoading: boolean;
  isLoadingEntities: boolean;
  error: string | null;

  // Adaptador (inyectable para tests)
  adapter: CompendiumDataPort;
};

/**
 * Acciones del navegador de compendios.
 */
type CompendiumBrowserActions = {
  // Carga de datos
  loadCompendiums: () => Promise<void>;
  selectCompendium: (compendiumId: string) => Promise<void>;
  selectEntityType: (entityType: string) => Promise<void>;
  loadEntities: () => Promise<void>;

  // Seleccion de entidad
  selectEntity: (entityId: string, entityName: string) => void;
  clearSelectedEntity: () => void;

  // Filtrado
  setSearchQuery: (query: string) => void;
  setFilter: (field: string, value: unknown) => void;
  clearFilters: () => void;

  // Layout
  setViewMode: (mode: 'grid' | 'list') => void;
  toggleViewMode: () => void;

  // Navegacion
  goBackToCompendiums: () => void;
  goBackToEntityTypes: () => void;
  goBackToEntities: () => void;

  // Reset
  reset: () => void;
};

export type CompendiumBrowserStore = CompendiumBrowserState & CompendiumBrowserActions;

const initialState: CompendiumBrowserState = {
  compendiums: [],
  currentCompendiumId: null,
  currentCompendiumName: null,
  entityTypes: [],
  currentEntityType: null,
  currentEntityTypeName: null,
  entities: [],
  schema: null,
  selectedEntityId: null,
  selectedEntityName: null,
  searchQuery: '',
  activeFilters: {},
  viewMode: 'list',
  isLoading: false,
  isLoadingEntities: false,
  error: null,
  adapter: localCompendiumAdapter,
};

/**
 * Store para navegacion de compendios.
 */
export const useCompendiumBrowserStore = create<CompendiumBrowserStore>((set, get) => ({
  ...initialState,

  loadCompendiums: async () => {
    set({ isLoading: true, error: null });
    try {
      const { adapter } = get();
      const compendiums = await adapter.getAvailableCompendiums();
      set({ compendiums, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Error loading compendiums',
        isLoading: false,
      });
    }
  },

  selectCompendium: async (compendiumId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { adapter, compendiums } = get();
      const compendium = compendiums.find((c) => c.id === compendiumId);
      const entityTypes = await adapter.getEntityTypes(compendiumId);
      set({
        currentCompendiumId: compendiumId,
        currentCompendiumName: compendium?.name || compendiumId,
        entityTypes,
        // Reset entity state
        currentEntityType: null,
        currentEntityTypeName: null,
        entities: [],
        schema: null,
        searchQuery: '',
        activeFilters: {},
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Error loading compendium',
        isLoading: false,
      });
    }
  },

  selectEntityType: async (entityType: string) => {
    const { currentCompendiumId, adapter, entityTypes } = get();
    if (!currentCompendiumId) return;

    set({ isLoadingEntities: true, error: null });
    try {
      const typeInfo = entityTypes.find((t) => t.typeName === entityType);
      const [result, schema] = await Promise.all([
        adapter.getEntities(currentCompendiumId, entityType),
        adapter.getEntitySchema(currentCompendiumId, entityType),
      ]);
      set({
        currentEntityType: entityType,
        currentEntityTypeName: typeInfo?.displayName || entityType,
        entities: result.entities,
        schema,
        selectedEntityId: null,
        selectedEntityName: null,
        searchQuery: '',
        activeFilters: {},
        isLoadingEntities: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Error loading entities',
        isLoadingEntities: false,
      });
    }
  },

  selectEntity: (entityId: string, entityName: string) => {
    set({ selectedEntityId: entityId, selectedEntityName: entityName });
  },

  clearSelectedEntity: () => {
    set({ selectedEntityId: null, selectedEntityName: null });
  },

  loadEntities: async () => {
    const { currentCompendiumId, currentEntityType, adapter, searchQuery, activeFilters } = get();
    if (!currentCompendiumId || !currentEntityType) return;

    set({ isLoadingEntities: true });
    try {
      const result = await adapter.getEntities(currentCompendiumId, currentEntityType, {
        search: searchQuery,
        filters: activeFilters,
      });
      set({ entities: result.entities, isLoadingEntities: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Error loading entities',
        isLoadingEntities: false,
      });
    }
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  setFilter: (field: string, value: unknown) => {
    set((state) => ({
      activeFilters: {
        ...state.activeFilters,
        [field]: value,
      },
    }));
  },

  clearFilters: () => {
    set({ searchQuery: '', activeFilters: {} });
  },

  setViewMode: (mode: 'grid' | 'list') => {
    set({ viewMode: mode });
  },

  toggleViewMode: () => {
    set((state) => ({ viewMode: state.viewMode === 'grid' ? 'list' : 'grid' }));
  },

  goBackToCompendiums: () => {
    set({
      currentCompendiumId: null,
      currentCompendiumName: null,
      entityTypes: [],
      currentEntityType: null,
      currentEntityTypeName: null,
      entities: [],
      schema: null,
      selectedEntityId: null,
      selectedEntityName: null,
      searchQuery: '',
      activeFilters: {},
    });
  },

  goBackToEntityTypes: () => {
    set({
      currentEntityType: null,
      currentEntityTypeName: null,
      entities: [],
      schema: null,
      selectedEntityId: null,
      selectedEntityName: null,
      searchQuery: '',
      activeFilters: {},
    });
  },

  goBackToEntities: () => {
    set({
      selectedEntityId: null,
      selectedEntityName: null,
    });
  },

  reset: () => {
    set(initialState);
  },
}));

// =============================================================================
// Selectores granulares
// =============================================================================

export const useCompendiums = () => useCompendiumBrowserStore((s) => s.compendiums);
export const useCurrentCompendiumId = () => useCompendiumBrowserStore((s) => s.currentCompendiumId);
export const useCurrentCompendiumName = () => useCompendiumBrowserStore((s) => s.currentCompendiumName);
export const useEntityTypes = () => useCompendiumBrowserStore((s) => s.entityTypes);
export const useCurrentEntityType = () => useCompendiumBrowserStore((s) => s.currentEntityType);
export const useCurrentEntityTypeName = () => useCompendiumBrowserStore((s) => s.currentEntityTypeName);
export const useEntities = () => useCompendiumBrowserStore((s) => s.entities);
export const useEntitySchema = () => useCompendiumBrowserStore((s) => s.schema);
export const useSelectedEntityId = () => useCompendiumBrowserStore((s) => s.selectedEntityId);
export const useSelectedEntityName = () => useCompendiumBrowserStore((s) => s.selectedEntityName);
export const useSearchQuery = () => useCompendiumBrowserStore((s) => s.searchQuery);
export const useActiveFilters = () => useCompendiumBrowserStore((s) => s.activeFilters);
export const useViewMode = () => useCompendiumBrowserStore((s) => s.viewMode);
export const useIsLoading = () => useCompendiumBrowserStore((s) => s.isLoading);
export const useIsLoadingEntities = () => useCompendiumBrowserStore((s) => s.isLoadingEntities);
export const useCompendiumError = () => useCompendiumBrowserStore((s) => s.error);

// =============================================================================
// Selectores de acciones
// =============================================================================

export const useCompendiumActions = () =>
  useCompendiumBrowserStore(
    useShallow((s) => ({
      loadCompendiums: s.loadCompendiums,
      selectCompendium: s.selectCompendium,
      selectEntityType: s.selectEntityType,
      loadEntities: s.loadEntities,
      selectEntity: s.selectEntity,
      clearSelectedEntity: s.clearSelectedEntity,
      setSearchQuery: s.setSearchQuery,
      setFilter: s.setFilter,
      clearFilters: s.clearFilters,
      setViewMode: s.setViewMode,
      toggleViewMode: s.toggleViewMode,
      goBackToCompendiums: s.goBackToCompendiums,
      goBackToEntityTypes: s.goBackToEntityTypes,
      goBackToEntities: s.goBackToEntities,
      reset: s.reset,
    }))
  );
