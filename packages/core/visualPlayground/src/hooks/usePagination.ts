import { useState, useEffect } from 'react'

type UsePaginationProps = {
  totalItems: number
  pageSize: number
  resetDependencies?: unknown[]
}

export function usePagination({ 
  totalItems, 
  pageSize,
  resetDependencies = []
}: UsePaginationProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.ceil(totalItems / pageSize)

  useEffect(() => {
    setCurrentPage(1)
  }, resetDependencies)

  const paginatedItems = {
    startIndex: (currentPage - 1) * pageSize,
    endIndex: Math.min(currentPage * pageSize, totalItems),
    totalPages,
  }

  return {
    currentPage,
    totalPages,
    setCurrentPage,
    paginatedItems,
  }
}

