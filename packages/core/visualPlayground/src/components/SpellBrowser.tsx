import { useState, useMemo, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { X, Filter, ChevronDown, Loader2, AlertCircle, ImageIcon } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ImagePickerModal } from '@/components/entity-editor/ImagePickerModal'
import { generateFacets, filterEntities } from '@root/core/domain/entities'
import { spellSchemaDefinition } from '@/data/spellSchema'
import { entitiesApi, imagesApi } from '@/lib/api'
import type { EntityFacet } from '@root/core/domain/entities/filtering/facets'
import type { EntityFilterCriteria } from '@root/core/domain/entities/filtering/filters'
import type { Entity } from '@root/core/domain/entities'

type Spell = Entity & {
  name: string
  level: number
  school: string
  subschool?: string
  components: string[]
  castingTime: string
  range: string
  duration: string
  savingThrow?: string
  spellResistance: boolean
  classes: string[]
  classLevels?: Record<string, number>
  description: string
  shortdescription?: string
  visualdescription?: string
  tags?: string[]
  image?: string
}

export function SpellBrowser() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<EntityFilterCriteria>({})
  const [sortBy, setSortBy] = useState<string>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [filtersOpen, setFiltersOpen] = useState(false)
  
  // State for loading spells from API
  const [allSpells, setAllSpells] = useState<Spell[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 30
  
  // Modal state
  const [selectedSpell, setSelectedSpell] = useState<Spell | null>(null)
  
  // Image picker state
  const [imagePickerOpen, setImagePickerOpen] = useState(false)
  const [spellEditingImage, setSpellEditingImage] = useState<Spell | null>(null)

  // Load spells from API on mount
  useEffect(() => {
    const loadSpells = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const spells = await entitiesApi.getAll('spell')
        setAllSpells(spells as Spell[])
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error loading spells')
      } finally {
        setIsLoading(false)
      }
    }

    loadSpells()
  }, [])

  // Handle image change
  const handleImageChange = async (imagePath: string) => {
    if (!spellEditingImage) return
    
    try {
      const updatedSpell = { ...spellEditingImage, image: imagePath }
      await entitiesApi.update('spell', spellEditingImage.id, updatedSpell)
      
      // Update local state
      setAllSpells(prev => prev.map(s => 
        s.id === spellEditingImage.id ? updatedSpell : s
      ))
      
      // Update selected spell if it's the one being edited
      if (selectedSpell?.id === spellEditingImage.id) {
        setSelectedSpell(updatedSpell)
      }
      
      setImagePickerOpen(false)
      setSpellEditingImage(null)
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Error desconocido'
      alert(`Error al actualizar imagen: ${errorMsg}`)
    }
  }

  const handleImageClick = (spell: Spell, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click
    setSpellEditingImage(spell)
    setImagePickerOpen(true)
  }

  // Generate facets from schema and entities
  const facets = useMemo(() => {
    if (allSpells.length === 0) {
      return []
    }
    return generateFacets(spellSchemaDefinition, allSpells as Entity[])
  }, [allSpells])
  
  // Apply filters and search
  const filteredSpells = useMemo(() => {
    let filtered = [...allSpells] as unknown as Spell[]

    // Apply search term with scoring
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase()
      
      // Calculate search score for each spell
      const withScores = filtered.map((spell) => {
        let score = 0
        const lowerName = spell.name.toLowerCase()
        const lowerDesc = spell.description.toLowerCase()
        
        // Exact match in name = highest score
        if (lowerName === lowerSearch) {
          score += 1000
        }
        // Name starts with search term = very high score
        else if (lowerName.startsWith(lowerSearch)) {
          score += 500
        }
        // Name contains search term = high score
        else if (lowerName.includes(lowerSearch)) {
          score += 100
        }
        
        // Description contains search term = low score
        if (lowerDesc.includes(lowerSearch)) {
          score += 10
        }
        
        // Tags match = medium score
        if (spell.tags?.some(tag => tag.toLowerCase().includes(lowerSearch))) {
          score += 50
        }
        
        return { spell, score }
      })
      
      // Filter out spells with score 0 and sort by score descending
      filtered = withScores
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(item => item.spell)
    }

    // Apply filters
    const filterCriteria: EntityFilterCriteria = {
      ...filters,
      sort_by: sortBy,
      sort_order: sortOrder,
    }

    filtered = filterEntities(filtered as Entity[], filterCriteria) as Spell[]

    return filtered
  }, [searchTerm, filters, sortBy, sortOrder])
  
  // Track performance with useEffect (non-blocking)
  // useEffect(() => {
  //   requestAnimationFrame(() => {
  //     const startTotal = performance.now()
  //     let searchTime = 0
  //     let filterTime = 0
  //     
  //     // Measure search
  //     const start1 = performance.now()
  //     if (searchTerm) {
  //       const lowerSearch = searchTerm.toLowerCase()
  //       void (allSpells as unknown as Spell[]).filter((spell) => {
  //         const lowerName = spell.name?.toLowerCase() || ''
  //         const lowerDesc = spell.description?.toLowerCase() || ''
  //         return lowerName.includes(lowerSearch) || lowerDesc.includes(lowerSearch)
  //       })
  //       searchTime = performance.now() - start1
  //     } else {
  //       searchTime = 0
  //     }
  //     
  //     // Measure filtering
  //     const start2 = performance.now()
  //     const filterCount = Object.keys(filters).length
  //     filterTime = (performance.now() - start2) + (filterCount * 0.1) // Rough estimate
  //     
  //     const totalTime = performance.now() - startTotal
  //     
  //     setPerformanceMetrics({
  //       search: searchTime,
  //       filtering: filterTime,
  //       facets: 0,
  //       pagination: 0,
  //       total: totalTime,
  //       resultCount: filteredSpells.length
  //     })
  //   })
  // }, [searchTerm, filters, filteredSpells.length])
  
  // Paginación
  const totalPages = Math.ceil(filteredSpells.length / itemsPerPage)
  const paginatedSpells = useMemo(() => {
    // Adjust current page if it's out of bounds
    const safePage = Math.min(Math.max(1, currentPage), totalPages || 1)
    const startIndex = (safePage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredSpells.slice(startIndex, endIndex)
  }, [filteredSpells, currentPage, totalPages])

  const handleFilterChange = (fieldName: string, value: string | number | boolean | undefined) => {
    setFilters((prev) => {
      const newFilters = { ...prev }
      if (value === undefined || value === null || value === '') {
        delete newFilters[fieldName]
      } else {
        newFilters[fieldName] = value
      }
      return newFilters
    })
  }

  const handleMultiSelectChange = (fieldName: string, value: string, checked: boolean) => {
    setFilters((prev) => {
      const currentValues = (prev[fieldName] as string[]) || []
      const newValues = checked
        ? [...currentValues, value]
        : currentValues.filter((v) => v !== value)

      const newFilters = { ...prev }
      if (newValues.length === 0) {
        delete newFilters[fieldName]
      } else {
        newFilters[fieldName] = newValues
      }
      return newFilters
    })
  }

  const renderFacet = (facet: EntityFacet) => {
    switch (facet.type) {
      case 'text':
        return (
          <div key={facet.fieldName} className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {facet.displayName}
            </label>
              <Input
                placeholder={`Buscar ${facet.displayName.toLowerCase()}...`}
                value={(filters[facet.fieldName] as string) || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange(facet.fieldName, e.target.value)}
                className="h-10"
              />
          </div>
        )

      case 'select': {
        const currentSelectValue = (filters[facet.fieldName] as string) || '__all__'
        const hasFilter = currentSelectValue !== '__all__'
        return (
          <div key={facet.fieldName} className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {facet.displayName}
              </label>
              {hasFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => handleFilterChange(facet.fieldName, undefined)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <Select
              value={currentSelectValue}
              onValueChange={(value: string) => handleFilterChange(facet.fieldName, value === '__all__' ? undefined : value)}
            >
              <SelectTrigger className={`h-10 w-full ${hasFilter ? 'border-primary/50 bg-primary/5' : ''}`}>
                <SelectValue placeholder={`Todos los ${facet.displayName.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <SelectItem value="__all__">
                  <span className="flex items-center gap-2">
                    <span>Todos</span>
                    {!hasFilter && <span className="text-xs text-muted-foreground">(sin filtro)</span>}
                  </span>
                </SelectItem>
                {facet.options?.map((option) => (
                  <SelectItem key={String(option)} value={String(option)}>
                    {String(option)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )
      }

      case 'multiselect':
        return (
          <div key={facet.fieldName} className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {facet.displayName}
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3 bg-muted/20">
              {facet.options?.map((option) => {
                const currentValues = (filters[facet.fieldName] as string[]) || []
                const checked = currentValues.includes(String(option))
                return (
                  <div key={String(option)} className="flex items-center space-x-2 hover:bg-accent/50 rounded-sm p-1.5 -m-1.5 transition-colors">
                    <Checkbox
                      id={`${facet.fieldName}-${option}`}
                      checked={checked}
                      onCheckedChange={(checked: boolean) =>
                        handleMultiSelectChange(facet.fieldName, String(option), checked === true)
                      }
                    />
                    <label
                      htmlFor={`${facet.fieldName}-${option}`}
                      className={`text-sm cursor-pointer flex-1 select-none ${checked ? 'font-medium' : ''}`}
                    >
                      {String(option)}
                    </label>
                  </div>
                )
              })}
            </div>
          </div>
        )

      case 'number': {
        const currentNumberValue = filters[facet.fieldName]
        const hasNumberFilter = currentNumberValue !== undefined && currentNumberValue !== null && currentNumberValue !== ''
        return (
          <div key={facet.fieldName} className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {facet.displayName}
              </label>
              {hasNumberFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => handleFilterChange(facet.fieldName, undefined)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            {facet.options ? (
              <Select
                value={(filters[facet.fieldName] as string) || '__all__'}
                onValueChange={(value: string) => handleFilterChange(facet.fieldName, value === '__all__' ? undefined : parseInt(value))}
              >
                <SelectTrigger className={`h-10 w-full ${hasNumberFilter ? 'border-primary/50 bg-primary/5' : ''}`}>
                  <SelectValue placeholder={`Todos los ${facet.displayName.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="__all__">Todos</SelectItem>
                  {facet.options.map((option) => (
                    <SelectItem key={String(option)} value={String(option)}>
                      {String(option)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                type="number"
                placeholder={`Filtrar por ${facet.displayName.toLowerCase()}...`}
                value={(filters[facet.fieldName] as string) || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleFilterChange(facet.fieldName, e.target.value ? parseInt(e.target.value) : undefined)
                }
                className={`h-10 ${hasNumberFilter ? 'border-primary/50 bg-primary/5' : ''}`}
              />
            )}
          </div>
        )
      }

      case 'boolean': {
        const currentBoolValue = filters[facet.fieldName]
        const hasBoolFilter = currentBoolValue !== undefined && currentBoolValue !== null
        return (
          <div key={facet.fieldName} className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {facet.displayName}
              </label>
              {hasBoolFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => handleFilterChange(facet.fieldName, undefined)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <Select
              value={(filters[facet.fieldName] !== undefined ? String(filters[facet.fieldName]) : '__all__')}
              onValueChange={(value: string) =>
                handleFilterChange(facet.fieldName, value === '__all__' ? undefined : value === 'true' ? true : value === 'false' ? false : undefined)
              }
            >
              <SelectTrigger className={`h-10 w-full ${hasBoolFilter ? 'border-primary/50 bg-primary/5' : ''}`}>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todos</SelectItem>
                <SelectItem value="true">Sí</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )
      }

      default:
        return null
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setFilters({})
    setSortBy('name')
    setSortOrder('asc')
    setCurrentPage(1)
  }

  const activeFiltersCount = Object.keys(filters).length + (searchTerm ? 1 : 0)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6 max-w-[1600px]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4 md:pb-6">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight">Buscador de Conjuros D&D 3.5</h1>
            <p className="text-muted-foreground mt-2 text-sm md:text-lg">
              Encuentra y filtra conjuros usando el sistema de entidades
            </p>
          </div>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFiltersCount} filtro{activeFiltersCount !== 1 ? 's' : ''}
              </Badge>
            )}
            <Button onClick={clearFilters} variant="outline" size="sm" className="md:size-lg md:text-base">
              Limpiar Filtros
            </Button>
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <Card>
            <CardContent className="py-12 flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground text-lg">Cargando conjuros...</p>
            </CardContent>
          </Card>
        )}

        {/* Error state */}
        {error && (
          <Card className="border-destructive">
            <CardContent className="py-12 flex flex-col items-center gap-4">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <div className="text-center">
                <p className="text-destructive text-lg font-medium">Error al cargar conjuros</p>
                <p className="text-muted-foreground mt-2">{error}</p>
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline" 
                  className="mt-4"
                >
                  Reintentar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main content - only show when loaded */}
        {!isLoading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden">
          <Button
            variant="outline"
            className="w-full justify-between"
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            <span className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtros
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </span>
            <ChevronDown className={`h-4 w-4 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
          </Button>
        </div>

        {/* Sidebar con filtros */}
        <div className={`lg:col-span-1 space-y-4 ${filtersOpen ? 'block' : 'hidden lg:block'}`}>
          <Card className="sticky top-4 lg:top-6">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Filtros</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden h-8 w-8 p-0"
                  onClick={() => setFiltersOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription className="mt-2">
                <span className="font-medium text-foreground">{filteredSpells.length}</span> de {allSpells.length} conjuros
                {filteredSpells.length > itemsPerPage && (
                  <div className="text-xs mt-1">
                    Mostrando {paginatedSpells.length} (página {currentPage} de {totalPages})
                  </div>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Búsqueda general */}
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Búsqueda
                </label>
                <Input
                  placeholder="Buscar por nombre o descripción..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="h-10"
                />
              </div>

              <div className="border-t pt-4 md:pt-6" />

              {/* Ordenamiento */}
              <div className="space-y-3">
                <label className="text-sm font-medium leading-none">Ordenamiento</label>
                <div className="grid grid-cols-2 gap-2">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Nombre</SelectItem>
                      <SelectItem value="level">Nivel</SelectItem>
                      <SelectItem value="school">Escuela</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortOrder} onValueChange={(v: string) => setSortOrder(v as 'asc' | 'desc')}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Asc</SelectItem>
                      <SelectItem value="desc">Desc</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border-t pt-4 md:pt-6" />

              {/* Facets generados automáticamente */}
              {facets.map(renderFacet)}
            </CardContent>
          </Card>
        </div>

        {/* Lista de resultados */}
        <div className="lg:col-span-3 space-y-4">
          {filteredSpells.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground text-lg">
                  No se encontraron conjuros con los filtros seleccionados.
                </p>
                <Button onClick={clearFilters} variant="outline" className="mt-4">
                  Limpiar filtros
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Paginación arriba */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-card rounded-lg border p-3 md:p-4">
                  <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                    Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredSpells.length)} de {filteredSpells.length}
                  </div>
                  <div className="flex items-center justify-center gap-1 sm:gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="hidden sm:inline-flex"
                    >
                      Primera
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      ←
                    </Button>
                    <span className="text-xs sm:text-sm px-2 sm:px-4 min-w-[80px] text-center">
                      {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      →
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="hidden sm:inline-flex"
                    >
                      Última
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Grid de conjuros */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {paginatedSpells.map((spell) => (
                <Card 
                  key={spell.id} 
                  className="hover:shadow-lg hover:shadow-primary/20 hover:border-primary/50 transition-all duration-200 flex flex-col h-full cursor-pointer"
                  onClick={() => setSelectedSpell(spell)}
                >
                  <CardHeader className="pb-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start gap-3">
                          {spell.image ? (
                            <button
                              onClick={(e) => handleImageClick(spell, e)}
                              className="shrink-0 w-20 h-20 rounded-md overflow-hidden border bg-muted/20 p-2 hover:ring-2 hover:ring-primary transition-all relative group"
                              title="Click para cambiar imagen"
                            >
                              <img
                                src={imagesApi.getImageUrl(spell.image)}
                                alt={spell.name}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none'
                                }}
                              />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <ImageIcon className="h-6 w-6 text-white" />
                              </div>
                            </button>
                          ) : (
                            <button
                              onClick={(e) => handleImageClick(spell, e)}
                              className="shrink-0 w-20 h-20 rounded-md border border-dashed bg-muted/20 p-2 hover:ring-2 hover:ring-primary transition-all flex items-center justify-center"
                              title="Click para añadir imagen"
                            >
                              <ImageIcon className="h-8 w-8 text-muted-foreground" />
                            </button>
                          )}
                          <CardTitle className="text-lg leading-tight flex-1">{spell.name}</CardTitle>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs shrink-0">
                        Nv {spell.level}
                      </Badge>
                    </div>
                    <CardDescription className="text-sm">
                      {spell.school}{spell.subschool && ` [${spell.subschool}]`}
                    </CardDescription>
                    {spell.tags && spell.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap pt-1">
                        {spell.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardHeader>
                  
                  <CardContent className="space-y-3 pt-0 flex-1 flex flex-col">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-muted/50 rounded-md p-2">
                        <div className="font-medium text-foreground mb-0.5">Componentes</div>
                        <div className="text-muted-foreground">{spell.components.join(', ')}</div>
                      </div>
                      <div className="bg-muted/50 rounded-md p-2">
                        <div className="font-medium text-foreground mb-0.5">Tiempo</div>
                        <div className="text-muted-foreground">{spell.castingTime}</div>
                      </div>
                      <div className="bg-muted/50 rounded-md p-2">
                        <div className="font-medium text-foreground mb-0.5">Alcance</div>
                        <div className="text-muted-foreground">{spell.range}</div>
                      </div>
                      <div className="bg-muted/50 rounded-md p-2">
                        <div className="font-medium text-foreground mb-0.5">Duración</div>
                        <div className="text-muted-foreground">{spell.duration}</div>
                      </div>
                    </div>
                    
                    {spell.savingThrow && (
                      <div className="text-xs bg-muted/30 rounded-md px-2 py-1.5">
                        <span className="font-medium text-foreground">Salvación:</span>{' '}
                        <span className="text-muted-foreground">{spell.savingThrow}</span>
                        {spell.spellResistance && (
                          <span className="text-muted-foreground"> • RS: Sí</span>
                        )}
                      </div>
                    )}
                    
                    <div className="text-xs bg-muted/30 rounded-md px-2 py-1.5">
                      <span className="font-medium text-foreground">Clases:</span>{' '}
                      <span className="text-muted-foreground">{spell.classes.join(', ')}</span>
                    </div>
                    
                    <div className="pt-2 border-t flex-1">
                      {spell.shortdescription ? (
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {spell.shortdescription}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4">
                          {spell.description}
                        </p>
                      )}
                      {spell.visualdescription && (
                        <p className="text-xs text-muted-foreground/80 leading-relaxed mt-2 italic">
                          {spell.visualdescription}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Paginación abajo */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center bg-card rounded-lg border p-3 md:p-4">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="hidden sm:inline-flex"
                  >
                    Primera
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    ←
                  </Button>
                  <span className="text-xs sm:text-sm px-2 sm:px-4 min-w-[80px] text-center">
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    →
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="hidden sm:inline-flex"
                  >
                    Última
                  </Button>
                </div>
              </div>
            )}
          </>
          )}
        </div>
      </div>
        )}
      </div>
      
      {/* Spell Detail Modal */}
      {selectedSpell && (
        <Dialog open={!!selectedSpell} onOpenChange={(open) => !open && setSelectedSpell(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
            <DialogHeader>
              <div className="flex items-start gap-4">
                {selectedSpell.image ? (
                  <button
                    onClick={(e) => handleImageClick(selectedSpell, e)}
                    className="shrink-0 w-24 h-24 rounded-md overflow-hidden border bg-muted/20 p-2 hover:ring-2 hover:ring-primary transition-all relative group"
                    title="Click para cambiar imagen"
                  >
                    <img
                      src={imagesApi.getImageUrl(selectedSpell.image)}
                      alt={selectedSpell.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-white" />
                    </div>
                  </button>
                ) : (
                  <button
                    onClick={(e) => handleImageClick(selectedSpell, e)}
                    className="shrink-0 w-24 h-24 rounded-md border border-dashed bg-muted/20 p-2 hover:ring-2 hover:ring-primary transition-all flex items-center justify-center"
                    title="Click para añadir imagen"
                  >
                    <ImageIcon className="h-10 w-10 text-muted-foreground" />
                  </button>
                )}
                <div className="flex-1">
                  <DialogTitle className="text-2xl mb-2">{selectedSpell.name}</DialogTitle>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary">Nivel {selectedSpell.level}</Badge>
                    <Badge variant="outline">{selectedSpell.school}</Badge>
                    {selectedSpell.subschool && (
                      <Badge variant="outline">{selectedSpell.subschool}</Badge>
                    )}
                    {selectedSpell.tags && selectedSpell.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </DialogHeader>
            
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                {/* Información básica */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-muted/50 rounded-md p-3">
                    <div className="text-xs font-medium text-muted-foreground mb-1">Componentes</div>
                    <div className="text-sm font-medium">{selectedSpell.components.join(', ')}</div>
                  </div>
                  <div className="bg-muted/50 rounded-md p-3">
                    <div className="text-xs font-medium text-muted-foreground mb-1">Tiempo de lanzamiento</div>
                    <div className="text-sm font-medium">{selectedSpell.castingTime}</div>
                  </div>
                  <div className="bg-muted/50 rounded-md p-3">
                    <div className="text-xs font-medium text-muted-foreground mb-1">Alcance</div>
                    <div className="text-sm font-medium">{selectedSpell.range}</div>
                  </div>
                  <div className="bg-muted/50 rounded-md p-3">
                    <div className="text-xs font-medium text-muted-foreground mb-1">Duración</div>
                    <div className="text-sm font-medium">{selectedSpell.duration}</div>
                  </div>
                </div>
                
                {/* Área, salvación, resistencia */}
                {(selectedSpell.savingThrow || selectedSpell.spellResistance) && (
                  <div className="flex flex-wrap gap-2">
                    {selectedSpell.savingThrow && (
                      <div className="bg-muted/30 rounded-md px-3 py-2">
                        <span className="text-sm font-medium">Salvación: </span>
                        <span className="text-sm text-muted-foreground">{selectedSpell.savingThrow}</span>
                      </div>
                    )}
                    {selectedSpell.spellResistance && (
                      <div className="bg-muted/30 rounded-md px-3 py-2">
                        <span className="text-sm font-medium">Resistencia a conjuros: </span>
                        <span className="text-sm text-muted-foreground">Sí</span>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Clases */}
                <div className="bg-muted/30 rounded-md px-3 py-2">
                  <span className="text-sm font-medium">Clases: </span>
                  <span className="text-sm text-muted-foreground">{selectedSpell.classes.join(', ')}</span>
                </div>
                
                {/* Descripción corta */}
                {selectedSpell.shortdescription && (
                  <div className="border-t pt-4">
                    <h3 className="text-sm font-semibold mb-2">Resumen</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {selectedSpell.shortdescription}
                    </p>
                  </div>
                )}
                
                {/* Descripción visual */}
                {selectedSpell.visualdescription && (
                  <div className="border-t pt-4">
                    <h3 className="text-sm font-semibold mb-2">Descripción Visual</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed italic">
                      {selectedSpell.visualdescription}
                    </p>
                  </div>
                )}
                
                {/* Descripción completa */}
                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold mb-2">Descripción Completa</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {selectedSpell.description}
                  </p>
                </div>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Image Picker Modal */}
      <ImagePickerModal
        open={imagePickerOpen}
        onOpenChange={setImagePickerOpen}
        onSelect={handleImageChange}
        currentValue={spellEditingImage?.image}
      />
    </div>
  )
}

