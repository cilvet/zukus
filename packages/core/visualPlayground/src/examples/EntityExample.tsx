import type { Entity } from '@root/core/domain/entities'

/**
 * Ejemplo de componente que importa tipos del proyecto principal
 */
export function EntityExample() {
  // Este es un ejemplo de cómo importar tipos del proyecto principal
  const exampleEntity: Entity = {
    id: 'example-1',
    entityType: 'spell',
  }

  return (
    <div className="p-4 border border-border rounded-lg">
      <h3 className="font-semibold mb-2">Entity Example</h3>
      <p className="text-sm text-muted-foreground mb-2">
        Tipo importado: <code className="bg-muted px-1 rounded">Entity</code>
      </p>
      <p className="text-xs text-muted-foreground mb-2">
        Este ejemplo demuestra cómo importar tipos del proyecto principal usando rutas relativas.
      </p>
      <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
        {JSON.stringify(exampleEntity, null, 2)}
      </pre>
      <p className="text-xs text-muted-foreground mt-2">
        Puedes importar cualquier tipo o función del proyecto principal:
      </p>
      <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
        <code>{`import type { Entity } from '@root/core/domain/entities'`}</code>
      </pre>
    </div>
  )
}

