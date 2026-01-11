import { Link } from 'react-router-dom'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

type ErrorScreenProps = {
  error: string
  onRetry?: () => void
}

export function ErrorScreen({ error, onRetry }: ErrorScreenProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-6 w-6" />
          <span className="font-medium">Error</span>
        </div>
        <p className="text-muted-foreground text-center max-w-md">{error}</p>
        {onRetry && (
          <Button variant="outline" onClick={onRetry}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        )}
      </div>
      <div className="mt-8 p-4 bg-muted rounded-lg max-w-lg">
        <p className="text-sm text-muted-foreground mb-2">Para iniciar el servidor:</p>
        <code className="text-sm bg-background px-2 py-1 rounded block">
          cd visualPlayground && bun run server
        </code>
      </div>
      <Link to="/" className="mt-6 text-primary hover:underline">
        ← Volver al inicio
      </Link>
    </div>
  )
}

