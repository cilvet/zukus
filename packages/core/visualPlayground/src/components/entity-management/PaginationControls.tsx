import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

type PaginationControlsProps = {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

function getPageNumbers(currentPage: number, totalPages: number): number[] {
  const maxVisible = 5
  const pages: number[] = []

  if (totalPages <= maxVisible) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
    return pages
  }

  if (currentPage <= 3) {
    for (let i = 1; i <= maxVisible; i++) {
      pages.push(i)
    }
    return pages
  }

  if (currentPage >= totalPages - 2) {
    for (let i = totalPages - 4; i <= totalPages; i++) {
      pages.push(i)
    }
    return pages
  }

  for (let i = currentPage - 2; i <= currentPage + 2; i++) {
    pages.push(i)
  }
  return pages
}

export function PaginationControls({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: PaginationControlsProps) {
  if (totalPages <= 1) {
    return null
  }

  const pageNumbers = getPageNumbers(currentPage, totalPages)
  const isFirstPage = currentPage === 1
  const isLastPage = currentPage === totalPages

  return (
    <div className="flex items-center justify-center gap-2 pt-4">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(1)}
        disabled={isFirstPage}
      >
        <ChevronsLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={isFirstPage}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="flex items-center gap-1">
        {pageNumbers.map((pageNum) => {
          const isActive = currentPage === pageNum
          return (
            <Button
              key={pageNum}
              variant={isActive ? 'default' : 'outline'}
              size="icon"
              onClick={() => onPageChange(pageNum)}
              className="w-9 h-9"
            >
              {pageNum}
            </Button>
          )
        })}
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={isLastPage}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(totalPages)}
        disabled={isLastPage}
      >
        <ChevronsRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

