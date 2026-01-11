import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { resolveProvider } from '@root/core/domain/levels/providers/resolveProvider'
import { testEntities, getEntityById } from '@/data/testEntities'
import { SelectorEditor } from './SelectorEditor'
import { SelectorPreview } from './SelectorPreview'
import type { DetailPanelProps } from './types'

export function DetailPanel({
  example,
  provider,
  variables,
  isEditing,
  onProviderChange,
  onVariableChange,
  onVariablesChange,
  onToggleEdit,
}: DetailPanelProps) {
  const resolvedResult = resolveProvider(provider, testEntities, getEntityById, variables)
  
  const buildJsonDisplayObject = () => {
    const display: Record<string, unknown> = { ...provider }
    
    if (resolvedResult.granted && resolvedResult.granted.entities.length > 0) {
      display._resolved = {
        grantedEntities: resolvedResult.granted.entities.map(e => ({
          id: e.id,
          name: e.name,
          entityType: e.entityType,
        })),
      }
    }
    
    return display
  }
  
  const jsonDisplayObject = buildJsonDisplayObject()
  
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h2 className="text-lg md:text-xl font-bold">{example.title}</h2>
          <p className="text-sm md:text-base text-muted-foreground">{example.description}</p>
        </div>
        <Button
          variant={isEditing ? 'default' : 'outline'}
          onClick={onToggleEdit}
          size="sm"
          className="sm:size-default"
        >
          {isEditing ? 'Ver resultado' : 'Editar'}
        </Button>
      </div>

      {Object.keys(variables).length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 bg-muted/50 rounded-md">
          <span className="text-sm font-medium">Variables:</span>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {Object.entries(variables).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <label className="text-sm">{key}:</label>
                <Input
                  type="number"
                  value={value}
                  onChange={(e) => onVariableChange(key, parseInt(e.target.value) || 0)}
                  className="w-20 h-8"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <Card>
        <CardContent className="pt-6">
          {isEditing ? (
            <SelectorEditor 
              provider={provider} 
              variables={variables}
              onChange={onProviderChange} 
              onVariablesChange={onVariablesChange}
            />
          ) : (
            <SelectorPreview 
              provider={provider} 
              variables={variables} 
              onProviderChange={onProviderChange}
            />
          )}
        </CardContent>
      </Card>

      <Accordion type="single" collapsible>
        <AccordionItem value="json">
          <AccordionTrigger className="text-sm">
            Ver configuración JSON (con estado actual)
          </AccordionTrigger>
          <AccordionContent>
            <pre className="text-xs bg-muted p-4 rounded-md overflow-auto max-h-80">
              {JSON.stringify(jsonDisplayObject, null, 2)}
            </pre>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}


