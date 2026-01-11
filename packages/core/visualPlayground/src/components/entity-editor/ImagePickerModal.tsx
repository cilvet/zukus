import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ChevronLeft, Search, Loader2, Check, Sparkles } from 'lucide-react'
import { imagesApi, type ImageInfo, type ImageCategory, type SemanticSearchResult } from '@/lib/api'

// =============================================================================
// Types
// =============================================================================

type ImagePickerModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (imagePath: string) => void
  currentValue?: string
}

// =============================================================================
// ImagePickerModal Component
// =============================================================================

export function ImagePickerModal({
  open,
  onOpenChange,
  onSelect,
  currentValue,
}: ImagePickerModalProps) {
  const [categories, setCategories] = useState<ImageCategory[]>([])
  const [allImages, setAllImages] = useState<ImageInfo[]>([])
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [useSemanticSearch, setUseSemanticSearch] = useState(false)
  const [semanticResults, setSemanticResults] = useState<SemanticSearchResult[]>([])
  const [isSemanticSearching, setIsSemanticSearching] = useState(false)

  // Load categories and all images on mount
  useEffect(() => {
    if (open) {
      loadCategoriesAndImages()
    }
  }, [open])

  const loadCategoriesAndImages = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [cats, imgs] = await Promise.all([
        imagesApi.getCategories(),
        imagesApi.getAll()
      ])
      setCategories(cats)
      setAllImages(imgs)
    } catch (e) {
      setError('Error loading images. Make sure the server is running.')
    } finally {
      setIsLoading(false)
    }
  }

  const performSemanticSearch = async (query: string) => {
    if (!query.trim()) {
      setSemanticResults([])
      return
    }

    setIsSemanticSearching(true)
    setError(null)
    try {
      const response = await imagesApi.semanticSearch(
        query, 
        50, // Get more results for semantic search
        categoryFilter || undefined
      )
      setSemanticResults(response.results)
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Unknown error'
      if (errorMsg.includes('CLIP search server is not running')) {
        setError('🤖 Búsqueda semántica no disponible. Inicia el servidor: cd icon-search && python3 clip_server.py')
      } else {
        setError('Error en búsqueda semántica')
      }
      setSemanticResults([])
    } finally {
      setIsSemanticSearching(false)
    }
  }

  // Semantic search effect
  useEffect(() => {
    if (!useSemanticSearch || !searchQuery.trim()) {
      setSemanticResults([])
      return
    }

    const timeoutId = setTimeout(() => {
      performSemanticSearch(searchQuery)
    }, 500) // Debounce 500ms

    return () => clearTimeout(timeoutId)
  }, [searchQuery, useSemanticSearch, categoryFilter])

  const handleSelectImage = (image: ImageInfo | SemanticSearchResult) => {
    onSelect(image.path)
    onOpenChange(false)
    // Reset state
    setCategoryFilter(null)
    setSearchQuery('')
    setSemanticResults([])
  }

  // Filter images based on search and category
  const filteredImages = allImages.filter((img) => {
    const matchesSearch = !searchQuery || 
      img.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      img.path.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = !categoryFilter || 
      img.category === categoryFilter
    
    return matchesSearch && matchesCategory
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Seleccionar imagen</span>
            <Badge variant="secondary">
              {allImages.length} imágenes
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {/* Search bar - always visible */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={useSemanticSearch ? "Búsqueda semántica (ej: 'fire explosion', 'blue shield')..." : "Buscar imágenes..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="semantic-search"
                checked={useSemanticSearch}
                onCheckedChange={setUseSemanticSearch}
              />
              <Label htmlFor="semantic-search" className="text-sm flex items-center gap-1.5 cursor-pointer">
                <Sparkles className="h-3.5 w-3.5" />
                Búsqueda semántica con IA
                {isSemanticSearching && <Loader2 className="h-3 w-3 animate-spin ml-1" />}
              </Label>
            </div>
            
            {categoryFilter && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCategoryFilter(null)}
                className="text-xs"
              >
                Limpiar filtro
              </Button>
            )}
          </div>
          
          {/* Category filters */}
          {!isLoading && categories.length > 0 && (
            <ScrollArea className="w-full whitespace-nowrap pb-2">
              <div className="flex gap-2">
                {categories.map((cat) => (
                  <Button
                    key={cat.name}
                    variant={categoryFilter === cat.name ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCategoryFilter(categoryFilter === cat.name ? null : cat.name)}
                    className="text-xs shrink-0"
                  >
                    {cat.name}
                    <Badge variant="secondary" className="ml-1.5">
                      {cat.imageCount}
                    </Badge>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Images grid - always visible when not loading */}
        {!isLoading && (
          <ScrollArea className="flex-1">
            {useSemanticSearch && searchQuery ? (
              // Semantic search results
              <div className="space-y-2 p-1">
                {isSemanticSearching ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : semanticResults.length > 0 ? (
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                    {semanticResults.map((result, idx) => {
                      const isSelected = currentValue === result.path
                      const pathParts = result.path.split('/')
                      const fileName = pathParts[pathParts.length - 1]
                      return (
                        <button
                          key={idx}
                          onClick={() => handleSelectImage(result)}
                          className={`
                            relative aspect-square border rounded-md overflow-hidden
                            hover:ring-2 hover:ring-primary transition-all
                            ${isSelected ? 'ring-2 ring-primary bg-primary/10' : ''}
                          `}
                          title={`${fileName}\nScore: ${result.score.toFixed(3)}`}
                        >
                          <img
                            src={imagesApi.getImageUrl(result.path)}
                            alt={fileName}
                            className="w-full h-full object-contain p-1"
                            loading="lazy"
                          />
                          {isSelected && (
                            <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5">
                              <Check className="h-3 w-3" />
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] px-1 py-0.5 text-center">
                            {(result.score * 100).toFixed(0)}%
                          </div>
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    No se encontraron resultados semánticos
                  </div>
                )}
              </div>
            ) : (
              // Normal filtered results
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 p-1">
                {filteredImages.map((image) => {
                  const isSelected = currentValue === image.path
                  return (
                    <button
                      key={image.id}
                      onClick={() => handleSelectImage(image)}
                      className={`
                        relative aspect-square border rounded-md overflow-hidden
                        hover:ring-2 hover:ring-primary transition-all
                        ${isSelected ? 'ring-2 ring-primary bg-primary/10' : ''}
                      `}
                      title={image.name}
                    >
                      <img
                        src={imagesApi.getImageUrl(image.path)}
                        alt={image.name}
                        className="w-full h-full object-contain p-1"
                        loading="lazy"
                      />
                      {isSelected && (
                        <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
            {!useSemanticSearch && filteredImages.length === 0 && !isLoading && (
              <div className="text-center text-muted-foreground py-8">
                No se encontraron imágenes
              </div>
            )}
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  )
}

