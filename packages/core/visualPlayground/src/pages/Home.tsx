import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function Home() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 md:mb-12 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-primary mb-2 md:mb-4">Visual Playground</h1>
          <p className="text-base md:text-xl text-muted-foreground">
            Entorno de desarrollo visual para simular y probar flujos de cilvet-dice
          </p>
        </header>

        <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Spell Browser Card */}
          <Card className="hover:shadow-lg hover:shadow-primary/20 hover:border-primary/50 transition-all duration-200">
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl">🔮 Buscador de Conjuros</CardTitle>
              <CardDescription className="text-sm md:text-base">
                Navega y filtra 2,792 conjuros de D&D 3.5
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs md:text-sm text-muted-foreground mb-4">
                Sistema completo de búsqueda con filtros inteligentes, paginación y métricas de performance en tiempo real.
              </p>
              <Link to="/spell-search">
                <Button className="w-full md:h-10" size="sm">
                  Explorar Conjuros
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Entity Selectors Card */}
          <Card className="hover:shadow-lg hover:shadow-primary/20 hover:border-primary/50 transition-all duration-200">
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl">🎯 Selectores de Entidades</CardTitle>
              <CardDescription className="text-sm md:text-base">
                Ejemplos de selectores con diferentes configuraciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs md:text-sm text-muted-foreground mb-4">
                Visualiza cómo funcionan los selectores con filtros estrictos/permisivos, múltiples entidades, y variables.
              </p>
              <Link to="/entity-selectors">
                <Button className="w-full md:h-10" size="sm">
                  Ver Selectores
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Entity Management Card */}
          <Card className="hover:shadow-lg hover:shadow-primary/20 hover:border-primary/50 transition-all duration-200">
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl">🗂️ Editor de Entidades</CardTitle>
              <CardDescription className="text-sm md:text-base">
                Crea y gestiona tipos de entidades e instancias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs md:text-sm text-muted-foreground mb-4">
                Define schemas de entidades (como content types) y crea instancias con validación automática.
              </p>
              <Link to="/entity-management">
                <Button className="w-full md:h-10" size="sm">
                  Gestionar Entidades
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <footer className="mt-8 md:mt-16 text-center text-xs md:text-sm text-muted-foreground">
          <p>
            Powered by React 19 + Vite + shadcn/ui
          </p>
        </footer>
      </div>
    </div>
  )
}

