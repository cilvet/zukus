import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Menu, X } from 'lucide-react'
import { DetailPanel } from '@/components/entity-selectors'
import { defaultExamples } from '@/data/entity-selectors/exampleConfigs'
import type { EntityProvider } from '@root/core/domain/levels/providers/types'
import { testEntities } from '@/data/testEntities'

export function EntitySelectorsPage() {
  const [selectedId, setSelectedId] = useState<string>(defaultExamples[0].id)
  const [isEditing, setIsEditing] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [providers, setProviders] = useState<Record<string, EntityProvider>>(() => {
    const initial: Record<string, EntityProvider> = {}
    defaultExamples.forEach(e => {
      initial[e.id] = structuredClone(e.provider)
    })
    return initial
  })
  const [variables, setVariables] = useState<Record<string, Record<string, number>>>(() => {
    const initial: Record<string, Record<string, number>> = {}
    defaultExamples.forEach(e => {
      if (e.defaultVariables) {
        initial[e.id] = { ...e.defaultVariables }
      }
    })
    return initial
  })

  const selectedExample = defaultExamples.find(e => e.id === selectedId)!
  const currentProvider = providers[selectedId]
  const currentVariables = variables[selectedId] || {}

  const handleProviderChange = (provider: EntityProvider) => {
    setProviders(prev => ({ ...prev, [selectedId]: provider }))
  }

  const handleVariableChange = (key: string, value: number) => {
    setVariables(prev => ({
      ...prev,
      [selectedId]: { ...prev[selectedId], [key]: value },
    }))
  }

  const handleVariablesChange = (newVariables: Record<string, number>) => {
    setVariables(prev => ({
      ...prev,
      [selectedId]: newVariables,
    }))
  }

  const handleReset = () => {
    const original = defaultExamples.find(e => e.id === selectedId)!
    setProviders(prev => ({ ...prev, [selectedId]: structuredClone(original.provider) }))
    if (original.defaultVariables) {
      setVariables(prev => ({ ...prev, [selectedId]: { ...original.defaultVariables } }))
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="h-9 w-9 p-0"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <div>
            <h1 className="text-lg font-bold">Entity Selectors</h1>
            <p className="text-xs text-muted-foreground">
              {testEntities.length.toLocaleString()} entidades
            </p>
          </div>
        </div>
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Volver
        </Link>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Panel - Navigation */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
          w-72 border-r bg-card flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="p-4 border-b">
          <div className="hidden lg:block">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
              ← Volver
            </Link>
            <h1 className="text-lg font-bold mt-2">Entity Selectors</h1>
            <p className="text-xs text-muted-foreground mt-1">
              {testEntities.length.toLocaleString()} entidades totales
            </p>
          </div>
          <div className="lg:hidden flex items-center justify-between">
            <h1 className="text-lg font-bold">Ejemplos</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-2">
            {defaultExamples.map((example) => (
              <button
                key={example.id}
                onClick={() => {
                  setSelectedId(example.id)
                  setIsEditing(false)
                  setSidebarOpen(false)
                }}
                className={`
                  w-full text-left p-3 rounded-md mb-1 transition-colors
                  ${selectedId === example.id 
                    ? 'bg-primary/10 border border-primary/50' 
                    : 'hover:bg-muted/50'
                  }
                `}
              >
                <p className="font-medium text-sm">{example.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{example.description}</p>
              </button>
            ))}
          </div>
        </ScrollArea>
      </aside>

      {/* Right Panel - Detail */}
      <main className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="max-w-3xl mx-auto">
          <DetailPanel
            example={selectedExample}
            provider={currentProvider}
            variables={currentVariables}
            isEditing={isEditing}
            onProviderChange={handleProviderChange}
            onVariableChange={handleVariableChange}
            onVariablesChange={handleVariablesChange}
            onToggleEdit={() => setIsEditing(!isEditing)}
          />

          {/* Reset Button */}
          <div className="mt-4">
            <Button variant="ghost" size="sm" onClick={handleReset}>
              Resetear configuración
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
